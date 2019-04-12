<%-- Licensed to the Apache Software Foundation (ASF) under one or more contributor license agreements. See the NOTICE file distributed with this work for additional information regarding copyright ownership. The ASF licenses this file to You under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License. --%>
    <link rel="stylesheet" href="../dataintegration/js/jquery/modal/jquery.modal.css" type="text/css" />
    <script type="text/javascript" src="../dataintegration/js/jquery/modal/jquery.modal.js"></script>
    <%@ page contentType="text/html" pageEncoding="UTF-8" session="false" %>
        <div id="add-existing-server-dialog" class="hidden small-dialog">
            <div class="dialog-header"><span class="dialog-header-text">Add Existing Server</span>
            </div>
            <div class="dialog-content">
                <div class="setting">
                    <div class="setting-name">Server name *</div>
                    <div class="setting-field">
                        <input id="server-name" type="text" />
                    </div>
                </div>
               <div class="setting">
                    <div class="setting-name">Is secured</div>
                    <div class="setting-field secured-field">
                        <input type="checkbox" class="secure-checkbox" value="secured" name="secure">
                    </div>
                </div>
                <div class="setting">
                    <div class="setting-name">Server IP/Hostname *</div>
                    <div class="setting-field">
                        <input id="server-host-name" type="text" />
                    </div>
                </div>
                 <div class="setting">
                    <div class="setting-name">Server port *</div>
                    <div class="setting-field">
                      <input type="text" name="port" id="server-port-number">
                    </div>
                </div>
                <div class="setting">
                 <span class="error-status"></span>
                </div>
                <div id="loader-icon" style="height: 50px;width: 49px;background-image: url(images/waitingpopup.gif);position: absolute;z-index: 2;margin-top: 18%;margin-left: 50%;float: left;display: none"></div>
            </div>
        </div>
        <style>
            #add-existing-server-dialog{
                min-width: 450px;
                min-height:330px;
                background-color: #fff;
                height: auto!important;
                overflow-x:hidden;
                overflow-y:hidden;
            }
            #add-existing-server-dialog .setting {
                float: left;
                width: 100%;
            }
            #add-existing-server-dialog .setting-name {
                float: left;
                width: 45%;
                margin-top: 6px;
            }
            #add-existing-server-dialog .setting-field {
                float: left;
                color: rgba(0, 0, 0, 0.87);
                width: 45%;
                padding-left:4%;
            }
            #add-existing-server-dialog .dialog-content {
                overflow-y: hidden;
            }
            .error-status {
                color: darkred
            }
            #add-existing-server-dialog input[type=text]{
                width:200px;
            }
            #add-existing-server-dialog .secure-checkbox{   
                box-shadow: none!important;
            }
        </style>