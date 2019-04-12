<%-- Licensed to the Apache Software Foundation (ASF) under one or more contributor license agreements. See the NOTICE file distributed with this work for additional information regarding copyright ownership. The ASF licenses this file to You under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License. --%>
    <link rel="stylesheet" href="../dataintegration/js/jquery/modal/jquery.modal.css" type="text/css" />
    <script type="text/javascript" src="../dataintegration/js/jquery/modal/jquery.modal.js"></script>
    <%@ page contentType="text/html" pageEncoding="UTF-8" session="false" %>
        <div id="nifi-properties-change-dialog" class="hidden small-dialog">
            <div class="dialog-header"><span class="dialog-header-text">Data Integration properties</span>
            </div>
            <div class="dialog-content">
                <div class="setting">
                    <div class="setting-name">Server IP/HostName</div>
                    <div class="setting-field">
                        <input id="host-name" type="text" />
                    </div>
                </div>
                <div class="setting">
                    <div class="setting-name">Server Port</div>
                    <div class="setting-field">
                        <input type="text" name="port" id="port-number-value">
                    </div>
                </div>
                <div class="setting">
                    <div class="setting-name">Auto Refresh Duration</div>
                    <div class="setting-field">
                        <input type="text" name="port" id="auto-refresh">
                    </div>
                </div>
                <div class="setting">
                    <div class="setting-name">Registry File location</div>
                    <div class="setting-field">
                        <input type="text" name="port" id="registry">
                    </div>
                </div>

                <div class="setting">
                    <span class="nifiProperties-error-status"></span>
                </div>
                <div class="progress-loading"></div>
            </div>
        </div>
        <style>
            #nifi-properties-change-dialog {
                min-width: 430px;
                background-color: #fff;
                min-height: 350px;
                height: auto!important;
                overflow-x: hidden;
                overflow-y: hidden;
            }

            #nifi-properties-change-dialog .setting {
                float: left;
                width: 100%;
            }

            #nifi-properties-change-dialog .setting-name {
                float: left;
                width: 37%;
                margin-right: 3%;
                margin-top: 6px;
            }

           #nifi-properties-change-dialog .setting-field {
                float: left;
                color: rgba(0, 0, 0, 0.87);
                width: 60%;
            }

            #nifi-properties-change-dialog .dialog-content {
                overflow-y: hidden;
            }

           #nifi-properties-change-dialog .nifiProperties-error-status {
                color: darkred
            }

        </style>