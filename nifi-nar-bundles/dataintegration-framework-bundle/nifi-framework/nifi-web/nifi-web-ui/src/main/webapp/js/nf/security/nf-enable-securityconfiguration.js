/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global nf, d3, Slick */
nf.EnableSecurityConfiguration = (function () {
    var config = {
        urls: {
            getumpusers: '../dataintegration-api/syncfusion/getumpusers',
            configureUMP: '../dataintegration-api/syncfusion/configureump',
            getnifidetails: '../dataintegration-api/syncfusion/getnifidetails'
        }
    };

    var openEnableSecurityConfigDialog = function (baseUrl) {
        if(baseUrl !== null && baseUrl !=""){
            $("#umpaddress").val(baseUrl);
            document.getElementById('umpaddress').readOnly = true;
        }
        else{
            $("#umpaddress").val("");
            document.getElementById('umpaddress').readOnly = false;
        }
        $.ajax({
            type: 'POST',
            url: config.urls.getnifidetails,
            data: {
                hostname: window.location.hostname
            },
            async: false
        }).done(function (response) {
            var jsonData = $.parseJSON(response);
            $("#register-link").text("");
            $("#register-link").text("https://" + jsonData.applicationHostName + ":" + jsonData.applicationPortNo);
        }).fail(function (error) {
            nf.Dialog.showOkDialog({
                headerText: 'Security',
                dialogContent: nf.Common.escapeHtml("Error occurred while accessing nifi details.")
            });
        });
        $("#idtext").empty();
        registerPnlOpen();
        $("#enable-securityconfiguration-dialog").ejDialog("open");
    };

    var applicationRegPnlOpen = function () {
        $("#application-errormessage").css("display", "none");
        var previousBtnDisable = $("#Backbtn").data("ejButton");
        previousBtnDisable.enable();
        $("#register-pnl").css("display", "none");
        $("#enablingsecurity-pnl").css("display", "none");
        $("#getadminuserdetails-pnl").css("display", "none");
        $("#getapplicationdetails").css("display", "block");
        $("#idtext").text("2");
    };

    var adminPnlOpen = function () {
        $("#application-errormessage").css("display", "none");
        $("#adminpanel-errormessage").css("display", "none");
        var previousBtnDisable = $("#Backbtn").data("ejButton");
        previousBtnDisable.enable();
        $("#register-pnl").css("display", "none");
        $("#enablingsecurity-pnl").css("display", "none");
        $("#getapplicationdetails").css("display", "none");
        $("#getadminuserdetails-pnl").css("display", "block");
        $("#idtext").text("3");
    };

    var initOpenSecurityDlgClick = function () {
        $('#enablesecurity-link').on('click', function () {
            openEnableSecurityConfigDialog("");
        });
    };


    var securityPnlOpen = function () {
        $.ajax({
            type: 'POST',
            url: config.urls.getnifidetails,
            data: {
                hostname: window.location.hostname
            },
            async: false
        }).done(function (response) {
            var jsonData = $.parseJSON(response);
            $("#secureregister-link").text("");
            $("#secureregister-link").text("https://" + jsonData.applicationHostName + ":" + jsonData.applicationPortNo);
        }).fail(function (error) {
            nf.Dialog.showOkDialog({
                headerText: 'Security',
                dialogContent: nf.Common.escapeHtml("Error occurred while getting data intgration details.")
            });
        });
        var previousBtnDisable = $("#Backbtn").data("ejButton");
        previousBtnDisable.disable();
        $("#Nextbtn").hide();
        $("#Closebtn").show();
        $("#register-pnl").css("display", "none");
        $("#getapplicationdetails").css("display", "none");
        $("#getadminuserdetails-pnl").css("display", "none");
        $("#enablingsecurity-pnl").css("display", "block");
        $("#idtext").text("4");
        //$("#secureregister-link").replaceWith('<a href="nifi-link">'+ securewizardResult+'</a>');
    };

    var registerPnlOpen = function () {
        var previousBtnDisable = $("#Backbtn").data("ejButton");
        previousBtnDisable.disable();
        $("#Nextbtn").show();
        $("#Closebtn").hide();
        $("#register-pnl").css("display", "block");
        $("#enablingsecurity-pnl").css("display", "none");
        $("#getapplicationdetails").css("display", "none");
        $("#getadminuserdetails-pnl").css("display", "none");
        $("#idtext").text("1");

    };

    var initUserDropDown = function (datasource) {
        $('#selectuser').ejDropDownList({
            dataSource: datasource,
            watermarkText: "Select a user",
            width: "100%",
            fields: {text: "text", value: "value"}
        });
    };

    return {
        init: function () {
            nf.EnableSecurityConfiguration.initUMSConfigurationDialog();
            initOpenSecurityDlgClick();
            nf.EnableSecurityConfiguration.closeUMPDlg();
        },

        initUMSConfigurationDialog: function () {
            $("#enable-securityconfiguration-dialog").ejDialog({
                showOnInit: false,
                enableModal: true,
                width: 740,
                height: 480,
                showFooter: true,
                footerTemplateId: "sample",
                enableResize: false
            });
            
            $("#enable-securityconfiguration-dialog").ejDialog({allowDraggable: false});

            $("#Backbtn").ejButton({
                size: "medium",
                click: function () {
                    nf.EnableSecurityConfiguration.previousPnl();
                }
            });

            $("#Nextbtn").ejButton({
                size: "medium",
                click: function () {
                    nf.EnableSecurityConfiguration.nextPnl();
                }
            });

            $("#Closebtn").ejButton({
                size: "medium",
                click: function () {
                    nf.EnableSecurityConfiguration.closeDlg();
                }
            });
        },

        openEnableSecurityDialog: function (baseUrl) {
            openEnableSecurityConfigDialog(baseUrl);
        },

        nextPnl: function () {
            if ($("#idtext").text() === "1") {
                applicationRegPnlOpen();
            } else if ($("#idtext").text() === "2") {
                if ($('#umpaddress').val() === '' || $('#umpaddress').val() === null) {
                    $("#umpaddress").addClass('error-alert');
                } else {
                    $("#umpaddress").removeClass('error-alert');
                }
                if ($('#applicationid').val() === '' || $('#applicationid').val() === null) {
                    $("#applicationid").addClass('error-alert');
                } else {
                    $("#applicationid").removeClass('error-alert');
                }
                if ($('#applicationsecret').val() === '' || $('#applicationsecret').val() === null) {
                    $("#applicationsecret").addClass('error-alert');
                } else {
                    $("#applicationsecret").removeClass('error-alert');
                }
                if ($("#umpaddress").hasClass("error-alert") || $("#applicationid").hasClass("error-alert") || $("#applicationsecret").hasClass("error-alert")) {
                    applicationRegPnlOpen();
                } else {
                    nf.SecurityCommon.enableUMSUserAccess($('#umpaddress').val(),$('#applicationid').val(),$('#applicationsecret').val());
                    $("#enable-securityconfiguration-dialog").find("#loader-icon").css("display","block");
                    setTimeout(function(){
                    $.ajax({
                        type: 'POST',
                        url: config.urls.getumpusers,
                        contentType: "application/x-www-form-urlencoded; charset=UTF-8", // this is the default value, so it's optional
                        data: {
                            baseUrl: $('#umpaddress').val(),
                            applicationId: $('#applicationid').val(),
                            applicationSecret: $('#applicationsecret').val()
                        },
                        async: false,
                        dataType: 'json'
                    }).done(function (response) {                         
                        var responseData = response.accessStatus.value;
                        var userList = responseData.split(',');
                        initUserDropDown([]);
                        var jsonArray = [];
                        for (var i = 0; i < userList.length; i++) {
                            var jsonObject = new Object();
                            jsonObject.text = userList[i];
                            jsonObject.value = userList[i];
                            jsonArray.push(jsonObject);
                        }
                        initUserDropDown(jsonArray);
                        $("#enable-securityconfiguration-dialog").find("#loader-icon").css("display","none");
                        adminPnlOpen();
                    }).fail(function () {
                        applicationRegPnlOpen();
                        $("#application-errormessage").css("display", "block");
                        $('#selectuser').empty();
                        $("#enable-securityconfiguration-dialog").find("#loader-icon").css("display","none");
                    });
                    },1000);
                }
            } else if ($("#idtext").text() === "3") {
                if ($('#selectuser').val() === '' || $('#selectuser').val() === null) {
                    adminPnlOpen();
                    $("#adminpanel-errormessage").css("display", "block");
                } else {
                    $("#adminpanel-errormessage").css("display", "none");
                    if (nf.SecurityCommon.isDIPSecured()) {
                        var baseUrl = $('#umpaddress').val();
                        var clientId = $('#applicationid').val();
                        var clientSecret = $('#applicationsecret').val();
                        var admin = $('#selectuser').val();
                        $("#enable-securityconfiguration-dialog").ejDialog("close");
                        nf.SecurityCommon.configureUMP(baseUrl, clientId, clientSecret, admin, true);
                    } else {
                        $("#enable-securityconfiguration-dialog").find("#loader-icon").css("display","block");
                        setTimeout(function(){
                        securityPnlOpen();
                        $.ajax({
                            type: 'POST',
                            url: config.urls.configureUMP,
                            data: {
                                hostname: window.location.hostname,
                                baseUrl: $('#umpaddress').val(),
                                clientId: $('#applicationid').val(),
                                clientSecret: $('#applicationsecret').val(),
                                admin: $('#selectuser').val(),
                                isSecured: false
                            },
                            async: false,
                            dataType: 'json'
                        }).done(function (response) {
                            $("#enable-securityconfiguration-dialog").find("#loader-icon").css("display","none");
                        }).fail(function (error) {
                            $("#enable-securityconfiguration-dialog").find("#loader-icon").css("display","none");
                        });
                        },1000);
                    }
                }
            } else {
                registerPnlOpen();
            }
        },

        previousPnl: function () {
            if ($("#idtext").text() === "2") {
                registerPnlOpen();
            } else if ($("#idtext").text() === "3") {
                applicationRegPnlOpen();
            }
        },
        closeDlg: function () {
            var secureNavigationLink = $("#secureregister-link").text();
            window.open(secureNavigationLink, '_blank');
        },
        urlCopyLink: function () {
            jQuery.fn.selectText = function () {
                this.find('input').each(function () {
                    if ($(this).prev().length === 0 || !$(this).prev().hasClass('p_copy')) {
                        $('<p class="p_copy" style="position: absolute; z-index: -1;"></p>').insertBefore($(this));
                    }
                    $(this).prev().html($(this).val());
                });
                var doc = document;
                var element = this[0];
                console.log(this, element);
                if (doc.body.createTextRange) {
                    var range = document.body.createTextRange();
                    range.moveToElementText(element);
                    range.select();
                } else if (window.getSelection) {
                    var selection = window.getSelection();
                    var range = document.createRange();
                    range.selectNodeContents(element);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            };
            $("#register-link").selectText();
            document.execCommand("copy");
            var copyLinkSnackbar = document.getElementById("snackbar");
            copyLinkSnackbar.className = "show";
            setTimeout(function(){ copyLinkSnackbar.className = copyLinkSnackbar.className.replace("show", ""); }, 3000);
        },
        UmsEnabledlCopyLink: function () {
            jQuery.fn.selectText = function () {
                this.find('input').each(function () {
                    if ($(this).prev().length === 0 || !$(this).prev().hasClass('p_copy')) {
                        $('<p class="p_copy" style="position: absolute; z-index: -1;"></p>').insertBefore($(this));
                    }
                    $(this).prev().html($(this).val());
                });
                var doc = document;
                var element = this[0];
                console.log(this, element);
                if (doc.body.createTextRange) {
                    var secureUrlRange = document.body.createTextRange();
                    secureUrlRange.moveToElementText(element);
                    secureUrlRange.select();
                } else if (window.getSelection) {
                    var selection = window.getSelection();
                    var secureUrlRange = document.createRange();
                    secureUrlRange.selectNodeContents(element);
                    selection.removeAllRanges();
                    selection.addRange(secureUrlRange);
                }
            };
            $("#secureregister-link").selectText();
            document.execCommand("copy");
            var secCopyLinkSnackbar = document.getElementById("secureSnackbar");
            secCopyLinkSnackbar.className = "show";
            setTimeout(function(){ secCopyLinkSnackbar.className = secCopyLinkSnackbar.className.replace("show", ""); }, 3000);
        },
        documentNavigate: function () {
            var documentNavgationLink = "https://help.syncfusion.com/data-integration/getting-started#enable-security-for-data-integration-platform-with-user-management-server-from-normal-mode";
            window.open(documentNavgationLink, '_blank');
        },
        closeUMPDlg: function () {
            $("#enable-securityconfiguration-dialog").ejDialog("close");
        }
    };

}());
