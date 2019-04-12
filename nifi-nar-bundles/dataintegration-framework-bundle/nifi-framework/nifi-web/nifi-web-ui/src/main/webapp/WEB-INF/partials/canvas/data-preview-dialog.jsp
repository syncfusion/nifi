<%--
   Licensed to the Apache Software Foundation (ASF) under one or more
    contributor license agreements.  See the NOTICE file distributed with
    this work for additional information regarding copyright ownership.
    The ASF licenses this file to You under the Apache License, Version 2.0
    (the "License"); you may not use this file except in compliance with
    the License.  You may obtain a copy of the License at
   
        http://www.apache.org/licenses/LICENSE-2.0
   
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
   --%>
<%@ page contentType="text/html" pageEncoding="UTF-8" session="false" %>

<div id="data-preview-dialog" class="hidden cancellable">
   <div id="data-preview-shell-container" class="dialog-content">
      <div id="data-preview-shell-close-container">
         <button id="shell-undock-button" class="undock-normal pointer " title="Open in New Window">
            <div class="fa fa-external-link-square"></div>
         </button>
         <button id="data-preview-shell-close-button" class="close-normal pointer" title="Close">
            <div class="fa fa-times"></div>
         </button>
         <div class="clear"></div>
      </div>
      <div id="data-preview-header-and-filter">
         <div id="data-preview-header-text">Data Preview</div>
      </div>
      <div id="data-preview-container">
         <div id="data-preview-tabs" class="tab-container">
         </div>
         <div id="data-preview-tabs-content">
            <div id="data-preview-filter-container" class="filter-container">
               <div id="data-preview-content-filename">
                  <span class="data-preview-content-label">File Name:</span>
                  <span class="data-preview-content-value" id="preview-file-name"></span>
               </div>
               <div id="data-preview-content-type">
                  <span class="data-preview-content-label">Content Type:</span>
                  <span class="data-preview-content-value" id="file-content-type"></span>
               </div>
               <div id="data-preview-filter-type" class="data-preview-filter-containerfilter-type"></div>
               <div id="view-as-label" class="preview-view-as-label">View as </div>
               <div class="auto-refresh-container">
               <div id="auto-refresh-interval" class="data-preview-filter-containerfilter-type"> </div>
               <div id="auto-refresh-label" class="preview-view-as-label">Refresh Interval</div>
               </div>
            </div>
            <div id="inputDataGrid"></div>
            <div id="outputDataGrid"></div>
            <textarea id="inputDataPreview" class="datapreview-textarea"></textarea>
            <textarea id="outputDataPreview" class="datapreview-textarea"></textarea>
            <div id="inputType" style="display:none"></div>
            <div id="outputType" style="display:none"></div>
            <div id="inputFileName" style="display:none"></div>
            <div id="outputFileName" style="display:none"></div>
            <div id="inputContent" style="display:none"></div>
            <div id="outputContent" style="display:none"></div>
            <div id="inputJsonContent" style="display:none"></div>
            <div id="outputJsonContent" style="display:none"></div>
            <div id="ViewType" style="display:none">original</div>     
         </div>
         <div id="loader-icon" style="height: 50px;width: 49px;background-image: url(images/waitingpopup.gif);position: absolute;z-index: 2;margin-top:14%;margin-left: 50%;float: left;display: none"></div>
    <div id="data-preview-refresh-container">
    <md-switch class="md-primary refresh-toggle" aria-label="Toggle auto refresh">
        Auto-refresh
    </md-switch>
    <button id="data-preview-refresh-button" class="refresh-button pointer fa fa-refresh" title="Refresh"></button>
    <div id="data-preview-last-refreshed-container" class="last-refreshed-container">
        Last updated:&nbsp;<span id="data-preview-last-refreshed" class="value-color" style="display:none"></span>
    </div>
    <div id="data-preview-loading-container" class="loading-container"></div>
   </div>
      </div>
   </div>
   <style>
      ::-webkit-scrollbar
      {
      width: 6px;  /* for vertical scrollbars */
      height: 6px; /* for horizontal scrollbars */
      }
      ::-webkit-scrollbar-track,::-webkit-scrollbar-track-piece
      {
      background: rgba(0, 0, 0, 0.05);
      }
      ::-webkit-scrollbar-thumb
      {
      background: rgba(0, 0, 0, 0.1);
      -webkit-border-radius: 5px;
      -webkit-box-shadow: inset 0 0 3px rgba(0,0,0,0.5); 
      }
   </style>
</div>