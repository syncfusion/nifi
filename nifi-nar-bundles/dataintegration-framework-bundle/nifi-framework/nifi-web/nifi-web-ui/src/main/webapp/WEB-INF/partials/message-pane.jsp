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
<div id="message-pane" class="message-pane hidden">
   <div class="main-container">
      <div style="width: 500px;height: 100%;margin-left: auto;margin-right: auto;">
         <div class="session-container">
            <div id="session-inner-container" class="hidden" style="display: block;">
               <div class="logged-user-name">Admin</div>
               <div id="message-title"></div>
               <div class="session-setting-field">
                  <span id="message-content"></span>
               </div>
            </div>
            <div id="session-button-container" class="login-container hidden">
               <span class="home-button"><a href="/dataintegration" class="redirection-link">Home</a>
               <span style="padding-left: 2px;padding-right: 2px;">/</span>
               <a href="#" class="redirection-link" id="redirect-link">Login</a></span>
            </div>
         </div>
      </div>
      <div class="session-footer-container">
         <div class="copy-right-container"><span>Copyright © 2001 - 2018 Syncfusion Inc | All Rights Reserved</span></div>
         <div class="syncfusion-footer-logo">
            <span class="poweredby-span">Powered by </span>
            <div class="footer-logo"></div>
         </div>
      </div>
   </div>
</div>
