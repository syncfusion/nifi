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

/* global top, define, module, require, exports, nf */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery',
                'nf.Common',
                'nf.Dialog',
                'nf.Storage'],
            function ($, nfCommon, nfDialog, nfStorage) {
                return (nf.Login = factory($, nfCommon, nfDialog, nfStorage));
            });
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = (nf.Login =
            factory(require('jquery'),
                require('nf.Common'),
                require('nf.Dialog'),
                require('nf.Storage')));
    } else {
        nf.Login = factory(root.$,
            root.nf.Common,
            root.nf.Dialog,
            root.nf.Storage);
    }
}(this, function ($, nfCommon, nfDialog, nfStorage) {
    'use strict';

    $(document).ready(function () {
        $(".loader").css("display","block");
        nf.EnableSecurityConfiguration.init();
        nfLogin.init();
    });

    var config = {
        urls: {
            token: '../dataintegration-api/access/token',
            accessStatus: '../dataintegration-api/access',
            getumpusers:  '../dataintegration-api/syncfusion/getumpusers', 
            decrypt: '../dataintegration-api/syncfusion/decryptclientsecret',
            accessConfig: '../dataintegration-api/access/config',
            syncfusionProviderStatus: '../dataintegration-api/syncfusion/status',
            syncfusionToken: '../dataintegration-api/syncfusion/token',
            isUMPConfigured: '../dataintegration-api/syncfusion/isumpconfigured',
            configureUMP:'../dataintegration-api/syncfusion/configureump',
            login:'/dataintegration/login'
        }
    };

    var initializeMessage = function () {
        $('#login-message-container').show();
    };

    var showLogin = function () {
        // reset the forms
        if(location.protocol === "http:"){
            $('#username').val('admin');
            $('#password').val('');
            
        }else{
            $('#username').val('');
            $('#password').val('');
            
        }
        
        // update the form visibility
        $('#login-container').show();
        $('#nifi-registration-container').hide();

        if(location.protocol === "http:"){
            // set the focus
            $('#password').focus();
        }else{
            // set the focus
            $('#username').focus();
        }
    };

  var validateCredentialEntries = function(){
             var isEmptyField=false;
              $("#password-error-validation").css("display","none");
             if($('#username').val().trim() === ""){
                 isEmptyField = true;
                 $("#user-error-validation").css("display","block");
                 $("#password-error-validation").css("display","block");
                 $('#password-error-validation').text("Please enter valid entry.");
             }
             if($('#password').val().trim() === ""){
                 isEmptyField = true;
                 $("#password-error-validation").css("display","block");
                 $('#password-error-validation').text("Please enter valid entry.");
             }
             return isEmptyField;
    };
    var initializeSubmission = function () {
        $('#login-submission-button').on('click', function () {
            $(".loader").css("display","block");
            $("#login-submission-button").addClass("disable-login-button");
            isEmptyField = validateCredentialEntries();
        
             if(isEmptyField===false){
                     if(location.protocol === "https:")
                         login();
                     else
                         validateCredential();
                 }else{
                     $(".loader").css("display","none");
                     $("#login-submission-button").removeClass("disable-login-button");
                 }
             
        });
    };

    var login = function () {
        // remove focus
        $('#username, #password').blur();

        // show the logging message...
        $('#login-progress-label').text('Logging in...');
        $('#login-progress-container').show();

        // login submit
        $.ajax({
            type: 'POST',
            url: config.urls.token,
            data: {
                'username': $('#username').val(),
                'password': $('#password').val()
            }
        }).done(function (jwt) {
            // get the payload and store the token with the appropirate expiration
            var token = nfCommon.getJwtPayload(jwt);
            var expiration = parseInt(token.exp, 10) * nfCommon.MILLIS_PER_SECOND;
            nfStorage.setItem('jwt', jwt, expiration);

            // check to see if they actually have access now
            $.ajax({
                type: 'GET',
                url: config.urls.accessStatus,
                dataType: 'json'
            }).done(function (response) {
                var accessStatus = response.accessStatus;

                // update the logout link appropriately
                showLogoutLink();

                // update according to the access status
                if (accessStatus.status === 'ACTIVE') {
                    // reload as appropriate - no need to schedule token refresh as the page is reloading
                    if (top !== window) {
                        parent.window.location = '/dataintegration';
                    } else {
                        window.location = '/dataintegration';
                    }
                } else {
                    $(".loader").css("display","none");
                    $("#login-submission-button").removeClass("disable-login-button");
                    $('#login-message-title').text('Unable to log in');
                    $('#login-message').text(accessStatus.message);

                    // update visibility
                    $('#login-container').hide();
                    $('#login-submission-container').hide();
                    $('#login-progress-container').hide();
                    $('#login-message-container').show();
                }
            }).fail(function (xhr, status, error) {
                $(".loader").css("display","none");
                $("#login-submission-button").removeClass("disable-login-button");
                $('#login-message-title').text('Unable to log in');
                $('#login-message').text(xhr.responseText);

                // update visibility
                $('#login-container').hide();
                $('#login-submission-container').hide();
                $('#login-progress-container').hide();
                $('#login-message-container').show();
            });
        }).fail(function (xhr, status, error) {
            $(".loader").css("display","none");
            $("#login-submission-button").removeClass("disable-login-button");
            nfDialog.showOkDialog({
                headerText: 'Login',
                dialogContent: nfCommon.escapeHtml(xhr.responseText)
            });

            // update the form visibility
            $('#login-submission-container').show();
            $('#login-progress-container').hide();
        });
    };
    
    var decrypt=function(clientSecret){
        var secretKey=null;
         $.ajax({
            type: 'POST',
            url: config.urls.decrypt,
            async: false,
            data: {
                clientSecret: clientSecret
            }
        }).done(function (clientSecret) {
            secretKey=clientSecret;
        }).fail(function(){
            nf.Dialog.showOkDialog({
                headerText: 'Login',
                dialogContent: nf.Common.escapeHtml("Error occurred while validating credentials.")
            });
        });
        return secretKey;
    };
    
    var getAdminUser=function(baseUrl, clientId, clientSecret){
        var admin=null;
         $.ajax({
            type: 'POST',
            url: config.urls.getumpusers,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8", // this is the default value, so it's optional
            data: {
                baseUrl: baseUrl,
                applicationId: clientId,
                applicationSecret: clientSecret
            },
            async: false,
            dataType: 'json'
        }).done(function (response) {
            admin = response.accessStatus.value;
        }).fail(function(){
            nf.Dialog.showOkDialog({
                headerText: 'Login',
                dialogContent: nf.Common.escapeHtml("Error occurred while validating credentials.")
            });
        });
        return admin;
    };
    
    var isUMPConfigured = function(baseUrl){
        var isConfigured="false";
        $.ajax({
            type:'POST',
            url:config.urls.isUMPConfigured,
            async:false,
            data:{
                baseUrl:baseUrl
            }
        }).done(function(response){            
            isConfigured = response;
        }).fail(function (xhr, status, error) {
            isConfigured = "error";
            nf.Dialog.showOkDialog({
                headerText: 'Login',
                dialogContent: nf.Common.escapeHtml(xhr.responseText)
            });
        });
        return isConfigured;        
    };
	
	var syncfusionLogin = function (code) {
        var isCancelled=false; 
        $.ajax({
            type: 'POST',
            url: config.urls.syncfusionToken,
            async: false,
            data: {
                code: code
            }
        }).done(function (jwt) {
            // get the payload and store the token with the appropirate expiration
            var token = nfCommon.getJwtPayload(jwt);
            var expiration = parseInt(token.exp, 10) * nfCommon.MILLIS_PER_SECOND;
            nfStorage.setItem('jwt', jwt, expiration);

            // check to see if they actually have access now
            $.ajax({
                type: 'GET',
                url: config.urls.accessStatus,
                async: false,
                dataType: 'json'
            }).done(function (response) {
                var accessStatus = response.accessStatus;

                // update the logout link appropriately
                showLogoutLink();

                // update according to the access status
                if (accessStatus.status === 'ACTIVE') {
                    // reload as appropriate - no need to schedule token refresh as the page is reloading
                    if (top !== window) {
                        parent.window.location = '/dataintegration';
                    } else {
                        window.location = '/dataintegration';
                    }
                } else {
                    isCancelled=true;
                    $(".loader").css("display","none");
                    $("#login-submission-button").removeClass("disable-login-button");
                    $('#login-message-title').text('Unable to log in');
                    $('#login-message').text(accessStatus.message);

                    // update visibility
                    $('#login-container').hide();
                    $('#login-submission-container').hide();
                    $('#login-progress-container').hide();
                    $('#login-message-container').show();
                }
            }).fail(function (xhr, status, error) {                
                isCancelled=true;
                $(".loader").css("display","none");
                $("#login-submission-button").removeClass("disable-login-button");
                $('#login-message-title').text('Unable to log in');
                $('#login-message').text(xhr.responseText);

                // update visibility
                $('#login-container').hide();
                $('#login-submission-container').hide();
                $('#login-progress-container').hide();
                $('#login-message-container').show();
            });
        }).fail(function (xhr, status, error) {
            isCancelled=true;
            $(".loader").css("display","none");
            $("#login-submission-button").removeClass("disable-login-button");
            nf.Dialog.showOkDialog({
                headerText: 'Login',
                dialogContent: nf.Common.escapeHtml(xhr.responseText),
				okHandler: function () {
					window.location = '/dataintegration/login';
                }
            });
            
            // update the form visibility
            $('#login-progress-container').hide();            
        });
        if(isCancelled)
        {
            return 'fail';
        } 
    };

    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    
    function getBaseUrl(url){
        var temp = url.split("/");
        return temp[0] + "//" + temp[2];
    }
	
    var showLogoutLink = function () {
        nfCommon.showLogoutLink();
    };
 var validateCredential=function () {
        $("#password-error-validation, #username-error-validation").css("display","none");
        $('#username, #password').blur();

        // show the logging message...
        $('#login-progress-label').text('Logging in...');
        $('#login-progress-container').show();

        $.ajax({
            type: 'POST',
            url: '../dataintegration-api/syncfusion/manage-credential',
            data: {
                username: $("#username").val().trim(),
                password: $("#password").val().trim(),
                operationtype: "login"
            },
            success: function (data) {                
                if (data.indexOf("Success") >= 0) {
                    localStorage.setItem(window.location.hostname + "-status", true);
                    localStorage.setItem(window.location.hostname + "-username", $("#username").val().trim());
                    window.location = '/dataintegration';
                } else {
                    $('#login-progress-container').hide();
                    $("#password-error-validation").css("display","block");
                    $("#password-error-validation").text("Please enter valid username and password.");
                }
                $(".loader").css("display","none");
                $("#login-submission-button").removeClass("disable-login-button");
            }, 
             error: function (xhr, statusText, error) {
                 nf.Dialog.showOkDialog({
                    headerText: "Error",
                    dialogContent: nf.Common.escapeHtml(xhr.responseText)
                });       
            }
        });
    };
    var nfLogin = {
        /**
         * Initializes the login page.
         */
        init: function () {
            $('#login-container').hide();
            var isSyncfusionProviderEnabled = false;
            $(".loader").css("display","block");
           
            $.ajax({
                type: 'GET',
                url: config.urls.syncfusionProviderStatus,
                dataType: 'json',
                async: false
            }).done(function (response) {
                var isCancelled=false;
                var syncfusionStatus = response.accessStatus;
                
                if (syncfusionStatus.status === 'TRUE') {
                    
                    isSyncfusionProviderEnabled = true;
                    var code = getParameterByName('code');
                    if(code !== null && code !== "") {
                        var status = syncfusionLogin(code);
                        if(status==='fail')
                            isCancelled=true;
                    } 
                    
                    if(syncfusionStatus.key === 'startUp' && !isCancelled && (code === null || code === "")) {
                        var startupUrl=syncfusionStatus.value;
                        var returnUrl=getParameterByName('app_url',startupUrl);
                        var baseUrl=getBaseUrl(startupUrl);
                        var isUMSConfigured = isUMPConfigured(baseUrl);
                       
                        if(isUMSConfigured === "true"){
                            var clientId=getParameterByName('client_id');
                            var clientSecret=getParameterByName('client_secret');
                            if(clientId !== null && clientSecret !== null && clientId !== "" && clientSecret !== "")
                            {         
                                clientSecret=decrypt(clientSecret);
                                nf.SecurityCommon.enableUMSUserAccess(baseUrl,clientId,clientSecret);
                                var admin=getAdminUser(baseUrl,clientId,clientSecret);
                                if(admin!==null && admin!=="")
                                {
                                    nf.SecurityCommon.configureUMP(baseUrl,clientId,clientSecret,admin,true);
                                    $(".loader").css("display","none");
                                }
                                else
                                {
                                     nfDialog.showOkDialog({
                                         headerText: "Error",
                                         dialogContent: "Can't able to retrieve admin user information from User Management Server"
                                     });
                                     $(".loader").css("display","none");
                                 }
                            }
                            else{
                                $(".loader").css("display","none");
                                nf.EnableSecurityConfiguration.openEnableSecurityDialog(baseUrl);
                            }
                        } else if(isUMSConfigured === "false") {
                            window.location.href= startupUrl;
                        }
                    }
                    
                    if(syncfusionStatus.key === 'baseUrl' && !isCancelled && (code === null || code === "")) {
                        var baseUrl=getBaseUrl(syncfusionStatus.value);
                        if(isUMPConfigured(baseUrl) !== "error")
                        {
                            $(".loader").css("display","block");
                            window.location = syncfusionStatus.value;
                        }
                    }
                }
            }).fail(function (xhr, status, error) {
                
            });
           
            $(".loader").css("display","none");
            if(!isSyncfusionProviderEnabled) {
				// supporting logging in via enter press
				$('#username, #password').on('keyup', function (e) {
					var code = e.keyCode ? e.keyCode : e.which;
					if (code === $.ui.keyCode.ENTER) {   
							if (!validateCredentialEntries()) {
								$(".loader").css("display", "block");
								$("#login-submission-button").addClass("disable-login-button");
								if (location.protocol === "https:")
									login();
								else
									validateCredential();
							}
						
					}
				});
				if(location.protocol === "https:"){
					nf.Storage.init();
				// access status
				var accessStatus = $.ajax({
					type: 'GET',
					url: config.urls.accessStatus,
					dataType: 'json'
				}).fail(function (xhr, status, error) {
					$('#login-message-title').text('Unable to check Access Status');
					$('#login-message').text(xhr.responseText);
					initializeMessage();
				});

				// access config
				var accessConfigXhr = $.ajax({
					type: 'GET',
					url: config.urls.accessConfig,
					dataType: 'json'
				});

				$.when(accessStatus, accessConfigXhr).done(function (accessStatusResult, accessConfigResult) {
					var accessStatusResponse = accessStatusResult[0];
					var accessStatus = accessStatusResponse.accessStatus;

					var accessConfigResponse = accessConfigResult[0];
					var accessConfig = accessConfigResponse.config;

					// possible login states
					var needsLogin = true;
					var showMessage = false;

					// handle the status appropriately
					if (accessStatus.status === 'UNKNOWN') {
						needsLogin = true;
					} else if (accessStatus.status === 'ACTIVE') {
						showMessage = true;
						needsLogin = false;

						$('#login-message-title').text('Success');
						$('#login-message').text(accessStatus.message);
					}

					// if login is required, verify its supported
					if (accessConfig.supportsLogin === false && needsLogin === true) {
						$('#login-message-title').text('Access Denied');
						$('#login-message').text('This NiFi is not configured to support username/password logins.');
						showMessage = true;
						needsLogin = false;
					}

					// initialize the page as appropriate
					if (showMessage === true) {
						initializeMessage();
					} else if (needsLogin === true) {
						showLogin();
						initializeSubmission();
					}
				});
				} else{
					showLogin();
					initializeSubmission();
                
				}
			}
        }
        
    };

    return nfLogin;
}));