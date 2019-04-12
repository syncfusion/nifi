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
                'nf.Connection',
                'nf.Common',
                'nf.Client',
                'nf.CanvasUtils'],
            function ($, d3, nfConnection, nfCommon, nfClient, nfCanvasUtils) {
                return (nf.RemoteProcessGroup = factory($, d3, nfConnection, nfCommon, nfClient, nfCanvasUtils));
            });
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = (nf.RemoteProcessGroup =
            factory(require('jquery'),
                require('d3'),
                require('nf.Connection'),
                require('nf.Common'),
                require('nf.Client'),
                require('nf.CanvasUtils')));
    } else {
        nf.RemoteProcessGroup = factory(root.$,
            root.d3,
            root.nf.Connection,
            root.nf.Common,
            root.nf.Client,
            root.nf.CanvasUtils);
    }
}(this, function ($, d3, nfConnection, nfCommon, nfClient, nfCanvasUtils) {
    'use strict';

    var nfConnectable;
    var nfDraggable;
    var nfSelectable;
    var nfQuickSelect;
    var nfContextMenu;

    var PREVIEW_NAME_LENGTH = 30;

    var dimensions = {
        width: 230,
        height: 130
    };
    var minimizedDimensions={
        width:230,
        height:65
    };

    // --------------------------------------------
    // remote process groups currently on the graph
    // --------------------------------------------

    var remoteProcessGroupMap;

    // -----------------------------------------------------------
    // cache for components that are added/removed from the canvas
    // -----------------------------------------------------------

    var removedCache;
    var addedCache;

    // --------------------
    // component containers
    // --------------------

    var remoteProcessGroupContainer;

    // --------------------------
    // privately scoped functions
    // --------------------------

    /**
     * Gets the process group comments.
     *
     * @param {object} d
     */
    var getProcessGroupComments = function (d) {
        if (nfCommon.isBlank(d.component.comments)) {
            return 'No comments specified';
        } else {
            return d.component.comments;
        }
    };

    /**
     * Selects the remote process group elements against the current remote process group map.
     */
    var select = function () {
        return remoteProcessGroupContainer.selectAll('g.remote-process-group').data(remoteProcessGroupMap.values(), function (d) {
            return d.id;
        });
    };

    /**
     * Renders the remote process groups in the specified selection.
     *
     * @param {selection} entered           The selection of remote process groups to be rendered
     * @param {boolean} selected            Whether the remote process group is selected
     */
    var renderRemoteProcessGroups = function (entered, selected) {
        if (entered.empty()) {
            return;
        }

        var remoteProcessGroup = entered.append('g')
            .attr({
                'id': function (d) {
                    return 'id-' + d.id;
                },
                'class': 'remote-process-group component minimized'
            })
            .classed('selected', selected)
            .call(nfCanvasUtils.position);

        // ----
        // body
        // ----

        // remote process group border
        remoteProcessGroup.append('rect')
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
                'rx':'2',
                'ry':'2'
            });

        // remote process group body
            //Modified the below lines to add design to the remote processor group
            remoteProcessGroup.append('rect')
            .attr({
                'class': 'body',
                'width': function (d) {
                    return d.dimensions.width;
                },
                'height': function (d) {
                    return d.dimensions.height;
                },
                'filter': 'url(#component-drop-shadow)',
                 'rx':'1',
                 'ry':'1',
                 'stroke':'#ffffff',
                 'stroke-opacity':'1',
                 'fill':'#448dd5'
            });
        // remote process group name
        remoteProcessGroup.append('text')
            .attr({
                'x': 25,
                'y': 18,
                'width': 180,
                'height': 16,
                'class': 'remote-process-group-name'
            });
     // remote process group icon
        remoteProcessGroup.append('image')
            .attr({
                'x': 210,
                'y': 10,
                'width': 14,
                'height': 14,
                'xlink:href':'images/Arrow-down.svg',
                'class': 'remote-process-group-arrow-icon'
            });  
                    
        // always support selection
        remoteProcessGroup.call(nfSelectable.activate).call(nfContextMenu.activate).call(nfQuickSelect.activate);
    };

    // attempt of space between component count and icon for process group contents
    var CONTENTS_SPACER = 5;

    /**
     * Updates the process groups in the specified selection.
     *
     * @param {selection} updated               The process groups to be updated
     */
    var updateRemoteProcessGroups = function (updated) {
        if (updated.empty()) {
            return;
        }

        // remote process group border authorization
        updated.select('rect.border')
            .classed('unauthorized', function (d) {
                return d.permissions.canRead === false;
            });

        // remote process group body authorization
        updated.select('rect.body')
            .classed('unauthorized', function (d) {
                return d.permissions.canRead === false;
            });

        updated.each(function (remoteProcessGroupData) {

            var remoteProcessGroup = d3.select(this);
            var elementId = remoteProcessGroup.attr("id");
            var details = remoteProcessGroup.select('g.remote-process-group-details');
            var isContainerEmpty=false;
            var container = remoteProcessGroup.select('g.remote-process-group-container');
            // update the component behavior as appropriate
            nfCanvasUtils.editable(remoteProcessGroup, nfConnectable, nfDraggable);

            // if this processor is visible, render everything
            if (remoteProcessGroup.classed('visible')) {
                if (details.empty()) {
                    details = remoteProcessGroup.append('g').attr('class', 'remote-process-group-details');
                    if (container.empty()){
                     var container=remoteProcessGroup.append('g').attr('class', 'remote-process-group-container');
                     isContainerEmpty=true;
                     }
                
                     // remote process group secure transfer
                     details.append('text')
                        .attr({
                            'class': 'remote-process-group-transmission-secure',
                            'x': 8,
                            'y': 17
                        }); 
                  // rect background
                    remoteProcessGroup.append('rect')
                        .attr({
                        'x':'0',
			'y':'35',
			'width':'230',
			'height':'1',
			'fill':'#E3E4E5'
                        });              
                    // -------
                    // details
                    // -------      
                        // ------------------
                    // details background
                    // ------------------                                                  
                    // -----
                    // stats
                    // -----
                   if (isContainerEmpty){
                    // stats label container
                    var remoteProcessGroupStatsLabel = container.append('g')
                        .attr({
                            'transform': 'translate(6, 55)'
                        });

                    // sent label
                    remoteProcessGroupStatsLabel.append('text')
                        .attr({
                            'width': 73,
                            'height': 10,
                            'x': 4,
                            'y': 5,
                            'class': 'stats-label'
                        })
                        .text('Sent');

                    // received label
                    remoteProcessGroupStatsLabel.append('text')
                        .attr({
                            'width': 73,
                            'height': 10,
                            'x': 4,
                            'y': 23,
                            'class': 'stats-label'
                        })
                        .text('Received');

                    // stats value container
                    var remoteProcessGroupStatsValue = container.append('g')
                        .attr({
                            'transform': 'translate(65, 55)'
                        });

                    // sent value
                    var sentText = remoteProcessGroupStatsValue.append('text')
                        .attr({
                            'width': 180,
                            'height': 10,
                            'x': 4,
                            'y': 5,
                            'class': 'remote-process-group-sent stats-value'
                        });

                    // sent count
                    sentText.append('tspan')
                        .attr({
                            'class': 'count'
                        });

                    // sent size
                    sentText.append('tspan')
                        .attr({
                            'class': 'size'
                        });

                    // sent ports
                    sentText.append('tspan')
                        .attr({
                            'class': 'ports'
                        });

                    // received value
                    var receivedText = remoteProcessGroupStatsValue.append('text')
                        .attr({
                            'width': 180,
                            'height': 10,
                            'x': 4,
                            'y': 23,
                            'class': 'remote-process-group-received stats-value'
                        });

                    // received ports
                    receivedText.append('tspan')
                        .attr({
                            'class': 'ports'
                        });

                    // received count
                    receivedText.append('tspan')
                        .attr({
                            'class': 'count'
                        });

                    // received size
                    receivedText.append('tspan')
                        .attr({
                            'class': 'size'
                        });

                    // stats value container
                    var processGroupStatsInfo = container.append('g')
                        .attr({
                            'transform': 'translate(165, 55)'
                        });

                    // sent info
                    processGroupStatsInfo.append('text')
                        .attr({
                            'width': 25,
                            'height': 10,
                            'x': 4,
                            'y': 5,
                            'class': 'stats-info'
                        })
                        .text('5 min');

                    // received info
                    processGroupStatsInfo.append('text')
                        .attr({
                            'width': 25,
                            'height': 10,
                            'x': 4,
                            'y': 23,
                            'class': 'stats-info'
                        })
                        .text('5 min');
            }
                if($("#"+elementId).hasClass("minimized")){
                  remoteProcessGroup.select(".remote-process-group-container").style("display","none");
                      // remote process group border authorization
                   remoteProcessGroup.select('rect.border')
                   .attr({
                            'height':function(d){
                                return minimizedDimensions.height;
                            }
                        });
          // remote process group body 
           remoteProcessGroup.select('rect.body')
            .attr({
                'height':function(d){
             return minimizedDimensions.height;
               }
               });
                    // remote process group footer
                    details.append('rect')
                        .attr({
                            'class': 'remote-process-group-footer',
                            'y': 35.5,
                            'x':-0.5,
                            'width':'231',
			    'height':'30',
                            'fill':"#E3E4E5"
                        });
                    // remote process group transmission status
                    details.append('text')
                        .attr({
                            'class': 'remote-process-group-transmission-status-text',
                            'x': 25,
                            'y': 52
                        });   
                   // remote process group transmission status
                    details.append('text')
                        .attr({
                            'class': 'remote-process-group-transmission-status',
                            'x': 10,
                            'y': 52
                        });
                        // -------------------
                    // active thread count
                    // -------------------

                    // active thread count
                    details.append('text')
                        .attr({
                            'class': 'active-thread-count-icon',
                            'y': 52,
                            'x':140,
                        })
                        .text('\ue83f').append('title').text('Active threads');

                    // active thread icon
                    details.append('text')
                        .attr({
                            'class': 'active-thread-count',
                            'y': 52,
                            'x':145,
                            'width':30
                        });

                    // ---------
                    // bulletins
                    // ---------
          /*  Modified the bulletin-background position in remote processor */
                    // bulletin background
                   details.append('rect')
                        .attr({
                            'class': 'bulletin-background',
                            'x':'195',
                            'y':'42',
                            'width': 15,
                            'height': 15,
                            'rx':2,
                            'ry':2
                        });

                    // bulletin icon
                    details.append('text')
                        .attr({
                            'class': 'bulletin-icon',
                            'x' :198,
                            'y': 53
                        })
                        .text('\uf24a');
                          
                      }
                     else
                     {
                    remoteProcessGroup.select(".remote-process-group-container").style("display","block");
                    // remote process group footer
                    details.append('rect')
                        .attr({
                            'class': 'remote-process-group-footer',
                            'y': 100.5,
                            'x':-0.5,
                            'width':'231',
                            'ry':2,
			    'height':'30',
                            'fill':"#E3E4E5"
                        });
                    // remote process group transmission status
                    details.append('text')
                        .attr({
                            'class': 'remote-process-group-transmission-status',
                            'x': 10,
                            'y': 120
                        });
                    // remote process group transmission status
                    details.append('text')
                        .attr({
                            'class': 'remote-process-group-transmission-status-text',
                            'x': 25,
                            'y': 120
                        });
                        // -------------------
                    // active thread count
                    // -------------------

                    // active thread count
                    details.append('text')
                        .attr({
                            'class': 'active-thread-count-icon',
                            'y': 120,
                            'x':140
                        })
                        .text('\ue83f').append('title').text('Active threads');;

                    // active thread icon
                    details.append('text')
                        .attr({
                            'class': 'active-thread-count',
                            'y': 120,
                            'x':145,
                            'width':30
                        });

                    // ---------
                    // bulletins
                    // ---------
          /*  Modified the bulletin-background position in remote processor */
                    // bulletin background
                   details.append('rect')
                        .attr({
                            'class': 'bulletin-background',
                            'x':'195',
                            'y':'110',
                            'width': 15,
                            'height': 15,
                            'rx':2,
                            'ry':2
                        });

                    // bulletin icon
                    details.append('text')
                        .attr({
                            'class': 'bulletin-icon',
                            'x' :198,
                            'y': 121
                        })
                        .text('\uf24a');
                    }
                    
                }

                if (remoteProcessGroupData.permissions.canRead) {
                    // remote process group uri
                    details.select('text.remote-process-group-uri')
                        .each(function (d) {
                            var remoteProcessGroupUri = d3.select(this);

                            // reset the remote process group name to handle any previous state
                            remoteProcessGroupUri.text(null).selectAll('title').remove();

                            // apply ellipsis to the remote process group name as necessary
                            nfCanvasUtils.ellipsis(remoteProcessGroupUri, d.component.targetUris);
                        }).append('title').text(function (d) {
                        return d.component.name;
                    });

                    // update the process groups transmission status
                    details.select('text.remote-process-group-transmission-secure')
                        .text(function (d) {
                            var icon = '';
                            if (d.component.targetSecure === true) {
                                icon = '\uf023';
                            } else {
                                icon = '\uf09c';
                            }
                            return icon;
                        })
                        .each(function (d) {
                            // get the tip
                            var tip = d3.select('#transmission-secure-' + d.id);

                            // remove the tip if necessary
                            if (tip.empty()) {
                                tip = d3.select('#remote-process-group-tooltips').append('div')
                                    .attr('id', function () {
                                        return 'transmission-secure-' + d.id;
                                    })
                                    .attr('class', 'tooltip nifi-tooltip');
                            }

                            // update the tip
                            tip.text(function () {
                                if (d.component.targetSecure === true) {
                                    return "Site-to-Site is secure.";
                                } else {
                                    return "Site-to-Site is NOT secure.";
                                }
                            });

                            // add the tooltip
                            nfCanvasUtils.canvasTooltip(tip, d3.select(this));
                        });

                    // ---------------
                    // update comments
                    // ---------------

                    // update the process group comments
                    details.select('text.remote-process-group-comments')
                        .each(function (d) {
                            var remoteProcessGroupComments = d3.select(this);

                            // reset the processor name to handle any previous state
                            remoteProcessGroupComments.text(null).selectAll('tspan, title').remove();

                            // apply ellipsis to the port name as necessary
                            nfCanvasUtils.ellipsis(remoteProcessGroupComments, getProcessGroupComments(d));
                        }).classed('unset', function (d) {
                        return nfCommon.isBlank(d.component.comments);
                    }).append('title').text(function (d) {
                        return getProcessGroupComments(d);
                    });

                    // --------------
                    // last refreshed
                    // --------------

                    details.select('text.remote-process-group-last-refresh')
                        .text(function (d) {
                            if (nfCommon.isDefinedAndNotNull(d.component.flowRefreshed)) {
                                return d.component.flowRefreshed;
                            } else {
                                return 'Remote flow not current';
                            }
                        });

                    // update the process group name
                    remoteProcessGroup.select('text.remote-process-group-name')
                        .each(function (d) {
                            var remoteProcessGroupName = d3.select(this);

                            // reset the remote process group name to handle any previous state
                            remoteProcessGroupName.text(null).selectAll('title').remove();

                            // apply ellipsis to the remote process group name as necessary
                            nfCanvasUtils.ellipsis(remoteProcessGroupName, d.component.name);
                        }).append('title').text(function (d) {
                        var comments=getProcessGroupComments(d);
                        var title=d.component.name+"\r\n"+"comments: "+comments;
                        return title;
                    });
                } else {
                    // clear the target uri
                    details.select('text.remote-process-group-uri').text(null);

                    // clear the transmission secure icon
                    details.select('text.remote-process-group-transmission-secure').text(null);

                    // clear the process group comments
                    details.select('text.remote-process-group-comments').text(null);

                    // clear the last refresh
                    details.select('text.remote-process-group-last-refresh').text(null);

                    // clear the name
                    remoteProcessGroup.select('text.remote-process-group-name').text(null);
                }

                // populate the stats
                remoteProcessGroup.call(updateProcessGroupStatus);
            } else {
                if (remoteProcessGroupData.permissions.canRead) {
                    // update the process group name
                    remoteProcessGroup.select('text.remote-process-group-name')
                        .text(function (d) {
                            var name = d.component.name;
                            if (name.length > PREVIEW_NAME_LENGTH) {
                                return name.substring(0, PREVIEW_NAME_LENGTH) + String.fromCharCode(8230);
                            } else {
                                return name;
                            }
                        });
                } else {
                    // clear the name
                    remoteProcessGroup.select('text.remote-process-group-name').text(null);
                }

                // remove the tooltips
                remoteProcessGroup.call(removeTooltips);

                // remove the details if necessary
                if (!details.empty()) {
                    details.remove();
                }
            }
        });
    };
 var minimizeRemoteProcessGroup = function(updated) {
    if (updated.empty()) {
        return;
    }
    updated.select(".remote-process-group-container").style("display","none");
    updated.select('rect.body')
        .attr({
            'width': function(d) {
                return d.minimizedDimensions.width;
            },
            'height': function(d) {
                return d.minimizedDimensions.height;
            }
        });
    updated.select('rect.border')
        .attr({
            'width': function(d) {
                return d.minimizedDimensions.width;
            },
            'height': function(d) {
                return d.minimizedDimensions.height;
            }
        });
    updated.select('.remote-process-group-arrow-icon')
        .attr({
            'xlink:href': 'images/Arrow-down.svg'
        });
       // remote process group footer                    
    updated.select('.remote-process-group-footer')
        .attr({
            'y': 35.5,
            'width': 231
        });
   // remote process group transmission status text
    updated.select('.remote-process-group-transmission-status-text')
        .attr({
            'y':'52'
        });
          // remote process group transmission status
     updated.select('.remote-process-group-transmission-status')
    .attr({
      'y': 52
       });
    updated.select('text.active-thread-count-icon')
        .attr({
            'y':'52'
        });
    updated.select('text.active-thread-count')
        .attr({
            'y':'52'
        });
    updated.select('rect.bulletin-background')
        .attr({
            'y': '42'
        });
    updated.select('text.bulletin-icon')
        .attr({
            'y': '53'
        });
};
var maximizeRemoteProcessGroup = function(updated) {
       if (updated.empty()) {
        return;
    }
    updated.select(".remote-process-group-container").style("display","block");
    updated.select('rect.body')
        .attr({
            'width': function(d) {
                return d.dimensions.width;
            },
            'height': function(d) {
                return d.dimensions.height;
            }
        });
    updated.select('rect.border')
        .attr({
            'width': function(d) {
                return d.dimensions.width;
            },
            'height': function(d) {
                return d.dimensions.height;
            }
        });
    updated.select('.remote-process-group-arrow-icon')
        .attr({
            'xlink:href': 'images/Arrow-up.svg'
        });
       // remote process group footer                    
    updated.select('.remote-process-group-footer')
        .attr({
            'y': 100.5,
            'width':231
        });
   // remote process group transmission status text
    updated.select('.remote-process-group-transmission-status-text')
        .attr({
            'y':120
        });
          // remote process group transmission status
     updated.select('.remote-process-group-transmission-status')
    .attr({
      'y': 120
       });
    updated.select('text.active-thread-count-icon')
        .attr({
            'y':120
        });
    updated.select('text.active-thread-count')
        .attr({
            'y':120
        });
    updated.select('rect.bulletin-background')
        .attr({
            'y': 110
        });
    updated.select('text.bulletin-icon')
        .attr({
            'y': 121
        });
};
   $(document).on("click", ".remote-process-group .remote-process-group-arrow-icon", function(event) {
    var selectedProcessGroup = d3.select(this.parentElement);
    var processorGroupId = selectedProcessGroup.attr("id");
    var processorGroupID = this.parentElement.id.slice(3, this.parentElement.id.length);
    var addConnect=d3.select(this.parentElement).select(".add-connect");
    var datum=selectedProcessGroup.datum();
    if ($("#" + processorGroupId).hasClass("minimized")) {
          var x = (datum.dimensions.width / 2) - 14;
          var y = (datum.dimensions.height / 2) + 14;  
        $(this).removeClass("remote-group-minimize-icon");
        $(this).addClass("remote-group-maximize-icon");
        $("#" + processorGroupId).addClass("maximized");
        $("#" + processorGroupId).removeClass("minimized");
        selectedProcessGroup.call(maximizeRemoteProcessGroup);
    } else {
        $(this).addClass("remote-group-minimize-icon");
        $("#" + processorGroupId).addClass("minimized");
        $("#" + processorGroupId).removeClass("maximized");
        $(this).removeClass("remote-group-maximize-icon");
          var x = (datum.minimizedDimensions.width / 2) - 14;
          var y = (datum.minimizedDimensions.height / 2) + 14;  
        selectedProcessGroup.call(minimizeRemoteProcessGroup);
    }
       addConnect.attr({
         'transform': 'translate(' + x + ', ' + y + ')'
        });
    var connections = nfConnection.getComponentConnections(processorGroupID);
    $.each(connections, function(_, connection) {
        // refresh the connection
        nfConnection.refresh(connection.id);
    });
       nf.Birdseye.refresh();
});
    var hasIssues = function (d) {
        return !nfCommon.isEmpty(d.component.authorizationIssues) || !nfCommon.isEmpty(d.component.validationErrors);
    };

    var getIssues = function (d) {
        var issues = [];
        if (!nfCommon.isEmpty(d.component.authorizationIssues)) {
            issues = issues.concat(d.component.authorizationIssues);
        }
        if (!nfCommon.isEmpty(d.component.validationErrors)) {
            issues = issues.concat(d.component.validationErrors);
        }
        return issues;
    };

    /**
     * Updates the process group status.
     *
     * @param {selection} updated           The process groups to be updated
     */
    var updateProcessGroupStatus = function (updated) {
        if (updated.empty()) {
            return;
        }

        // sent count value
        updated.select('text.remote-process-group-sent tspan.count')
            .text(function (d) {
                return nfCommon.substringBeforeFirst(d.status.aggregateSnapshot.sent, ' ');
            });

        // sent size value
        updated.select('text.remote-process-group-sent tspan.size')
            .text(function (d) {
                return ' ' + nfCommon.substringAfterFirst(d.status.aggregateSnapshot.sent, ' ');
            });

        // sent ports value
        updated.select('text.remote-process-group-sent tspan.ports')
            .text(function (d) {
                return ' ' + String.fromCharCode(8594) + ' ' + d.inputPortCount;
            });

        // received ports value
        updated.select('text.remote-process-group-received tspan.ports')
            .text(function (d) {
                return d.outputPortCount + ' ' + String.fromCharCode(8594) + ' ';
            });

        // received count value
        updated.select('text.remote-process-group-received tspan.count')
            .text(function (d) {
                return nfCommon.substringBeforeFirst(d.status.aggregateSnapshot.received, ' ');
            });

        // received size value
        updated.select('text.remote-process-group-received tspan.size')
            .text(function (d) {
                return ' ' + nfCommon.substringAfterFirst(d.status.aggregateSnapshot.received, ' ');
            });

        // --------------------
        // authorization issues
        // --------------------

        // TODO - only consider state from the status
        // update the process groups transmission status
        updated.select('text.remote-process-group-transmission-status')
            .text(function (d) {
                var icon = '';
                if (d.permissions.canRead) {
                    if (hasIssues(d)) {
                        icon = '\uf071';
                    } else if (d.component.transmitting === true) {
                        icon = '\uf140';
                    } else {
                        icon = '\ue80a';
                    }
                }
                return icon;
            })
            .attr('font-family', function (d) {
                var family = '';
                if (d.permissions.canRead) {
                    if (hasIssues(d) || d.component.transmitting) {
                        family = 'FontAwesome';
                    } else {
                        family = 'flowfont';
                    }
                }
                return family;
            })
            .classed('invalid', function (d) {
                return d.permissions.canRead && hasIssues(d);
            })
            .classed('transmitting', function (d) {
                return d.permissions.canRead && !hasIssues(d) && d.component.transmitting === true;
            })
            .classed('not-transmitting', function (d) {
                return d.permissions.canRead && !hasIssues(d) && d.component.transmitting === false;
            })
            .each(function (d) {
                // get the tip
                var tip = d3.select('#authorization-issues-' + d.id);

                // if there are validation errors generate a tooltip
                if (d.permissions.canRead && hasIssues(d)) {
                    // create the tip if necessary
                    if (tip.empty()) {
                        tip = d3.select('#remote-process-group-tooltips').append('div')
                            .attr('id', function () {
                                return 'authorization-issues-' + d.id;
                            })
                            .attr('class', 'tooltip nifi-tooltip');
                    }

                    // update the tip
                    tip.html(function () {
                        var list = nfCommon.formatUnorderedList(getIssues(d));
                        if (list === null || list.length === 0) {
                            return '';
                        } else {
                            return $('<div></div>').append(list).html();
                        }
                    });

                    // add the tooltip
                    nfCanvasUtils.canvasTooltip(tip, d3.select(this));
                } else {
                    if (!tip.empty()) {
                        tip.remove();
                    }
                }
            });
          //run status text
            updated.select('text.remote-process-group-transmission-status-text')
            .text(function (d) {
                  var text = '';
               if (d.permissions.canRead) {
               if (hasIssues(d)) {
                        text = 'Invalid';
                    } else if (d.component.transmitting === true) {
                        text = 'Transmitting';
                    } else {
                        text = 'Non Transmitting';
                    }
                }
                    return text;
                }); 

        updated.each(function (d) {
            var remoteProcessGroup = d3.select(this);
            var offset = 0;

            // -------------------
            // active thread count
            // -------------------            

            nfCanvasUtils.activeThreadCount(remoteProcessGroup, d, function (off) {
                offset = off;
            });

            // ---------
            // bulletins
            // ---------

            remoteProcessGroup.select('rect.bulletin-background').classed('has-bulletins', function () {
                return !nfCommon.isEmpty(d.status.aggregateSnapshot.bulletins);
            });

            nfCanvasUtils.bulletins(remoteProcessGroup, d, function () {
                return d3.select('#remote-process-group-tooltips');
            }, offset);
        });
    };

    /**
     * Removes the remote process groups in the specified selection.
     *
     * @param {selection} removed               The process groups to be removed
     */
    var removeRemoteProcessGroups = function (removed) {
        if (removed.empty()) {
            return;
        }

        removed.call(removeTooltips).remove();
    };

    /**
     * Removes the tooltips for the remote process groups in the specified selection.
     *
     * @param {type} removed
     */
    var removeTooltips = function (removed) {
        removed.each(function (d) {
            // remove any associated tooltips
            $('#bulletin-tip-' + d.id).remove();
            $('#authorization-issues-' + d.id).remove();
            $('#transmission-secure-' + d.id).remove();
        });
    };

    var nfRemoteProcessGroup = {
        /**
         * Initializes of the Process Group handler.
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

            remoteProcessGroupMap = d3.map();
            removedCache = d3.map();
            addedCache = d3.map();

            // create the process group container
            remoteProcessGroupContainer = d3.select('#canvas').append('g')
                .attr({
                    'pointer-events': 'all',
                    'class': 'remote-process-groups'
                });
        },

        /**
         * Adds the specified remote process group entity.
         *
         * @param remoteProcessGroupEntities       The remote process group
         * @param options           Configuration options
         */
        add: function (remoteProcessGroupEntities, options) {
            var selectAll = false;
            if (nfCommon.isDefinedAndNotNull(options)) {
                selectAll = nfCommon.isDefinedAndNotNull(options.selectAll) ? options.selectAll : selectAll;
            }

            // get the current time
            var now = new Date().getTime();

            var add = function (remoteProcessGroupEntity) {
                addedCache.set(remoteProcessGroupEntity.id, now);

                // add the remote process group
                remoteProcessGroupMap.set(remoteProcessGroupEntity.id, $.extend({
                    type: 'RemoteProcessGroup',
                    dimensions: dimensions,
                    minimizedDimensions:minimizedDimensions,
                }, remoteProcessGroupEntity));
            };

            // determine how to handle the specified remote process groups
            if ($.isArray(remoteProcessGroupEntities)) {
                $.each(remoteProcessGroupEntities, function (_, remoteProcessGroupEntity) {
                    add(remoteProcessGroupEntity);
                });
            } else if (nfCommon.isDefinedAndNotNull(remoteProcessGroupEntities)) {
                add(remoteProcessGroupEntities);
            }

            // apply the selection and handle new remote process groups
            var selection = select();
            selection.enter().call(renderRemoteProcessGroups, selectAll);
            selection.call(updateRemoteProcessGroups);
        },

        /**
         * Populates the graph with the specified remote process groups.
         *
         * @argument {object | array} remoteProcessGroupEntities                   The remote process groups to add
         * @argument {object} options                                    Configuration options
         */
        set: function (remoteProcessGroupEntities, options) {
            var selectAll = false;
            var transition = false;
            if (nfCommon.isDefinedAndNotNull(options)) {
                selectAll = nfCommon.isDefinedAndNotNull(options.selectAll) ? options.selectAll : selectAll;
                transition = nfCommon.isDefinedAndNotNull(options.transition) ? options.transition : transition;
            }

            var set = function (proposedRemoteProcessGroupEntity) {
                var currentRemoteProcessGroupEntity = remoteProcessGroupMap.get(proposedRemoteProcessGroupEntity.id);

                // set the remote process group if appropriate due to revision and wasn't previously removed
                if (nfClient.isNewerRevision(currentRemoteProcessGroupEntity, proposedRemoteProcessGroupEntity) && !removedCache.has(proposedRemoteProcessGroupEntity.id)) {
                    remoteProcessGroupMap.set(proposedRemoteProcessGroupEntity.id, $.extend({
                        type: 'RemoteProcessGroup',
                        dimensions: dimensions,
                        minimizedDimensions:minimizedDimensions,
                    }, proposedRemoteProcessGroupEntity));
                }
            };

            // determine how to handle the specified remote process groups
            if ($.isArray(remoteProcessGroupEntities)) {
                $.each(remoteProcessGroupMap.keys(), function (_, key) {
                    var currentRemoteProcessGroupEntity = remoteProcessGroupMap.get(key);
                    var isPresent = $.grep(remoteProcessGroupEntities, function (proposedRemoteProcessGroupEntity) {
                        return proposedRemoteProcessGroupEntity.id === currentRemoteProcessGroupEntity.id;
                    });

                    // if the current remote process group is not present and was not recently added, remove it
                    if (isPresent.length === 0 && !addedCache.has(key)) {
                        remoteProcessGroupMap.remove(key);
                    }
                });
                $.each(remoteProcessGroupEntities, function (_, remoteProcessGroupEntity) {
                    set(remoteProcessGroupEntity);
                });
            } else if (nfCommon.isDefinedAndNotNull(remoteProcessGroupEntities)) {
                set(remoteProcessGroupEntities);
            }

            // apply the selection and handle all new remote process groups
            var selection = select();
            selection.enter().call(renderRemoteProcessGroups, selectAll);
            selection.call(updateRemoteProcessGroups).call(nfCanvasUtils.position, transition);
            selection.exit().call(removeRemoteProcessGroups);
        },

        /**
         * If the remote process group id is specified it is returned. If no remote process
         * group id specified, all remote process groups are returned.
         *
         * @param {string} id
         */
        get: function (id) {
            if (nfCommon.isUndefined(id)) {
                return remoteProcessGroupMap.values();
            } else {
                return remoteProcessGroupMap.get(id);
            }
        },

        /**
         * If the remote process group id is specified it is refresh according to the current
         * state. If no remote process group id is specified, all remote process groups are refreshed.
         *
         * @param {string} id      Optional
         */
        refresh: function (id) {
            if (nfCommon.isDefinedAndNotNull(id)) {
                d3.select('#id-' + id).call(updateRemoteProcessGroups);
            } else {
                d3.selectAll('g.remote-process-group').call(updateRemoteProcessGroups);
            }
        },

        /**
         * Refreshes the components necessary after a pan event.
         */
        pan: function () {
            d3.selectAll('g.remote-process-group.entering, g.remote-process-group.leaving').call(updateRemoteProcessGroups);
        },

        /**
         * Reloads the remote process group state from the server and refreshes the UI.
         * If the remote process group is currently unknown, this function just returns.
         *
         * @param {string} id       The remote process group id
         */
        reload: function (id) {
            if (remoteProcessGroupMap.has(id)) {
                var remoteProcessGroupEntity = remoteProcessGroupMap.get(id);
                return $.ajax({
                    type: 'GET',
                    url: remoteProcessGroupEntity.uri,
                    dataType: 'json'
                }).done(function (response) {
                    nfRemoteProcessGroup.set(response);

                    // reload the group's connections
                    var connections = nfConnection.getComponentConnections(id);
                    $.each(connections, function (_, connection) {
                        if (connection.permissions.canRead) {
                            nfConnection.reload(connection.id);
                        }
                    });
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
         * Removes the specified process group.
         *
         * @param {array|string} remoteProcessGroupIds      The remote process group id(s)
         */
        remove: function (remoteProcessGroupIds) {
            var now = new Date().getTime();

            if ($.isArray(remoteProcessGroupIds)) {
                $.each(remoteProcessGroupIds, function (_, remoteProcessGroupId) {
                    removedCache.set(remoteProcessGroupId, now);
                    remoteProcessGroupMap.remove(remoteProcessGroupId);
                });
            } else {
                removedCache.set(remoteProcessGroupIds, now);
                remoteProcessGroupMap.remove(remoteProcessGroupIds);
            }

            // apply the selection and handle all removed remote process groups
            select().exit().call(removeRemoteProcessGroups);
        },

        /**
         * Removes all remote process groups.
         */
        removeAll: function () {
            nfRemoteProcessGroup.remove(remoteProcessGroupMap.keys());
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

    return nfRemoteProcessGroup;
}));