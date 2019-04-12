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
<!DOCTYPE html>
<html>
    <head>
        <title>Login</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta http-equiv="X-UA-Compatible" content="IE=Edge">
        <link rel="stylesheet" href="assets/reset.css/reset.css" type="text/css" />
        <link rel="shortcut icon" href="images/data-integration.ico"/>
        <link rel="stylesheet" href="fonts/flowfont/flowfont.css" type="text/css" />
        <link rel="stylesheet" href="assets/font-awesome/css/font-awesome.min.css" type="text/css" />
        <link rel="stylesheet" href="assets/syncfusion-javascript/Content/ej/web/material/ej.web.all.min.css" type="text/css" />
        ${nf.login.style.tags}
        ${nf.syncfusion.style.tags}
        <link rel="stylesheet" href="js/jquery/modal/jquery.modal.css?${project.version}" type="text/css" />
        <link rel="stylesheet" href="assets/qtip2/dist/jquery.qtip.min.css?" type="text/css" />
        <link rel="stylesheet" href="assets/jquery-ui-dist/jquery-ui.min.css" type="text/css" />
        <link rel="stylesheet" href="fonts/flowfont/flowfont.css" type="text/css" />
        <link rel="stylesheet" href="assets/angular-material/angular-material.min.css" type="text/css" />
        <link rel="stylesheet" href="assets/font-awesome/css/font-awesome.min.css" type="text/css" />    
        <script type="text/javascript" src="assets/jquery/dist/jquery.min.js"></script>
        <script type="text/javascript" src="js/jquery/jquery.base64.js"></script>
        <script type="text/javascript" src="js/jquery/jquery.count.js"></script>
        <script type="text/javascript" src="js/jquery/jquery.center.js"></script>
        <script type="text/javascript" src="js/jquery/modal/jquery.modal.js?${project.version}"></script>
        <script type="text/javascript" src="assets/qtip2/dist/jquery.qtip.min.js"></script>
        <script type="text/javascript" src="assets/jquery-ui-dist/jquery-ui.min.js"></script>
        <script type="text/javascript" src="js/nf/nf-namespace.js?${project.version}"></script>
        <script type="text/javascript" src="assets/syncfusion-javascript/Scripts/ej/web/ej.web.all.min.js"></script>
        ${nf.login.script.tags}        
    </head>
    <body class="login-body">
        
        <div id="login-splash" style="display:none;">
            <div id="splash-img" layout="row" layout-align="center center" class="layout-align-center-center layout-row">
             <!--<md-progress-circular md-mode="indeterminate" class="md-warn" md-diameter="150"></md-progress-circular>-->
            </div>
            </div>
        <div id="login-background-container" style="width: 100%;height: 100%;background: url(images/LoginPageBg.png);background-repeat: no-repeat;background-size:100%;display:none">  
            <div style="width: 60%;height: 95%;float: left;">    
            <div id="syncfusion-logo-id" style="float: right;margin-left: 20%;">
                    <div class="syncfusion-logo" style="width: 100%;height: 70%;background: url(images/syncfusion-logo.png);        
                         background-repeat: no-repeat;background-color: transparent;">
                    </div>
                </div>
            </div>
            <div style="width: 40%;height: 95%;float: right;">
                <div class="loader" style="position: absolute;border: 4px solid #f3f3f3;border-radius: 50%;border-top: 5px solid #3498db;width: 25px!important;width: 21px;height: 25px;-webkit-animation: spin 2s linear infinite;animation: spin 2s linear infinite;margin-top: 200px;margin-left: 206px;margin-top: 260px;z-index: 2;display: none"></div>
                <div id="login-container" class="hidden" style="width: 250px;padding: 23px;height: 175px;float: right;position: absolute;background: #ffffff;border-radius: 4px;box-shadow: 0px 10px 6px -6px #999;margin-top: 14%;">
                    <div style="width: 100%;height: 46px;padding-bottom: 16px;">
			<div>
                            <input type="text" placeholder="Username" id="username" value="admin" autocomplete="off" style="border: 1px solid transparent;width: 100%;height: 25px;padding: 0px;font-family: segoe UI;font-size: 12px;border-top: 0px;">
			</div>
                        <div>
                            <div style="width: 100%;border: 1px solid rgba(0, 0, 0, 0.11);margin-bottom: 8px;"></div>
                        </div>
                    </div>
		<div style="width: 100%;height:25px;padding-bottom: 16px;">
                    <div>
                        <input type="password" placeholder="Password" id="password" style="border: 1px solid transparent;width: 100%;height: 25px;padding: 0px;font-size: 12px;font-family: segoe UI;border-top: 0px;">
                    </div>
                    <div>
                        <div style="width: 100%;border: 1px solid rgba(0, 0, 0, 0.11);margin-bottom:34px;"></div>
                        <div id="password-error-validation" style="font-size: 12px;font-family: segoe UI;color: #ef5454;display: none"></div>
                    </div>
                </div>
                <div style="width: 100%;height:25px;padding-bottom: 20px;">
                    <span class="password-hint">Default password : admin</span>
                </div>
                <button type="button" id="login-submission-button" style="width: 100%;height: 32px;box-shadow: 0px 2px 5px 0px #999;background-color: #47b747;border-radius: 5px;cursor: pointer;color: #FFFFFF;border: none;">SIGN IN</button>
            </div>
            <jsp:include page="/WEB-INF/partials/login/login-progress.jsp"/>
            </div>   
            <div style="width: 50%;height: 5%;bottom: 0px;float: left">
                <div style="width: 97%;height: 100%;color: white;padding-left: 20px;padding-top: 10px">Copyright © 2010-2018 Syncfusion Inc | All Rights Reserved</div>
            </div>
            <div style="width: 50%;height: 5%;bottom: 0px;float: right">
                <div style="width: 50%;height: 100%;color: white;text-align: right;padding-right: 20px;padding-top: 10px;float: right">
                    <div style="width: 90px;height: 20px;float: right;background-size: 90px;background-image: url(images/sync-logo.png);margin-left: 10px;margin-top: -8px;"></div>
                    <div style="width: 50%;height: 100%;float: right;text-align: right;">Powered by </div>                    
                </div>
            </div>
        </div>
        <jsp:include page="/WEB-INF/partials/login/login-message.jsp"/>
        <jsp:include page="/WEB-INF/partials/ok-dialog.jsp"/>
        <div style="display: none">
            <jsp:include page="/WEB-INF/partials/security/enable-securityconfiguration-dialog.jsp"/>
        </div>
        <script>
            if(location.protocol === "https:"){
                $("#login-background-container").css("display","none");
                $("#login-splash").css("display","block");
                $(".loader").css("display","none");   
            }
            else{
                $("#login-background-container").css("display","block");
                
            }
        </script>
    </body>
</html>
