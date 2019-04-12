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

/* global define, module, require, exports, nf */
var selectedConnectionId=[];
var selectedProcessGroupId=[];
var childGroupProcessId=[];
var totalGroupProcessorId=[];
var gridDataList = [];
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery',
                'd3',
                'nf.CanvasUtils',
                'nf.Common',
                'nf.Dialog',
                'nf.Client',
                'nf.ErrorHandler',
                'nf.Clipboard',
                'nf.Snippet',
                'nf.GoTo',
                'nf.ng.Bridge',
                'nf.Shell',
                'nf.VariableRegistry',
                'nf.ComponentState',
                'nf.Draggable',
                'nf.Birdseye',
                'nf.Connection',
                'nf.Graph',
                'nf.ProcessGroupConfiguration',
                'nf.ProcessorConfiguration',
                'nf.ProcessorDetails',
                'nf.LabelConfiguration',
                'nf.RemoteProcessGroupConfiguration',
                'nf.RemoteProcessGroupDetails',
                'nf.PortConfiguration',
                'nf.PortDetails',
                'nf.ConnectionConfiguration',
                'nf.ConnectionDetails',
                'nf.PolicyManagement',
                'nf.RemoteProcessGroup',
                'nf.Label',
                'nf.Processor',
                'nf.RemoteProcessGroupPorts',
                'nf.ComponentVersion',
                'nf.QueueListing',
                'nf.StatusHistory'],
            function ($, d3, nfCanvasUtils, nfCommon, nfDialog, nfClient, nfErrorHandler, nfClipboard, nfSnippet, nfGoto, nfNgBridge, nfShell, nfVariableRegistry, nfComponentState, nfDraggable, nfBirdseye, nfConnection, nfGraph, nfProcessGroupConfiguration, nfProcessorConfiguration, nfProcessorDetails, nfLabelConfiguration, nfRemoteProcessGroupConfiguration, nfRemoteProcessGroupDetails, nfPortConfiguration, nfPortDetails, nfConnectionConfiguration, nfConnectionDetails, nfPolicyManagement, nfRemoteProcessGroup, nfLabel, nfProcessor, nfRemoteProcessGroupPorts, nfComponentVersion, nfQueueListing, nfStatusHistory) {
                return (nf.Actions = factory($, d3, nfCanvasUtils, nfCommon, nfDialog, nfClient, nfErrorHandler, nfClipboard, nfSnippet, nfGoto, nfNgBridge, nfShell, nfVariableRegistry, nfComponentState, nfDraggable, nfBirdseye, nfConnection, nfGraph, nfProcessGroupConfiguration, nfProcessorConfiguration, nfProcessorDetails, nfLabelConfiguration, nfRemoteProcessGroupConfiguration, nfRemoteProcessGroupDetails, nfPortConfiguration, nfPortDetails, nfConnectionConfiguration, nfConnectionDetails, nfPolicyManagement, nfRemoteProcessGroup, nfLabel, nfProcessor, nfRemoteProcessGroupPorts, nfComponentVersion, nfQueueListing, nfStatusHistory));
            });
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = (nf.Actions =
            factory(require('jquery'),
                require('d3'),
                require('nf.CanvasUtils'),
                require('nf.Common'),
                require('nf.Dialog'),
                require('nf.Client'),
                require('nf.ErrorHandler'),
                require('nf.Clipboard'),
                require('nf.Snippet'),
                require('nf.GoTo'),
                require('nf.ng.Bridge'),
                require('nf.Shell'),
                require('nf.VariableRegistry'),
                require('nf.ComponentState'),
                require('nf.Draggable'),
                require('nf.Birdseye'),
                require('nf.Connection'),
                require('nf.Graph'),
                require('nf.ProcessGroupConfiguration'),
                require('nf.ProcessorConfiguration'),
                require('nf.ProcessorDetails'),
                require('nf.LabelConfiguration'),
                require('nf.RemoteProcessGroupConfiguration'),
                require('nf.RemoteProcessGroupDetails'),
                require('nf.PortConfiguration'),
                require('nf.PortDetails'),
                require('nf.ConnectionConfiguration'),
                require('nf.ConnectionDetails'),
                require('nf.PolicyManagement'),
                require('nf.RemoteProcessGroup'),
                require('nf.Label'),
                require('nf.Processor'),
                require('nf.RemoteProcessGroupPorts'),
                require('nf.ComponentVersion'),
                require('nf.QueueListing'),
                require('nf.StatusHistory')));
    } else {
        nf.Actions = factory(root.$,
            root.d3,
            root.nf.CanvasUtils,
            root.nf.Common,
            root.nf.Dialog,
            root.nf.Client,
            root.nf.ErrorHandler,
            root.nf.Clipboard,
            root.nf.Snippet,
            root.nf.GoTo,
            root.nf.ng.Bridge,
            root.nf.Shell,
            root.nf.VariableRegistry,
            root.nf.ComponentState,
            root.nf.Draggable,
            root.nf.Birdseye,
            root.nf.Connection,
            root.nf.Graph,
            root.nf.ProcessGroupConfiguration,
            root.nf.ProcessorConfiguration,
            root.nf.ProcessorDetails,
            root.nf.LabelConfiguration,
            root.nf.RemoteProcessGroupConfiguration,
            root.nf.RemoteProcessGroupDetails,
            root.nf.PortConfiguration,
            root.nf.PortDetails,
            root.nf.ConnectionConfiguration,
            root.nf.ConnectionDetails,
            root.nf.PolicyManagement,
            root.nf.RemoteProcessGroup,
            root.nf.Label,
            root.nf.Processor,
            root.nf.RemoteProcessGroupPorts,
            root.nf.ComponentVersion,
            root.nf.QueueListing,
            root.nf.StatusHistory);
    }
}(this, function ($, d3, nfCanvasUtils, nfCommon, nfDialog, nfClient, nfErrorHandler, nfClipboard, nfSnippet, nfGoto, nfNgBridge, nfShell, nfVariableRegistry, nfComponentState, nfDraggable, nfBirdseye, nfConnection, nfGraph, nfProcessGroupConfiguration, nfProcessorConfiguration, nfProcessorDetails, nfLabelConfiguration, nfRemoteProcessGroupConfiguration, nfRemoteProcessGroupDetails, nfPortConfiguration, nfPortDetails, nfConnectionConfiguration, nfConnectionDetails, nfPolicyManagement, nfRemoteProcessGroup, nfLabel, nfProcessor, nfRemoteProcessGroupPorts, nfComponentVersion, nfQueueListing, nfStatusHistory) {
    'use strict';

    var config = {
        urls: {
            api: '../dataintegration-api',
            controller: '../dataintegration-api/controller'
        }
    };

 var MAX_DELAY = 4;
 var cancelled = false;
 var dropRequests=[];
 var dropRequestTimer = null;
 var totalCount;
 var totalQueued;
 var totalFiles;
 var connectionCount;
 var deletedRequests=[];
 var xmlEditor;
var pollDropRequest = function(dropRequest) {   
    $.ajax({
        asyn: false,
        type: 'GET',
        url: dropRequest.uri,
        dataType: 'json'
    }).done(function(response) {
        dropRequest = response.dropRequest;
       // close the dialog if the
     if (dropRequest.finished === true || cancelled === true) {
      DeleteQueue(dropRequest);
      dropRequests.pop(dropRequest);
      if(dropRequests.length===0){
       processDropRequest("Completed Successfully"); 
        dropRequestTimer = null; 
       if (dropRequestTimer !== null) {
           // cancel it
          clearTimeout(dropRequestTimer);
            // cancel the drop request
         }     
    }
     } else {
   // wait delay to poll again
    dropRequestTimer = setTimeout(function () {
      // clear the drop request timer
    dropRequestTimer = null;
   // schedule to poll the status again in nextDelay
     dropRequestTimer = pollDropRequest(dropRequest);
   }, 1 * 1000);
   }
    }).fail(function(xhr, status, error) {
        if (xhr.status === 403) {
            nfErrorHandler.handleAjaxError(xhr, status, error);
        } else {
            DeleteQueue(dropRequest);
             dropRequestTimer = null; 
        }
    });
};
// process the drop request
 var processDropRequest = function(text) {
$('#drop-request-status-message').text(text);  
 };

var Emptyqueue = function(emptyQueueType) {
    selection = nf.CanvasUtils.getSelection();
    var deleteOperationPerformed = emptyQueueType;
    var count = 0;
    var connectioncount = 0;
    totalCount=0;
    totalQueued=0;
    totalFiles=0;
    deletedRequests=[];
    dropRequests=[];
    connectionCount=0;
    var processgroupcount = 0;
    if (selection[0].length !== 0) { // when component is selected
        for (count; count < selection[0].length; count++) {
            var selectedcomponentid = selection[0][count].id;
            var selectedcomponentclass = $("#" + selectedcomponentid).attr("class");
            if (selectedcomponentclass.indexOf('connection') > -1) {
                connectioncount = connectioncount + 1;
                selectedcomponentid = selection[0][count].id;
                selectedConnectionId.push(selectedcomponentid.replace("id-", ""));

            } else if (selectedcomponentclass.indexOf('process-group') > -1) {
                processgroupcount = processgroupcount + 1;
                selectedcomponentid = selection[0][count].id;
                selectedProcessGroupId.push(selectedcomponentid.replace("id-", ""));
            }

        }
      if (connectioncount === selection[0].length && selection[0].length !== 0) {

        Postrequest();
        nf.CanvasUtils.reload();
    } else if (processgroupcount === selection[0].length && selection[0].length !== 0) {

        ExtractingProcessorGroupId();
        GettingGroupProcessorConnection();
        Postrequest();
        nf.CanvasUtils.reload();
    } else {

        if (selectedConnectionId.length !== 0) {

            Postrequest();

        }
        if (selectedProcessGroupId.length !== 0) {

            ExtractingProcessorGroupId();
            GettingGroupProcessorConnection();
            Postrequest();

        }
        nf.CanvasUtils.reload();
    }
    } // when no component is selected
    else {
        var canvasPageGroupId = nf.CanvasUtils.getGroupId();
        selectedProcessGroupId.push(canvasPageGroupId);
        ExtractingProcessorGroupId();
        GettingGroupProcessorConnection();
        Postrequest();
    }
//    if (deleteOperationPerformed !== 'Delete') {
//        nfDialog.showOkDialog({
//            headerText: 'Empty Queue',
//            dialogContent: 'Emptied queued flow files for the selected components.',
//            handler: {
//                click: function() {
//                    nf.CanvasUtils.reload();
//                }
//            }
//        });
//    }
    nf.CanvasUtils.reload();
};
var GettingGroupProcessorConnection = function() {
    var count = 0;
    var groupProcessorId;
    for (count; count < totalGroupProcessorId.length; count++) {
        groupProcessorId = totalGroupProcessorId[count];
        $.ajax({
            async: false,
            type: 'GET',
            url: '../dataintegration-api/process-groups/' + encodeURIComponent(groupProcessorId) + '/connections',
            dataType: 'json',
            contentType: 'application/json'
        }).done(function(responseText) {
            if (responseText.connections.length !== 0) {
                var count = 0;
                var connectionId;
                for (count; count < responseText.connections.length; count++) {
                    connectionId = responseText.connections[count].id;
                    selectedConnectionId.push(connectionId);
                }
            }
        }).fail(function(xhr, status, error) {
            if (xhr.status === 403) {
                nfErrorHandler.handleAjaxError(xhr, status, error);
            }
        });

    }
};
var ExtractingProcessorGroupId = function() {
    var count = 0;
    for (count; count < selectedProcessGroupId.length; count++) {
        totalGroupProcessorId.push(selectedProcessGroupId[count]);
        GetChildGroupProcessId(selectedProcessGroupId[count]);
    }
    if (childGroupProcessId.length !== 0) {
        selectedProcessGroupId = [];
        count = 0;
        for (count; count < childGroupProcessId.length; count++) {
            selectedProcessGroupId[count] = childGroupProcessId[count];
        }
        childGroupProcessId = [];
        ExtractingProcessorGroupId();
    }

};
var GetChildGroupProcessId = function(GroupProcessorId, selectedProcessorsId, canIterate) {
    $.ajax({
        async: false,
        type: 'GET',
        url: '../dataintegration-api/process-groups/' + encodeURIComponent(GroupProcessorId) + '/process-groups',
        dataType: 'json',
        contentType: 'application/json'
    }).done(function(response) {
        if (response.processGroups.length !== 0) {
            var count = 0;
            var childGroupProcessorID;
            for (count; count < response.processGroups.length; count++) {
                childGroupProcessorID = response.processGroups[count].id;
                childGroupProcessId.push(childGroupProcessorID);
                if(canIterate !== undefined && canIterate)
                        GetProcessGroupProcessorId(childGroupProcessorID, selectedProcessorsId, true);
            }
        }
    }).fail(function(xhr, status, error) {
        if (xhr.status === 403) {
            nfErrorHandler.handleAjaxError(xhr, status, error);
        }
    });

};
var Postrequest = function() {
    var count = 0;
    var connectionid;
    // initialize the progress bar value
      updateProgress(0);
   // show the progress dialog
     $('#drop-request-status-dialog').modal('show');
     connectionCount=selectedConnectionId.length;
    // process the drop request
     processDropRequest("Waiting for destination component to complete its action");
    for (count; count < selectedConnectionId.length; count++) {
        totalCount++;
        connectionid = selectedConnectionId[count];
        $.ajax({
            async:false,
            type: 'POST',
            url: '../dataintegration-api/flowfile-queues/' + encodeURIComponent(connectionid) + '/drop-requests',
            dataType: 'json',
            contentType: 'application/json'
        }).done(function(response) {
            dropRequests.push(response.dropRequest);
         for(var dropCount=0; dropCount < dropRequests.length; dropCount++) {
              pollDropRequest(dropRequests[dropCount]); 
          }
        }).fail(function(xhr, status, error) {
            if (xhr.status === 403) {
                nfErrorHandler.handleAjaxError(xhr, status, error);
            } else {
                DeleteQueue(response.dropRequest);
            }
        });
         nf.CanvasUtils.reload();
    }
    if(selectedConnectionId.length === 0){
        $('#drop-request-status-dialog').modal('hide');
                // display the results
                nfDialog.showOkDialog({
                    headerText: 'Empty Queue',
                    dialogContent: "There is no connection in selected process group(s)."
                });
    }
};
                        // updates the progress bar
                        var updateProgress = function (percentComplete) {
                        // remove existing labels
                        var progressBar = $('#drop-request-percent-complete');
                        progressBar.find('div.progress-label').remove();
                        progressBar.find('md-progress-linear').remove();
                        // update the progress bar
                        (nfNgBridge.injector.get('$compile')($('<md-progress-linear ng-cloak ng-value="' + percentComplete + '" class="md-hue-2" md-mode="determinate" aria-label="Drop request percent complete"></md-progress-linear>'))(nfNgBridge.rootScope)).appendTo(progressBar);
                    };
    var DeleteQueue = function(dropRequest) {
        if (nfCommon.isDefinedAndNotNull(dropRequest)) {
           if(jQuery.inArray(dropRequest.id,deletedRequests) === -1 ){
            $.ajax({
                async: false,
                type: 'DELETE',
                url: dropRequest.uri,
                dataType: 'json'
            }).done(function(response) {
                deletedRequests.push(dropRequest.id);
                // report the results of this drop request
                dropRequest = response.dropRequest;

                // build the results
                var droppedTokens = dropRequest.dropped.split(/ \/ /);
                var results = $('<div></div>');
                if(connectionCount>1){
                    totalQueued=totalQueued + parseInt(droppedTokens[0].replace(',',''));
                if(deletedRequests.length === connectionCount){
                $('<span class="label"></span>').text(totalQueued).appendTo(results);
                $('<span></span>').text(' FlowFiles were removed from the queue.').appendTo(results);
                $('#drop-request-status-dialog').modal('hide');
                // display the results
                nfDialog.showOkDialog({
                    headerText: 'Empty Queue',
                    dialogContent: results
                });
                }
                }
                else{
               // if this request failed so the error
                if (nfCommon.isDefinedAndNotNull(dropRequest.failureReason)) {
                    $('<br/><br/><span></span>').text(dropRequest.failureReason).appendTo(results);
                }            
                $('<span class="label"></span>').text(droppedTokens[0]).appendTo(results);
                $('<span></span>').text(' FlowFiles (' + droppedTokens[1] + ')').appendTo(results); 
                $('<span></span>').text(' were removed from the queue.').appendTo(results);
                // if the request did not complete, include the original
                if (dropRequest.percentCompleted < 100) {
                    var originalTokens = dropRequest.original.split(/ \/ /);
                    $('<span class="label"></span>').text(' out of ' + originalTokens[0]).appendTo(results);
                    $('<span></span>').text(' (' + originalTokens[1] + ')').appendTo(results);
                    $('<span></span>').text(' were removed from the queue.').appendTo(results);
                }

                 $('#drop-request-status-dialog').modal('hide');
                // display the results
                nfDialog.showOkDialog({
                    headerText: 'Empty Queue',
                    dialogContent: results
                });
                }          
            }).fail(function(xhr, status, error){
                nfErrorHandler.handleAjaxError(xhr, status, error);
            });
        }
    } else {
        // nothing was removed
        nfDialog.showOkDialog({
            headerText: 'Empty Queue',
            dialogContent: 'No FlowFiles were removed.'
        });
        // close the dialog
        $('#drop-request-status-dialog').modal('hide');
    }
};
    /**
     * Initializes the drop request status dialog.
     */
    var initializeDropRequestStatusDialog = function () {
        // configure the drop request status dialog
        $('#drop-request-status-dialog').modal({
            scrollableContentStyle: 'scrollable',
            handler: {
                close: function () {
                    // clear the current button model
                    $('#drop-request-status-dialog').modal('setButtonModel', []);
                }
            }
        });
    };


    /**
     * Updates the resource with the specified entity.
     *
     * @param {string} uri
     * @param {object} entity
     */
    var updateResource = function (uri, entity) {
        return $.ajax({
            type: 'PUT',
            url: uri,
            data: JSON.stringify(entity),
            dataType: 'json',
            contentType: 'application/json'
        }).fail(function (xhr, status, error) {
            nfDialog.showOkDialog({
                headerText: 'Update Resource',
                dialogContent: nfCommon.escapeHtml(xhr.responseText)
            });
        });
    };
	
    var deleteSelectedComponent = function(selection){
        if (selection.size() === 1) {
                var selectionData = selection.datum();
                var revision = nfClient.getRevision(selectionData);

                $.ajax({
                    type: 'DELETE',
                    url: selectionData.uri + '?' + $.param({
                        version: revision.version,
                        clientId: revision.clientId
                    }),
                    dataType: 'json'
                }).done(function (response) {
                    // remove the component/connection in question
                    nf[selectionData.type].remove(selectionData.id);

                    // if the selection is a connection, reload the source and destination accordingly
                    if (nfCanvasUtils.isConnection(selection) === false) {
                        var connections = nfConnection.getComponentConnections(selectionData.id);
                        if (connections.length > 0) {
                            var ids = [];
                            $.each(connections, function (_, connection) {
                                ids.push(connection.id);
                            });

                            // remove the corresponding connections
                            nfConnection.remove(ids);
                        }
                    }

                    // refresh the birdseye
                     nfBirdseye.refresh();
                    // inform Angular app values have changed
                     nfNgBridge.digest();
                }).fail(nfErrorHandler.handleAjaxError);
            } else {
                // create a snippet for the specified component and link to the data flow
                var parentGroupId = nfCanvasUtils.getGroupId();
                var snippet = nfSnippet.marshal(selection, parentGroupId);
                nfSnippet.create(snippet).done(function (response) {
                    // remove the snippet, effectively removing the components
                    nfSnippet.remove(response.snippet.id).done(function () {
                        var components = d3.map();

                        // add the id to the type's array
                        var addComponent = function (type, id) {
                            if (!components.has(type)) {
                                components.set(type, []);
                            }
                            components.get(type).push(id);
                        };

                        // go through each component being removed
                        selection.each(function (d) {
                            // remove the corresponding entry
                            addComponent(d.type, d.id);

                            // if this is not a connection, see if it has any connections that need to be removed
                            if (d.type !== 'Connection') {
                                var connections = nf.Connection.getComponentConnections(d.id);
                                if (connections.length > 0) {
                                    $.each(connections, function (_, connection) {
                                        addComponent('Connection', connection.id);
                                    });
                                }
                            }
                        });

                        // remove all the non connections in the snippet first
                        components.forEach(function (type, ids) {
                            if (type !== 'Connection') {
                                nf[type].remove(ids);
                            }
                        });

                        // then remove all the connections
                        if (components.has('Connection')) {
                            nfConnection.remove(components.get('Connection'));
                        }

                        // refresh the birdseye
                         nfBirdseye.refresh();

                        // inform Angular app values have changed
                        nfNgBridge.digest();
                    }).fail(nfErrorHandler.handleAjaxError);
                }).fail(nfErrorHandler.handleAjaxError);
            }
    };
    // create a method for updating process groups and processors
    var updateProcessGroup = function (response) {
        $.ajax({
            type: 'GET',
            url: config.urls.api + '/flow/process-groups/' + encodeURIComponent(response.id),
            dataType: 'json'
        }).done(function (response) {
            nfGraph.set(response.processGroupFlow.flow);
        });
    };

    // determine if the source of this connection is part of the selection
    var isSourceSelected = function (connection, selection) {
        return selection.filter(function (d) {
                return nfCanvasUtils.getConnectionSourceComponentId(connection) === d.id;
            }).size() > 0;
    };

    var updateGridList = function (responseId)
    {
        var canContinue = true;
        do {
            $.ajax({
                type: 'GET',
                async: false,
                url: '../dataintegration-api/provenance/' + responseId
            }).done(function (response) {
                response = JSON.parse(JSON.stringify(response));
                if (response.provenance.percentCompleted === 100)
                {
                    var iteration = 0;
                    var provenaceEventsList = response.provenance.results.provenanceEvents;
                    for (iteration; iteration < provenaceEventsList.length && iteration < 1000; iteration++) {
                        gridDataList.push($.extend(true, {}, provenaceEventsList[iteration]));
                    }
                    deleteProvenanceRequest(responseId);
                    canContinue = false;
                }
            });
        } while (canContinue);
    };
    
    var deleteProvenanceRequest = function (responseId)
    {
        var startTime = new Date();
        $.ajax({
            type: 'DELETE',
            async: false,
            url: '../dataintegration-api/provenance/' + responseId,
            success: function () {
                var endTime = 0;
                for(var count=0; parseInt(endTime/1000) < 0.00001; count++){
                    endTime = new Date()-startTime; //After deleting, have to wait for sometime.
                }
            }
        });
    };
    
    var GetProcessGroupProcessorId = function(groupId, selectedProcessorsId, canIterate){
        selectedProcessorsId = GetProcessors(groupId, selectedProcessorsId);
        GetChildGroupProcessId(groupId, selectedProcessorsId, canIterate);
        return selectedProcessorsId;
    };
    
    var GetProcessors = function(processGroupId, selectedProcessorsId){        
        $.ajax({
            type: 'GET',
            url: '../dataintegration-api/process-groups/' + processGroupId + '/processors',
            async: false,
            success: function (response) {
                var processorsList = response.processors;
                for (count = 0; count < processorsList.length; count++) {
                    selectedProcessorsId.push(processorsList[count].id);
                }
            }
        });
        return selectedProcessorsId;
    };

    var nfActions = {
		
        /**
         * Initializes the actions.
         */
        init: function () {
            initializeDropRequestStatusDialog();
        },

        /**
         * Enters the specified process group.
         *
         * @param {selection} selection     The the currently selected component
         */
        enterGroup: function (selection) {
            if (selection.size() === 1 && nfCanvasUtils.isProcessGroup(selection)) {
                var selectionData = selection.datum();
                nfCanvasUtils.getComponentByType('ProcessGroup').enterGroup(selectionData.id);
            }
        },

        /**
         * Exits the current process group but entering the parent group.
         */
        leaveGroup: function () {
            nfCanvasUtils.getComponentByType('ProcessGroup').enterGroup(nfCanvasUtils.getParentGroupId());
        },
        deleteSelection: function (selection) {
            deleteSelectedComponent(selection);
        },
        /**
         * Refresh the flow of the remote process group in the specified selection.
         *
         * @param {selection} selection
         */
        refreshRemoteFlow: function (selection) {
            if (selection.size() === 1 && nfCanvasUtils.isRemoteProcessGroup(selection)) {
                var d = selection.datum();
                var refreshTimestamp = d.component.flowRefreshed;

                var setLastRefreshed = function (lastRefreshed) {
                    // set the new value in case the component is redrawn during the refresh
                    d.component.flowRefreshed = lastRefreshed;

                    // update the UI to show last refreshed if appropriate
                    if (selection.classed('visible')) {
                        selection.select('text.remote-process-group-last-refresh')
                            .text(function () {
                                return lastRefreshed;
                            });
                    }
                };

                var poll = function (nextDelay) {
                    $.ajax({
                        type: 'GET',
                        url: d.uri,
                        dataType: 'json'
                    }).done(function (response) {
                        var remoteProcessGroup = response.component;

                        // the timestamp has not updated yet, poll again
                        if (refreshTimestamp === remoteProcessGroup.flowRefreshed) {
                            schedule(nextDelay);
                        } else {
                            nfRemoteProcessGroup.set(response);

                            // reload the group's connections
                            var connections = nfConnection.getComponentConnections(remoteProcessGroup.id);
                            $.each(connections, function (_, connection) {
                                if (connection.permissions.canRead) {
                                    nfConnection.reload(connection.id);
                                }
                            });
                        }
                    });
                };

                var schedule = function (delay) {
                    if (delay <= 32) {
                        setTimeout(function () {
                            poll(delay * 2);
                        }, delay * 1000);
                    } else {
                        // reset to the previous value since the contents could not be updated (set to null?)
                        setLastRefreshed(refreshTimestamp);
                    }
                };

                setLastRefreshed('Refreshing...');
                poll(1);
            }
        },

        /**
         * Opens the remote process group in the specified selection.
         *
         * @param {selection} selection         The selection
         */
        openUri: function (selection) {
            if (selection.size() === 1 && nfCanvasUtils.isRemoteProcessGroup(selection)) {
                var selectionData = selection.datum();
                var uri = selectionData.component.targetUri;

                if (!nfCommon.isBlank(uri)) {
                    window.open(encodeURI(uri));
                } else {
                    nfDialog.showOkDialog({
                        headerText: 'Remote Process Group',
                        dialogContent: 'No target URI defined.'
                    });
                }
            }
        },

        /**
         * Shows and selects the source of the connection in the specified selection.
         *
         * @param {selection} selection     The selection
         */
        showSource: function (selection) {
            if (selection.size() === 1 && nfCanvasUtils.isConnection(selection)) {
                var selectionData = selection.datum();

                // the source is in the current group
                if (selectionData.sourceGroupId === nfCanvasUtils.getGroupId()) {
                    var source = d3.select('#id-' + selectionData.sourceId);
                    nfActions.show(source);
                } else if (selectionData.sourceType === 'REMOTE_OUTPUT_PORT') {
                    // if the source is remote
                    var remoteSource = d3.select('#id-' + selectionData.sourceGroupId);
                    nfActions.show(remoteSource);
                } else {
                    // if the source is local but in a sub group
                    nfCanvasUtils.showComponent(selectionData.sourceGroupId, selectionData.sourceId);
                }
            }
        },

        /**
         * Shows and selects the destination of the connection in the specified selection.
         *
         * @param {selection} selection     The selection
         */
        showDestination: function (selection) {
            if (selection.size() === 1 && nfCanvasUtils.isConnection(selection)) {
                var selectionData = selection.datum();

                // the destination is in the current group or its remote
                if (selectionData.destinationGroupId === nfCanvasUtils.getGroupId()) {
                    var destination = d3.select('#id-' + selectionData.destinationId);
                    nfActions.show(destination);
                } else if (selectionData.destinationType === 'REMOTE_INPUT_PORT') {
                    // if the destination is remote
                    var remoteDestination = d3.select('#id-' + selectionData.destinationGroupId);
                    nfActions.show(remoteDestination);
                } else {
                    // if the destination is local but in a sub group
                    nfCanvasUtils.showComponent(selectionData.destinationGroupId, selectionData.destinationId);
                }
            }
        },

        /**
         * Shows the downstream components from the specified selection.
         *
         * @param {selection} selection     The selection
         */
        showDownstream: function (selection) {
            if (selection.size() === 1 && !nfCanvasUtils.isConnection(selection)) {

                // open the downstream dialog according to the selection
                if (nfCanvasUtils.isProcessor(selection)) {
                    nfGoto.showDownstreamFromProcessor(selection);
                } else if (nfCanvasUtils.isFunnel(selection)) {
                    nfGoto.showDownstreamFromFunnel(selection);
                } else if (nfCanvasUtils.isInputPort(selection)) {
                    nfGoto.showDownstreamFromInputPort(selection);
                } else if (nfCanvasUtils.isOutputPort(selection)) {
                    nfGoto.showDownstreamFromOutputPort(selection);
                } else if (nfCanvasUtils.isProcessGroup(selection) || nfCanvasUtils.isRemoteProcessGroup(selection)) {
                    nfGoto.showDownstreamFromGroup(selection);
                }
            }
        },

        /**
         * Shows the upstream components from the specified selection.
         *
         * @param {selection} selection     The selection
         */
        showUpstream: function (selection) {
            if (selection.size() === 1 && !nfCanvasUtils.isConnection(selection)) {

                // open the downstream dialog according to the selection
                if (nfCanvasUtils.isProcessor(selection)) {
                    nfGoto.showUpstreamFromProcessor(selection);
                } else if (nfCanvasUtils.isFunnel(selection)) {
                    nfGoto.showUpstreamFromFunnel(selection);
                } else if (nfCanvasUtils.isInputPort(selection)) {
                    nfGoto.showUpstreamFromInputPort(selection);
                } else if (nfCanvasUtils.isOutputPort(selection)) {
                    nfGoto.showUpstreamFromOutputPort(selection);
                } else if (nfCanvasUtils.isProcessGroup(selection) || nfCanvasUtils.isRemoteProcessGroup(selection)) {
                    nfGoto.showUpstreamFromGroup(selection);
                }
            }
        },

        /**
         * Shows and selects the component in the specified selection.
         *
         * @param {selection} selection     The selection
         */
        show: function (selection) {
            // deselect the current selection
            var currentlySelected = nfCanvasUtils.getSelection();
            currentlySelected.classed('selected', false);

            // select only the component/connection in question
            selection.classed('selected', true);

            if (selection.size() === 1) {
                nfActions.center(selection);
            } else {
                nfNgBridge.injector.get('navigateCtrl').zoomFit();
            }

            // update URL deep linking params
            nfCanvasUtils.setURLParameters(nfCanvasUtils.getGroupId(), selection);

            // inform Angular app that values have changed
            nfNgBridge.digest();
        },

        /**
         * Selects all components in the specified selection.
         *
         * @param {selection} selection     Selection of components to select
         */
        select: function (selection) {
            selection.classed('selected', true);
        },

        /**
         * Selects all components.
         */
        selectAll: function () {
            nfActions.select(d3.selectAll('g.component, g.connection'));
        },

        /**
         * Centers the component in the specified selection.
         *
         * @argument {selection} selection      The selection
         */
        center: function (selection) {
            if (selection.size() === 1) {
                var box;
                if (nfCanvasUtils.isConnection(selection)) {
                    var x, y;
                    var d = selection.datum();

                    // get the position of the connection label
                    if (d.bends.length > 0) {
                        var i = Math.min(Math.max(0, d.labelIndex), d.bends.length - 1);
                        x = d.bends[i].x;
                        y = d.bends[i].y;
                    } else {
                        x = (d.start.x + d.end.x) / 2;
                        y = (d.start.y + d.end.y) / 2;
                    }

                    box = {
                        x: x,
                        y: y,
                        width: 1,
                        height: 1
                    };
                } else {
                    var selectionData = selection.datum();
                    var selectionPosition = selectionData.position;

                    box = {
                        x: selectionPosition.x,
                        y: selectionPosition.y,
                        width: selectionData.dimensions.width,
                        height: selectionData.dimensions.height
                    };
                }

                // center on the component
                nfCanvasUtils.centerBoundingBox(box);

                // refresh the canvas
                nfCanvasUtils.refreshCanvasView({
                    transition: true
                });
            }
        },

        /**
         * Enables all eligible selected components.
         *
         * @argument {selection} selection      The selection
         */
        enable: function (selection) {
            var componentsToEnable = nfCanvasUtils.filterEnable(selection);

            if (componentsToEnable.empty()) {
                nfDialog.showOkDialog({
                    headerText: 'Enable Components',
                    dialogContent: 'No eligible components are selected. Please select the components to be enabled and ensure they are no longer running.'
                });
            } else {
                var enableRequests = [];

                // enable the selected processors
                componentsToEnable.each(function (d) {
                    var selected = d3.select(this);

                    // build the entity
                    var entity = {
                        'revision': nfClient.getRevision(d),
                        'component': {
                            'id': d.id,
                            'state': 'STOPPED'
                        }
                    };

                    enableRequests.push(updateResource(d.uri, entity).done(function (response) {
                        nfCanvasUtils.getComponentByType(d.type).set(response);
                    }));
                });

                // inform Angular app once the updates have completed
                if (enableRequests.length > 0) {
                    $.when.apply(window, enableRequests).always(function () {
                        nfNgBridge.digest();
                    });
                }
            }
        },

        /**
         * Disables all eligible selected components.
         *
         * @argument {selection} selection      The selection
         */
        disable: function (selection) {
            var componentsToDisable = nfCanvasUtils.filterDisable(selection);

            if (componentsToDisable.empty()) {
                nfDialog.showOkDialog({
                    headerText: 'Disable Components',
                    dialogContent: 'No eligible components are selected. Please select the components to be disabled and ensure they are no longer running.'
                });
            } else {
                var disableRequests = [];

                // disable the selected components
                componentsToDisable.each(function (d) {
                    var selected = d3.select(this);

                    // build the entity
                    var entity = {
                        'revision': nfClient.getRevision(d),
                        'component': {
                            'id': d.id,
                            'state': 'DISABLED'
                        }
                    };

                    disableRequests.push(updateResource(d.uri, entity).done(function (response) {
                        nfCanvasUtils.getComponentByType(d.type).set(response);
                    }));
                });

                // inform Angular app once the updates have completed
                if (disableRequests.length > 0) {
                    $.when.apply(window, disableRequests).always(function () {
                        nfNgBridge.digest();
                    });
                }
            }
        },

        /**
         * Opens provenance with the component in the specified selection.
         *
         * @argument {selection} selection The selection
         */
        openProvenance: function (selection) {
            if (selection.size() === 1 && !nfCanvasUtils.isProcessGroup(selection)) {
                 var selectionData = selection.datum();
                nfShell.showPage('provenance?' + $.param({
                    componentId: selectionData.id
                }));
            } else {
                nfShell.showPage('provenance?' + $.param({
                    componentId: "test"  //To display empty data provenance details, used dummy value "test" as component ID.
                }), false);
                var timeOut = setInterval(function () {
                    if ($('#shell-iframe').contents().find('#provenance-table').css("display") === "block")
                        $('#shell-iframe').contents().find("#loader-icon").css("display", "block");
                }, 500);
                var count = 0;
                var selectedProcessorsId = [];
                $(".selected").each(function () {
                    var classNames = $(this).attr("class");
                    if (classNames.indexOf("processor") >= 0) { //To get only selected processor Id's. Not queue list Id.
                        var id = $(this).attr("id");
                        selectedProcessorsId.push(id.replace("id-", ""));
                    } else if (classNames.indexOf("process-group") >= 0) {
                        selectedProcessorsId = GetProcessGroupProcessorId($(this).attr("id").replace("id-", ""), selectedProcessorsId, true);
                    }
                });
                for (count = 0; count < selectedProcessorsId.length; count++)
                {
                    var responseData = "";
                    $.ajax({
                        type: 'POST',
                        async: false,
                        url: '../dataintegration-api/provenance',
                        contentType: "application/json",
                        dataType: 'json',
                        data: JSON.stringify({"provenance": {"request": {"maxResults": 1000, "searchTerms": {"ProcessorID": selectedProcessorsId[count]}}}}),
                        success: function (data) {
                            responseData = JSON.parse(JSON.stringify(data));
                            var responseId = responseData.provenance.id;
                            updateGridList(responseId);
                        }
                    });
                }
                setTimeout(function () {
                    var iframeShell = $('#shell-iframe')[0].contentWindow.$;
                    var dataKey = $('#shell-iframe').contents().find('#provenance-table');
                    var provenanceGrid = iframeShell.data(dataKey[0], 'gridInstance');
                    var provenanceData = provenanceGrid.getData();
                    provenanceData.beginUpdate();
                    provenanceData.setItems([]);
                    provenanceData.endUpdate();
                    provenanceData.beginUpdate();
                    for (count = 0; count < gridDataList.length && count < 1000; count++) {
                        provenanceData.addItem(gridDataList[count]);
                    }
                    provenanceData.endUpdate();
                    if (count > 1000)
                        count = count - 1; //if count contains more than 1000 values, then we have to subtract 1.
                    $('#shell-iframe').contents().find('#total-events').text(count); //To display total number of data in data provenance table
                    clearInterval(timeOut);
                    $('#shell-iframe').contents().find("#loader-icon").css("display","none");
                    gridDataList = [];
                }, 5000);
            }  
         },
         
        /**
         * Show data preview dialog      
         */
          showDataPreview: function(selection) {
                $("#context-menu").hide();
                nf.DataPreviewDialog.showPage();
                $("#data-preview-last-refreshed").css("display","none");
                $('#data-preview-tabs').find('li:last').click();
                $("#data-preview-dialog").find("#loader-icon").css("display", "block");
                nf.Actions.getDataPreview(selection);
            },
         getDataPreview: function(selection) {
                setTimeout(nf.Actions.requestPreviewData(selection), 5000);
            },
          /**
         *Request data preview api   
         */
         requestPreviewData: function(selection) {
                var id = selection.attr("id");
                var selectedProcessorId = id.replace("id-", "");
                if (selection.size() === 1) {
                    var provenanceEntity = {
                        'provenance': {
                            'request': {
                                'searchTerms': {
                                    'ProcessorID': selectedProcessorId
                                },
                                maxResults: "1000",
                                summarize: true,
                                incrementalResults: false
                            },
                            'results': {
                                'provenanceEvents': []
                            }
                        }
                    };
                    $.ajax({
                        type: 'POST',
                        url: '../dataintegration-api/syncfusion/getdatapreview',
                        contentType: "application/json",
                        dataType: 'json',
                        data: JSON.stringify(provenanceEntity),
                        success: function(data) {
                            var responseData = JSON.parse(JSON.stringify(data));   
                             nf.Actions.loadPreviewData(responseData);
                        },
                        error: function(error) {
                            $("#data-preview-dialog").find("#loader-icon").css("display", "none");
                        }
                    });
                }
            },
         /**
         *Load data returned into data preview dialog   
         */
       loadPreviewData: function(responseData) {
        if (responseData.length > 0) {
         var inputResponse = "";
         var outputResponse = "";
         var isJsonInput=false;
          var isJsonOutput=false;
         if (responseData[0].InputResponse !== "" || responseData[0].OutputResponse !== "") {
             inputResponse = responseData[0].InputResponse;
             outputResponse = responseData[0].OutputResponse;
             $("#inputType").text(responseData[0].InputContentType);
             $("#outputType").text(responseData[0].OutputContentType);
             $("#file-content-type").text(responseData[0].OutputContentType);
             $("#preview-file-name").text(responseData[0].OutputFileName);
             $("#inputFileName").text(responseData[0].InputFileName);
             $("#outputFileName").text(responseData[0].OutputFileName);  
             if (inputResponse !== "") {
                 if (responseData[0].InputContentType.indexOf("Text/csv") > -1) {
                     var JsonResponse = nf.DataPreviewDialog.convertCSV(inputResponse);
                     $("#inputJsonContent").text(JsonResponse);
                 } else if (responseData[0].InputContentType.indexOf("application/json") > -1) {
                     $("#inputJsonContent").text(responseData[0].InputJsonResponse);
                     try {
                         var tmpData = JSON.parse(inputResponse);
                         inputResponse = JSON.stringify(tmpData, null, '\t');
                     } catch (e) {}
                 }
                 $("#inputContent").text(inputResponse);
               if ((responseData[0].InputContentType.indexOf("application/json") > -1) || (responseData[0].InputContentType.indexOf("Text/csv") > -1)) {
                            if (!nf.DataPreviewDialog.isNestedJson($("#inputJsonContent").text())) {
                               nf.DataPreviewDialog.bindDropdownContent(true);
                               isJsonInput = true;  
                            }
                        }
             }
             else
               $("#inputContent").text("No input data available");   
             if (outputResponse !== "") {
                 if (responseData[0].OutputContentType.indexOf("Text/csv") > -1) {
                     var JsonResponse = nf.DataPreviewDialog.convertCSV(outputResponse);
                     $("#outputJsonContent").text(JsonResponse);
                 } else if (responseData[0].OutputContentType.indexOf("application/json") > -1) {
                     $("#outputJsonContent").text(responseData[0].OutputJsonResponse);
                     try {
                         var tmpData = JSON.parse(outputResponse);
                         outputResponse = JSON.stringify(tmpData, null, '\t');
                     } catch (e) {}
                 }
                 $("#outputContent").text(outputResponse);
             if ((responseData[0].OutputContentType.indexOf("application/json") > -1) || (responseData[0].OutputContentType.indexOf("Text/csv") > -1)) {
                            if (!nf.DataPreviewDialog.isNestedJson($("#outputJsonContent").text())) {
                                nf.DataPreviewDialog.bindDropdownContent(true);
                                isJsonOutput=true;
                            }      
             }
             }
             else
               $("#outputContent").text("No output data available");            
         } else{
             $("#data-preview-dialog").find("#loader-icon").css("display", "none");
             $("#outputContent").text("No output data available");
             $("#inputContent").text("No input data available");
         }
           var lastRefreshed=responseData[0].LastRefreshed.split(" ");
           $("#data-preview-last-refreshed").text(lastRefreshed[3]+" "+lastRefreshed[4]);
           $("#data-preview-last-refreshed").css("display","block");  
     } else {
         $("#data-preview-dialog").find("#loader-icon").css("display", "none");
         $("#outputContent").text("No output data available");
         $("#inputContent").text("No input data available");
         nf.Dialog.showOkDialog({
             headerText: 'Unable to preview data',
             dialogContent: nf.Common.escapeHtml("Something went wrong.Please check log for more details.")
         });
     }
             var viewType = $("#ViewType").text();
             if($('#data-preview-tabs').find(".selected-tab").text()==="INPUT DATA"){
                 if(viewType === "grid" && isJsonInput===true){
                    nf.DataPreviewDialog.initGrid("inputJsonContent");    
                    $("#data-preview-filter-type").combo('setSelectedOption', {
                        value: 'grid'
                    });
                 }
               else
                nf.DataPreviewDialog.initXmlEditor("inputDataPreview");
              }
            else if($('#data-preview-tabs').find(".selected-tab").text()=== "OUTPUT DATA"){
                if(viewType === "grid" && isJsonOutput===true){
                      nf.DataPreviewDialog.initGrid("outputJsonContent"); 
                    $("#data-preview-filter-type").combo('setSelectedOption', {
                        value: 'grid'
                    });
                }
              else
              nf.DataPreviewDialog.initXmlEditor("outputDataPreview");
            }
 },
        /**
         * Starts the components in the specified selection.
         *
         * @argument {selection} selection      The selection
         */
        start: function (selection) {
            if (selection.empty()) {
                // build the entity
                var entity = {
                    'id': nfCanvasUtils.getGroupId(),
                    'state': 'RUNNING'
                };

                updateResource(config.urls.api + '/flow/process-groups/' + encodeURIComponent(nfCanvasUtils.getGroupId()), entity).done(updateProcessGroup);
            } else {
                var componentsToStart = selection.filter(function (d) {
                    return nfCanvasUtils.isRunnable(d3.select(this));
                });

                // ensure there are startable components selected
                if (componentsToStart.empty()) {
                    nfDialog.showOkDialog({
                        headerText: 'Start Components',
                        dialogContent: 'No eligible components are selected. Please select the components to be started and ensure they are no longer running.'
                    });
                } else {
                    var startRequests = [];

                    // start each selected component
                    componentsToStart.each(function (d) {
                        var selected = d3.select(this);

                        // prepare the request
                        var uri, entity;
                        if (nfCanvasUtils.isProcessGroup(selected)) {
                            uri = config.urls.api + '/flow/process-groups/' + encodeURIComponent(d.id);
                            entity = {
                                'id': d.id,
                                'state': 'RUNNING'
                            };
                        } else {
                            uri = d.uri;
                            entity = {
                                'revision': nfClient.getRevision(d),
                                'component': {
                                    'id': d.id,
                                    'state': 'RUNNING'
                                }
                            };
                        }

                        startRequests.push(updateResource(uri, entity).done(function (response) {
                            if (nfCanvasUtils.isProcessGroup(selected)) {
                                nfCanvasUtils.getComponentByType('ProcessGroup').reload(d.id);
                            } else {
                                nfCanvasUtils.getComponentByType(d.type).set(response);
                            }
                        }));
                    });

                    // inform Angular app once the updates have completed
                    if (startRequests.length > 0) {
                        $.when.apply(window, startRequests).always(function () {
                            nfNgBridge.digest();
                        });
                    }
                }
            }
        },

        /**
         * Stops the components in the specified selection.
         *
         * @argument {selection} selection      The selection
         */
        stop: function (selection) {
            if (selection.empty()) {
                // build the entity
                var entity = {
                    'id': nfCanvasUtils.getGroupId(),
                    'state': 'STOPPED'
                };

                updateResource(config.urls.api + '/flow/process-groups/' + encodeURIComponent(nfCanvasUtils.getGroupId()), entity).done(updateProcessGroup);
            } else {
                var componentsToStop = selection.filter(function (d) {
                    return nfCanvasUtils.isStoppable(d3.select(this));
                });

                // ensure there are some component to stop
                if (componentsToStop.empty()) {
                    nfDialog.showOkDialog({
                        headerText: 'Stop Components',
                        dialogContent: 'No eligible components are selected. Please select the components to be stopped.'
                    });
                } else {
                    var stopRequests = [];

                    // stop each selected component
                    componentsToStop.each(function (d) {
                        var selected = d3.select(this);

                        // prepare the request
                        var uri, entity;
                        if (nfCanvasUtils.isProcessGroup(selected)) {
                            uri = config.urls.api + '/flow/process-groups/' + encodeURIComponent(d.id);
                            entity = {
                                'id': d.id,
                                'state': 'STOPPED'
                            };
                        } else {
                            uri = d.uri;
                            entity = {
                                'revision': nfClient.getRevision(d),
                                'component': {
                                    'id': d.id,
                                    'state': 'STOPPED'
                                }
                            };
                        }

                        stopRequests.push(updateResource(uri, entity).done(function (response) {
                            if (nfCanvasUtils.isProcessGroup(selected)) {
                                nfCanvasUtils.getComponentByType('ProcessGroup').reload(d.id);
                            } else {
                                nfCanvasUtils.getComponentByType(d.type).set(response);
                            }
                        }));
                    });

                    // inform Angular app once the updates have completed
                    if (stopRequests.length > 0) {
                        $.when.apply(window, stopRequests).always(function () {
                            nfNgBridge.digest();
                        });
                    }
                }
            }
        },

        /**
         * Enables transmission for the components in the specified selection.
         *
         * @argument {selection} selection      The selection
         */
        enableTransmission: function (selection) {
            var componentsToEnable = selection.filter(function (d) {
                return nfCanvasUtils.canStartTransmitting(d3.select(this));
            });

            // start each selected component
            componentsToEnable.each(function (d) {
                // build the entity
                var entity = {
                    'revision': nfClient.getRevision(d),
                    'component': {
                        'id': d.id,
                        'transmitting': true
                    }
                };

                // start transmitting
                updateResource(d.uri, entity).done(function (response) {
                    nfRemoteProcessGroup.set(response);
                });
            });
        },

        /**
         * Disables transmission for the components in the specified selection.
         *
         * @argument {selection} selection      The selection
         */
        disableTransmission: function (selection) {
            var componentsToDisable = selection.filter(function (d) {
                return nfCanvasUtils.canStopTransmitting(d3.select(this));
            });

            // stop each selected component
            componentsToDisable.each(function (d) {
                // build the entity
                var entity = {
                    'revision': nfClient.getRevision(d),
                    'component': {
                        'id': d.id,
                        'transmitting': false
                    }
                };

                updateResource(d.uri, entity).done(function (response) {
                    nfRemoteProcessGroup.set(response);
                });
            });
        },

        /**
         * Shows the configuration dialog for the specified selection.
         *
         * @param {selection} selection     Selection of the component to be configured
         */
        showConfiguration: function (selection) {
            if (selection.empty()) {
                nfProcessGroupConfiguration.showConfiguration(nfCanvasUtils.getGroupId());
            } else if (selection.size() === 1) {
                var selectionData = selection.datum();
                if (nfCanvasUtils.isProcessor(selection)) {
                    nfProcessorConfiguration.showConfiguration(selection);
                } else if (nfCanvasUtils.isLabel(selection)) {
                    nfLabelConfiguration.showConfiguration(selection);
                } else if (nfCanvasUtils.isProcessGroup(selection)) {
                    nfProcessGroupConfiguration.showConfiguration(selectionData.id);
                } else if (nfCanvasUtils.isRemoteProcessGroup(selection)) {
                    nfRemoteProcessGroupConfiguration.showConfiguration(selection);
                } else if (nfCanvasUtils.isInputPort(selection) || nfCanvasUtils.isOutputPort(selection)) {
                    nfPortConfiguration.showConfiguration(selection);
                } else if (nfCanvasUtils.isConnection(selection)) {
                    nfConnectionConfiguration.showConfiguration(selection);
                }
            }
        },

        /**
         * Opens the policy management page for the selected component.
         *
         * @param selection
         */
        managePolicies: function(selection) {
            if (selection.size() <= 1) {
                nfPolicyManagement.showComponentPolicy(selection);
            }
        },
        
        /**
         * Opens the policy management page for the selected component.
         *
         * @param selection
         */
        managePermissions: function(selection) {
            if (selection.size() <= 1) {
                nf.SecurityManagement.ShowSelectedItemPolicy(selection);
            }
        },

        // Defines an action for showing component details (like configuration but read only).
        showDetails: function (selection) {
            if (selection.empty()) {
                nfProcessGroupConfiguration.showConfiguration(nfCanvasUtils.getGroupId());
            } else if (selection.size() === 1) {
                var selectionData = selection.datum();
                if (nfCanvasUtils.isProcessor(selection)) {
                    nfProcessorDetails.showDetails(nfCanvasUtils.getGroupId(), selectionData.id);
                } else if (nfCanvasUtils.isProcessGroup(selection)) {
                    nfProcessGroupConfiguration.showConfiguration(selectionData.id);
                } else if (nfCanvasUtils.isRemoteProcessGroup(selection)) {
                    nfRemoteProcessGroupDetails.showDetails(selection);
                } else if (nfCanvasUtils.isInputPort(selection) || nfCanvasUtils.isOutputPort(selection)) {
                    nfPortDetails.showDetails(selection);
                } else if (nfCanvasUtils.isConnection(selection)) {
                    nfConnectionDetails.showDetails(nfCanvasUtils.getGroupId(), selectionData.id);
                }
            }
        },

        /**
         * Shows the usage documentation for the component in the specified selection.
         *
         * @param {selection} selection     The selection
         */
        showUsage: function (selection) {
            if (selection.size() === 1 && nfCanvasUtils.isProcessor(selection)) {
                var selectionData = selection.datum();
                var selectedProcessor=nfCommon.substringAfterLast(selectionData.component.type, '.');
                 window.open("https://help.syncfusion.com/data-integration/processors/" +selectedProcessor); 
            }
        },

        /**
         * Shows the stats for the specified selection.
         *
         * @argument {selection} selection      The selection
         */
        showStats: function (selection) {
            if (selection.size() === 1) {
                var selectionData = selection.datum();
                if (nfCanvasUtils.isProcessor(selection)) {
                    nfStatusHistory.showProcessorChart(nfCanvasUtils.getGroupId(), selectionData.id);
                } else if (nfCanvasUtils.isProcessGroup(selection)) {
                    nfStatusHistory.showProcessGroupChart(nfCanvasUtils.getGroupId(), selectionData.id);
                } else if (nfCanvasUtils.isRemoteProcessGroup(selection)) {
                    nfStatusHistory.showRemoteProcessGroupChart(nfCanvasUtils.getGroupId(), selectionData.id);
                } else if (nfCanvasUtils.isConnection(selection)) {
                    nfStatusHistory.showConnectionChart(nfCanvasUtils.getGroupId(), selectionData.id);
                }
            }
        },

        /**
         * Opens the remote ports dialog for the remote process group in the specified selection.
         *
         * @param {selection} selection         The selection
         */
        remotePorts: function (selection) {
            if (selection.size() === 1 && nfCanvasUtils.isRemoteProcessGroup(selection)) {
                nfRemoteProcessGroupPorts.showPorts(selection);
            }
        },

        /**
         * Reloads the status for the entire canvas (components and flow.)
         */
        reload: function () {
            nfCanvasUtils.reload({
                'transition': true
            });
        },

        /**
         * Deletes the component in the specified selection.
         *
         * @param {selection} selection     The selection containing the component to be removed
         */
        'delete': function (selection) {
            var umsIsOpen = $("#enable-securityconfiguration-dialog").ejDialog("isOpen");
            if(umsIsOpen === false){
               if (nfCommon.isUndefined(selection) || selection.empty()) {
                nfDialog.showOkDialog({
                    headerText: 'Reload',
                    dialogContent: 'No eligible components are selected. Please select the components to be deleted.'
                });
            } else {
                var deleteDialogCheck = $("#delete-confirmation-dialog").attr("value");
                if (nf.Canvas.canWrite() && nf.CanvasUtils.areDeletable(selection)) {
                    if (selection.size() === 1) {
                        $("#delete-alert-text").text("Are you sure you want to delete the selected component?");
                    } else {
                        $("#delete-alert-text").text("Are you sure you want to delete the selected components?");
                    }
                    if (deleteDialogCheck === "show") {
                        deleteConfirmation(selection);
                    } else {
                        deleteSelectedComponent(selection);
                    }
                }
                
            }
            }
        else{
            return;
        }
        },

        /**
         * Deletes the flow files in the specified connection.
         *
         * @param {type} selection
         */
        emptyQueue: function (selection) {
            nfDialog.showYesNoDialog({
                headerText: 'Empty Queue',
                dialogContent: 'Are you sure you want to empty this queue? All FlowFiles waiting at the time of the request will be removed.',
                noText: 'Cancel',
                yesText: 'Empty',
                yesHandler: function () {
                    // get the connection data
                    
                    Emptyqueue('Empty Queue');
                    selectedConnectionId=[];
                    totalGroupProcessorId=[];
                    selectedProcessGroupId=[];
                    nf.CanvasUtils.reload();
                    }
            });
        },
        deleteEmptyQueue: function(){
            Emptyqueue('Delete');
            selectedConnectionId=[];
            totalGroupProcessorId=[];
            selectedProcessGroupId=[];
            nf.CanvasUtils.reload();
        },

        /**
         * Lists the flow files in the specified connection.
         *
         * @param {selection} selection
         */
        listQueue: function (selection) {
            if (selection.size() !== 1 || !nfCanvasUtils.isConnection(selection)) {
                return;
            }

            // get the connection data
            var connection = selection.datum();

            // list the flow files in the specified connection
            nfQueueListing.listQueue(connection);
        },

        /**
         * Views the state for the specified processor.
         *
         * @param {selection} selection
         */
        viewState: function (selection) {
            if (selection.size() !== 1 || !nfCanvasUtils.isProcessor(selection)) {
                return;
            }

            // get the processor data
            var processor = selection.datum();

            // view the state for the selected processor
            nfComponentState.showState(processor, nfCanvasUtils.isConfigurable(selection));
        },

        /**
         * Opens the variable registry for the specified selection of the current group if the selection is emtpy.
         *
         * @param {selection} selection
         */
        openVariableRegistry: function (selection) {
            if (selection.empty()) {
                nfVariableRegistry.showVariables(nfCanvasUtils.getGroupId());
            } else if (selection.size() === 1) {
                var selectionData = selection.datum();
                if (nfCanvasUtils.isProcessGroup(selection)) {
                    nfVariableRegistry.showVariables(selectionData.id);
                }
            }
        },

        /**
         * Views the state for the specified processor.
         *
         * @param {selection} selection
         */
        changeVersion: function (selection) {
            if (selection.size() !== 1 || !nfCanvasUtils.isProcessor(selection)) {
                return;
            }

            // get the processor data
            var processor = selection.datum();

            // attempt to change the version of the specified component
            nfComponentVersion.promptForVersionChange(processor);
        },

        /**
         * Aligns the components in the specified selection vertically along the center of the components.
         *
         * @param {array} selection      The selection
         */
        alignVertical: function (selection) {
            var updates = d3.map();
             var connectionUpdate;
            // ensure every component is writable
            if (nfCanvasUtils.canModify(selection) === false) {
                nfDialog.showOkDialog({
                    headerText: 'Component Position',
                    dialogContent: 'Must be authorized to modify every component selected.'
                });
                return;
            }
            // determine the extent
            var minX = null, maxX = null;
            selection.each(function (d) {
                if (d.type !== "Connection") {
                    if (minX === null || d.position.x < minX) {
                        minX = d.position.x;
                    }
                    var componentMaxX = d.position.x + d.dimensions.width;
                    if (maxX === null || componentMaxX > maxX) {
                        maxX = componentMaxX;
                    }
                }
            });
            var center = (minX + maxX) / 2;

            // align all components left
            selection.each(function(d) {
                if (d.type !== "Connection") {
                    var delta = {
                        x: center - (d.position.x + d.dimensions.width / 2),
                        y: 0
                    };
                    // if this component is already centered, no need to updated it
                    if (delta.x !== 0) {
                        // consider any connections
                        var connections = nfConnection.getComponentConnections(d.id);
                        $.each(connections, function(_, connection) {
                            var connectionSelection = d3.select('#id-' + connection.id);

                            if (!updates.has(connection.id) && nfCanvasUtils.getConnectionSourceComponentId(connection) === nfCanvasUtils.getConnectionDestinationComponentId(connection)) {
                                // this connection is self looping and hasn't been updated by the delta yet
                                   connectionUpdate = nfDraggable.updateConnectionPosition(nfConnection.get(connection.id), delta);
                                if (connectionUpdate !== null) {
                                    updates.set(connection.id, connectionUpdate);
                                }
                            } else if (!updates.has(connection.id) && connectionSelection.classed('selected') && nfCanvasUtils.canModify(connectionSelection)) {
                                // this is a selected connection that hasn't been updated by the delta yet
                                if (nfCanvasUtils.getConnectionSourceComponentId(connection) === d.id || !isSourceSelected(connection, selection)) {
                                    // the connection is either outgoing or incoming when the source of the connection is not part of the selection
                                     connectionUpdate = nfDraggable.updateConnectionPosition(nfConnection.get(connection.id), delta);
                                    if (connectionUpdate !== null) {
                                        updates.set(connection.id, connectionUpdate);
                                    }
                                }
                            }
                        });
                        updates.set(d.id, nfDraggable.updateComponentPosition(d, delta));
                    }
                }
            });
            nfDraggable.refreshConnections(updates);
        },

        /**
         * Aligns the components in the specified selection horizontally along the center of the components.
         *
         * @param {array} selection      The selection
         */
        alignHorizontal: function (selection) {
            var updates = d3.map();
            // ensure every component is writable
            if (nfCanvasUtils.canModify(selection) === false) {
                nfDialog.showOkDialog({
                    headerText: 'Component Position',
                    dialogContent: 'Must be authorized to modify every component selected.'
                });
                return;
            }

            // determine the extent
            var minY = null, maxY = null;
            selection.each(function (d) {
                if (d.type !== "Connection") {
                    if (minY === null || d.position.y < minY) {
                        minY = d.position.y;
                    }
                    var componentMaxY = d.position.y + d.dimensions.height;
                    if (maxY === null || componentMaxY > maxY) {
                        maxY = componentMaxY;
                    }
                }
            });
            var center = (minY + maxY) / 2;

            // align all components with top most component
            selection.each(function(d) {
                 var connectionUpdate;
                if (d.type !== "Connection") {
                    var delta = {
                        x: 0,
                        y: center - (d.position.y + d.dimensions.height / 2)
                    };

                    // if this component is already centered, no need to updated it
                    if (delta.y !== 0) {
                        // consider any connections
                        var connections = nfConnection.getComponentConnections(d.id);
                        $.each(connections, function(_, connection) {
                            var connectionSelection = d3.select('#id-' + connection.id);

                            if (!updates.has(connection.id) && nfCanvasUtils.getConnectionSourceComponentId(connection) === nfCanvasUtils.getConnectionDestinationComponentId(connection)) {
                                // this connection is self looping and hasn't been updated by the delta yet
                                 connectionUpdate = nfDraggable.updateConnectionPosition(nfConnection.get(connection.id), delta);
                                if (connectionUpdate !== null) {
                                    updates.set(connection.id, connectionUpdate);
                                }
                            } else if (!updates.has(connection.id) && connectionSelection.classed('selected') && nfCanvasUtils.canModify(connectionSelection)) {
                                // this is a selected connection that hasn't been updated by the delta yet
                                if (nfCanvasUtils.getConnectionSourceComponentId(connection) === d.id || !isSourceSelected(connection, selection)) {
                                    // the connection is either outgoing or incoming when the source of the connection is not part of the selection
                                     connectionUpdate = nfDraggable.updateConnectionPosition(nfConnection.get(connection.id), delta);
                                    if (connectionUpdate !== null) {
                                        updates.set(connection.id, connectionUpdate);
                                    }
                                }
                            }
                        });
                        updates.set(d.id, nfDraggable.updateComponentPosition(d, delta));
                    }
                }
            });

            nfDraggable.refreshConnections(updates);
        },

        /**
         * Opens the fill color dialog for the component in the specified selection.
         *
         * @param {type} selection      The selection
         */
        fillColor: function (selection) {
            if (nfCanvasUtils.isColorable(selection)) {
                // we know that the entire selection is processors or labels... this
                // checks if the first item is a processor... if true, all processors
                var allProcessors = nfCanvasUtils.isProcessor(selection);

                var color;
                if (allProcessors) {
                    color = nfProcessor.defaultFillColor();
                } else {
                    color = nfLabel.defaultColor();
                }

                // if there is only one component selected, get its color otherwise use default
                if (selection.size() === 1) {
                    var selectionData = selection.datum();

                    // use the specified color if appropriate
                    if (nfCommon.isDefinedAndNotNull(selectionData.component.style['background-color'])) {
                        color = selectionData.component.style['background-color'];
                    }
                }

                // set the color
                $('#fill-color').minicolors('value', color);

                // update the preview visibility
                if (allProcessors) {
                    $('#fill-color-processor-preview').show();
                    $('#fill-color-label-preview').hide();
                } else {
                    $('#fill-color-processor-preview').hide();
                    $('#fill-color-label-preview').show();
                }

                // show the dialog
                $('#fill-color-dialog').modal('show');
            }
        },

        /**
         * Groups the currently selected components into a new group.
         */
        group: function () {
            var selection = nfCanvasUtils.getSelection();

            // ensure that components have been specified
            if (selection.empty()) {
                return;
            }

            // determine the origin of the bounding box for the selected components
            var origin = nfCanvasUtils.getOrigin(selection);

            var pt = {'x': origin.x, 'y': origin.y};
            $.when(nfNgBridge.injector.get('groupComponent').promptForGroupName(pt)).done(function (processGroup) {
                var group = d3.select('#id-' + processGroup.id);
                nfCanvasUtils.moveComponents(selection, group);
            });
        },

        /**
         * Moves the currently selected component into the current parent group.
         */
        moveIntoParent: function () {
            var selection = nfCanvasUtils.getSelection();

            // ensure that components have been specified
            if (selection.empty()) {
                return;
            }

            // move the current selection into the parent group
            nfCanvasUtils.moveComponentsToParent(selection);
        },

        /**
         * Uploads a new template.
         */
        uploadTemplate: function () {
           document.getElementById('template-file-field').click();
        },
        /**
         * Publishes a new template.
         */
         publishTemplate: function () {
            var selection = nfCanvasUtils.getSelection();

            // ensure that components have been specified
            if (selection.empty()) {
                return;
            }
           openPublishTemplateDialog('');
            // create template and publish to server
        },
        /**
         * Creates a new template based off the currently selected components. If no components
         * are selected, a template of the entire canvas is made.
         */
        template: function (canVisibleTemplate, canUpdateScrollbar) {
            var selection = nfCanvasUtils.getSelection();

            // if no components are selected, use the entire graph
            if (selection.empty()) {
                selection = d3.selectAll('g.component, g.connection');
            }

            // ensure that components have been specified
            if (selection.empty()) {
                nfDialog.showOkDialog({
                    headerText: 'Create Template',
                    dialogContent: "The current selection is not valid to create a template."
                });
                return;
            }

            // remove dangling edges (where only the source or destination is also selected)
            selection = nfCanvasUtils.trimDanglingEdges(selection);

            // ensure that components specified are valid
            if (selection.empty()) {
                nfDialog.showOkDialog({
                    headerText: 'Create Template',
                    dialogContent: "The current selection is not valid to create a template."
                });
                return;
            }

            // prompt for the template name
            $('#new-template-dialog').modal('setButtonModel', [{
                buttonText: 'Create',
                color: {
                    base: '#728E9B',
                    hover: '#004849',
                    text: '#ffffff'
                },
                handler: {
                    click: function () {
                        // get the template details
                        var templateName = $('#new-template-name').val();

                        // ensure the template name is not blank
                        if (nfCommon.isBlank(templateName)) {
                            nfDialog.showOkDialog({
                                headerText: 'Create Template',
                                dialogContent: "The template name cannot be blank."
                            });
                            return;
                        }

                        // hide the dialog
                        $('#new-template-dialog').modal('hide');

                        // get the description
                        var templateDescription = $('#new-template-description').val();

                        // create a snippet
                        var parentGroupId = nfCanvasUtils.getGroupId();
                        var snippet = nfSnippet.marshal(selection, parentGroupId);

                        // create the snippet
                        nfSnippet.create(snippet).done(function (response) {
                            var createSnippetEntity = {
                                'name': templateName,
                                'description': templateDescription,
                                'snippetId': response.snippet.id
                            };

                            // create the template
                            $.ajax({
                                type: 'POST',
                                url: config.urls.api + '/process-groups/' + encodeURIComponent(nfCanvasUtils.getGroupId()) + '/templates',
                                data: JSON.stringify(createSnippetEntity),
                                dataType: 'json',
                                contentType: 'application/json'
                            }).done(function () {
                                // show the confirmation dialog
                                nfDialog.showOkDialog({
                                    headerText: 'Create Template',
                                    dialogContent: "Template '" + nfCommon.escapeHtml(templateName) + "' was successfully created."
                                });
                                addTemplate(canVisibleTemplate, canUpdateScrollbar);
                            }).always(function () {
                                // clear the template dialog fields
                                $('#new-template-name').val('');
                                $('#new-template-description').val('');
                            }).fail(nfErrorHandler.handleAjaxError);
                        }).fail(nfErrorHandler.handleAjaxError);
                    }
                }
            }, {
                buttonText: 'Cancel',
                color: {
                    base: '#FFFFFF',
                    hover: '#F2F2F2',
                    text: '#5C5C5C',
                    border:'1px solid #ccc!important'
                },
                handler: {
                    click: function () {
                        // clear the template dialog fields
                        $('#new-template-name').val('');
                        $('#new-template-description').val('');

                        $('#new-template-dialog').modal('hide');
                    }
                }
            }]).modal('show');

            // auto focus on the template name
            $('#new-template-name').focus();
        },

        /**
         * Copies the component in the specified selection.
         *
         * @param {selection} selection     The selection containing the component to be copied
         */
        copy: function (selection) {
            if (selection.empty()) {
                return;
            }

            // determine the origin of the bounding box of the selection
            var origin = nfCanvasUtils.getOrigin(selection);

            // copy the snippet details
            var parentGroupId = nfCanvasUtils.getGroupId();
            nfClipboard.copy({
                snippet: nfSnippet.marshal(selection, parentGroupId),
                origin: origin
            });
        },

        /**
         * Pastes the currently copied selection.
         *
         * @param {selection} selection     The selection containing the component to be copied
         * @param {obj} evt                 The mouse event
         */
     paste: function(selection, evt) {
        var createdGroupId;
        if (nfCommon.isDefinedAndNotNull(evt)) {
            // get the current scale and translation
            var scale =  nfCanvasUtils.scaleCanvasView();
            var translate =  nfCanvasUtils.translateCanvasView();

            var mouseX = evt.pageX;
            var mouseY = evt.pageY -  nfCanvasUtils.getCanvasOffset();

            // adjust the x and y coordinates accordingly
            var x = (mouseX / scale) - (translate[0] / scale);
            var y = (mouseY / scale) - (translate[1] / scale);

            // record the paste origin
            var pasteLocation = {
                x: x,
                y: y
            };

        }

        // perform the paste
        nfClipboard.paste().done(function(data) {
            var copySnippet = $.Deferred(function(deferred) {
                var reject = function(xhr, status, error) {
                    deferred.reject(xhr.responseText);
                };

                // create a snippet from the details
                nfSnippet.create(data.snippet).done(function(createResponse) {
                    // determine the origin of the bounding box of the copy
                    var origin = pasteLocation;
                    var snippetOrigin = data.origin;

                    // determine the appropriate origin
                    if (!nfCommon.isDefinedAndNotNull(origin)) {
                        snippetOrigin.x += 25;
                        snippetOrigin.y += 25;
                        origin = snippetOrigin;
                        x = snippetOrigin.x;
                        y = snippetOrigin.y;
                    }
                    //check and paste the copied snippet into the group processor    
                    var selectedcomponent = data.snippet;
                    var canCreateGroupProcessor=false;
                    var isSelectedComponentHavePortOrFunnel=false;
                    var isSelectedComponentsHaveProcessorAndPort=false;
                    
                    if(Object.keys(selectedcomponent.outputPorts).length>0 || Object.keys(selectedcomponent.inputPorts).length>0 || Object.keys(selectedcomponent.funnels).length>0){
                        isSelectedComponentHavePortOrFunnel=true;
                    }
                    
                    if(Object.keys(selectedcomponent.processors).length>0 &&isSelectedComponentHavePortOrFunnel){
                        isSelectedComponentsHaveProcessorAndPort=true;
                    }
                    
                    if (nfCanvasUtils.getParentGroupId() === null && jQuery.isEmptyObject(selectedcomponent.processGroups) && !isSelectedComponentHavePortOrFunnel) {
                        $.ajax({
                            type: 'GET',
                            url: '../dataintegration-api/process-groups/root/process-groups',
                            async: false,
                            success: function(data) {
                                var count = 0;
                                var processorNameList = [];
                                var isGroupNameCreated = false;
                                for (count; count < data.processGroups.length; count++) {
                                    var processorName = data.processGroups[count].status.name;
                                    if (processorName.indexOf("Data Flow_") > -1)
                                        processorNameList.push(processorName.split("Data Flow_")[1]);
                                }
                                var maxProcessorGroupNumber = Math.max.apply(Math, processorNameList);
                                if (maxProcessorGroupNumber !== -Infinity) {
                                    for (count = 1; count <= maxProcessorGroupNumber; count++) {
                                        if (processorNameList.indexOf(count.toString()) === -1) {
                                            groupProcessorCount = count;
                                            isGroupNameCreated = true;
                                            break;
                                        }
                                    }
                                    if (!isGroupNameCreated)
                                        groupProcessorCount = maxProcessorGroupNumber + 1;
                                }
                            }
                        });
                        groupName = "Data Flow_" + groupProcessorCount;
                        groupId = nfCanvasUtils.getGroupId();
                        var processGroupEntity = {
                            'revision': nfClient.getRevision({
                                'revision': {
                                    'version': 0
                                }
                            }),
                            'component': {
                                'name': groupName,
                                'position': {
                                    'x': x,
                                    'y': y
                                }
                            }
                        };
                        componentUrl = '../dataintegration-api/process-groups/' + groupId + '/process-groups';
                        createComponent(processGroupEntity, componentUrl,componentName).done(function(response) {
                            createdGroupId = response.id;
                            gotoProcessGroup(createdGroupId);
                            // update component visibility
                            nfGraph.updateVisibility();
                            // update the birdseye
                            nfBirdseye.refresh();
                            nf.Canvas.View.refresh({
                               transition: true
                            });
                            // copy the snippet to the new location
                            nfSnippet.copy(createResponse.snippet.id, origin, createdGroupId).done(function(copyResponse) {
                                var snippetFlow = copyResponse.flow;

                                // update the graph accordingly
                                nfGraph.add(snippetFlow, {
                                    'selectAll': true
                                });

                                // update component visibility
                                nfGraph.updateVisibility();

                                // refresh the birdseye/toolbar
                                nfBirdseye.refresh();
                            }).fail(function() {
                                // an error occured while performing the copy operation, reload the
                                // graph in case it was a partial success
                               nfCanvasUtils.reload().done(function() {
                                    // update component visibility
                                    nfGraph.updateVisibility();

                                    // refresh the birdseye/toolbar
                                    nfBirdseye.refresh();
                                });
                            }).fail(reject);

                        }).fail(nfErrorHandler.handleAjaxError);
                        nf.Canvas.View.refresh({
                            transition: true
                        });

                    }else if(isSelectedComponentsHaveProcessorAndPort && nfCanvasUtils.getParentGroupId() === null && jQuery.isEmptyObject(selectedcomponent.processGroups)){
                        var message = 'Unable to paste the copied content. Because the copied components have processor and which cannot be pasted on root group processor.';


                nfDialog.showOkDialog({
                    headerText: 'Paste Error',
                    dialogContent: nfCommon.escapeHtml(message)
                });
                    } 
                    else {
                        createdGroupId = nf.Canvas.getGroupId();
                        // copy the snippet to the new location
                        nfSnippet.copy(createResponse.snippet.id, origin, createdGroupId).done(function(copyResponse) {
                            var snippetFlow = copyResponse.flow;

                            // update the graph accordingly
                            nfGraph.add(snippetFlow, {
                                'selectAll': true
                            });

                            // update component visibility
                            nfGraph.updateVisibility();

                            // refresh the birdseye/toolbar
                            nfBirdseye.refresh();
                        }).fail(function() {
                            // an error occured while performing the copy operation, reload the
                            // graph in case it was a partial success
                            nf.Canvas.reload().done(function() {
                                // update component visibility
                              nfGraph.updateVisibility();

                                // refresh the birdseye/toolbar
                                nfBirdseye.refresh();
                            });
                        }).fail(reject);

                    }


                }).fail(reject);
            }).promise();

            // show the appropriate message is the copy fails
            copySnippet.fail(function(responseText) {
                // look for a message
                var message = 'An error occurred while attempting to copy and paste.';
                if ($.trim(responseText) !== '') {
                    message = responseText;
                }

                nfDialog.showOkDialog({
                    headerText: 'Paste Error',
                    dialogContent: nfCommon.escapeHtml(message)
                });
            });
        });
    },
        /**
         * Moves the connection in the specified selection to the front.
         *
         * @param {selection} selection
         */
        toFront: function (selection) {
            if (selection.size() !== 1 || !nfCanvasUtils.isConnection(selection)) {
                return;
            }

            // get the connection data
            var connection = selection.datum();

            // determine the current max zIndex
            var maxZIndex = -1;
            $.each(nfConnection.get(), function (_, otherConnection) {
                if (connection.id !== otherConnection.id && otherConnection.zIndex > maxZIndex) {
                    maxZIndex = otherConnection.zIndex;
                }
            });

            // ensure the edge wasn't already in front
            if (maxZIndex >= 0) {
                // use one higher
                var zIndex = maxZIndex + 1;

                // build the connection entity
                var connectionEntity = {
                    'revision': nfClient.getRevision(connection),
                    'component': {
                        'id': connection.id,
                        'zIndex': zIndex
                    }
                };

                // update the edge in question
                $.ajax({
                    type: 'PUT',
                    url: connection.uri,
                    data: JSON.stringify(connectionEntity),
                    dataType: 'json',
                    contentType: 'application/json'
                }).done(function (response) {
                    nfConnection.set(response);
                });
            }
        }
    };
function createComponent(componentEntity, componentUrl, componentName) {
 return   $.ajax({
        type: 'POST',
        aysnc:false,
        url: componentUrl,
        data: JSON.stringify(componentEntity),
        dataType: 'json',
        contentType: 'application/json'
    }).done(function(responseData) {
        response = responseData;
        addToGraph(componentName, responseData);
        // update component visibility
       nfGraph.updateVisibility();
        nf.Canvas.View.refresh({
            transition: true
        });
        // update the birdseye
        nfBirdseye.refresh();
    }).fail(function(xhr, status, error) {
        if (xhr.status === 400) {
            var errors = xhr.responseText.split('\n');

            var content;
            if (errors.length === 1) {
                content = $('<span></span>').text(errors[0]);
            } else {
                content = nfCommon.formatUnorderedList(errors);
            }

            nfDialog.showOkDialog({
                dialogContent: content,
                headerText: 'Configuration Error'
            });
        } else {
            nfErrorHandler.handleAjaxError(xhr, status, error);
        }
    });

}
    return nfActions;
}));