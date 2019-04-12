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

/* global define, top, module, require, exports */
var dataSource = [];
var processorList = [];
var destinationList = [];
var sourceList = [];

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery',
                'nf.Common',
                'nf.UniversalCapture',
                'nf.Dialog',
                'nf.ErrorHandler',
                'nf.CustomUi',
                'nf.ClusterSummary'],
            function ($, nfCommon, nfUniversalCapture, nfDialog, nfErrorHandler, nfCustomUi, nfClusterSummary) {
                return (nf.ProcessorDetails = factory($, nfCommon, nfUniversalCapture, nfDialog, nfErrorHandler, nfCustomUi, nfClusterSummary));
            });
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = (nf.ProcessorDetails =
            factory(require('jquery'),
                require('nf.Common'),
                require('nf.UniversalCapture'),
                require('nf.Dialog'),
                require('nf.ErrorHandler'),
                require('nf.CustomUi'),
                require('nf.ClusterSummary')));
    } else {
        nf.ProcessorDetails = factory(root.$,
            root.nf.Common,
            root.nf.UniversalCapture,
            root.nf.Dialog,
            root.nf.ErrorHandler,
            root.nf.CustomUi,
            root.nf.ClusterSummary);
    }
}(this, function ($, nfCommon, nfUniversalCapture, nfDialog, nfErrorHandler, nfCustomUi, nfClusterSummary) {
    'use strict';

    /**
     * Creates an option for the specified relationship name.
     *
     * @argument {object} relationship      The relationship
     */
    var createRelationshipOption = function (relationship) {
        var relationshipLabel = $('<div class="relationship-name ellipsis"></div>').text(relationship.name);

        // build the relationship checkbox element
        if (relationship.autoTerminate === true) {
            relationshipLabel.css('font-weight', 'bold');
        }

        // build the relationship container element
        var relationshipContainerElement = $('<div class="processor-relationship-container"></div>').append(relationshipLabel).appendTo('#read-only-auto-terminate-relationship-names');
        if (!nfCommon.isBlank(relationship.description)) {
            var relationshipDescription = $('<div class="relationship-description"></div>').text(relationship.description);
            relationshipContainerElement.append(relationshipDescription);
        }

        return relationshipContainerElement;
    };

    var updateDetails = function(groupId, isSeperateWindow){
        var iteration = 0;
        var workflowCount = 1;
        dataSource = [];
        sourceList = [];
        
        getprocessorGroupDetails(groupId);
        
        for(iteration=0; iteration<processorList.length; iteration++){
            var overallProcessorList = [];
            var sourceId = processorList[iteration].sourceProcessorId;
            if(destinationList.indexOf(sourceId) === -1){
                if(sourceList.indexOf(sourceId)===-1){
                    sourceList.push(sourceId);
                    overallProcessorList.push(sourceId);
                    var obj = getDetailsObj("source", sourceId, iteration, workflowCount, isSeperateWindow);
                    dataSource.push($.extend(true, {}, obj));
                    getOverallProcessorList(sourceId, overallProcessorList, workflowCount, isSeperateWindow);
                    workflowCount++;
                }
            }
        }    
    };

    var getprocessorGroupDetails = function(processorGroupId){
        $.ajax({
            type: 'GET',
            async: false,
            url: '../dataintegration-api/flow/process-groups/'+encodeURIComponent(processorGroupId),
            success: function (data) {
                var iteration = 0;
                destinationList = [];

                var responseData = JSON.parse(JSON.stringify(data));
                var connections = responseData.processGroupFlow.flow.connections;
                for(iteration; iteration<connections.length; iteration++){
                    destinationList.push(connections[iteration].status.destinationId);
                }
                getProcessorList(connections, iteration);
            }
        });
    };
    
    var getProcessorList = function(connections, iteration){
        processorList = [];
        for(iteration=0; iteration<connections.length; iteration++){
             var sourceGroupId = "", destinationId = "";
            if(connections[iteration].sourceType === "REMOTE_OUTPUT_PORT")
                sourceGroupId = connections[iteration].sourceGroupId;
            else
                sourceGroupId = connections[iteration].status.sourceId;
            
            if(connections[iteration].destinationType === "REMOTE_OUTPUT_PORT")
                destinationId = connections[iteration].destinationGroupId;
            else 
                destinationId = connections[iteration].status.destinationId;
            
            var obj = { 
                sourceProcessorId: sourceGroupId, 
                sourceProcessorName: connections[iteration].status.sourceName,
                sourceType: connections[iteration].sourceType,
                destinationProcessorId: destinationId, 
                destinationProcessorName: connections[iteration].status.destinationName,
                destinationType: connections[iteration].destinationType
            };
            processorList.push($.extend(true, {}, obj));
        }
    };
    
    var getOverallProcessorList = function(sourceId, overallProcessorList, workflowCount, isSeperateWindow){
        var destinationsList = [];
        for(var count=0; count<processorList.length; count++){
            newSourceId = processorList[count].sourceProcessorId;
            if(newSourceId === sourceId){ 
                destinationId = processorList[count].destinationProcessorId;
                if(overallProcessorList.indexOf(destinationId)===-1){
                    destinationsList.push(destinationId);
                    overallProcessorList.push(destinationId);
                    var obj = getDetailsObj("destination", destinationId, count, workflowCount, isSeperateWindow);
                    dataSource.push($.extend(true, {}, obj));
                }
            }
            if(count === processorList.length-1){
                for(var iteration=0; iteration<destinationsList.length;iteration++){
                    getOverallProcessorList(destinationsList[iteration], overallProcessorList, workflowCount, isSeperateWindow);
                }
            }
        }
    };
    
    var getDetailsObj = function(category, sourceId, iteration, workflowCount, isSeperateWindow){
        var componentType = category === "source"?processorList[iteration].sourceType:processorList[iteration].destinationType;
        var processorName = category === "source"?processorList[iteration].sourceProcessorName:processorList[iteration].destinationProcessorName;
        var processorDetails ="", className = isSeperateWindow?"":"class='processorName'";;
        var timeDetail = "";
        var processorType ="";
        var sourceName = "";
        if(componentType === "PROCESSOR"){
            processorDetails = getComponentDetails(sourceId, "processors");
            timeDetail = getTimingDetails("processors", sourceId);
        } else if(componentType === "OUTPUT_PORT"){
            processorDetails = getComponentDetails(sourceId, "output-ports");
        } else if(componentType === "INPUT_PORT"){
            processorDetails = getComponentDetails(sourceId, "input-ports");  
        } else if(componentType === "REMOTE_OUTPUT_PORT"){
            processorDetails = getComponentDetails(sourceId, "remote-process-groups"); 
        }else if(componentType === "FUNNEL"){
            processorDetails = getComponentDetails(sourceId, "funnels"); 
        }
        var runningStatus = processorDetails.split("&amp;")[0];
        var validationMessage = processorDetails.split("&amp;")[1];
        var schedulingTime = processorDetails.split("&amp;")[3];
        if(componentType === "PROCESSOR"){
            var imagePath = "";
            if(checkImageExists("images/"+ processorDetails.split("&amp;")[2]+".svg"))
                imagePath = "url(images/"+processorDetails.split("&amp;")[2]+".svg)";
            else
                imagePath = "url(images/CustomProcessor.svg)";
            processorType = "<div class='processor-info-icon' style='background-image:"+imagePath+"'></div>"+processorDetails.split("&amp;")[2];
            sourceName = "<div class='processor-info-icon' style='background-image:"+imagePath+"'></div><span "+className+" id='"+sourceId+"'>"+processorName+"</span>";
        }else if(componentType === "OUTPUT_PORT"){
            var imagePath = 'url("images/output_port.svg")';
            processorType = "<div class='processor-info-icon' style='background-image:"+imagePath+"'></div>"+"Output port";
            sourceName = "<div class='processor-info-icon' style='background-image:"+imagePath+"'></div><span id='"+sourceId+"'>"+processorName+"</span>";
        }else if(componentType === "INPUT_PORT"){
            var imagePath = 'url("images/ic_Input port.svg")';
            processorType = "<div class='processor-info-icon' style='background-image:"+imagePath+"'></div>"+"Input port";
            sourceName = "<div class='processor-info-icon' style='background-image:"+imagePath+"'></div><span id='"+sourceId+"'>"+processorName+"</span>";
        }else if(componentType === "REMOTE_OUTPUT_PORT"){
            var imagePath = 'url("images/Remote_Process_group.svg")';
            processorType = "<div class='processor-info-icon' style='background-image:"+imagePath+"'></div>"+"Remote output port";
            sourceName = "<div class='processor-info-icon' style='background-image:"+imagePath+"'></div><span "+className+" id='"+sourceId+"'>"+processorName+"</span>";
        }else if(componentType === "FUNNEL"){
            var imagePath = 'url("images/Funnel.svg")';
            processorType = "<div class='processor-info-icon' style='background-image:"+imagePath+"'></div>"+"Funnel";
            sourceName = "<div class='processor-info-icon' style='background-image:"+imagePath+"'></div><span "+className+" id='"+sourceId+"'>"+processorName+"</span>";
        }
        var elapsedTime = (timeDetail!=="")?timeDetail.split(',')[2]:"-";
        var startTime = (timeDetail!=="")?timeDetail.split(',')[0]:"-";
        var endTime = (timeDetail!=="")?timeDetail.split(',')[1]:"-";
        var obj = {Name: sourceName, Type: processorType, Status: runningStatus, Start_time: startTime, End_time: endTime, 
            Elapsed_time: elapsedTime, Scheduling_Period: schedulingTime, Validation_Message: validationMessage, WorkflowItem: "workflow"+workflowCount, 
            In_size: processorDetails.split("&amp;")[4], Read_write: processorDetails.split("&amp;")[6], Out_size: processorDetails.split("&amp;")[5]};
        return obj;
    };
    
    var getComponentDetails = function(processorId, componentType){
        var processorDetails = "";
        var className = "";
        var bulletinMessage = "";
        var validationError = "";
        $.ajax({
            type: 'GET',
            async: false,
            url: '../dataintegration-api/'+componentType+'/'+encodeURIComponent(processorId),
            success: function (responseData) {
                if(componentType !== "remote-process-groups" && componentType !== "funnels"){
                    var bulletinResponse = responseData.bulletins;
                    if(bulletinResponse !== undefined){
                        for(var bulletinCount = 0; bulletinCount<bulletinResponse.length; bulletinCount++){
                            bulletinMessage = bulletinMessage + bulletinResponse[bulletinCount].bulletin.message +";";
                        }
                    }
                    var validationResponse = responseData.component.validationErrors;
                    if(validationResponse !== undefined){
                        for(var validationCount = 0; validationCount<validationResponse.length; validationCount++){
                            validationError = validationError + validationResponse[validationCount] +";";
                        }
                    }
                    if(bulletinMessage === "" && validationError === "")
                        bulletinMessage = "-";
                    
                    if(responseData.status.aggregateSnapshot.runStatus === "Stopped")
                        className = 'stopped fa fa-stop stopped';
                    else if(responseData.status.aggregateSnapshot.runStatus === "Running")
                        className = 'running fa fa-play running';
                    else
                        className = 'invalid fa fa-warning invalid';
                }
                if(componentType === "processors"){
                    processorDetails = "<span class='"+className+"' style='padding-right: 5px'></span>"+
                            responseData.status.aggregateSnapshot.runStatus + "&amp;" + validationError + bulletinMessage + "&amp;" +
                            responseData.status.aggregateSnapshot.type + "&amp;" + responseData.component.config.schedulingPeriod +"&amp;"+
                            responseData.status.aggregateSnapshot.input + "&amp;" + responseData.status.aggregateSnapshot.output + "&amp;"+
                            responseData.status.aggregateSnapshot.read +"/"+responseData.status.aggregateSnapshot.written;
                } else if(componentType === "output-ports" || componentType === "input-ports"){
                    var inputSize = componentType==="output-ports"?responseData.status.aggregateSnapshot.input:"-";
                    var outputSize = componentType==="input-ports"?responseData.status.aggregateSnapshot.output:"-";
                    processorDetails = "<span class='"+className+"' style='padding-right: 5px'></span>"+
                            responseData.status.aggregateSnapshot.runStatus + "&amp;" + validationError + bulletinMessage + "&amp;" +
                            responseData.component.type + "&amp;" + "-" +"&amp;"+
                            inputSize + "&amp;" + outputSize + "&amp;"+ "-";
                } else if(componentType === "remote-process-groups"){
                    processorDetails = "-" + "&amp;" + "-" + "&amp;" + "-" + "&amp;" + "-" +"&amp;"+
                            "-" + "&amp;" + "-" + "&amp;"+ responseData.status.aggregateSnapshot.received +"/"+responseData.status.aggregateSnapshot.sent;
                }else{
                    processorDetails = "-" + "&amp;" + "-" + "&amp;" + "-" + "&amp;" + "-" +"&amp;"+
                            "-" + "&amp;" + "-" + "&amp;"+ "-";
                } 
            }
        });
        return processorDetails;
    };

    var checkImageExists = function(image_url){
        var http = new XMLHttpRequest();
        http.open('HEAD', image_url, false);
        http.send();
        return http.status !== 404;
    };
    
    var getTimingDetails = function(type, id){
        var iteration = 0;
        var timeStampList = [];
        var timeObjList = [];
        var timeStamp = "";
        var newtimeStamp = "";
        $.ajax({
            type: 'GET',
            async: false,
            url: '../dataintegration-api/flow/'+type+'/'+encodeURIComponent(id)+"/status/history",
            success: function (responseData) {
                timeStampList = responseData.statusHistory.aggregateSnapshots;
                for(iteration = 0; iteration<timeStampList.length; iteration++){
                    if(iteration === 0){
                        newtimeStamp = new Date(timeStampList[iteration].timestamp);
                        timeObjList.push(newtimeStamp);
                        timeStamp = timeStamp + newtimeStamp +",";
                    } else if(iteration === (timeStampList.length - 1)){
                        newtimeStamp = new Date(timeStampList[iteration].timestamp);
                        timeObjList.push(newtimeStamp);
                        timeStamp = timeStamp + newtimeStamp;
                        elapsedTime = getElapsedTime(timeObjList);
                        timeStamp = timeStamp + "," + elapsedTime;
                    }
                }
                if(timeStamp === "")
                    timeStamp = "-" + "," + "-" + "," + "-";
                else if(timeStamp.split(',')[1] === "")
                    timeStamp = timeStamp + "-" + "," + "-";
            }
        });
        return timeStamp;
    };
    
    var getElapsedTime = function(timeStampList){
        var elapsedTime = "";
        var startTime = timeStampList[0];
        var endTime = timeStampList[1];
        var timeDifference = parseInt(Math.abs(endTime - startTime)/1000);
        if(timeDifference < 0)
            elapsedTime = timeDifference*1000 + "ms";
        else if( timeDifference >= 0 && timeDifference < 60){
            elapsedTime = timeDifference + "sec";
        } else if(timeDifference >= 60 && timeDifference < 3600){
            elapsedTime = parseInt(timeDifference/60) + "min " + parseInt(timeDifference%60) +"sec";
        }else if(timeDifference >= 3600 && timeDifference < 86400){
            elapsedTime = parseInt(timeDifference/3600) + "hr " + parseInt(timeDifference%3600) + "min " + parseInt(timeDifference%60) +"sec";
        }else if(timeDifference >= 86400 && timeDifference < 604800){
            elapsedTime = parseInt(timeDifference/86400) + "d " + parseInt(timeDifference%3600) +"hr " + parseInt(timeDifference%3600) +"min";
        } else {
            elapsedTime = parseInt(timeDifference/604800) + "w " + parseInt(timeDifference/86400) + "d " + parseInt(timeDifference%3600) +"hr";
        }
        return elapsedTime;
    };
    
    return {
        /**
         * Initializes the processor details dialog.
         */
        init: function (supportsGoTo) {

            // initialize the properties tabs
            $('#processor-details-tabs').tabbs({
                tabStyle: 'tab',
                selectedTabStyle: 'selected-tab',
                scrollableTabContentStyle: 'scrollable',
                tabs: [{
                    name: 'Settings',
                    tabContentId: 'details-standard-settings-tab-content'
                }, {
                    name: 'Scheduling',
                    tabContentId: 'details-scheduling-tab-content'
                }, {
                    name: 'Properties',
                    tabContentId: 'details-processor-properties-tab-content'
                }, {
                    name: 'Comments',
                    tabContentId: 'details-processor-comments-tab-content'
                }],
                select: function () {
                    // remove all property detail dialogs
                    nfUniversalCapture.removeAllPropertyDetailDialogs();

                    // resize the property grid in case this is the first time its rendered
                    if ($(this).text() === 'Properties') {
                        $('#read-only-processor-properties').propertytable('resetTableSize');
                    }

                    // show the border if processor relationship names if necessary
                    var processorRelationships = $('#read-only-auto-terminate-relationship-names');
                    if (processorRelationships.is(':visible') && processorRelationships.get(0).scrollHeight > Math.round(processorRelationships.innerHeight())) {
                        processorRelationships.css('border-width', '1px');
                    }
                }
            });

            // configure the processor details dialog
            $('#processor-details').modal({
                headerText: 'Processor Details',
                scrollableContentStyle: 'scrollable',
                handler: {
                    close: function () {
                        // empty the relationship list
                        $('#read-only-auto-terminate-relationship-names').css('border-width', '0').empty();

                        // clear the property grid
                        $('#read-only-processor-properties').propertytable('clear');

                        // clear the processor details
                        nfCommon.clearField('read-only-processor-id');
                        nfCommon.clearField('read-only-processor-type');
                        nfCommon.clearField('read-only-processor-name');
                        nfCommon.clearField('read-only-concurrently-schedulable-tasks');
                        nfCommon.clearField('read-only-scheduling-period');
                        nfCommon.clearField('read-only-penalty-duration');
                        nfCommon.clearField('read-only-yield-duration');
                        nfCommon.clearField('read-only-run-duration');
                        nfCommon.clearField('read-only-bulletin-level');
                        nfCommon.clearField('read-only-execution-node');
                        nfCommon.clearField('read-only-execution-status');
                        nfCommon.clearField('read-only-processor-comments');

                        // removed the cached processor details
                        $('#processor-details').removeData('processorDetails');
                        $('#processor-details').removeData('processorHistory');
                    },
                    open: function () {
                        nfCommon.toggleScrollable($('#' + this.find('.tab-container').attr('id') + '-content').get(0));
                    }
                }
            });

            // configure the processor group details dialog
            $('#processor-group-details').modal({               
                headerText: 'Processor Group Details',
                scrollableContentStyle: 'scrollable',
                buttons: [{
                        buttonText: 'Close',
                        color: {
                            base: '#728E9B',
                            hover: '#004849',
                            text: '#ffffff'
                        },
                        handler: {
                            click: function () {
                                // close the dialog
                                this.modal('hide');
                            }
                        }
                    }]
            });

            // initialize the properties
            $('#read-only-processor-properties').propertytable({
                supportsGoTo: supportsGoTo,
                readOnly: true
            });
        },

        /**
         * Shows the details for the specified processor.
         *
         * @argument {string} groupId       The group id
         * @argument {string} processorId   The processor id
         */
        showDetails: function (groupId, processorId) {
            // load the properties for the specified processor
            var getProcessor = $.ajax({
                type: 'GET',
                url: '../dataintegration-api/processors/' + encodeURIComponent(processorId),
                dataType: 'json'
            }).done(function (response) {
                if (nfCommon.isDefinedAndNotNull(response.component)) {
                    // get the processor details
                    var details = response.component;

                    // record the processor details
                    $('#processor-details').data('processorDetails', details);

                    // populate the processor settings
                    nfCommon.populateField('read-only-processor-id', details.id);
                    nfCommon.populateField('read-only-processor-type', nfCommon.formatType(details));
                    nfCommon.populateField('read-only-processor-bundle', nfCommon.formatBundle(details.bundle));
                    nfCommon.populateField('read-only-processor-name', details.name);
                    nfCommon.populateField('read-only-concurrently-schedulable-tasks', details.config.concurrentlySchedulableTaskCount);
                    nfCommon.populateField('read-only-scheduling-period', details.config.schedulingPeriod);
                    nfCommon.populateField('read-only-penalty-duration', details.config.penaltyDuration);
                    nfCommon.populateField('read-only-yield-duration', details.config.yieldDuration);
                    nfCommon.populateField('read-only-run-duration', nfCommon.formatDuration(details.config.runDurationMillis));
                    nfCommon.populateField('read-only-bulletin-level', details.config.bulletinLevel);
                    nfCommon.populateField('read-only-processor-comments', details.config.comments);

                    var showRunSchedule = true;

                    var schedulingStrategy = details.config['schedulingStrategy'];

                    // make the scheduling strategy human readable
                    if (schedulingStrategy === 'EVENT_DRIVEN') {
                        showRunSchedule = false;
                        schedulingStrategy = 'Event driven';
                    } else if (schedulingStrategy === 'RUN_ONCE') { 
                        showRunSchedule = false;
                        schedulingStrategy = 'Run once';
                    } else if (schedulingStrategy === 'CRON_DRIVEN') {
                        schedulingStrategy = 'CRON driven';
                    } else if (schedulingStrategy === 'TIMER_DRIVEN') {
                        schedulingStrategy = "Timer driven";
                    } else {
                        schedulingStrategy = "On primary node";
                    }
                    nfCommon.populateField('read-only-scheduling-strategy', schedulingStrategy);

                    // only show the run schedule when applicable
                    if (showRunSchedule === true) {
                        $('#read-only-run-schedule').show();
                    } else {
                        $('#read-only-run-schedule').hide();
                    }

                    var executionNode = details.config.executionNode;

                    // only show the execution-node when applicable
                    if (executionNode === 'PRIMARY') {
                        if (executionNode === 'ALL') {
                            executionNode = "All nodes";
                        } else if (executionNode === 'PRIMARY') {
                            executionNode = "Primary node only";
                        }
                        nfCommon.populateField('read-only-execution-node', executionNode);

                        $('#read-only-execution-node-options').show();
                    } else {
                        $('#read-only-execution-node-options').hide();
                    }

                    // load the relationship list
                    if (!nfCommon.isEmpty(details.relationships)) {
                        $.each(details.relationships, function (i, relationship) {
                            createRelationshipOption(relationship);
                        });
                    } else {
                        $('#read-only-auto-terminate-relationship-names').append('<div class="unset">This processor has no relationships.</div>');
                    }
                }
            });

            // get the processor history
            var getProcessorHistory = $.ajax({
                type: 'GET',
                url: '../dataintegration-api/flow/history/components/' + encodeURIComponent(processorId),
                dataType: 'json'
            }).done(function (response) {
                var processorHistory = response.componentHistory;

                // record the processor history
                $('#processor-details').data('processorHistory', processorHistory);
            });

            // show the dialog once we have the processor and its history
            $.when(getProcessor, getProcessorHistory).done(function (processorResult, historyResult) {
                var processorResponse = processorResult[0];
                var processor = processorResponse.component;
                var historyResponse = historyResult[0];
                var history = historyResponse.componentHistory;

                // load the properties
                $('#read-only-processor-properties').propertytable('loadProperties', processor.config.properties, processor.config.descriptors, history.propertyHistory);

                var buttons = [{
                    buttonText: 'Ok',
                    color: {
                        base: '#448DD5',
                        hover: '#C0D8F0',
                        text: '#ffffff',
                        border:'1px solid #ccc!important'
                    },
                    handler: {
                        click: function () {
                            // hide the dialog
                            $('#processor-details').modal('hide');
                        }
                    }
                }];

                // determine if we should show the advanced button
                if (top === window && nfCommon.isDefinedAndNotNull(nfCustomUi) && nfCommon.isDefinedAndNotNull(processor.config.customUiUrl) && processor.config.customUiUrl !== '') {
                    buttons.push({
                        buttonText: 'Advanced',
                        clazz: 'fa fa-cog button-icon',
                        color: {
                            base: '#E3E8EB',
                            hover: '#C7D2D7',
                            text: '#004849'
                        },
                        handler: {
                            click: function () {
                                // reset state and close the dialog manually to avoid hiding the faded background
                                $('#processor-details').modal('hide');

                                // show the custom ui
                                nfCustomUi.showCustomUi(processorResponse, processor.config.customUiUrl, false);
                            }
                        }
                    });
                }

                // show the dialog
                $('#processor-details').modal('setButtonModel', buttons).modal('show');

                // add ellipsis if necessary
                $('#processor-details div.relationship-name').ellipsis();

                // show the border if necessary
                var processorRelationships = $('#read-only-auto-terminate-relationship-names');
                if (processorRelationships.is(':visible') && processorRelationships.get(0).scrollHeight > Math.round(processorRelationships.innerHeight())) {
                    processorRelationships.css('border-width', '1px');
                }
            }).fail(function (xhr, status, error) {
                if (xhr.status === 400 || xhr.status === 404 || xhr.status === 409) {
                    nfDialog.showOkDialog({
                        headerText: 'Error',
                        dialogContent: nfCommon.escapeHtml(xhr.responseText)
                    });
                } else {
                    nfErrorHandler.handleAjaxError(xhr, status, error);
                }
            });
        },
        
        /**
         * Shows the details for the specified processor group.
         * 
         * @argument {string} groupId       The group id
         * @argument {string} groupName       The group name
         */
        showProcessorGroupDetails: function (groupId, groupName) {
            $('#summary').find("#loader-icon").css("display","block");
            setTimeout(function(){
            var isSeperateWindow = parent.location.pathname.indexOf("/dataintegration/summary")>=0;
            updateDetails(groupId, isSeperateWindow);
            $("#processor-group-details").find("#processor-group-id").text(groupId);
            $("#processor-group-details").find(".dialog-header-text").text(groupName+" Workflow Details");
            
            var dataGrid = $('#Grid').data("ejGrid");
            dataGrid.dataSource(dataSource);
            
            // show the dialog
            $('#processor-group-details').modal('show');
            dataGrid.refreshContent();
            dataGrid.groupColumn("WorkflowItem"); 
            dataGrid.gotoPage(1);
            $('#summary').find("#loader-icon").css("display","none");
            },1000);
            
            if(dataSource.length === 0){
                $("#processor-group-details").find(".emptyrecord")
                    .text("No workflow to display for the selected '"+groupName+"' process group.");
                $("#processor-group-details").find(".emptyrecord").addClass("error-text-property");
            }
            if(parent.location.pathname.indexOf("/dataintegration/summary")>=0){
                $("#processor-group-details").find(".processorName").css("color","rgba(0,0,0,.84)");
                $("#processor-group-details").find(".processorName").css("cursor","default");
            } else{
                $("#processor-group-details").find(".processorName").css("color","rgb(18, 128, 206)");
                $("#processor-group-details").find(".processorName").css("cursor","pointer");
                $("#processor-group-details").find(".processorName").on("click", function(){
                    var groupId = $("#processor-group-details").find("#processor-group-id").text();
                    // and our parent has canvas utils and shell defined
                    if (nfCommon.isDefinedAndNotNull(parent.nf) && nfCommon.isDefinedAndNotNull(parent.nf.CanvasUtils) && nfCommon.isDefinedAndNotNull(parent.nf.Shell)) {
                        parent.nf.CanvasUtils.showComponent(groupId, $(this).attr("id"));
                        parent.$('#shell-close-button').click();
                    }
                });
            }
        }   
    };
}));
