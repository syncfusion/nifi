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
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery',
                'nf.Common'
            ],
            function($, nfCommon) {
                return (nf.DataPreviewDialog = factory($, nfCommon));
            });
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = (nf.DataPreviewDialog = factory(require('jquery'),
            require('nf.Common')));
    } else {
        nf.DataPreviewDialog = factory(root.$,
            root.nf.Common);
    }
}(this, function($, nfCommon) {
    'use strict';
    /**
     * Initializes the data preview dialog
     */
    var initDataPreviewDialog = function() {
        // initialize the data preview tabs
        $('#data-preview-tabs').tabbs({
            tabStyle: 'tab',
            selectedTabStyle: 'selected-tab',
            scrollableTabContentStyle: 'scrollable',
            tabs: [{
                name: 'INPUT DATA',
                tabContentId: 'inputDataPreview'
            }, {
                name: 'OUTPUT DATA',
                tabContentId: 'outputDataPreview'
            }],
            select: function() {
                var tab = $(this).text();
                $("#ViewType").text('original');
                // update the combo for view type
                $('#data-preview-filter-type').combo({
                    options: [{
                        text: 'original',
                        value: 'original'
                    }]
                });
                if (tab === 'INPUT DATA') {
                    nf.DataPreviewDialog.initXmlEditor("inputDataPreview");
                    var dataType = $("#inputType").text();
                    if (dataType !== "" || dataType !== null) {
                        $("#file-content-type").text(dataType);
                        $("#preview-file-name").text($("#inputFileName").text());
                        if ((dataType.indexOf("application/json") > -1 || (dataType.indexOf("Text/csv") > -1)) && !nf.DataPreviewDialog.isNestedJson($("#inputJsonContent").text())) {
                            nf.DataPreviewDialog.bindDropdownContent(true);
                        }

                    }
                } else if (tab === 'OUTPUT DATA') {
                    nf.DataPreviewDialog.initXmlEditor("outputDataPreview");
                    var dataType = $("#outputType").text();
                    $("#file-content-type").text(dataType);
                    $("#preview-file-name").text($("#outputFileName").text());
                    if (dataType !== "" || dataType !== null) {
                        if (((dataType.indexOf("application/json") > -1) || (dataType.indexOf("Text/csv") > -1)) && !nf.DataPreviewDialog.isNestedJson($("#outputJsonContent").text())) {
                            nf.DataPreviewDialog.bindDropdownContent(true);
                        }
                    }
                }
            }
        });
        // configure the dialog
        $('#data-preview-dialog').modal({
            scrollableContentStyle: 'scrollable',
            header: false,
            footer: false,
            responsive: {
                x: false,
                y: false
            }
        });

        // register a listener when the frame is closed
        $('#data-preview-shell-close-button').click(function() {
            $("#outputContent").text("");
            $("#inputContent").text("");
            // close the shell
            $('#data-preview-dialog').modal('hide');
            var inputGrid = $("#InputDataGrid").data("ejGrid");
            if (inputGrid !== undefined)
                $("#inputDataGrid").ejGrid("destroy");
            var outputGrid = $("#outputDataGrid").data("ejGrid");
            if (outputGrid !== undefined)
                $("#outputDataGrid").ejGrid("destroy");

            $("#inputType").text("");
            $("#outputType").text("");
        });

        // register a listener when the frame is undocked
        $('#shell-undock-button').click(function() {
            var uri = $('#shell-iframe').attr('src');
            if (!nfCommon.isBlank(uri)) {
                // open the page and close the shell
                window.open(uri);

                // close the shell
                $('#data-preview-dialog').modal('hide');
            }
        });
        $(".md-container").click(function(){
            nf.DataPreviewDialog.bindAutoRefreshInterval();
        });
    };
    var showPageResize = null;
    var showContentResize = null;
    var nfContextMenu = null;
    var autoRefresh=0;
    return {
        /**
         * Initialize the shell.
         *
         * @param nfContextMenuRef    The nfContextMenu module.
         */
        init: function(nfContextMenuRef) {
            nfContextMenu = nfContextMenuRef;
            initDataPreviewDialog();
        },
        resizeContent: function(shell) {
            var contentContainer = shell.find('.shell-content-container');
            contentContainer.css({
                width: shell.width(),
                height: shell.height() - 28 - 40 //subtract shell-close-container and padding
            });
            shell.trigger("shell:content:resize");
        },

        // handle resize
        resizeIframe: function(shell) {
            var shellIframe = shell.find('#shell-iframe');
            shellIframe.css({
                width: shell.width(),
                height: shell.height() - 28 - 40 //subtract shell-close-container and padding
            });
            shell.trigger("shell:iframe:resize");
        },
        /**
         * Load given data into js grid
         */
        initGrid: function(source) {
            var id;
            $(".e-grid").css("display", "none");
            if (source.indexOf("outputJsonContent") > -1) {
                id = "outputDataGrid";
                $("#outputDataGrid").css("display", "block");
            } else {
                id = "inputDataGrid";
                $("#inputDataGrid").css("display", "block");
            }
            $('.CodeMirror').css("display", "none");
            $(".datapreview-textarea").css("display", "none");
            var sourceElement = $("#" + source).text();
            if (sourceElement !== "") {
                var dataSource = $.parseJSON(sourceElement);
                $('#' + id).ejGrid({
                    dataSource: dataSource,
                    allowPaging: true,
                    minWidth: 500,
                    pageSettings: {
                        pageSize: 8
                    }
                });
            }
            $("#data-preview-dialog").find("#loader-icon").css("display", "none");
        },
        /**
         * Load data in xml editor using codemirror
         */
        initXmlEditor: function(element) {
            $('.CodeMirror').css("display", "none");
            $(".e-grid").css("display", "none");
            $(".datapreview-textarea").css("display", "none");
            var field = document.getElementById(element);
            xmlEditor = CodeMirror.fromTextArea(field, {
                mode: "application/xml",
                lineNumbers: true,
                matchBrackets: true,
                readOnly: true
            });
            $('.CodeMirror').css("height", "75%");
            if (element.indexOf("outputDataPreview") > -1) {
                xmlEditor.getDoc().setValue($("#outputContent").text());
            } else {
                xmlEditor.getDoc().setValue($("#inputContent").text());
            }
            $("#data-preview-dialog").find("#loader-icon").css("display", "none");
        },
        /**
         * Convert given csv data into json data
         */
        convertCSV: function(response) {
            var data = response.split("\n");
            var json;
            var column;
            json = '[';
            for (var i = 0; i < data.length; i++) {
                var jsonData = data[i].toString();
                jsonData = jsonData.split(",");
                column = '{';
                for (var j = 0; j < jsonData.length; j++) {
                    column = column + '"' + 'column' + j + '"' + ':' + '"' + jsonData[j] + '"';
                    column = column + ",";
                }
                column = column.substring(0, column.length - 1);
                column = column + "},";
                json = json + column;
            }
            json = json.substring(0, json.length - 1);
            json = json + "]";
            return json;
        },
        /**
         * Bind filter types to data preview dialog with grid option
         */
        bindDropdownContent: function(hasGrid) {
            if (hasGrid) {
                $('#data-preview-filter-type').combo({
                    options: [{
                        text: 'original',
                        value: 'original'
                    }, {
                        text: 'grid',
                        value: 'grid'
                    }],
                    select: function() {
                        $("#data-preview-dialog").find("#loader-icon").css("display", "block");
                        var selection = $(this).text();
                        var selectedTab = $("#data-preview-dialog .selected-tab").text();
                        if (selection === 'grid') {
                            $("#ViewType").text('grid');
                            if (selectedTab === 'OUTPUT DATA')
                                nf.DataPreviewDialog.initGrid("outputJsonContent");
                            else
                                nf.DataPreviewDialog.initGrid("inputJsonContent");
                        } else {
                            if (selectedTab === 'OUTPUT DATA')
                                nf.DataPreviewDialog.initXmlEditor("outputDataPreview");
                            else
                                nf.DataPreviewDialog.initXmlEditor("inputDataPreview");
                        }
                    }
                });
            }
        },
        /**
         * Check whether given json is nested json
         */
        isNestedJson: function(element) {
            var isNested = Object.keys(element).some(function(key) {
                return element[key] && typeof element[key] === 'object';
            });
        },
        bindAutoRefreshInterval:function(){
          var state=$(".auto-refresh-container").css("display");
          $(".auto-refresh-container").toggle();
          if(state==="none"){
           // update the combo for auto refresh interval
             $('#auto-refresh-interval').combo({
                    options: [{
                        text: '30 Seconds',
                        value:'30 Seconds'
                    },
                    {
                        text: '20 Seconds',
                        value:'20 Seconds'
                    },
                    {
                        text: '10 Seconds',
                        value:'10 Seconds'
                    },
                    {
                        text: '5 Seconds',
                        value:'5 Seconds'
                    }  
                ],
                 select: function() {
                        var selectedInterval = parseInt($(this).text().split(" ")[0]);
                        var milliSeconds=selectedInterval  * 1000;
                         clearInterval(autoRefresh);
                         autoRefresh = 0;
                        nf.DataPreviewDialog.autoRefreshDataPreview(milliSeconds);
                    }
                });
            }
            else{
               clearInterval(autoRefresh);
               autoRefresh = 0;
            }
        },
        /**
         * Add auto refresh to selected interval
         */
        autoRefreshDataPreview: function(interval) {
              autoRefresh=setInterval(function() {
              var selection = nf.CanvasUtils.getSelection();
              nf.Actions.requestPreviewData(selection);
          }, interval);
        },
        /**
         * Shows a page in the shell.
         *
         * @argument {string} uri               The URI to show
         * @argument {boolean} canUndock        Whether or not the shell is undockable
         */
        showPage: function(uri, canUndock) {
            // if the context menu is on this page, attempt to close
            if (nfCommon.isDefinedAndNotNull(nfContextMenu)) {
                nfContextMenu.hide();
            }

            return $.Deferred(function(deferred) {
                var shell = $('#shell');

                // default undockable to true
                if (nfCommon.isNull(canUndock) || nfCommon.isUndefined(canUndock)) {
                    canUndock = true;
                }

                // register a new close handler
                $('#data-preview-dialog').modal('setCloseHandler', function() {
                    // remove the previous contents of the shell
                    shell.empty();
                    deferred.resolve();
                });

                // register a new open handler
                $('#data-preview-dialog').modal('setOpenHandler', function() {
                    nfCommon.toggleScrollable($('#' + this.find('.tab-container').attr('id') + '-content').get(0));
                });
                // show the custom processor ui
                $('#data-preview-dialog').modal('show');
                // conditionally show the undock button
                if (canUndock) {
                    $('#shell-undock-button').show();
                } else {
                    $('#shell-undock-button').hide();
                }

                // create an iframe to hold the custom ui
                var shellIframe = $('<iframe/>', {
                    id: 'shell-iframe',
                    frameBorder: '0',
                    src: uri
                }).css({
                    width: shell.width(),
                    height: shell.height() - 28 //subtract shell-close-container
                }).appendTo(shell);
            }).promise();
        }
    };
}));