/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global define, module, require, exports */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery',
                'd3',
                'nf.Common',
                'nf.Client',
                'nf.CanvasUtils'],
            function ($, d3, nfCommon, nfClient, nfCanvasUtils) {
                return (nf.Port = factory($, d3, nfCommon, nfClient, nfCanvasUtils));
            });
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = (nf.Port =
            factory(require('jquery'),
                require('d3'),
                require('nf.Common'),
                require('nf.Client'),
                require('nf.CanvasUtils')));
    } else {
        nf.Port = factory(root.$,
            root.d3,
            root.nf.Common,
            root.nf.Client,
            root.nf.CanvasUtils);
    }
}(this, function ($, d3, nfCommon, nfClient, nfCanvasUtils) {
    'use strict';

    var nfConnectable;
    var nfDraggable;
    var nfSelectable;
    var nfQuickSelect;
    var nfContextMenu;

    var PREVIEW_NAME_LENGTH = 15;
    var OFFSET_VALUE = 25;

    var portDimensions = {
        width: 185,
        height: 65
    };
    var remotePortDimensions = {
        width: 185,
        height: 65
    };

    // ----------------------------
    // ports currently on the graph
    // ----------------------------

    var portMap;

    // -----------------------------------------------------------
    // cache for components that are added/removed from the canvas
    // -----------------------------------------------------------

    var removedCache;
    var addedCache;

    // --------------------
    // component containers
    // --------------------

    var portContainer;

    // --------------------------
    // privately scoped functions
    // --------------------------

    /**
     * Selects the port elements against the current port map.
     */
    var select = function () {
        return portContainer.selectAll('g.input-port, g.output-port').data(portMap.values(), function (d) {
            return d.id;
        });
    };

    var getPortsComments = function (d) {
        if (nfCommon.isBlank(d.component.comments)) {
            return 'No comments specified';
        } else {
            return d.component.comments;
        }
    };
    /**
     * Renders the ports in the specified selection.
     *
     * @param {selection} entered           The selection of ports to be rendered
     * @param {boolean} selected            Whether the port should be selected
     */
    var renderPorts = function (entered, selected) {
        if (entered.empty()) {
            return;
        }

        var port = entered.append('g')
            .attr({
                'id': function (d) {
                    return 'id-' + d.id;
                },
                'class': function (d) {
                    if (d.portType === 'INPUT_PORT') {
                        return 'input-port component';
                    } else {
                        return 'output-port component';
                    }
                }
            })
            .classed('selected', selected)
            .call(nfCanvasUtils.position);

        // port border
        port.append('rect')
            .attr({
                'class': 'border',
                'width': function (d) {
                    return d.dimensions.width;
                },
                'height': function (d) {
                    return d.dimensions.height;
                },
                'fill': 'transparent',
                'stroke': 'transparent',
                'rx':'1',
                'ry':'1'
            });

        // port body
        port.append('rect')
            .attr({
                'class': 'body',
                'width': function (d) {
                    return d.dimensions.width;
                },
                'height': function (d) {
                    return d.dimensions.height;
                },
                'filter': 'url(#component-drop-shadow)',
                'rx':'2',
                'ry':'2'
            });

        var offset = 0;

        // conditionally render the remote banner
       // Removed the condition to display the remote banner in all cases
    /*    if (nf.nfCanvasUtils.getParentGroupId() === null) {
            offset = OFFSET_VALUE;

            // port remote banner
            port.append('rect')
                .attr({
                    'class': 'remote-banner',
                    'width': function (d) {
                        return d.dimensions.width;
                    },
                    'height': offset,
                    'fill': '#e3e8eb'
                });
        }
        */

        // port icon
        port.append('image')
            .attr({
                'class': 'port-icon',
                'x':8,
                'y':12,
                'width':16,
                'height':16,
                'fill':'#646464'
            })
          .attr({
         'xlink:href':function(d) {
              if (d.portType === 'INPUT_PORT') {
               return 'images/ic_Input port.svg';
              }
              else{
                 return 'images/output_port.svg';
              }
          }
  });
        // port name
        port.append('text')
            .attr({
                'x': 30,
                'y': 24,
                'width':145,
                'height': 30,
                'class': 'port-name'
            });

        // make ports selectable
        port.call(nfSelectable.activate).call(nfContextMenu.activate).call(nfQuickSelect.activate);

        // only activate dragging and connecting if appropriate
        port.filter(function (d) {
            return d.permissions.canWrite && d.permissions.canRead;
        }).call(nfDraggable.activate).call(nfConnectable.activate);
    };

    /**
     * Updates the ports in the specified selection.
     *
     * @param {selection} updated               The ports to be updated
     */
    var updatePorts = function (updated) {
        if (updated.empty()) {
            return;
        }

        // port border authorization
        updated.select('rect.border')
            .classed('unauthorized', function (d) {
                return d.permissions.canRead === false;
            });

        // port body authorization
        updated.select('rect.body')
            .classed('unauthorized', function (d) {
                return d.permissions.canRead === false;
            });

        updated.each(function (portData) {
            var port = d3.select(this);
            var details = port.select('g.port-details');

            // update the component behavior as appropriate
            nfCanvasUtils.editable(port, nfConnectable, nfDraggable);

            // if this process group is visible, render everything
            if (port.classed('visible')) {
                if (details.empty()) {
                    details = port.append('g').attr('class', 'port-details');

                    var offset = 0;
                    // port footer
                     details.append('rect')
                        .attr({
                            'class': 'port-footer',
                            'x':0.5,
                            'y':39.5,
                             'width': function (d) {
                              return d.dimensions.width - 1;
                               },
                              'height':25,
                              'fill':'#E3E4E5',
                              'stroke-width':1,
                              'stroke':'#E0E0E0',
                              'fill-opacity':1                          
                        });

                    // run status icon
                   // Changed the position of run status icon in port
                   details.append('text')
                        .attr({
                            'class': 'run-status-icon',
                            'x':10,
                            'y':57                           
                        });
                     // run status text
                     details.append('text')
                        .attr({
                            'class': 'run-status-text',
                            'x':28,
                            'y':57                           
                        });
                      if (nfCanvasUtils.getParentGroupId() === null) {   
                       offset = OFFSET_VALUE;
                        // bulletin background
                        details.append('rect')
                            .attr({
                                'class': 'bulletin-background',
                                'x': function (d) {
                                    return portData.dimensions.width - offset;
                                },
                                'width': offset,
                                'height': offset
                            });

                        // bulletin icon
                        details.append('text')
                            .attr({
                                'class': 'bulletin-icon',
                                'x': function (d) {
                                    return portData.dimensions.width - 18;
                                },
                                'y': 18
                            })
                            .text('\uf24a');
                      // port transmitting icon
                           details.append('text')
                            .attr({
                                'class': 'port-transmission-icon',
                                'x': 159,
                                'y': 57,
                                'fill':'#fff'
                          });
                      }

                    // -------------------
                    // active thread count
                    // -------------------

                    // active thread count
                    details.append('text')
                        .attr({
                            'class': 'active-thread-count-icon',
                            'x':140,
                            'y':57
                        })
                        .text('\ue83f').append('title').text('Active threads');

                    // active thread icon
                    details.append('text')
                        .attr({
                            'class': 'active-thread-count',
                            'x':145,
                            'y': 57,
                            'width':30
                        });
                }

                if (portData.permissions.canRead) {
                    // update the port name
                    port.select('text.port-name')
                        .each(function (d) {
                            var portName = d3.select(this);
                            var name = d.component.name;
                            // reset the port name to handle any previous state
                            portName.text(null).selectAll('tspan, title').remove();
                            nfCanvasUtils.ellipsis(portName, name);
                        }).append('title').text(function (d) {
                            var comments = getPortsComments(d);
                            var title = d.component.name+"\r\n"+"comments: "+comments;
                        return title;
                    });
                } else {
                    // clear the port name
                    port.select('text.port-name').text(null);
                }

                // populate the stats
                port.call(updatePortStatus);
            } else {
                if (portData.permissions.canRead) {
                    // update the port name
                    port.select('text.port-name')
                        .text(function (d) {
                            var name = d.component.name;
                            if (name.length > PREVIEW_NAME_LENGTH) {
                                return name.substring(0, PREVIEW_NAME_LENGTH) + String.fromCharCode(8230);
                            } else {
                                return name;
                            }
                        });
                } else {
                    // clear the port name
                    port.select('text.port-name').text(null);
                }

                // remove tooltips if necessary
                port.call(removeTooltips);

                // remove the details if necessary
                if (!details.empty()) {
                    details.remove();
                }
            }
        });
    };

    /**
     * Updates the port status.
     *
     * @param {selection} updated           The ports to be updated
     */
    var updatePortStatus = function (updated) {
        var img = '';
        if (updated.empty()) {
            return;
        }

        // update the run status
         updated.select('text.run-status-icon')
            .attr({
                'fill': function (d) {
                  var fill = '';
                     if (d.status.aggregateSnapshot.runStatus === 'Disabled') {
                    fill = '#fcaf15';
                } else if (d.status.aggregateSnapshot.runStatus === 'Invalid') {
                    fill = '#b23434';
                } else if (d.status.aggregateSnapshot.runStatus === 'Running') {
                    fill = '#49B748';
                    
                } else if (d.status.aggregateSnapshot.runStatus === 'Stopped') {
                    fill = '#ff6464';
                }
                    return fill;
                },
                'font-family': function (d) {
                    var family = 'FontAwesome';
                    if (d.status.aggregateSnapshot.runStatus === 'Disabled') {
                        family = 'flowfont';
                    }
                    return family;
                }
            })
            .text(function (d) {
                {
                if (d.status.aggregateSnapshot.runStatus === 'Disabled') {
                    img = '\ue802';
                    fill = '#fcaf15';
                } else if (d.status.aggregateSnapshot.runStatus === 'Invalid') {
                    img = '\uf071';
                    fill = '#b23434';
                } else if (d.status.aggregateSnapshot.runStatus === 'Running') {
                    img = '\uf04b';
                    fill = '#49B748';
                    
                } else if (d.status.aggregateSnapshot.runStatus === 'Stopped') {
                    img = '\uf04d';
                    fill = '#ff6464';
                }
                }
                return img;
            })
            .each(function (d) {
                // get the tip
                var tip = d3.select('#run-status-tip-' + d.id);

                // if there are validation errors generate a tooltip
                if (d.permissions.canRead && !nfCommon.isEmpty(d.component.validationErrors)) {
                    // create the tip if necessary
                    if (tip.empty()) {
                        tip = d3.select('#port-tooltips').append('div')
                            .attr('id', function () {
                                return 'run-status-tip-' + d.id;
                            })
                            .attr('class', 'tooltip nifi-tooltip');
                    }

                    // update the tip
                    tip.html(function () {
                        var list = nfCommon.formatUnorderedList(d.component.validationErrors);
                        if (list === null || list.length === 0) {
                            return '';
                        } else {
                            return $('<div></div>').append(list).html();
                        }
                    });

                    // add the tooltip
                    nfCanvasUtils.canvasTooltip(tip, d3.select(this));
                } else {
                    // remove if necessary
                    if (!tip.empty()) {
                        tip.remove();
                    }
                }
            });
           updated.select('text.run-status-text')
            .text(function (d) {
                  var text = '';
                if (d.status.aggregateSnapshot.runStatus === 'Disabled') {
                    text = 'Disabled';
                } else if (d.status.aggregateSnapshot.runStatus === 'Invalid') {
                    text = 'Invalid';
                } else if (d.status.aggregateSnapshot.runStatus === 'Running') {
                   text = 'Running';
                    
                } else if (d.status.aggregateSnapshot.runStatus === 'Stopped') {
                    text = 'Stopped';
                }
                    return text;
                });     
        updated.select('text.port-transmission-icon')
            .attr({
                'font-family': function (d) {
                    if (d.status.transmitting === true) {
                        return 'FontAwesome';
                    } else {
                        return 'flowfont';
                    }
                }
            })
            .text(function (d) {
                if (d.status.transmitting === true) {
                    return '\uf140';
                } else {
                    return '\ue80a';
                }
            })
            .classed('transmitting', function (d) {
                if (d.status.transmitting === true) {
                    return true;
                } else {
                    return false;
                }
            })
            .classed('not-transmitting', function (d) {
                if (d.status.transmitting !== true) {
                    return true;
                } else {
                    return false;
                }
            })
            .append('title').text(function(d){
                if (d.status.transmitting === true) {
                    return 'Transmitting count';
                } else {
                    return 'Non transmitting count';
                }});

        updated.each(function (d) {
            var port = d3.select(this);
            var offset = 0;

            // -------------------
            // active thread count
            // -------------------

            nfCanvasUtils.activeThreadCount(port, d, function (off) {
                offset = off;
            });

            // ---------
            // bulletins
            // ---------

            port.select('rect.bulletin-background').classed('has-bulletins', function () {
                return !nfCommon.isEmpty(d.status.aggregateSnapshot.bulletins);
            });

            nfCanvasUtils.bulletins(port, d, function () {
                return d3.select('#port-tooltips');
            }, offset);
        });
    };

    /**
     * Removes the ports in the specified selection.
     *
     * @param {selection} removed               The ports to be removed
     */
    var removePorts = function (removed) {
        if (removed.empty()) {
            return;
        }

        removed.call(removeTooltips).remove();
    };

    /**
     * Removes the tooltips for the ports in the specified selection.
     *
     * @param {selection} removed
     */
    var removeTooltips = function (removed) {
        removed.each(function (d) {
            // remove any associated tooltips
            $('#run-status-tip-' + d.id).remove();
            $('#bulletin-tip-' + d.id).remove();
        });
    };

    var nfPort = {
        /**
         * Initializes of the Port handler.
         *
         * @param nfConnectableRef   The nfConnectable module.
         * @param nfDraggableRef   The nfDraggable module.
         * @param nfSelectableRef   The nfSelectable module.
         * @param nfContextMenuRef   The nfContextMenu module.
         * @param nfQuickSelectRef   The nfQuickSelect module.
         */
        init: function (nfConnectableRef, nfDraggableRef, nfSelectableRef, nfContextMenuRef, nfQuickSelectRef) {
            nfConnectable = nfConnectableRef;
            nfDraggable = nfDraggableRef;
            nfSelectable = nfSelectableRef;
            nfContextMenu = nfContextMenuRef;
            nfQuickSelect = nfQuickSelectRef;

            portMap = d3.map();
            removedCache = d3.map();
            addedCache = d3.map();

            // create the port container
            portContainer = d3.select('#canvas').append('g')
                .attr({
                    'pointer-events': 'all',
                    'class': 'ports'
                });
        },

        /**
         * Adds the specified port entity.
         *
         * @param portEntities       The port
         * @param options           Configuration options
         */
        add: function (portEntities, options) {
            var selectAll = false;
            if (nfCommon.isDefinedAndNotNull(options)) {
                selectAll = nfCommon.isDefinedAndNotNull(options.selectAll) ? options.selectAll : selectAll;
            }

            // determine the appropriate dimensions for this port
            var dimensions = portDimensions;
            if (nfCanvasUtils.getParentGroupId() === null) {
                dimensions = remotePortDimensions;
            }

            // get the current time
            var now = new Date().getTime();

            var add = function (portEntity) {
                addedCache.set(portEntity.id, now);

                // add the port
                portMap.set(portEntity.id, $.extend({
                    type: 'Port',
                    dimensions: dimensions,
                    status: {
                        activeThreadCount: 0
                    }
                }, portEntity));
            };

            // determine how to handle the specified port status
            if ($.isArray(portEntities)) {
                $.each(portEntities, function (_, portNode) {
                    add(portNode);
                });
            } else if (nfCommon.isDefinedAndNotNull(portEntities)) {
                add(portEntities);
            }

            // apply the selection and handle new ports
            var selection = select();
            selection.enter().call(renderPorts, selectAll);
            selection.call(updatePorts);
        },

        /**
         * Populates the graph with the specified ports.
         *
         * @argument {object | array} portNodes                    The ports to add
         * @argument {object} options                Configuration options
         */
        set: function (portEntities, options) {
            var selectAll = false;
            var transition = false;
            if (nfCommon.isDefinedAndNotNull(options)) {
                selectAll = nfCommon.isDefinedAndNotNull(options.selectAll) ? options.selectAll : selectAll;
                transition = nfCommon.isDefinedAndNotNull(options.transition) ? options.transition : transition;
            }

            // determine the appropriate dimensions for this port
            var dimensions = portDimensions;
            if (nfCanvasUtils.getParentGroupId() === null) {
                dimensions = remotePortDimensions;
            }

            var set = function (proposedPortEntity) {
                var currentPortEntity = portMap.get(proposedPortEntity.id);

                // set the port if appropriate due to revision and wasn't previously removed
                if (nfClient.isNewerRevision(currentPortEntity, proposedPortEntity) && !removedCache.has(proposedPortEntity.id)) {
                    // add the port
                    portMap.set(proposedPortEntity.id, $.extend({
                        type: 'Port',
                        dimensions: dimensions,
                        status: {
                            activeThreadCount: 0
                        }
                    }, proposedPortEntity));
                }
            };

            // determine how to handle the specified port status
            if ($.isArray(portEntities)) {
                $.each(portMap.keys(), function (_, key) {
                    var currentPortEntity = portMap.get(key);
                    var isPresent = $.grep(portEntities, function (proposedPortEntity) {
                        return proposedPortEntity.id === currentPortEntity.id;
                    });

                    // if the current port is not present and was not recently added, remove it
                    if (isPresent.length === 0 && !addedCache.has(key)) {
                        portMap.remove(key);
                    }
                });
                $.each(portEntities, function (_, portNode) {
                    set(portNode);
                });
            } else if (nfCommon.isDefinedAndNotNull(portEntities)) {
                set(portEntities);
            }

            // apply the selection and handle all new ports
            var selection = select();
            selection.enter().call(renderPorts, selectAll);
            selection.call(updatePorts).call(nfCanvasUtils.position, transition);
            selection.exit().call(removePorts);
        },

        /**
         * If the port id is specified it is returned. If no port id
         * specified, all ports are returned.
         *
         * @param {string} id
         */
        get: function (id) {
            if (nfCommon.isUndefined(id)) {
                return portMap.values();
            } else {
                return portMap.get(id);
            }
        },

        /**
         * If the port id is specified it is refresh according to the current
         * state. If not port id is specified, all ports are refreshed.
         *
         * @param {string} id      Optional
         */
        refresh: function (id) {
            if (nfCommon.isDefinedAndNotNull(id)) {
                d3.select('#id-' + id).call(updatePorts);
            } else {
                d3.selectAll('g.input-port, g.output-port').call(updatePorts);
            }
        },

        /**
         * Refreshes the components necessary after a pan event.
         */
        pan: function () {
            d3.selectAll('g.input-port.entering, g.output-port.entering, g.input-port.leaving, g.output-port.leaving').call(updatePorts);
        },

        /**
         * Reloads the port state from the server and refreshes the UI.
         * If the port is currently unknown, this function just returns.
         *
         * @param {string} id The port id
         */
        reload: function (id) {
            if (portMap.has(id)) {
                var portEntity = portMap.get(id);
                return $.ajax({
                    type: 'GET',
                    url: portEntity.uri,
                    dataType: 'json'
                }).done(function (response) {
                    nfPort.set(response);
                });
            }
        },

        /**
         * Positions the component.
         *
         * @param {string} id   The id
         */
        position: function (id) {
            d3.select('#id-' + id).call(nfCanvasUtils.position);
        },

        /**
         * Removes the specified port.
         *
         * @param {string} portIds      The port id(s)
         */
        remove: function (portIds) {
            var now = new Date().getTime();

            if ($.isArray(portIds)) {
                $.each(portIds, function (_, portId) {
                    removedCache.set(portId, now);
                    portMap.remove(portId);
                });
            } else {
                removedCache.set(portIds, now);
                portMap.remove(portIds);
            }

            // apply the selection and handle all removed ports
            select().exit().call(removePorts);
        },

        /**
         * Removes all ports..
         */
        removeAll: function () {
            nfPort.remove(portMap.keys());
        },

        /**
         * Expires the caches up to the specified timestamp.
         *
         * @param timestamp
         */
        expireCaches: function (timestamp) {
            var expire = function (cache) {
                cache.forEach(function (id, entryTimestamp) {
                    if (timestamp > entryTimestamp) {
                        cache.remove(id);
                    }
                });
            };

            expire(addedCache);
            expire(removedCache);
        }
    };

    return nfPort;
}));