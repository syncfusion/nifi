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
                'Slick',
                'nf.Client',
                'nf.Birdseye',
                'nf.Graph',
                'nf.nf.CanvasUtils',
                'nf.ErrorHandler',
                'nf.Dialog',
                'nf.Common'],
            function ($, Slick, nfClient, nfBirdseye, nfGraph, nfCanvasUtils, nfErrorHandler, nfDialog, nfCommon) {
                return (nf.ng.ProcessorComponent = factory($, Slick, nfClient, nfBirdseye, nfGraph, nfCanvasUtils, nfErrorHandler, nfDialog, nfCommon));
            });
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = (nf.ng.ProcessorComponent =
            factory(require('jquery'),
                require('Slick'),
                require('nf.Client'),
                require('nf.Birdseye'),
                require('nf.Graph'),
                require('nf.CanvasUtils'),
                require('nf.ErrorHandler'),
                require('nf.Dialog'),
                require('nf.Common')));
    } else {
        nf.ng.ProcessorComponent = factory(root.$,
            root.Slick,
            root.nf.Client,
            root.nf.Birdseye,
            root.nf.Graph,
            root.nf.CanvasUtils,
            root.nf.ErrorHandler,
            root.nf.Dialog,
            root.nf.Common);
    }
}(this, function ($, Slick, nfClient, nfBirdseye, nfGraph, nfCanvasUtils, nfErrorHandler, nfDialog, nfCommon) {
    'use strict';

    return function (serviceProvider) {
       function ProcessorComponent(component) {
     this.icon = 'icon icon-Processor';
     this.hoverIcon = 'icon icon-Processor-add';
       
    }

    ProcessorComponent.prototype = {
        constructor: ProcessorComponent,

        /**
         * Gets the component.
         *
         * @returns {*|jQuery|HTMLElement}
         */
        getElement: function() {
            
            return $('#Processor-component');
          
        },

        /**
         * Enable the component.
         */
        enabled: function() {
            this.getElement().attr('disabled', false);
        },

        /**
         * Disable the component.
         */
        disabled: function() {
            this.getElement().attr('disabled', true);
        },

        /**
         * Handler function for when component is dropped on the canvas.
         *
         * @argument {object} pt        The point that the component was dropped.
         */
        dropHandler: function(event,id) {
           
           // this.createProcessor("",event);
        },

        /**
         * The drag icon for the toolbox component.
         *
         * @param event
         * @returns {*|jQuery|HTMLElement}
         */
            dragIcon: function () {
            var SelectedProcessorName = $(this).attr("title");
            return $('<div class="icon icon-processor-drag" style="margin-top:2px;text-overflow: ellipsis;margin-left: -14px;font-Size: 12px;position: relative;color:#484D4E;height: 27.5px ! important;width: 135px ! important;display: inline-flex; line-height: 19px;background-color:#C9F0F8;border-radius:4px;overflow:hidden;border:2px solid #84D2F9"><span class="processorname" style="padding-left: 6px;padding-top: 2px;font-size: 11px;color:black;overflow:hidden;text-overflow:ellipsis;">'+ SelectedProcessorName +'</span></div>');
           },
      
        /**
         * Creates a new Processor at the specified point.
         *
         * @argument {object} pt        The point that the Processor was dropped.
         */
         createProcessor: function(name) {

       var processorType= "org.apache.nifi.processors.standard."+name;
      
       var groupId =(nf.Canvas.getGroupId());
       alert(groupId);
      var processorEntity = {
            'revision': nfClient.getRevision({
                'revision': {
                    'version': 0
                }
            }),
            'component': {
                'type': processorType,
                'name': name
               
            }
        };

        // create a new processor of the defined type
        $.ajax({
            type: 'POST',
            url: '../dataintegration-api/process-groups/' +groupId+ '/processors',
            data: JSON.stringify(processorEntity),
            dataType: 'json',
            contentType: 'application/json'
        }).done(function (response) {
             nf.Graph.add({
                'processors': [response]
            }, {
                'selectAll': true
            });

            // update component visibility
            nf.Canvas.View.updateVisibility();

            // update the birdseye
            nf.Birdseye.refresh();
        }).fail(nf.Common.handleAjaxError);
    }
	};
    var processorComponent = new ProcessorComponent();
    return processorComponent;
};
}));