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
                'nf.CanvasUtils', 'nf.Connection'],
            function ($, d3, nfCommon, nfClient, nfCanvasUtils,nfConnection) {
                return (nf.Processor = factory($, d3, nfCommon, nfClient, nfCanvasUtils,nfConnection));
            });
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = (nf.Processor =
            factory(require('jquery'),
                require('d3'),
                require('nf.Common'),
                require('nf.Client'),
                require('nf.CanvasUtils'),
                require('nf.Connection')));
    } else {
        nf.Processor = factory(root.$,
            root.d3,
            root.nf.Common,
            root.nf.Client,
            root.nf.CanvasUtils,
            root.nf.Connection);
    }
}(this, function ($, d3, nfCommon, nfClient, nfCanvasUtils,nfConnection) {
    'use strict';

    var nfConnectable;
    var nfDraggable;
    var nfSelectable;
    var nfQuickSelect;
    var nfContextMenu;

    var PREVIEW_NAME_LENGTH = 25;

    // default dimensions for each type of component
    var dimensions = {
        width: 220,
        height: 129
    };
    var minimizedDimensions={
        width: 185,
        height: 65 
    };
var processorState= "minimized";
var footerDimensions={
   height: 120   
};

var footerMinimizedDimensions={
   height: 57   
};
    // ---------------------------------
    // processors currently on the graph
    // ---------------------------------

    var processorMap;

    // -----------------------------------------------------------
    // cache for components that are added/removed from the canvas
    // -----------------------------------------------------------

    var removedCache;
    var addedCache;

    // --------------------
    // component containers
    // --------------------

    var processorContainer;

    // --------------------------
    // privately scoped functions
    // --------------------------

    /**
     * Selects the processor elements against the current processor map.
     */
    var select = function () {
        return processorContainer.selectAll('g.processor').data(processorMap.values(), function (d) {
            return d.id;
        });
    };

    // renders the processors
    var renderProcessors = function (entered, selected) {
        if (entered.empty()) {
            return;
        }

         processor = entered.append('g')
            .attr({
                'id': function (d) {
                    return 'id-' + d.id;
                },
                'class': 'processor component minimized'
            })
            .classed('selected', selected)
            .call(nfCanvasUtils.position);

        // processor border
        processor.append('rect')
            .attr({
                'width': function (d) {
                    return d.minimizedDimensions.width;
                },
                'height': function (d) {
                    return d.minimizedDimensions.height;
                },
                'fill': 'transparent',
                'class':'border processor-main-container',
                'stroke-opacity': '1',
                'stroke-width': '4px',
                'rx': '1',
                'ry': '1',
                'stroke': '#ffffff'
            });
        // processor body
        processor.append('rect')
            .attr({
                'class': 'body',
                'width': function (d) {
                    return d.minimizedDimensions.width;
                },
                'height': function (d) {
                    return d.minimizedDimensions.height;
                },
                'filter': 'url(#component-drop-shadow)',
                'stroke': 'transparent',
                'rx':1,
                'ry':1
            });

        // minimize icon
        processor.append('image')
            .attr({
                'x':155,
                'y':12,
                'width':14,
                'xlink:href':'images/Arrow-down.svg',
                'height': 18,
                'class': 'processor-arrow-icon'
            }).style('visibility', function (d) {
                            return "hidden";
                        });
             // processor name
             processor.append('text')
            .attr({
                'x':34,
                'y':25,
                'width':110,
                'height': 16,
                'class': 'processor-name'
            });
        // make processors selectable
        processor.call(nfSelectable.activate).call(nfContextMenu.activate).call(nfQuickSelect.activate);
    };
 $(document).on("click", ".processors .processor-arrow-icon", function(event) {
    var selectedProcessor = d3.select(this.parentElement);
    var processorId = selectedProcessor.attr("id");
    var processorID = this.parentElement.id.slice(3, this.parentElement.id.length);
    var addConnect=d3.select(this.parentElement).select(".add-connect");
    var datum=selectedProcessor.datum();
    if ($("#" + processorId).hasClass("maximized")) {
         var x = (datum.minimizedDimensions.width / 2) - 14;
         var y = (datum.minimizedDimensions.height / 2) + 14;  
        $(this).addClass("processor-minimize-icon");
        $("#" + processorId).addClass("minimized");
        $("#" + processorId).removeClass("maximized");
        $(this).removeClass("processor-maximize-icon");
        selectedProcessor.call(minimizeProcessor);
    } else {
         var x = (datum.dimensions.width / 2) - 14;
         var y = (datum.dimensions.height / 2) + 14;  
        $(this).removeClass("processor-minimize-icon");
        $(this).addClass("processor-maximize-icon");
        $("#" + processorId).addClass("maximized");
        $("#" + processorId).removeClass("minimized");
        selectedProcessor.call(maximizeProcessor);
    }
     addConnect.attr({
      'transform': 'translate(' + x + ', ' + y + ')'
     });
    var connections = nfConnection.getComponentConnections(processorID);
    $.each(connections, function(_, connection) {
        // refresh the connection
        nfConnection.refresh(connection.id);
    });
    nf.Birdseye.refresh();
});
    /**
     * Updates the processors in the specified selection.
     *
     * @param {selection} updated       The processors to update
     */
    var updateProcessors = function(updated) {
      var processorText;
      if (updated.empty()) {
          return;
      }
      // processor border authorization
      updated.select('rect.border')
          .classed('unauthorized', function(d) {
              return d.permissions.canRead === false;
          })
          .classed('ghost', function(d) {
              return d.permissions.canRead === true && d.component.extensionMissing === true;
          });
      // processor body authorization
      updated.select('rect.body')
          .classed('unauthorized', function(d) {
              return d.permissions.canRead === false;
          });

      updated.each(function(processorData) {
          var isMinimized = false;
          var processor = d3.select(this);
          var elementId = processor.attr("id");
          if ($("#" + elementId).hasClass("minimized")) {
              isMinimized = true;
              processor.select('rect.body')
                  .attr({
                      'width': function(d) {
                          return d.minimizedDimensions.width;
                      },
                      'height': function(d) {
                          return d.minimizedDimensions.height;
                      }
                  });
              processor.select('rect.processor-main-container')
                  .attr({
                      'width': function(d) {
                          return d.minimizedDimensions.width;
                      },
                      'height': function(d) {
                          return d.minimizedDimensions.height;
                      }
                  });
              processor.select('.processor-arrow-icon')
                  .attr({
                      'x': 155,
                      'xlink:href': 'images/Arrow-down.svg'
                  });
          } else {
              isMinimized = false;
          }
          var details = processor.select('g.processor-canvas-details');
          // update the component behavior as appropriate
          nfCanvasUtils.editable(processor, nfConnectable, nfDraggable);

          // if this processor is visible, render everything
          if (processor.classed('visible')) {
              if (details.empty()) {
                  processor.select('text.processor-name').style('visibility', "visible");
                  details = processor.append('g').attr('class', 'processor-canvas-details');

                  // -----
                  // stats
                  // -----

                  // draw the processor statistics table
                  // Added a overall content:
                  var processorDetails = details.append('g').attr('class', 'processor-inner-details');
                  processorDetails.append('rect')
                      .attr({

                          'height': '0.5',
                          'width': '219',
                          'x': '0.5',
                          'y': '35',
                          'fill': '#ffffff',
                          'stroke-width': '0.5',
                          'stroke': '#E0E0E0',
                          'stroke-opacity': '6'
                      });

                  processorDetails.append('rect')
                      .attr({
                          'width': '70',
                          'height': '70',
                          'x': 0,
                          'y': 37,
                          'fill': '#ffffff',
                          'fill-opacity': "1"
                      });
                  if (isMinimized) {
                      details.select(".processor-inner-details").style("display", "none");
                      var processorFooter = details.append('g').attr('class', 'processor-footer-details');
                      processorFooter.append('rect')
                          .attr({
                              'width': '184',
                              'height': '25',
                              'x': 0.5,
                              'y': 39.5,
                              'class': 'processor-footer-container',
                              'fill': '#E3E4E5',
                              'stroke-width': '1',
                              'stroke': '#E0E0E0',
                              'fill-opacity': "1"
                          });
                      processorFooter.append('text')
                          .attr({
                              'class': 'run-status-icon',
                              'x': 10,
                              'y': function(d) {
                                  return d.footerMinimizedDimensions.height;
                              }
                          });
                      processorFooter.append('text')
                          .attr({
                              'class': 'status-icon',
                              'x': 95,
                              'y': function(d) {
                                  return d.footerMinimizedDimensions.height;
                              }
                          });
                      processorFooter.append('text')
                          .attr({
                              'y': function(d) {
                                  return d.footerMinimizedDimensions.height;
                              },
                              'x': 28,
                              'class': 'run-status-text'
                          });
                      processorFooter.append('text')
                          .attr({
                              'y': function(d) {
                                  return d.footerMinimizedDimensions.height;
                              },
                              'x': 117,
                              'class': 'active-thread-status-text'
                          }).text('Threads');

                      // active thread count
                      processorFooter.append('text')
                          .attr({
                              'class': 'active-thread-count-icon',
                              'y': function(d) {
                                  return d.footerMinimizedDimensions.height;
                              },
                              'x': '115'
                          })
                          .text('\ue83f');

                      // active thread background
                      processorFooter.append('text')
                          .attr({
                              'class': 'active-thread-count',
                              'y': function(d) {
                                  return d.footerMinimizedDimensions.height;
                              },
                              'x': '155',
                              'width':30
                          });

                      // ---------
                      // bulletins
                      // ---------

                      // bulletin background
                      processorFooter.append('rect')
                          .attr({
                              'class': 'bulletin-background',
                              'x': 164,
                              'y': 45,
                              'width': 18,
                              'height': 18
                          });

                      // bulletin icon
                      processorFooter.append('text')
                          .attr({
                              'class': 'bulletin-icon',
                              'x': 168,
                              'y': 58
                          })
                          .text('\uf24a');
                  } else {
                      var processorFooter = details.append('g').attr('class', 'processor-footer-details');
                      processorFooter.append('rect')
                          .attr({
                              'width': '219',
                              'height': '25',
                              'x': 0.5,
                              'y': 104,
                              'class': 'processor-footer-container',
                              'fill': '#E3E4E5',
                              'stroke-width': '1',
                              'stroke': '#E0E0E0',
                              'fill-opacity': "1"
                          });
                      processorFooter.append('text')
                          .attr({
                              'class': 'run-status-icon',
                              'x': 10,
                              'y': function(d) {
                                  return d.footerDimensions.height;
                              }
                          });
                      processorFooter.append('text')
                          .attr({
                              'class': 'status-icon',
                              'x': 95,
                              'y': function(d) {
                                  return d.footerDimensions.height;
                              }
                          });
                      processorFooter.append('text')
                          .attr({
                              'y': function(d) {
                                  return d.footerDimensions.height;
                              },
                              'x': 28,
                              'class': 'run-status-text'
                          })
                      processorFooter.append('text')
                          .attr({
                              'y': function(d) {
                                  return d.footerDimensions.height;
                              },
                              'x': 117,
                              'class': 'active-thread-status-text'
                          }).text('Threads');
                      // active thread count
                      processorFooter.append('text')
                          .attr({
                              'class': 'active-thread-count-icon',
                              'y': function(d) {
                                  return d.footerDimensions.height;
                              },
                              'x': '115'
                          })
                          .text('\ue83f');

                      // active thread background
                      processorFooter.append('text')
                          .attr({
                              'class': 'active-thread-count',
                              'y': function(d) {
                                  return d.footerDimensions.height;
                              },
                              'x': '155',
                              'width':30
                          });

                      // ---------
                      // bulletins
                      // ---------

                      // bulletin background
                      processorFooter.append('rect')
                          .attr({
                              'class': 'bulletin-background',
                              'x': 192,
                              'y': 107,
                              'width': 18,
                              'height': 18
                          });

                      // bulletin icon
                      processorFooter.append('text')
                          .attr({
                              'class': 'bulletin-icon',
                              'x': 196,
                              'y': 121
                          })
                          .text('\uf24a');
                  }
                  // stats label container
                  var processorStatsLabel = processorDetails.append('g')
                      .attr({
                          'transform': 'translate(3,44)'
                      });

                  // in label
                  //Modified the axis value of the stat label
                  processorStatsLabel.append('text')
                      .attr({
                          'width': 73,
                          'height': 10,
                          'y': 5,
                          'x': 4,
                          'class': 'stats-label'
                      })
                      .text('In');

                  // read/write label
                  processorStatsLabel.append('text')
                      .attr({
                          'width': 73,
                          'height': 10,
                          'y': 22,
                          'x': 4,
                          'class': 'stats-label'
                      })
                      .text('Read/Write');

                  // out label
                  processorStatsLabel.append('text')
                      .attr({
                          'width': 73,
                          'height': 10,
                          //'y': 46,
                          'y': 38,
                          'x': '4',
                          'class': 'stats-label'
                      })
                      .text('Out');

                  // tasks/time label
                  processorStatsLabel.append('text')
                      .attr({
                          'width': 73,
                          'height': 10,
                          // 'y': 65,
                          'y': '54',
                          'x': '4',
                          'class': 'stats-label'
                      })
                      .text('Tasks/Time');

                  // stats value container
                  var processorStatsValue = processorDetails.append('g')
                      .attr({
                          'transform': 'translate(69,44)'
                      });

                  // in value
                  processorStatsValue.append('text')
                      .attr({
                          'width': 100,
                          'height': 9,
                          'y': 5,
                          'class': 'processor-in stats-value'
                      });

                  // read/write value
                  processorStatsValue.append('text')
                      .attr({
                          'width': 100,
                          'height': 10,
                          // 'y': 27,
                          'y': 22,
                          'class': 'processor-read-write stats-value'
                      });

                  // out value
                   processorStatsValue.append('text')
                      .attr({
                          'width': 100,
                          'height': 10,
                          // 'y': 46,
                          'y': 38,
                          'class': 'processor-out stats-value'
                      });

                  // tasks/time value
                  processorStatsValue.append('text')
                      .attr({
                          'width': 100,
                          'height': 10,
                          // 'y': 65,
                          'y': 54,
                          'class': 'processor-tasks-time stats-value'
                      });

                  // stats value container
                  var processorStatsInfo = processorDetails.append('g')
                      .attr('transform', 'translate(185,44)');

                  // in info
                  processorStatsInfo.append('text')
                      .attr({
                          'width': 25,
                          'height': 10,
                          //'y': 9,
                          'y': 5,
                          'class': 'stats-info'
                      })
                      .text('5 min');

                  // read/write info
                  processorStatsInfo.append('text')
                      .attr({
                          'width': 25,
                          'height': 10,
                          // 'y': 27,
                          'y': 22,
                          'class': 'stats-info'
                      })
                      .text('5 min');

                  // out info
                  processorStatsInfo.append('text')
                      .attr({
                          'width': 25,
                          'height': 10,
                          // 'y': 46,
                          'y': 38,
                          'class': 'stats-info'
                      })
                      .text('5 min');

                  // tasks/time info
                  processorStatsInfo.append('text')
                      .attr({
                          'width': 25,
                          'height': 10,
                          // 'y': 65,
                          'y': 54,
                          'class': 'stats-info'
                      })
                      .text('5 min');

                  // -------------------
                  // active thread count
                  // -------------------


              }

              if (processorData.permissions.canRead) {
                  // update the processor name
                  processor.select('text.processor-name')
                      .each(function(d) {
                          var processorName = d3.select(this);
                          processorText = nfCommon.substringAfterLast(d.component.type, '.');
                          // reset the processor name to handle any previous state
                          processorName.text(null).selectAll('title').remove();
                          // apply ellipsis to the processor name as necessary
                          nfCanvasUtils.ellipsis(processorName, d.component.name);
                      }).append('title').text(function(d) {
                          return d.component.name;
                      });
                  // read/write value
                  processor.select('text.processor-in')
                      .each(function(d) {
                          var name = d3.select(this);
                          name.text(null).selectAll('title').remove();
                          // apply ellipsis 
                          var value = d.status.aggregateSnapshot.input;
                          nfCanvasUtils.wrapText(name, value);
                      }).append('title').text(function(d) {
                          return d.status.aggregateSnapshot.input;
                      });
                  // read/write value
                  processor.select('text.processor-read-write')
                      .each(function(d) {
                          var name = d3.select(this);
                          name.text(null).selectAll('title').remove();
                          // apply ellipsis 
                          var value = d.status.aggregateSnapshot.read + ' / ' + d.status.aggregateSnapshot.written;
                          var text= nfCanvasUtils.wrapText(name, value);
                          name.text(text);
                      }).append('title').text(function(d) {
                          return d.status.aggregateSnapshot.read + ' / ' + d.status.aggregateSnapshot.written;
                      });

                  // out count value
                  processor.select('text.processor-out')
                      .each(function(d) {
                          var name = d3.select(this);
                          name.text(null).selectAll('title').remove();
                          // apply ellipsis 
                          var value = d.status.aggregateSnapshot.output;
                          var text= nfCanvasUtils.wrapText(name, value);
                          name.text(text);
                      }).append('title').text(function(d) {
                          return d.status.aggregateSnapshot.output;
                      });

                  // tasks/time value
                  processor.select('text.processor-tasks-time')
                      .each(function(d) {
                          var name = d3.select(this);
                          name.text(null).selectAll('title').remove();
                          // apply ellipsis 
                          var value = d.status.aggregateSnapshot.tasks + ' / ' + d.status.aggregateSnapshot.tasksDuration;
                          var text= nfCanvasUtils.wrapText(name, value);
                          name.text(text);
                      }).append('title').text(function(d) {
                          return d.status.aggregateSnapshot.tasks + ' / ' + d.status.aggregateSnapshot.tasksDuration;
                      });



              } else {
                  // clear the processor name
                  processor.select('text.processor-name').text(null);
              }
              // Added processor image
              processor.select(".processor-type-icon").remove();
              processor.append('image')
                  .call(nfCanvasUtils.disableImageHref)
                  .attr({
                      'xlink:href':function(d) {
                           if(checkImageExists('images/' + processorText + '.svg'))
                               return 'images/' + processorText + '.svg';
                           else
                               return 'images/CustomProcessor.svg';
                          
                      },
                      'width': 18,
                      'class': 'processor-type-icon',
                      'height': 18,
                      'x': 9,
                      'y': 11
                  });
              // update the processor type as title to icon
              if (processorData.permissions.canRead) {
                  processor.select('.processor-type-icon')
                      .each(function(d) {}).append('title').text(function(d) {
                          return d.status.aggregateSnapshot.type+" "+ d.component.bundle.version; //nfCommon.substringAfterLast(d.component.type, '.');
                      });
              }
              // populate the stats
              processor.call(updateProcessorStatus);
          } else {
              if (processorData.permissions.canRead) {
                  // update the processor name
                  processor.select('text.processor-name')
                      .text(function(d) {
                          var name = d.component.name;
                          if (name.length > PREVIEW_NAME_LENGTH) {
                              return name.substring(0, PREVIEW_NAME_LENGTH) + String.fromCharCode(8230);
                          } else {
                              return name;
                          }
                      });
              } else {
                  // clear the processor name
                  processor.select('text.processor-name').text(null);
              }
              processor.select('text.processor-name').style('visibility', "hidden");
              // remove the tooltips
              processor.call(removeTooltips);

              // remove the details if necessary
              if (!details.empty()) {
                  details.remove();
              }

          }

          // ---------------
          // processor color
          // ---------------

          //update the processor icon container
          processor.select('rect.processor-icon-container').classed('unauthorized', !processorData.permissions.canRead);

          //update the processor icon
          processor.select('text.processor-icon').classed('unauthorized', !processorData.permissions.canRead);

          //update the processor border
          processor.select('rect.border').classed('unauthorized', !processorData.permissions.canRead);

          // use the specified color if appropriate
          if (processorData.permissions.canRead) {
              if (nfCommon.isDefinedAndNotNull(processorData.component.style['background-color'])) {
                  var color = processorData.component.style['background-color'];

                  //update the processor icon container
                  processor.select('rect.processor-icon-container')
                      .style('fill', function(d) {
                          return color;
                      });

                  //update the processor border
                  processor.select('rect.border')
                      .style('stroke', function(d) {
                          return color;
                      });
              }
          }

          // update the processor color
          processor.select('text.processor-icon')
              .style('fill', function(d) {

                  // get the default color
                  var color = nfProcessor.defaultIconColor();

                  if (!d.permissions.canRead) {
                      return color;
                  }

                  // use the specified color if appropriate
                  if (nfCommon.isDefinedAndNotNull(d.component.style['background-color'])) {
                      color = d.component.style['background-color'];

                      //special case #ffffff implies default fill
                      if (color.toLowerCase() === '#ffffff') {
                          color = nfProcessor.defaultIconColor();
                      } else {
                          color = nfCommon.determineContrastColor(
                              nfCommon.substringAfterLast(
                                  color, '#'));
                      }
                  }

                  return color;
              });

          // restricted component indicator
          processor.select('circle.restricted-background').style('visibility', showRestricted);
          processor.select('text.restricted').style('visibility', showRestricted);
      });
  };

    /**
     * Returns whether the resticted indicator should be shown for a given
     * @param d
     * @returns {*}
     */
    var showRestricted = function (d) {
        if (!d.permissions.canRead) {
            return 'hidden';
        }

        return d.component.restricted ? 'visible' : 'hidden';
    };

    /**
     * Updates the stats for the processors in the specified selection.
     *
     * @param {selection} updated           The processors to update
     */
    var updateProcessorStatus = function (updated) {
        if (updated.empty()) {
            return;
        }
        updated.select('text.run-status-icon')
            .attr({
                'fill': function (d) {
                  var fill = '';
                     if (d.status.aggregateSnapshot.runStatus === 'Disabled') {
                    fill = '#E0B34E';
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
                var img = '';
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
                return img;
            })
            .each(function (d) {
                // get the tip
                var tip = d3.select('#run-status-tip-' + d.id);

                // if there are validation errors generate a tooltip
                if (d.permissions.canRead && !nfCommon.isEmpty(d.component.validationErrors)) {
                    // create the tip if necessary
                    if (tip.empty()) {
                        tip = d3.select('#processor-tooltips').append('div')
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
                    // remove the tip if necessary
                    if (!tip.empty()) {
                        tip.remove();
                    }
                }
            });
            //run status text
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
          
        // in count / in size value
        updated.select('text.processor-in')
            .text(function (d) {
             var name = d3.select(this);
             var text = nfCanvasUtils.wrapText(name, nfCommon.substringBeforeFirst(d.status.aggregateSnapshot.input, ' ') +' '+nfCommon.substringAfterFirst(d.status.aggregateSnapshot.input,' '));
             return text;
            });

        // read/write value
        updated.select('text.processor-read-write')
            .text(function (d) {
                var name = d3.select(this);
                var text= nfCanvasUtils.wrapText(name,d.status.aggregateSnapshot.read + ' / ' + d.status.aggregateSnapshot.written);
                return text;
            });

        // out count //out size value
        updated.select('text.processor-out')
            .text(function (d) {
               var name = d3.select(this);
                var text = nfCanvasUtils.wrapText(name,nfCommon.substringBeforeFirst(d.status.aggregateSnapshot.output, ' ') + ' ' + nfCommon.substringAfterFirst(d.status.aggregateSnapshot.output, ' '));
              return text;
            });
        // tasks/time value
        updated.select('text.processor-tasks-time')
            .text(function (d) {
                var name = d3.select(this);
                var text = nfCanvasUtils.wrapText(name,d.status.aggregateSnapshot.tasks + ' / ' + d.status.aggregateSnapshot.tasksDuration);
                return text;
            });

        updated.each(function (d) {
            var processor = d3.select(this);

            // -------------------
            // active thread count
            // -------------------

            nfCanvasUtils.activeThreadCount(processor, d);
            // ---------
            // bulletins
            // ---------

            processor.select('rect.bulletin-background').classed('has-bulletins', function () {
                return !nfCommon.isEmpty(d.status.aggregateSnapshot.bulletins);
            });

            nfCanvasUtils.bulletins(processor, d, function () {
                return d3.select('#processor-tooltips');
            }, 286);
        });
    };

    /**
     * Removes the processors in the specified selection.
     *
     * @param {selection} removed
     */
    var removeProcessors = function (removed) {
        if (removed.empty()) {
            return;
        }

        removed.call(removeTooltips).remove();
    };
var minimizeProcessor = function(updated) {
    if (updated.empty()) {
        return;
    }
    updated.select(".processor-inner-details").style("display", "none");
    updated.select('rect.processor-main-container')
        .attr({
            'width': function(d) {
                return d.minimizedDimensions.width;
            },
            'height': function(d) {
                return d.minimizedDimensions.height;
            }
        });
    updated.select('rect.body')
        .attr({
            'width': function(d) {
                return d.minimizedDimensions.width;
            },
            'height': function(d) {
                return d.minimizedDimensions.height;
            }
        });
    updated.select('.processor-arrow-icon')
        .attr({
            'x': 163,
            'xlink:href': 'images/Arrow-down.svg'
        });

    updated.select('.processor-footer-container')
        .attr({
            'y': 40,
            'width': function(d) {
                return d.minimizedDimensions.width - 1;
            }
        });
    updated.select('text.run-status-icon')
        .attr({
            'y': function(d) {
                return d.footerMinimizedDimensions.height;
            }
        });
    updated.select('text.active-thread-count-icon')
        .attr({
            'y': function(d) {
                return d.footerMinimizedDimensions.height;
            },
            'x': 100
        });
    updated.select('text.active-thread-status-text')
        .attr({
            'y': function(d) {
                return d.footerMinimizedDimensions.height;
            },
            'x': 105
        });
    updated.select('text.active-thread-count')
        .attr({
            'y': function(d) {
                return d.footerMinimizedDimensions.height;
            },
            'x': 145
        });
    updated.select('text.run-status-text')
        .attr({
            'y': function(d) {
                return d.footerMinimizedDimensions.height;
            }
        });
    updated.select('rect.bulletin-background')
        .attr({
            'y': '45',
            'x': 164
        });
    updated.select('text.bulletin-icon')
        .attr({
            'y': '59',
            'x': 167
        });
    updated.select('.processor-name')
        .attr({
            'width': 125
        });
    // update the processor name
    updated.select('text.processor-name')
        .each(function(d) {
            var processorName = d3.select(this);
            // reset the processor name to handle any previous state
            processorName.text(null).selectAll('title').remove();
            // apply ellipsis to the processor name as necessary
            nfCanvasUtils.ellipsis(processorName, d.component.name);
        }).append('title').text(function(d) {
            return d.component.name;
        });
};
var maximizeProcessor = function(updated) {
    if (updated.empty()) {
        return;
    }
    updated.select(".processor-inner-details").style("display", "block");
    updated.select('rect.processor-main-container')
        .attr({
            'width': function(d) {
                return d.dimensions.width;
            },
            'height': function(d) {
                return d.dimensions.height;
            }
        });
    updated.select('rect.body')
        .attr({
            'width': function(d) {
                return d.dimensions.width;
            },
            'height': function(d) {
                return d.dimensions.height;
            }
        });
    updated.select('.processor-arrow-icon')
        .attr({
            'x': 192,
            'xlink:href': 'images/Arrow-up.svg'
        });
    updated.select('.processor-footer-container')
        .attr({
            'width': '219',
            'y': 104
        });
    updated.select('text.run-status-icon')
        .attr({
            'y': function(d) {
                return d.footerDimensions.height;
            }
        });
    updated.select('text.active-thread-count-icon')
        .attr({
            'y': function(d) {
                return d.footerDimensions.height;
            },
            'x': '115'
        });
    updated.select('text.active-thread-count')
        .attr({
            'y': function(d) {
                return d.footerDimensions.height;
            },
            'x': '155',
        });
    updated.select('text.active-thread-status-text')
        .attr({
            'y': function(d) {
                return d.footerDimensions.height;
            },
            'x': '117'
        });
    updated.select('text.run-status-text')
        .attr({
            'y': function(d) {
                return d.footerDimensions.height;
            }
        });
    updated.select('rect.bulletin-background')
        .attr({
            'y': 107,
            'x': 192
        });
    updated.select('text.bulletin-icon')
        .attr({
            'x': 196,
            'y': 121
        });
    updated.select('.processor-name')
        .attr({
            'width': 150
        });
    // update the processor name
    updated.select('text.processor-name')
        .each(function(d) {
            var processorName = d3.select(this);
            // reset the processor name to handle any previous state
            processorName.text(null).selectAll('title').remove();
            // apply ellipsis to the processor name as necessary
            nfCanvasUtils.ellipsis(processorName, d.component.name);
        }).append('title').text(function(d) {
            return d.component.name;
        });
};
    /**
     * Removes the tooltips for the processors in the specified selection.
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

    var nfProcessor = {
        /**
         * Initializes of the Processor handler.
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

            processorMap = d3.map();
            removedCache = d3.map();
            addedCache = d3.map();

            // create the processor container
            processorContainer = d3.select('#canvas').append('g')
                .attr({
                    'pointer-events': 'all',
                    'class': 'processors'
                });
        },

        /**
         * Adds the specified processor entity.
         *
         * @param processorEntities       The processor
         * @param options           Configuration options
         */
        add: function (processorEntities, options) {
            var selectAll = false;
            if (nfCommon.isDefinedAndNotNull(options)) {
                selectAll = nfCommon.isDefinedAndNotNull(options.selectAll) ? options.selectAll : selectAll;
            }

            // get the current time
            var now = new Date().getTime();

            var add = function (processorEntity) {
                addedCache.set(processorEntity.id, now);

                // add the processor
                processorMap.set(processorEntity.id, $.extend({
                    type: 'Processor',
                    dimensions: dimensions,
                    minimizedDimensions:minimizedDimensions,
                    footerDimensions:footerDimensions,
                    processorState:processorState,
                    footerMinimizedDimensions:footerMinimizedDimensions
                }, processorEntity));
            };

            // determine how to handle the specified processor
            if ($.isArray(processorEntities)) {
                $.each(processorEntities, function (_, processorEntity) {
                    add(processorEntity);
                });
            } else if (nfCommon.isDefinedAndNotNull(processorEntities)) {
                add(processorEntities);
            }

            // apply the selection and handle new processor
            var selection = select();
            selection.enter().call(renderProcessors, selectAll);
            selection.call(updateProcessors);
        },

        /**
         * Populates the graph with the specified processors.
         *
         * @argument {object | array} processorEntities                The processors to add
         * @argument {object} options                Configuration options
         */
        set: function (processorEntities, options) {
            var selectAll = false;
            var transition = false;
            if (nfCommon.isDefinedAndNotNull(options)) {
                selectAll = nfCommon.isDefinedAndNotNull(options.selectAll) ? options.selectAll : selectAll;
                transition = nfCommon.isDefinedAndNotNull(options.transition) ? options.transition : transition;
            }

            var set = function (proposedProcessorEntity) {
                var currentProcessorEntity = processorMap.get(proposedProcessorEntity.id);

                // set the processor if appropriate due to revision and wasn't previously removed
                if (nfClient.isNewerRevision(currentProcessorEntity, proposedProcessorEntity) && !removedCache.has(proposedProcessorEntity.id)) {
                    processorMap.set(proposedProcessorEntity.id, $.extend({
                        type: 'Processor',
                        dimensions: dimensions,
                        minimizedDimensions:minimizedDimensions,
                        footerDimensions:footerDimensions,
                        footerMinimizedDimensions:footerMinimizedDimensions
                    }, proposedProcessorEntity));
                }
            };

            // determine how to handle the specified processor
            if ($.isArray(processorEntities)) {
                $.each(processorMap.keys(), function (_, key) {
                    var currentProcessorEntity = processorMap.get(key);
                    var isPresent = $.grep(processorEntities, function (proposedProcessorEntity) {
                        return proposedProcessorEntity.id === currentProcessorEntity.id;
                    });

                    // if the current processor is not present and was not recently added, remove it
                    if (isPresent.length === 0 && !addedCache.has(key)) {
                        processorMap.remove(key);
                    }
                });
                $.each(processorEntities, function (_, processorEntity) {
                    set(processorEntity);
                });
            } else if (nfCommon.isDefinedAndNotNull(processorEntities)) {
                set(processorEntities);
            }

            // apply the selection and handle all new processors
            var selection = select();
            selection.enter().call(renderProcessors, selectAll);
            selection.call(updateProcessors).call(nfCanvasUtils.position, transition);
            selection.exit().call(removeProcessors);
        },

        /**
         * If the processor id is specified it is returned. If no processor id
         * specified, all processors are returned.
         *
         * @param {string} id
         */
        get: function (id) {
            if (nfCommon.isUndefined(id)) {
                return processorMap.values();
            } else {
                return processorMap.get(id);
            }
        },

        /**
         * If the processor id is specified it is refresh according to the current
         * state. If not processor id is specified, all processors are refreshed.
         *
         * @param {string} id      Optional
         */
        refresh: function (id) {
            if (nfCommon.isDefinedAndNotNull(id)) {
                d3.select('#id-' + id).call(updateProcessors);
            } else {
                d3.selectAll('g.processor').call(updateProcessors);
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
         * Refreshes the components necessary after a pan event.
         */
        pan: function () {
            d3.selectAll('g.processor.entering, g.processor.leaving').call(updateProcessors);
        },

        /**
         * Reloads the processor state from the server and refreshes the UI.
         * If the processor is currently unknown, this function just returns.
         *
         * @param {string} id The processor id
         */
        reload: function (id) {
            if (processorMap.has(id)) {
                var processorEntity = processorMap.get(id);
                return $.ajax({
                    type: 'GET',
                    url: processorEntity.uri,
                    dataType: 'json'
                }).done(function (response) {
                    nfProcessor.set(response);
                });
            }
        },

        /**
         * Removes the specified processor.
         *
         * @param {array|string} processorIds      The processors
         */
        remove: function (processorIds) {
            var now = new Date().getTime();

            if ($.isArray(processorIds)) {
                $.each(processorIds, function (_, processorId) {
                    removedCache.set(processorId, now);
                    processorMap.remove(processorId);
                });
            } else {
                removedCache.set(processorIds, now);
                processorMap.remove(processorIds);
            }

            // apply the selection and handle all removed processors
            select().exit().call(removeProcessors);
        },

        /**
         * Removes all processors.
         */
        removeAll: function () {
            nfProcessor.remove(processorMap.keys());
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
         * Returns the default fill color that should be used when drawing a processor.
         */
        defaultFillColor: function () {
            return '#448dd5';
        },

        /**
         * Returns the default icon color that should be used when drawing a processor.
         */
        defaultIconColor: function () {
            return '#ad9897';
        }
    };

    return nfProcessor;
}));