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
        define(['d3',
                'nf.Connection',
                'nf.ConnectionConfiguration',
                'nf.CanvasUtils'],
            function (d3, nfConnection, nfConnectionConfiguration, nfCanvasUtils) {
                return (nf.Connectable = factory(d3, nfConnection, nfConnectionConfiguration, nfCanvasUtils));
            });
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = (nf.Connectable =
            factory(require('d3'),
                require('nf.Connection'),
                require('nf.ConnectionConfiguration'),
                require('nf.CanvasUtils')));
    } else {
        nf.Connectable = factory(root.d3,
            root.nf.Connection,
            root.nf.ConnectionConfiguration,
            root.nf.CanvasUtils);
    }
}(this, function (d3, nfConnection, nfConnectionConfiguration, nfCanvasUtils) {
    'use strict';

    var connect;
    var canvas;
    var origin;

    /**
     * Determines if we want to allow adding connections in the current state:
     *
     * 1) When shift is down, we could be adding components to the current selection.
     * 2) When the selection box is visible, we are in the process of moving all the
     * components currently selected.
     * 3) When the drag selection box is visible, we are in the process or selecting components
     * using the selection box.
     *
     * @returns {boolean}
     */
    var allowConnection = function () {
        return !d3.event.shiftKey && d3.select('rect.drag-selection').empty() && d3.select('rect.selection').empty();
    };

    return {
        init: function () {
            canvas = d3.select('#canvas');
                    var sourceWidth;
                    var sourceHeight;
                    var destinationWidth;
                    var destinationHeight;
            // dragging behavior for the connector
            connect = d3.behavior.drag()
                .origin(function (d) {
                    origin = d3.mouse(canvas.node());
                    return {
                        x: origin[0],
                        y: origin[1]
                    };
                })
                .on('dragstart', function (d) {
                    // stop further propagation
                    d3.event.sourceEvent.stopPropagation();

                    // unselect the previous components
                    nfCanvasUtils.getSelection().classed('selected', false);

                    // mark the source component has selected
                    var source = d3.select(this.parentNode).classed('selected', true);

                    // mark this component as dragging and selected
                    d3.select(this).classed('dragging', true);

                    // mark the source of the drag
                    var sourceData = source.datum();
                    sourceWidth= sourceData.dimensions.width;
                    sourceHeight=sourceData.dimensions.height;
                    // start the drag line and insert it first to keep it on the bottom
                    var position = d3.mouse(canvas.node());
                    if($("#id-" + sourceData.id).hasClass("minimized")){
                       sourceWidth=sourceData.minimizedDimensions.width;
                       sourceHeight=sourceData.minimizedDimensions.height;
                    }
                     else if($("#id-" + sourceData.id).hasClass("minimized-process-group")){
                       sourceWidth=sourceData.minimizedDimensions.width;
                       sourceHeight=sourceData.minimizedDimensions.height;
                    }
                    canvas.insert('path', ':first-child')
                        .datum({
                            'sourceId': sourceData.id,
                            'sourceWidth': sourceWidth,
                            'x': position[0],
                            'y': position[1]
                        })
                        .attr({
                            'class': 'connector',
                            'd': function (pathDatum) {
                                return 'M' + pathDatum.x + ' ' + pathDatum.y + 'L' + pathDatum.x + ' ' + pathDatum.y;
                            }
                        });

                    // updates the location of the connection img
                    d3.select(this).attr('transform', function () {
                        return 'translate(' + position[0] + ', ' + (position[1] + 20) + ')';
                    });

                    // re-append the image to keep it on top
                    canvas.node().appendChild(this);
                })
                .on('drag', function (d) {
                    // updates the location of the connection img
                    d3.select(this).attr('transform', function () {
                        return 'translate(' + d3.event.x + ', ' + (d3.event.y + 50) + ')';
                    });

                    // mark node's connectable if supported
                    var destination = d3.select('g.hover').classed('connectable-destination', function () {
                        // ensure the mouse has moved at least 10px in any direction, it seems that
                        // when the drag event is trigger is not consistent between browsers. as a result
                        // some browser would trigger when the mouse hadn't moved yet which caused
                        // click and contextmenu events to appear like an attempt to connection the
                        // component to itself. requiring the mouse to have actually moved before
                        // checking the eligiblity of the destination addresses the issue
                        return (Math.abs(origin[0] - d3.event.x) > 10 || Math.abs(origin[1] - d3.event.y) > 10) &&
                            nfCanvasUtils.isValidConnectionDestination(d3.select(this));
                    });
                    // update the drag line
                    d3.select('path.connector').classed('connectable', function () {
                        if (destination.empty()) {
                            return false;
                        }
                        destination.select(".processor-main-container").classed('connection-destination',true);
                        // if there is a potential destination, see if its connectable
                        return destination.classed('connectable-destination');
                    }).attr('d', function (pathDatum) {
                        if (!destination.empty() && destination.classed('connectable-destination')) {
                            var destinationData = destination.datum();
                            destinationWidth=destinationData.dimensions.width;
                            destinationHeight=destinationData.dimensions.height;
                    if($("#id-" + destinationData.id).hasClass("minimized")){
                       destinationWidth=destinationData.minimizedDimensions.width;
                       destinationHeight=destinationData.minimizedDimensions.height;
                    }
                    else if($("#id-" + destinationData.id).hasClass("minimized-process-group")){
                       destinationWidth=destinationData.minimizedDimensions.width;
                       destinationHeight=destinationData.minimizedDimensions.height;  
                    }
                            // show the line preview as appropriate
                            if (pathDatum.sourceId === destinationData.id) {
                                var x = pathDatum.x;
                                var y = pathDatum.y;
                                var componentOffset = pathDatum.sourceWidth / 2;
                                var xOffset = nfConnection.config.selfLoopXOffset;
                                var yOffset = nfConnection.config.selfLoopYOffset;
                                return 'M' + x + ' ' + y + 'L' + (x + componentOffset + xOffset) + ' ' + (y - yOffset) + 'L' + (x + componentOffset + xOffset) + ' ' + (y + yOffset) + 'Z';
                            } else {
                                // get the position on the destination perimeter
                                var end = nfCanvasUtils.getPerimeterPoint(pathDatum, {
                                    'x': destinationData.position.x,
                                    'y': destinationData.position.y,
                                    'width': destinationWidth,
                                    'height':destinationHeight
                                });

                                // direct line between components to provide a 'snap feel'
                                return 'M' + pathDatum.x + ' ' + pathDatum.y + 'L' + end.x + ' ' + end.y;
                            }
                        } else {
                            return 'M' + pathDatum.x + ' ' + pathDatum.y + 'L' + d3.event.x + ' ' + d3.event.y;
                        }
                    });
                })
                .on('dragend', function (d) {
                    // stop further propagation
                    d3.event.sourceEvent.stopPropagation();

                    // get the add connect img
                    var addConnect = d3.select(this);

                    // get the connector, if it the current point is not over a new destination
                    // the connector will be removed. otherwise it will be removed after the
                    // connection has been configured/cancelled
                    var connector = d3.select('path.connector');
                    var connectorData = connector.datum();

                    // get the destination
                    var destination = d3.select('g.connectable-destination');

                    // we are not over a new destination
                    if (destination.empty()) {
                        // get the source to determine if we are still over it
                        var source = d3.select('#id-' + connectorData.sourceId);
                        var sourceData = source.datum();

                        // get the mouse position relative to the source
                        var position = d3.mouse(source.node());

                        // if the position is outside the component, remove the add connect img
                        if (position[0] < 0 || position[0] > sourceWidth|| position[1] < 0 || position[1] > sourceHeight) {
                            addConnect.remove();
                        } else {
                            // reset the add connect img by restoring the position and place in the DOM
                            addConnect.classed('dragging', false).attr('transform', function () {
                                return 'translate(' + d.origX + ', ' + d.origY + ')';
                            });
                            source.node().appendChild(this);
                        }

                        // remove the connector
                        connector.remove();
                    } else {
                        // remove the add connect img
                        addConnect.remove();

                        // create the connection
                        var destinationData = destination.datum();
                        nfConnectionConfiguration.createConnection(connectorData.sourceId, destinationData.id);
                    }
                });
        },

        /**
         * Activates the connect behavior for the components in the specified selection.
         *
         * @param {selection} components
         */
        activate: function (components) {
            components
                .classed('connectable', true)
                .on('mouseenter.connectable', function (d) {
                    if (allowConnection()) {
                        var selection = d3.select(this);

                        // ensure the current component supports connection source
                        if (nfCanvasUtils.isValidConnectionSource(selection)) {
                            // see if theres already a connector rendered
                            var addConnect = d3.select('text.add-connect');
                            if (addConnect.empty()) {                              
                                 d3.select(this).select('.processor-arrow-icon').style("visibility", function() {
                                 return "visible";
                                 });
                                 d3.select(this).select('.remote-process-group-arrow-icon').style("visibility", function() {
                                 return "visible";
                                 });
                                 d3.select(this).select('.process-group-arrow-icon').style("visibility", function() {
                                  return "visible";
                                  });
                                var id=selection.attr("id");
                                if($("#"+id).hasClass("minimized")||$("#"+id).hasClass("minimized-process-group"))
                                {
                                var x = (d.minimizedDimensions.width / 2) - 14;
                                var y = (d.minimizedDimensions.height / 2) + 14;  
                                }
                                else{
                                var x = (d.dimensions.width / 2) - 14;
                                var y = (d.dimensions.height / 2) + 14; 
                                }
                                selection.append('text')
                                    .datum({
                                        origX: x,
                                        origY: y
                                    })
                                    .call(connect)
                                    .attr({
                                        'class': 'add-connect',
                                        'transform': 'translate(' + x + ', ' + y + ')'
                                    })
                                    .text('\ue834');
                            }
                        }
                    }
                })
                .on('mouseleave.connectable', function () {
                    // conditionally remove the connector
                    var addConnect = d3.select(this).select('text.add-connect');
                    if (!addConnect.empty() && !addConnect.classed('dragging')) {
                        addConnect.remove();
                        d3.select(this).select('.processor-arrow-icon').style("visibility", function() {
                          return "hidden";
                          });
                          d3.select(this).select('.remote-process-group-arrow-icon').style("visibility", function() {
                          return "hidden";
                          });
                          d3.select(this).select('.process-group-arrow-icon').style("visibility", function() {
                          return "hidden";
                          });
                    }
                })
                // Using mouseover/out to workaround chrome issue #122746
                .on('mouseover.connectable', function () {
                    // mark that we are hovering when appropriate
                    d3.select(this).classed('hover', function () {
                        return allowConnection();
                    });
                })
                .on('mouseout.connection', function () {
                    // remove all hover related classes
                    d3.select(this).classed('hover connectable-destination', false);
                });
        },

        /**
         * Deactivates the connect behavior for the components in the specified selection.
         *
         * @param {selection} components
         */
        deactivate: function (components) {
            components
                .classed('connectable', false)
                .on('mouseenter.connectable', null)
                .on('mouseleave.connectable', null)
                .on('mouseover.connectable', null)
                .on('mouseout.connectable', null);
        }
    };
}));