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

/* global d3, define, module, require, exports */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery',
                'd3',
                'nf.Connection',
                'nf.Common',
                'nf.Client',
                'nf.CanvasUtils',
                'nf.Dialog'],
            function ($, d3, nfConnection, nfCommon, nfClient, nfCanvasUtils, nfDialog) {
                return (nf.ProcessGroup = factory($, d3, nfConnection, nfCommon, nfClient, nfCanvasUtils, nfDialog));
            });
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = (nf.ProcessGroup =
            factory(require('jquery'),
                require('d3'),
                require('nf.Connection'),
                require('nf.Common'),
                require('nf.Client'),
                require('nf.CanvasUtils'),
                require('nf.Dialog')));
    } else {
        nf.ProcessGroup = factory(root.$,
            root.d3,
            root.nf.Connection,
            root.nf.Common,
            root.nf.Client,
            root.nf.CanvasUtils,
            root.nf.Dialog);
    }
}(this, function ($, d3, nfConnection, nfCommon, nfClient, nfCanvasUtils, nfDialog) {
    'use strict';

    var nfConnectable;
    var nfDraggable;
    var nfSelectable;
    var nfContextMenu;

    var PREVIEW_NAME_LENGTH = 30;

    var dimensions = {
        width: 225,
        height: 156
    };
var minimizedDimensions={
        width: 225,
        height: 72  
};
    // ----------------------------
    // process groups currently on the graph
    // ----------------------------

    var processGroupMap;

    // -----------------------------------------------------------
    // cache for components that are added/removed from the canvas
    // -----------------------------------------------------------

    var removedCache;
    var addedCache;

    // --------------------
    // component containers
    // --------------------

    var processGroupContainer;

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
     * Selects the process group elements against the current process group map.
     */
    var select = function () {
        return processGroupContainer.selectAll('g.process-group').data(processGroupMap.values(), function (d) {
            return d.id;
        });
    };

    /**
     * Renders the process groups in the specified selection.
     *
     * @param {selection} entered           The selection of process groups to be rendered
     * @param {boolean} selected            Whether the process group should be selected
     */
    var renderProcessGroups = function (entered, selected) {
        if (entered.empty()) {
            return;
        }

        var processGroup = entered.append('g')
            .attr({
                'id': function (d) {
                    return 'id-' + d.id;
                },
                'class': 'process-group component'
            })
            .classed('selected', selected)
            .call(nfCanvasUtils.position);
        // ----
        // body
        // ----

         // process group border
         processGroup.append('rect')
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
        // process group body
        processGroup.append('rect')
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
                'ry':'1'
            });
        // process group name
        processGroup.append('text')
            .attr({
                'x': 30,
                'y': 20,
                'width': 125,
                'height': 16,
                 'color':'black',
                 'class': 'process-group-name'
            });
       // process group icon
        processGroup.append('image')
            .attr({
                'x':10,
                'y':10,
                'width':14,
                'xlink:href':'images/Process_group.svg',
                'height': 14,
                'class': 'process-group-icon'
            });
            
       // minimize icon
        processGroup.append('image')
            .attr({
                'x':200,
                'y':10,
                'width':14,
                'xlink:href':'images/Arrow-down.svg',
                'height': 14,
                'class': 'process-group-arrow-icon'
            }).style('visibility', function (d) {
                            return "visible";
                        });
        // always support selecting and navigation
        processGroup.on('dblclick', function (d) {
            // enter this group on double click
            nfProcessGroup.enterGroup(d.id);
        })
            .call(nfSelectable.activate).call(nfContextMenu.activate);

        // only support dragging, connection, and drag and drop if appropriate
        processGroup.filter(function (d) {
            return d.permissions.canWrite && d.permissions.canRead;
        })
            .on('mouseover.drop', function (d) {
                // Using mouseover/out to workaround chrome issue #122746

                // get the target and ensure its not already been marked for drop
                var target = d3.select(this);
                if (!target.classed('drop')) {
                    var targetData = target.datum();

                    // see if there is a selection being dragged
                    var drag = d3.select('rect.drag-selection');
                    if (!drag.empty()) {
                        // filter the current selection by this group
                        var selection = nfCanvasUtils.getSelection().filter(function (d) {
                            return targetData.id === d.id;
                        });

                        // ensure this group isn't in the selection
                        if (selection.empty()) {
                            // mark that we are hovering over a drop area if appropriate
                            target.classed('drop', function () {
                                // get the current selection and ensure its disconnected
                                return nfConnection.isDisconnected(nfCanvasUtils.getSelection());
                            });
                        }
                    }
                }
            })
            .on('mouseout.drop', function (d) {
                // mark that we are no longer hovering over a drop area unconditionally
                d3.select(this).classed('drop', false);
            })
            .call(nfDraggable.activate)
            .call(nfConnectable.activate);
    };

    // attempt of space between component count and icon for process group contents
    var CONTENTS_SPACER = 10;
    var CONTENTS_VALUE_SPACER = 5;

    /**
     * Updates the process groups in the specified selection.
     *
     * @param {selection} updated               The process groups to be updated
     */
    var updateProcessGroups = function (updated) {
        if (updated.empty()) {
            return;
        }

        // process group border authorization
        updated.select('rect.border')
            .classed('unauthorized', function (d) {
                return d.permissions.canRead === false;
            });

        // process group body authorization
        updated.select('rect.body')
            .classed('unauthorized', function (d) {
                return d.permissions.canRead === false;
            });

        updated.each(function (processGroupData) {
            var isMinimized = false;
            var processGroup = d3.select(this);
            var elementId = processGroup.attr("id");
            if (processGroup.datum().state==="minimized"){
            isMinimized = true;
            processGroup.classed("minimized-process-group",true);  
            }
            else
            processGroup.classed("maximized-process-group",true);     
            
            var details = processGroup.select('g.process-group-details');

            // update the component behavior as appropriate
            nfCanvasUtils.editable(processGroup, nfConnectable, nfDraggable);

            // if this processor is visible, render everything
            if (processGroup.classed('visible')) {
                if (details.empty()) {
                 details = processGroup.append('g').attr('class', 'process-group-details');
                                     // -------------------
                    // contents background
                    // -------------------    
                    
                   var containerDetails = processGroup.select('.process-group-container');
                   if(containerDetails.empty()){
                   containerDetails=processGroup.append('g')
                        .attr({
                            'x':'0',
                            'y':'120',
                            'width':'225' ,
                            'height':'36',
                            'fill': '#E3E4E5', 
                            'class':'process-group-container'
                        });
                         // stats
                    // -----

                    // stats label container
                    var processGroupStatsLabel = containerDetails.append('g')
                        .attr({
                            'transform': 'translate(6, 53)'
                        });

                    // queued label
                    processGroupStatsLabel.append('text')
                        .attr({
                            'width': 73,
                            'height': 10,
                            'x': 4,
                            'y': 5,
                            'class': 'stats-label'
                        })
                        .text('Queued');

                    // in label
                    processGroupStatsLabel.append('text')
                        .attr({
                            'width': 73,
                            'height': 10,
                            'x': 4,
                            'y': 23,
                            'class': 'stats-label'
                        })
                        .text('In');

                    // read/write label
                    processGroupStatsLabel.append('text')
                        .attr({
                            'width': 73,
                            'height': 10,
                            'x': 4,
                            'y': 39,
                            'class': 'stats-label'
                        })
                        .text('Read/Write');

                    // out label
                    processGroupStatsLabel.append('text')
                        .attr({
                            'width': 73,
                            'height': 10,
                            'x': 4,
                            'y': 55,
                            'class': 'stats-label'
                        })
                        .text('Out');

                    // stats value container
                    var processGroupStatsValue = containerDetails.append('g')
                        .attr({
                            'transform': 'translate(75,53)'
                        });

                    // queued value
                    var queuedText = processGroupStatsValue.append('text')
                        .attr({
                            'width': 90,
                            'height': 10,
                            'x': 4,
                            'y': 5,
                            'class': 'process-group-queued stats-value'
                        });

                    // queued count
                    queuedText.append('tspan')
                        .attr({
                            'class': 'count'
                        });

                    // queued size
                    queuedText.append('tspan')
                        .attr({
                            'class': 'size'
                        });

                    // in value
                    var inText = processGroupStatsValue.append('text')
                        .attr({
                            'width': 90,
                            'height': 10,
                            'x': 4,
                            'y': 23,
                            'class': 'process-group-in stats-value'
                        });

                    // in count
                    inText.append('tspan')
                        .attr({
                            'class': 'count'
                        });

                    // in size
                    inText.append('tspan')
                        .attr({
                            'class': 'size'
                        });

                    // in
                    inText.append('tspan')
                        .attr({
                            'class': 'ports'
                        });

                    // read/write value
                    processGroupStatsValue.append('text')
                        .attr({
                            'width':90,
                            'height': 10,
                            'x': 4,
                            'y': 39,
                            'class': 'process-group-read-write stats-value'
                        });

                    // out value
                    var outText = processGroupStatsValue.append('text')
                        .attr({
                            'width': 90,
                            'height': 10,
                            'x': 4,
                            'y': 55,
                            'class': 'process-group-out stats-value'
                        });

                    // out ports
                    outText.append('tspan')
                        .attr({
                            'class': 'ports'
                        });

                    // out count
                    outText.append('tspan')
                        .attr({
                            'class': 'count'
                        });

                    // out size
                    outText.append('tspan')
                        .attr({
                            'class': 'size'
                        });

                    // stats value container
                    var processGroupStatsInfo = containerDetails.append('g')
                        .attr({
                            'transform': 'translate(181,53)'
                        });

                    // in info
                    processGroupStatsInfo.append('text')
                        .attr({
                            'width': 25,
                            'height': 10,
                            'x': 4,
                            'y': 19,
                            'class': 'stats-info'
                        })
                        .text('5 min');

                    // read/write info
                    processGroupStatsInfo.append('text')
                        .attr({
                            'width': 25,
                            'height': 10,
                            'x': 4,
                            'y': 37,
                            'class': 'stats-info'
                        })
                        .text('5 min');

                    // out info
                    processGroupStatsInfo.append('text')
                        .attr({
                            'width': 25,
                            'height': 10,
                            'x': 4,
                            'y': 55,
                            'class': 'stats-info'
                        })
                        .text('5 min');
                      processGroup.append('rect')
                        .attr({
                          'y':'35',
                          'width':'225', 
                          'height':'1', 
                          'fill': '#E3E4E5',
                          'class':'process-group-border'
                        });    
                        }
                 if(isMinimized){
                  processGroup.select('rect.body')
                  .attr({
                      'height': function(d) {
                          return d.minimizedDimensions.height;
                      }
                      });
                   processGroup.select('rect.border')
                  .attr({
                      'height': function(d) {
                          return d.minimizedDimensions.height;
                      }
                      });
              processGroup.select('.process-group-arrow-icon')
                  .attr({
                      'xlink:href': 'images/Arrow-down.svg'
                  });
                    // -------------------
                    // contents background
                    // -------------------                       
                       details.append('rect')
                        .attr({
                            'x':'0',
                            'y':'38',
                            'width':'225' ,
                            'height':'34.5',
                            'fill': '#E3E4E5', 
                            'class':'process-group-footer'
                        });             
                    // --------
                    // contents
                    // --------

                    // transmitting icon
                    details.append('text')
                        .attr({
                            'x': 5,
                            'y': 58,
                            'class': 'process-group-transmitting process-group-contents-icon',
                            'font-family': 'FontAwesome',
                            'fill':'#868686'
                        })
                        .text('\uf140').append('title').text('Transmitting count');

                    // transmitting count
                    details.append('text')
                        .attr({
                            'x': 19,
                            'y': 58,
                            'width':10,
                            'class': 'process-group-transmitting-count process-group-contents-count'
                        });

                    // not transmitting icon
                    details.append('text')
                        .attr({
                            'fill':'#868686',
                            'y': 58,
                            'x':35,
                            'class': 'process-group-not-transmitting process-group-contents-icon',
                            'font-family': 'flowfont'
                        })
                        .text('\ue80a').append('title').text('Non transmitting count');

                    // not transmitting count
                    details.append('text')
                        .attr({
                            'y': 58,
                            'width':10,
                             'x':50,
                            'class': 'process-group-not-transmitting-count process-group-contents-count'
                        });

                    // running icon
                    details.append('text')
                        .attr({
                            'y': 58,
                            'fill':'#7dc7a0',
                             'x':72,
                            'class': 'process-group-running process-group-contents-icon',
                            'font-family': 'FontAwesome'
                        })
                        .text('\uf04b').append('title').text('Running count');

                    // running count
                    details.append('text')
                        .attr({
                            'y':58,
                            'width':10,
                             'x':85,
                            'class': 'process-group-running-count process-group-contents-count'
                        });

                    // stopped icon
                    details.append('text')
                        .attr({
                            'y': 58,
                            'fill':'#d18686',
                            'x':104,
                            'class': 'process-group-stopped process-group-contents-icon',
                            'font-family': 'FontAwesome'
                        })
                        .text('\uf04d').append('title').text('Stopped count');

                    // stopped count
                    details.append('text')
                        .attr({
                            'y':58,
                            'width':10,
                            'x':118,
                            'class': 'process-group-stopped-count process-group-contents-count'
                        });

                    // invalid icon
                    details.append('text')
                        .attr({
                            'y':58,
                            'fill':'#cf9f5d',
                            'x':135,
                            'class': 'process-group-invalid process-group-contents-icon',
                            'font-family': 'FontAwesome'
                        })
                        .text('\uf071').append('title').text('Invalid count');

                    // invalid count
                    details.append('text')
                        .attr({
                            'y': 58,
                            'width':10,
                            'x':151,
                            'class': 'process-group-invalid-count process-group-contents-count'
                        });

                    // disabled icon
                    details.append('text')
                        .attr({
                            'y': 58,
                            'fill':'#fcaf15',
                            'x':167,
                            'class': 'process-group-disabled process-group-contents-icon',
                            'font-family': 'flowfont'
                        })
                        .text('\ue802').append('title').text('Disabled count');

                    // disabled count
                    details.append('text')                   
                        .attr({
                            'y':58,
                            'width':10,
                            'x':182,
                            'class': 'process-group-disabled-count process-group-contents-count'
                        });                              
                  processGroup.select(".process-group-container").style("display","none");
                  processGroup.select(".process-group-border").style("display","none");
                }
             else{
                  processGroup.select(".process-group-container").style("display", "block");
                  processGroup.select(".process-group-border").style("display","block");
                   processGroup.select('rect.body')
                  .attr({
                      'height': function(d) {
                          return d.dimensions.height;
                      }
                  });
                   processGroup.select('rect.border')
                  .attr({
                      'height': function(d) {
                          return d.dimensions.height;
                      }
                  });
                processGroup.select('.process-group-arrow-icon')
                  .attr({
                      'xlink:href': 'images/Arrow-up.svg'
                  });   
                       details.append('rect')
                        .attr({
                            'x':'0',
                            'y':'122',
                            'width':'225' ,
                            'height':'34.5',
                            'fill': '#E3E4E5', 
                            'class':'process-group-footer'
                        });             
                    // --------
                    // contents
                    // --------

                    // transmitting icon
                    details.append('text')
                        .attr({
                            'x': 5,
                            'y': 145,
                            'class': 'process-group-transmitting process-group-contents-icon',
                            'font-family': 'FontAwesome',
                            'fill':'#868686'
                        })
                        .text('\uf140').append('title').text('Transmitting count');

                    // transmitting count
                    details.append('text')
                        .attr({
                            'x': 19,
                            'y': 145,
                            'class': 'process-group-transmitting-count process-group-contents-count'
                        });

                    // not transmitting icon
                    details.append('text')
                        .attr({
                            'fill':'#868686',
                            'y': 145,
                            'x':35,
                            'class': 'process-group-not-transmitting process-group-contents-icon',
                            'font-family': 'flowfont'
                        })
                        .text('\ue80a').append('title').text('Non transmitting count');

                    // not transmitting count
                    details.append('text')
                        .attr({
                            'y': 145,
                            'width':10,    
                            'x':50,
                            'class': 'process-group-not-transmitting-count process-group-contents-count'
                        });

                    // running icon
                    details.append('text')
                        .attr({
                            'y': 145,
                            'x':72,
                             'fill':'#7dc7a0', 
                            'class': 'process-group-running process-group-contents-icon',
                            'font-family': 'FontAwesome'
                        })
                        .text('\uf04b').append('title').text('Running count');

                    // running count
                    details.append('text')
                        .attr({
                            'y':145,
                            'width':10,
                            'x':85,
                            'class': 'process-group-running-count process-group-contents-count'
                        });

                    // stopped icon
                    details.append('text')
                        .attr({
                            'y': 145,
                            'x':104,
                            'fill':'#d18686',
                            'class': 'process-group-stopped process-group-contents-icon',
                            'font-family': 'FontAwesome'
                        })
                        .text('\uf04d').append('title').text('Stopped count');

                    // stopped count
                    details.append('text')
                        .attr({
                            'y':145,
                             'x':118,
                            'width':10,
                            'class': 'process-group-stopped-count process-group-contents-count'
                        });

                    // invalid icon
                    details.append('text')
                        .attr({
                            'y':145,
                             'x':135,
                            'fill':'#cf9f5d',
                            'class': 'process-group-invalid process-group-contents-icon',
                            'font-family': 'FontAwesome'
                        })
                        .text('\uf071').append('title').text('Invalid count');

                    // invalid count
                    details.append('text')
                        .attr({
                            'y': 145,
                            'width':10,
                             'x':151,
                            'class': 'process-group-invalid-count process-group-contents-count'
                        });

                    // disabled icon
                    details.append('text')
                        .attr({
                            'y': 145,
                            'fill':'#fcaf15',
                            'class': 'process-group-disabled process-group-contents-icon',
                            'font-family': 'flowfont',
                            'x':167
                        })
                        .text('\ue802').append('title').text('Disabled count');

                    // disabled count
                    details.append('text')                   
                        .attr({
                            'y':145,
                            'width':10,
                            'x':182,
                            'class': 'process-group-disabled-count process-group-contents-count'
                        });
                   
                     // -------------------
                     // active thread count
                    // -------------------

                    // active thread count
                    processGroup.append('text')
                        .attr({
                            'class': 'active-thread-count-icon',
                            'y': 20,
                            'x':182
                        })
                        .text('\ue83f');

                    // active thread icon
                    processGroup.append('text')
                        .attr({
                            'class': 'active-thread-count',
                            'y': 20,
                            'width':30,
                            'x':184
                        });

                    // ---------
                    // bulletins
                    // ---------
                     details.append('rect')
                        .attr({
                            'class': 'bulletin-background',
                            'x':205,                         
                            'y': 133,
                            'width':15,
                            'height':15,
                            'rx':2,
                            'ry':2
                        });
                    details.append('text')
                        .attr({
                            'class': 'bulletin-icon',
                            'x':208,
                            'y': 145
                        })
                        .text('\uf24a');       
                }
            }
                
                // update transmitting
                var transmitting = details.select('text.process-group-transmitting')
                    .classed('transmitting', function (d) {
                        return d.permissions.canRead && d.activeRemotePortCount > 0;
                    })
                    .classed('zero', function (d) {
                        return d.permissions.canRead && d.activeRemotePortCount === 0;
                    });
                     details.select('text.process-group-transmitting-count')
                      .each(function(d) {
                     var activeRemotePortCount = d3.select(this);
                      // reset the inactiveRemotePortCount to handle any previous state
                        activeRemotePortCount.text(null).selectAll('title').remove();
                     // apply ellipsis to the inactiveRemotePortCount as necessary
                      nfCanvasUtils.ellipsis(activeRemotePortCount,d.activeRemotePortCount.toString());
                      }).append('title').text(function(d) {
                          return d.activeRemotePortCount;
                      });
                // update not transmitting
                var notTransmitting = details.select('text.process-group-not-transmitting')
                    .classed('not-transmitting', function (d) {
                        return d.permissions.canRead && d.inactiveRemotePortCount > 0;
                    })
                    .classed('zero', function (d) {
                        return d.permissions.canRead && d.inactiveRemotePortCount === 0;
                    });
                    details.select('text.process-group-not-transmitting-count')
                      .each(function(d) {
                     var inactiveRemotePortCount = d3.select(this);
                      // reset the inactiveRemotePortCount to handle any previous state
                        inactiveRemotePortCount.text(null).selectAll('title').remove();
                     // apply ellipsis to the inactiveRemotePortCount as necessary
                      nfCanvasUtils.ellipsis(inactiveRemotePortCount,d.inactiveRemotePortCount.toString());
                      }).append('title').text(function(d) {
                          return d.inactiveRemotePortCount;
                      });
                // update running
                var running = details.select('text.process-group-running')
                    .classed('running', function (d) {
                        return d.permissions.canRead && d.component.runningCount > 0;
                    })
                    .classed('zero', function (d) {
                        return d.permissions.canRead && d.component.runningCount === 0;
                    });
                     details.select('text.process-group-running-count')
                      .each(function(d) {
                       var runningCount = d3.select(this);
                      // reset the running count to handle any previous state
                        runningCount.text(null).selectAll('title').remove();
                     // apply ellipsis to the running count as necessary
                      nfCanvasUtils.ellipsis(runningCount,d.runningCount.toString());
                      }).append('title').text(function(d) {
                          return d.runningCount;
                      });
                // update stopped
                var stopped = details.select('text.process-group-stopped')
                    .classed('stopped', function (d) {
                        return d.permissions.canRead && d.component.stoppedCount > 0;
                    })
                    .classed('zero', function (d) {
                        return d.permissions.canRead && d.component.stoppedCount === 0;
                    });
                     details.select('text.process-group-stopped-count')
                      .each(function(d) {
                        var stoppedCount = d3.select(this);
                      // reset the stopped count to handle any previous state
                        stoppedCount.text(null).selectAll('title').remove();
                     // apply ellipsis to the stopped count as necessary
                      nfCanvasUtils.ellipsis(stoppedCount,d.stoppedCount.toString());
                      }).append('title').text(function(d) {
                          return d.stoppedCount;
                      });

                // update invalid
                var invalid = details.select('text.process-group-invalid')
                    .classed('invalid', function (d) {
                        return d.permissions.canRead && d.component.invalidCount > 0;
                    })
                    .classed('zero', function (d) {
                        return d.permissions.canRead && d.component.invalidCount === 0;
                    })
                     details.select('text.process-group-invalid-count')
                      .each(function(d) {
                        var invalidCount = d3.select(this);
                      // reset the invalid count to handle any previous state
                        invalidCount.text(null).selectAll('title').remove();
                     // apply ellipsis to the invalid count as necessary
                      nfCanvasUtils.ellipsis(invalidCount,d.invalidCount.toString());
                      }).append('title').text(function(d) {
                          return d.invalidCount;
                      });


                // update disabled
                var disabled = details.select('text.process-group-disabled')
                    .classed('disabled', function (d) {
                        return d.permissions.canRead && d.component.disabledCount > 0;
                    })
                    .classed('zero', function (d) {
                        return d.permissions.canRead && d.component.disabledCount === 0;
                    });
                    details.select('text.process-group-disabled-count')
                      .each(function(d) {
                        var disabledCount = d3.select(this);
                      // reset the disabled count to handle any previous state
                        disabledCount.text(null).selectAll('title').remove();
                     // apply ellipsis to the invalid count as necessary
                      nfCanvasUtils.ellipsis(disabledCount,d.disabledCount.toString());
                      }).append('title').text(function(d) {
                          return d.disabledCount;
                      });
                if (processGroupData.permissions.canRead) {
                    // update the process group comments
                    details.select('text.process-group-comments')
                        .each(function (d) {
                          var processGroupComments = d3.select(this);
                         // reset the process group name to handle any previous state
                         processGroupComments.text(null).selectAll('tspan, title').remove();
                       // apply ellipsis to the port name as necessary
                            nfCanvasUtils.ellipsis(processGroupComments, getProcessGroupComments(d));
                        }).classed('unset', function (d) {
                        return nfCommon.isBlank(d.component.comments);
                    }).append('title').text(function (d) {
                        return getProcessGroupComments(d);
                    });

                    // update the process group name
                    processGroup.select('text.process-group-name')
                        .each(function (d) {
                            var processGroupName = d3.select(this);

                            // reset the process group name to handle any previous state
                            processGroupName.text(null).selectAll('title').remove();

                            // apply ellipsis to the process group name as necessary
                            nfCanvasUtils.ellipsis(processGroupName, d.component.name);
                        }).append('title').text(function (d) {
                        var comments=getProcessGroupComments(d);
                        var title=d.component.name+"\r\n"+"comments: "+comments;
                        return title;
                    });
                } else {
                    // clear the process group comments
                    details.select('text.process-group-comments').text(null);

                    // clear the process group name
                    processGroup.select('text.process-group-name').text(null);
                }

                // populate the stats
                processGroup.call(updateProcessGroupStatus);
            } else {
                if (processGroupData.permissions.canRead) {
                    // update the process group name
                    processGroup.select('text.process-group-name')
                        .text(function (d) {
                            var name = d.component.name;
                            if (name.length > PREVIEW_NAME_LENGTH) {
                                return name.substring(0, PREVIEW_NAME_LENGTH) + String.fromCharCode(8230);
                            } else {
                                return name;
                            }
                        });
                } else {
                    // clear the process group name
                    processGroup.select('text.process-group-name').text(null);
                }

                // remove the tooltips
                processGroup.call(removeTooltips);

                // remove the details if necessary
                if (!details.empty()) {
                    details.remove();
                }
            }
        });
    };

    var minimizedProcessGroup = function(updated){
         if (updated.empty()) {
            return;
        }
        var id=updated.attr("id");      
        $("#"+id+" .process-group-container").css("display","none");
        $("#"+id+" .process-group-border").css("display","none");
        updated.select('rect.body')
                  .attr({
                      'height': function(d) {
                          return d.minimizedDimensions.height;
                      }
                      });
       updated.select('rect.border')
                  .attr({
                      'height': function(d) {
                          return d.minimizedDimensions.height;
                      }
                      });
        updated.select('.process-group-arrow-icon')
                  .attr({
                      'xlink:href': 'images/Arrow-down.svg'
                  });
                   // -------------------
                    // contents background
                    // -------------------                       
                       updated.select('rect.process-group-footer')
                        .attr({
                            'y':'38'
                        }); 
                          // --------
                    // contents
                    // --------
                    // transmitting icon
                    updated.select('text.process-group-transmitting')
                        .attr({
                            'y': 58
                        })
                        .text('\uf140');
                    // transmitting count
                    updated.select('text.process-group-transmitting-count')
                        .attr({
                            'y': 58
                        });

                    // not transmitting icon
                    updated.select('text.process-group-not-transmitting')
                        .attr({
                            'y': 58
                        })
                        .text('\ue80a');

                    // not transmitting count
                    updated.select('text.process-group-not-transmitting-count')
                        .attr({
                            'y': 58
                        });

                    // running icon
                    updated.select('text.process-group-running')
                        .attr({
                            'y': 58
                        })
                        .text('\uf04b');

                    // running count
                    updated.select('text.process-group-running-count')
                        .attr({
                            'y':58
                        });

                    // stopped icon
                    updated.select('text.process-group-stopped')
                        .attr({
                            'y': 58
                        })
                        .text('\uf04d');

                    // stopped count
                    updated.select('text.process-group-stopped-count')
                        .attr({
                            'y':58
                        });

                    // invalid icon
                    updated.select('text.process-group-invalid')
                        .attr({
                            'y':58
                        })
                        .text('\uf071');

                    // invalid count
                    updated.select('text.process-group-invalid-count')
                        .attr({
                            'y': 58
                        });

                    // disabled icon
                    updated.select('text.process-group-disabled')
                        .attr({
                            'y': 58
                        })
                        .text('\ue802');

                    // disabled count
                    updated.select('text.process-group-disabled-count')                   
                        .attr({
                            'y':58
                        });    
                    // bulletin background
                    updated.select('rect.bulletin-background')                   
                        .attr({
                            'y':46
                        });  
                         // bulletin icon
                    updated.select('text.bulletin-icon')                   
                        .attr({
                            'y':58
                        });  
    };
    var maximizedProcessGroup = function(updated){
         if (updated.empty()) {
            return;
        }
        var id=updated.attr("id");      
        $("#"+id+" .process-group-container").css("display","block");
        $("#"+id+" .process-group-border").css("display","block");
        updated.select('rect.body')
                  .attr({
                      'height': function(d) {
                          return d.dimensions.height;
                      }
                      });
       updated.select('rect.border')
                  .attr({
                      'height': function(d) {
                          return d.dimensions.height;
                      }
                      });
        updated.select('.process-group-arrow-icon')
                  .attr({
                      'xlink:href': 'images/Arrow-up.svg'
                  });
                   // -------------------
                    // contents background
                    // -------------------                       
                       updated.select('rect.process-group-footer')
                        .attr({
                            'y':'122'
                        }); 
                          // --------
                    // contents
                    // --------
                    // transmitting icon
                    updated.select('text.process-group-transmitting')
                        .attr({
                            'y': 145
                        })
                        .text('\uf140');
                    // transmitting count
                    updated.select('text.process-group-transmitting-count')
                        .attr({
                            'y': 145
                        });

                    // not transmitting icon
                    updated.select('text.process-group-not-transmitting')
                        .attr({
                            'y': 145
                        });

                    // not transmitting count
                    updated.select('text.process-group-not-transmitting-count')
                        .attr({
                            'y': 145
                        });

                    // running icon
                    updated.select('text.process-group-running')
                        .attr({
                            'y': 145
                        });

                    // running count
                    updated.select('text.process-group-running-count')
                        .attr({
                            'y':145
                        });

                    // stopped icon
                    updated.select('text.process-group-stopped')
                        .attr({
                            'y': 145
                        })
                    // stopped count
                    updated.select('text.process-group-stopped-count')
                        .attr({
                            'y':145
                        });

                    // invalid icon
                    updated.select('text.process-group-invalid')
                        .attr({
                            'y':145
                        })
                        .text('\uf071');

                    // invalid count
                    updated.select('text.process-group-invalid-count')
                        .attr({
                            'y': 145
                        });

                    // disabled icon
                    updated.select('text.process-group-disabled')
                        .attr({
                            'y': 145
                        })
                        .text('\ue802');

                    // disabled count
                    updated.select('text.process-group-disabled-count')                   
                        .attr({
                            'y':145
                        });    
                          // bulletin background
                    updated.select('rect.bulletin-background')                   
                        .attr({
                            'y':133
                        });  
                         // bulletin icon
                    updated.select('text.bulletin-icon')                   
                        .attr({
                            'y':145
                        });  
    };
    
    
   $(document).on("click", ".process-group .process-group-arrow-icon", function(event) {
    var state;
    var selectedProcessGroup = d3.select(this.parentElement);
    var processorGroupId = selectedProcessGroup.attr("id");
    var processorGroupID = this.parentElement.id.slice(3, this.parentElement.id.length);
    var addConnect=d3.select(this.parentElement).select(".add-connect");
    var processGroup=selectedProcessGroup.datum();
    if ($("#" + processorGroupId).hasClass("minimized-process-group")) {
          state="maximized";
          var x = (processGroup.dimensions.width / 2) - 14;
          var y = (processGroup.dimensions.height / 2) + 14;  
        $(this).removeClass("group-minimize-icon");
        $(this).addClass("group-maximize-icon");
        $("#" + processorGroupId).addClass("maximized-process-group");
        $("#" + processorGroupId).removeClass("minimized-process-group");
        selectedProcessGroup.call(maximizedProcessGroup);
    } else {
        state="minimized";
        $(this).addClass("group-minimize-icon");
        $("#" + processorGroupId).addClass("minimized-process-group");
        $("#" + processorGroupId).removeClass("maximized-process-group");
        $(this).removeClass("group-maximize-icon");
          var x = (processGroup.minimizedDimensions.width / 2) - 14;
          var y = (processGroup.minimizedDimensions.height / 2) + 14;  
        selectedProcessGroup.call(minimizedProcessGroup);
    }
            // build the entity
            var entity = {
                'revision': nfClient.getRevision(processGroup),
                'component': {
                    'id':processorGroupID,
                    'position': processGroup.position,
                    'state':state
                  }
            };
                   $.ajax({
                    type: 'PUT',
                    url: '../dataintegration-api/process-groups/' +processorGroupID,
                    data: JSON.stringify(entity),
                    dataType: 'json',
                    contentType: 'application/json'
                }).done(function (response) {

                }).fail(function (xhr, status, error) {
                    if (xhr.status === 400 || xhr.status === 404 || xhr.status === 409) {
                        nfDialog.showOkDialog({
                            headerText: 'Component Position',
                            dialogContent: nfCommon.escapeHtml(xhr.responseText)
                        });
                    } else {
                    }
                });
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
    /**
     * Updates the process group status.
     *
     * @param {selection} updated           The process groups to be updated
     */
    var updateProcessGroupStatus = function (updated) {
        if (updated.empty()) {
            return;
        }

        // queued count value
         updated.select('text.process-group-queued tspan.count')
            .text(function (d) {
                return nfCommon.substringBeforeFirst(d.status.aggregateSnapshot.queued, ' ');
            });

        // queued size value
        updated.select('text.process-group-queued tspan.size')
            .text(function (d) {
                return ' ' + nfCommon.substringAfterFirst(d.status.aggregateSnapshot.queued, ' ');
            });

        // in count value
        updated.select('text.process-group-in')
            .each(function (d) {
               var inValue = d3.select(this);
              // reset the input value to handle any previous state
              inValue.text(null).selectAll('title').remove();
                var value = nfCommon.substringBeforeFirst(d.status.aggregateSnapshot.input, ' ') + ' ' + nfCommon.substringAfterFirst(d.status.aggregateSnapshot.queued, ' ')+ ' ' + String.fromCharCode(8594) + ' ' + d.inputPortCount;
               nfCanvasUtils.ellipsis(inValue,value.toString());
              }).append('title').text(function(d) {
                   var value = nfCommon.substringBeforeFirst(d.status.aggregateSnapshot.input, ' ') + ' ' + nfCommon.substringAfterFirst(d.status.aggregateSnapshot.queued, ' ')+ ' ' + String.fromCharCode(8594) + ' ' + d.inputPortCount;
                   return value;
              });  
        // read/write value  
        updated.select('text.process-group-read-write')
         .each(function(d) {
         var value = d.status.aggregateSnapshot.read + ' / ' + d.status.aggregateSnapshot.written;    
         var readWriteValue = d3.select(this);
                      // reset the inactiveRemotePortCount to handle any previous state
                        readWriteValue.text(null).selectAll('title').remove();
                     // apply ellipsis to the inactiveRemotePortCount as necessary
                      nfCanvasUtils.ellipsis(readWriteValue,value.toString());
                      }).append('title').text(function(d) {
                          return d.status.aggregateSnapshot.read + ' / ' + d.status.aggregateSnapshot.written;
                      });    
        // out ports value
        updated.select('text.process-group-out')
          .each(function(d) {
                var outValue = d3.select(this);
              // reset the process group name to handle any previous state
                outValue.text(null).selectAll('title').remove();
             nfCanvasUtils.ellipsis(outValue,(d.outputPortCount + ' ' + String.fromCharCode(8594) + ' '+ nfCommon.substringBeforeFirst(d.status.aggregateSnapshot.output, ' ') + ' ' + nfCommon.substringAfterFirst(d.status.aggregateSnapshot.output, ' ')).toString());
            }).append('title').text(function(d) {
              return d.outputPortCount + ' ' + String.fromCharCode(8594) + ' '+ nfCommon.substringBeforeFirst(d.status.aggregateSnapshot.output, ' ') + ' ' + nfCommon.substringAfterFirst(d.status.aggregateSnapshot.output, ' ');
              });  
        updated.each(function (d) {
            var processGroup = d3.select(this);
            var offset = 0;

            // -------------------
            // active thread count
            // -------------------

            nfCanvasUtils.activeThreadCount(processGroup, d, function (off) {
                offset = off;
            });

            // ---------
            // bulletins
            // ---------

            processGroup.select('rect.bulletin-background').classed('has-bulletins', function () {
                return !nfCommon.isEmpty(d.status.aggregateSnapshot.bulletins);
            });

            nfCanvasUtils.bulletins(processGroup, d, function () {
                return d3.select('#process-group-tooltips');
            }, offset);
        });
    };

    /**
     * Removes the process groups in the specified selection.
     *
     * @param {selection} removed               The process groups to be removed
     */
    var removeProcessGroups = function (removed) {
        if (removed.empty()) {
            return;
        }

        removed.call(removeTooltips).remove();
    };

    /**
     * Removes the tooltips for the process groups in the specified selection.
     *
     * @param {selection} removed
     */
    var removeTooltips = function (removed) {
        removed.each(function (d) {
            // remove any associated tooltips
            $('#bulletin-tip-' + d.id).remove();
        });
    };

    var nfProcessGroup = {
        /**
         * Initializes of the Process Group handler.
         *
         * @param nfConnectableRef   The nfConnectable module.
         * @param nfDraggableRef   The nfDraggable module.
         * @param nfSelectableRef   The nfSelectable module.
         * @param nfContextMenuRef   The nfContextMenu module.
         */
        init: function (nfConnectableRef, nfDraggableRef, nfSelectableRef, nfContextMenuRef) {
            nfConnectable = nfConnectableRef;
            nfDraggable = nfDraggableRef;
            nfSelectable = nfSelectableRef;
            nfContextMenu = nfContextMenuRef;

            processGroupMap = d3.map();
            removedCache = d3.map();
            addedCache = d3.map();

            // create the process group container
            processGroupContainer = d3.select('#canvas').append('g')
                .attr({
                    'pointer-events': 'all',
                    'class': 'process-groups'
                });
        },

        /**
         * Adds the specified process group entity.
         *
         * @param processGroupEntities       The process group
         * @param options           Configuration options
         */
        add: function (processGroupEntities, options) {
            var selectAll = false;
            if (nfCommon.isDefinedAndNotNull(options)) {
                selectAll = nfCommon.isDefinedAndNotNull(options.selectAll) ? options.selectAll : selectAll;
            }

            // get the current time
            var now = new Date().getTime();

            var add = function (processGroupEntity) {
                addedCache.set(processGroupEntity.id, now);

                // add the process group
                processGroupMap.set(processGroupEntity.id, $.extend({
                    type: 'ProcessGroup',
                    dimensions: dimensions,
                    minimizedDimensions:minimizedDimensions,
                }, processGroupEntity));
            };

            // determine how to handle the specified process groups
            if ($.isArray(processGroupEntities)) {
                $.each(processGroupEntities, function (_, processGroupEntity) {
                    add(processGroupEntity);
                });
            } else if (nfCommon.isDefinedAndNotNull(processGroupEntities)) {
                add(processGroupEntities);
            }

            // apply the selection and handle new process groups
            var selection = select();
            selection.enter().call(renderProcessGroups, selectAll);
            selection.call(updateProcessGroups);
        },

        /**
         * Populates the graph with the specified process groups.
         *1467
         * @argument {object | array} processGroupEntities                    The process groups to add
         * @argument {object} options                Configuration options
         */
        set: function (processGroupEntities, options) {
            var selectAll = false;
            var transition = false;
            if (nfCommon.isDefinedAndNotNull(options)) {
                selectAll = nfCommon.isDefinedAndNotNull(options.selectAll) ? options.selectAll : selectAll;
                transition = nfCommon.isDefinedAndNotNull(options.transition) ? options.transition : transition;
            }

            var set = function (proposedProcessGroupEntity) {
                var currentProcessGroupEntity = processGroupMap.get(proposedProcessGroupEntity.id);

                // set the process group if appropriate due to revision and wasn't previously removed
                if (nfClient.isNewerRevision(currentProcessGroupEntity, proposedProcessGroupEntity) && !removedCache.has(proposedProcessGroupEntity.id)) {
                    processGroupMap.set(proposedProcessGroupEntity.id, $.extend({
                        type: 'ProcessGroup',
                        dimensions: dimensions,
                        minimizedDimensions:minimizedDimensions,
                    }, proposedProcessGroupEntity));
                }
            };

            // determine how to handle the specified process groups
            if ($.isArray(processGroupEntities)) {
                $.each(processGroupMap.keys(), function (_, key) {
                    var currentProcessGroupEntity = processGroupMap.get(key);
                    var isPresent = $.grep(processGroupEntities, function (proposedProcessGroupEntity) {
                        return proposedProcessGroupEntity.id === currentProcessGroupEntity.id;
                    });

                    // if the current process group is not present and was not recently added, remove it
                    if (isPresent.length === 0 && !addedCache.has(key)) {
                        processGroupMap.remove(key);
                    }
                });
                $.each(processGroupEntities, function (_, processGroupEntity) {
                    set(processGroupEntity);
                });
            } else if (nfCommon.isDefinedAndNotNull(processGroupEntities)) {
                set(processGroupEntities);
            }

            // apply the selection and handle all new process group
            var selection = select();
            selection.enter().call(renderProcessGroups, selectAll);
            selection.call(updateProcessGroups).call(nfCanvasUtils.position, transition);
            selection.exit().call(removeProcessGroups);
        },

        /**
         * If the process group id is specified it is returned. If no process group id
         * specified, all process groups are returned.
         *
         * @param {string} id
         */
        get: function (id) {
            if (nfCommon.isUndefined(id)) {
                return processGroupMap.values();
            } else {
                return processGroupMap.get(id);
            }
        },

        /**
         * If the process group id is specified it is refresh according to the current
         * state. If no process group id is specified, all process groups are refreshed.
         *
         * @param {string} id      Optional
         */
        refresh: function (id) {
            if (nfCommon.isDefinedAndNotNull(id)) {
                d3.select('#id-' + id).call(updateProcessGroups);
            } else {
                d3.selectAll('g.process-group').call(updateProcessGroups);
            }
        },

        /**
         * Refreshes the components necessary after a pan event.
         */
        pan: function () {
            d3.selectAll('g.process-group.entering, g.process-group.leaving').call(updateProcessGroups);
        },

        /**
         * Reloads the process group state from the server and refreshes the UI.
         * If the process group is currently unknown, this function reloads the canvas.
         *
         * @param {string} id The process group id
         */
        reload: function (id) {
            if (processGroupMap.has(id)) {
                var processGroupEntity = processGroupMap.get(id);
                return $.ajax({
                    type: 'GET',
                    url: processGroupEntity.uri,
                    dataType: 'json'
                }).done(function (response) {
                    nfProcessGroup.set(response);
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
         * @param {string} processGroupIds      The process group id(s)
         */
        remove: function (processGroupIds) {
            var now = new Date().getTime();

            if ($.isArray(processGroupIds)) {
                $.each(processGroupIds, function (_, processGroupId) {
                    removedCache.set(processGroupId, now);
                    processGroupMap.remove(processGroupId);
                });
            } else {
                removedCache.set(processGroupIds, now);
                processGroupMap.remove(processGroupIds);
            }

            // apply the selection and handle all removed process groups
            select().exit().call(removeProcessGroups);
        },

        /**
         * Removes all process groups.
         */
        removeAll: function () {
            nfProcessGroup.remove(processGroupMap.keys());
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
        },

        /**
         * Enters the specified group.
         *
         * @param {string} groupId
         */
        enterGroup: function (groupId) {

            // hide the context menu
            nfContextMenu.hide();

            // set the new group id
            nfCanvasUtils.setGroupId(groupId);

            // reload the graph
            return nfCanvasUtils.reload().done(function () {

                // attempt to restore the view
                var viewRestored = nfCanvasUtils.restoreUserView();

                // if the view was not restore attempt to fit
                if (viewRestored === false) {
                    nfCanvasUtils.fitCanvasView();

                    // refresh the canvas
                    nfCanvasUtils.refreshCanvasView({
                        transition: true
                    });
                }

                // update URL deep linking params
                nfCanvasUtils.setURLParameters(groupId, d3.select());

            }).fail(function () {
                nfDialog.showOkDialog({
                    headerText: 'Process Group',
                    dialogContent: 'Unable to enter the selected group.'
                });
            });
        }
    };
    return nfProcessGroup;    
}));