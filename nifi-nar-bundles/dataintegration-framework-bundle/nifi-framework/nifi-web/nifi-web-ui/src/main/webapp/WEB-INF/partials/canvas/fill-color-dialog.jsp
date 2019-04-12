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
<div id="fill-color-dialog" class="hidden">
    <div class="dialog-content">
        <div class="setting" style="margin-bottom: 0px;">
            <div class="setting-name">Color</div>
            <div class="setting-field">
                <input type="text" id="fill-color" value="#FFFFFF"/>
            </div>
            <div class="setting-name" style="margin-top: 10px;">Value</div>
            <div class="setting-field">
                <input type="text" id="fill-color-value" value="#FFFFFF"/>
            </div>
            <div class="setting-name" style="margin-top: 10px;">Preview</div>
            <div class="setting-field">
                <div id="fill-color-processor-preview"style="border: 3px solid ! important;">
                    <!--Removed the default fill-color-processor-preview-icon id and added a new id to modify the processor preview design-->
                    <!--<div id="fill-color-processor-preview-modified-icon" style="background-image: url(images/processor_icon_preview.png);float: left;width: 20px;height: 20px;margin-left: 4px;margin-top:3px;display: none"></div>-->
                    <div id="fill-color-processor-preview-name" style="margin-left: 35px; line-height: 25px; font-size: 12px; height: 25px; color: #262626;">Processor Name</div>
                    <!--<div style="width: 96%;height: 36px;margin-left: 4px;background-image: url(images/processor_Preview.png);display: none"></div>-->
                </div>
                <div id="fill-color-label-preview">
                    <div id="fill-color-label-preview-value">Label Value</div>
                </div>
            </div>
        </div>
    </div>
</div>