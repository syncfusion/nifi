/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global nf */

nf.SecurityCommon = (function () {
    
    var config = {
        urls: {
            currentUser: '../dataintegration-api/flow/current-user',
            configureUMP:'../dataintegration-api/syncfusion/configureump',
            syncfusionProviderStatus: '../dataintegration-api/syncfusion/status',
            enableUMSAccess: '../dataintegration-api/syncfusion/enable-ums-user-access',
            getUMSApplications: '../dataintegration-api/syncfusion/get-ums-apps'
        }
    };
    return {
        
        getIndexOfItem: function (itemName, itemList) {
            var userIndex;
            $.each(itemList, function (index, user) {
                if (user.component.identity === itemName)
                    userIndex = index;
            });
            return userIndex;
        },
        loadCurrentUser: function () {
            return $.ajax({
                type: 'GET',
                url: config.urls.currentUser,
                dataType: 'json'
            }).done(function (currentUser) {
                nf.Common.setCurrentUser(currentUser);
            }).fail(nf.ErrorHandler.handleAjaxError);
        },
        isUMP:function(){
            var isUMPEnabled=false;
            $.ajax({
                type: 'GET',
                url: config.urls.syncfusionProviderStatus,
                dataType: 'json',
                async: false
            }).done(function (response) {
                var syncfusionStatus = response.accessStatus;                
                if (syncfusionStatus.status === 'TRUE') {
                    isUMPEnabled=true;
                }else{
                    isUMPEnabled=false;
                }
            }).fail(function(error){
               
            });
            return isUMPEnabled;
        },
        isDIPSecured: function(){
            if(window.location.protocol === "https:")
                return true;
            else
                return false;
        },
        configureUMP: function (baseUrl, clientId, clientSecret, admin, isSecured) {
            $.ajax({
                type: 'POST',
                url: config.urls.configureUMP,
                data: {
                    hostname: window.location.hostname,
                    baseUrl: baseUrl,
                    clientId: clientId,
                    clientSecret: clientSecret,
                    admin: admin,
                    isSecured: isSecured
                },
                async: false
            }).done(function (response) {
                if (response === "Success") {
                    if(isSecured){
                        window.location='/dataintegration';
                    }
                }else{
                    nf.Dialog.showOkDialog({
                        headerText: 'Login',
                        dialogContent: "User Management Server configuration is failed. Please check logs or contact Syncfusion support."
                    });
                }                    
            }).fail(function (error) {
                nf.Dialog.showOkDialog({
                    headerText: 'Login',
                    dialogContent: "User Management Server configuration is failed. Please check logs or contact Syncfusion support."
                });
            });
        },
        enableUMSUserAccess: function (baseUrl, clientId, clientSecret){
            $.ajax({
                type: 'POST',
                url: config.urls.enableUMSAccess,
                data: {
                    baseUrl: baseUrl,
                    clientId: clientId,
                    clientSecret: clientSecret
                },
                async: false
            }).done(function (response) {
            }).fail(function (error) {
              
            });
        },
        getUMSApplicationDetails: function(){
            var details=[];
            nf.SecurityCommon.loadCurrentUser();
            $.ajax({
                type: 'POST',
                url: config.urls.getUMSApplications,
                data: {
                    username: nf.Common.currentUser.identity
                },
                async: false
            }).done(function (response) {
                if(nf.Common.isDefinedAndNotNull(response))
                    details = response;
            }).fail(function (error) {
             
            });
            return details;
        }
    };
}());
