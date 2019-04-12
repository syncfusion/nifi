<%-- Licensed to the Apache Software Foundation (ASF) under one or more contributor license agreements. See the NOTICE file distributed with this work for additional information regarding copyright ownership. The ASF licenses this file to You under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License. --%>
    <link rel="stylesheet" href="../dataintegration/js/jquery/modal/jquery.modal.css" type="text/css" />
    <script type="text/javascript" src="../dataintegration/js/jquery/modal/jquery.modal.js"></script>
    <%@ page contentType="text/html" pageEncoding="UTF-8" session="false" %>
        <div id="publish-template-dialog" class="hidden small-dialog">
            <div class="dialog-header"><span class="dialog-header-text">Publish Template</span>
            </div>
            <div class="dialog-content">
                <div class="setting">
                    <div class="setting-name">Server IP/Hostname *</div>
                    <div class="setting-field">
                        <input id="remote-server-host-name" type="text" />
                    </div>
                </div>
                 <div class="setting">
                    <div class="setting-name">Server port *</div>
                    <div class="setting-field">
                      <input type="text" name="port" id="port-number">
                    </div>
                </div>
                <div class="setting">
                    <div class="setting-name">Is secured</div>
                    <div class="setting-field">
                        <input type="checkbox" class="secured-checkbox" value="secured" name="secured">
                    </div>
                </div>
                <div class="login-credentials">
                    <div class="setting">
                        <div class="setting-name">Username *</div>
                        <div class="setting-field">
                            <input id="server-user-name" type="text" />
                        </div>
                    </div>
                    <div class="setting">
                        <div class="setting-name">Password *</div>
                        <div class="setting-field">
                            <input id="server-password" type="password" />
                        </div>
                    </div>
                </div>
                <div class="setting">
                    <div class="setting-name">Publish to</div>
                    <div class="setting-field">
                        <span><input type="radio" value="Existing group" name="publish-group">Existing group</span>
                        <span><input type="radio" value="New group" name="publish-group">New group</span>
                    </div>
                </div>
                <div class="setting select-process-group-section">
                    <div class="setting-name">Choose processor group</div>
                    <div class="setting-field">
                        <select class="group-name">
                        </select>
                    </div>
                </div>
                <div class="setting new-process-group-section">
                    <div class="setting-name">Processor group name</div>
                    <div class="setting-field">
                        <input id="new-process-group-name" class="new-process-group" type="text" />
                    </div>
                </div>
                <div class="setting new-template-name">
                    <div class="setting-name">Template name</div>
                    <div class="setting-field">
                        <input class="template-name" type="text" />
                    </div>
                </div>
                <div class="setting">
                        <span class="template-error-status"></span>
                </div>
                <div class="progress-loading"></div>
            </div>
        </div>
        <style>
            #publish-template-dialog {
                min-width: 500px;
                background-color: #fff;
                min-height: 380px;
                height: auto!important;
                overflow-x:hidden;
                overflow-y:hidden;
            }
            #publish-template-dialog .setting {
                float: left;
                width: 100%;
            }
            #publish-template-dialog .setting-name {
                float: left;
                width: 50%;
                margin-top: 6px;
                margin-right: 0px;
            }
            #publish-template-dialog .setting-field {
                float: left;
                color: rgba(0, 0, 0, 0.87);
                width: 45%;
                padding-left:4%;
            }
            #publish-template-dialog .dialog-content {
                overflow-y: hidden;
            }
            .login-credentials {
                display: none;
            }
            .group-name {
                width: 200px;
                height: 30px;
                margin-left: 6px;
            }
            .select-process-group-section {
                display: none;
            }
            .template-error-status {
                color: darkred
            }
            .new-template-name{
                display:none;
            }
            #publish-template-dialog input[type=text],#publish-template-dialog input[type=password]{
                width:200px;
            }
            .secured-checkbox{
                box-shadow: none!important;
                margin-left: 6px;
            }
        </style>