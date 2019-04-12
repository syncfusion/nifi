<%-- Licensed to the Apache Software Foundation (ASF) under one or more contributor license agreements. See the NOTICE file distributed with this work for additional information regarding copyright ownership. The ASF licenses this file to You under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License. --%>
    <link rel="stylesheet" href="assets/syncfusion-javascript/Content/ej/web/material/ej.web.all.min.css" type="text/css" />
    <script type="text/javascript" src="assets/syncfusion-javascript/node_modules/jsrender/jsrender.min.js"></script>
    <script type="text/javascript" src="assets/syncfusion-javascript/Scripts/ej/web/ej.web.all.min.js"></script>

    <%@ page contentType="text/html" pageEncoding="UTF-8" session="false" %>
        <div id="registry-variables-dialog" class="hidden small-dialog">
            <div class="dialog-header" style="height:80px;margin-left: -5px;">
                <span class="dialog-header-text" style="font-size:18px;color: #448dd5;font-family: Segoe UI;margin-bottom: 30px;line-height: 120px;line-height: 120px;">Configurations</span>
            </div>
            <div class="toolbar" style="border-bottom:3px solid gray;margin-left:15px;margin-right:15px;height:38px">
                <span class="restart-information" style="float: left;margin-top: 6px">*You must restart the data integration service to apply any changes done here.</span>
                <button class="restart-services restart-button" onclick="restartServices()" style="float:left;margin-left:20px;top: 3px;">Restart</button>
                <div id="SelectFileDropdown" style="float:right;border:1px solid rgb(204, 204, 204);width: 25%;">
                <input id="SelectFile" type="text" />
                </div>
            </div>
            <button class="restart-services save-file-content" style="top: 15px;width: 70px;float: right;margin-right: 15px;" onclick="saveEditConfigFile()">Save</button>
            <button class="edit-cancel" style="top:15px;width:70px;float:right;" onclick="undoConfigFile()">Cancel</button>
            <div class="dialog-content" style="top: 180px;bottom: 40px;margin-right: -5px;left: 15px !important;overflow-y: auto;">
                <div id="Grid" class="registry-table"></div>
                <textarea id="XmlFileContent" onchange="saveXmlContent()"></textarea>
                <div class="loader-icon" style="height: 50px;width: 49px;background-image: url(images/waitingpopup.gif);position: absolute;z-index: 2;margin-top: 18%;margin-left: 50%;float: left;display: none"></div>
            </div>
        </div>
