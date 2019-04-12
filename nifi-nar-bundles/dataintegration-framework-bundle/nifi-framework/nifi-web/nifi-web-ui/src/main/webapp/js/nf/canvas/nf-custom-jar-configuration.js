/* global nf*/
var databasetype;
nf.CustomJarConfiguration = (function () {
    var customJarUploadDialog = function () {
         $('#custom-jar-configuration').modal({
             headerText: 'Upload',
              buttons: [{
                    buttonText: 'UPLOAD',
                    color: {
                        base: '#728E9B',
                        hover: '#004849',
                        text: '#ffffff'
                    },
              handler: {
                        click: function () {
                            $('#custom-jar-configuration').find("#loader-icon").css("display", "block");
                            jarUpload(databasetype);
                            $('#custom-jar-configuration').find("#loader-icon").css("display", "none");
                        }
                    }
                }, {
                    buttonText: 'Cancel',
                    color: {
                        base: '#E3E8EB',
                        hover: '#C7D2D7',
                        text: '#004849'
                    },
                    handler: {
                     click: function () {
                          $('#custom-jar-configuration').modal('hide');
                        }
                    }
                }]
        });
    };
    
    var jarUpload = function (databasetype) {
        var jarSelected = $("#jar-filetext-name").val();
        var jarFileName = jarSelected.replace(/.*[\/\\]/, '');
        var exportJar = $('#jar-upload-form').ajaxForm({
            url: '../dataintegration-api/syncfusion/',
            dataType: "text",
            beforeSubmit: function (formData, $form, options) {
                // ensure uploading to the current process group
                options.url += (encodeURIComponent(jarFileName) + '/uploadJar');
            },
            success: function (response, statusText, xhr, form) {
                // see if the import was successful and inform the user
                var contentMessage = "";
                if (response === 'Success') {
                    if (databasetype === "MySQL" || databasetype === "Oracle" || databasetype === "SQLServer") {
                        updateSQLPropertyFile();
                        contentMessage = jarFileName + " has been uploaded successfully.";
                        $('#custom-jar-configuration').modal('hide');
                    } else {
                        updateDBCPTextField();
                        contentMessage = jarFileName + " has been uploaded successfully.";
                        $('#custom-jar-configuration').modal('hide');
                    }
                    nf.Dialog.showOkDialog({
                        headerText: 'Success',
                        dialogContent: contentMessage
                    });
                } else {
                    // import failed
                    if (response.startsWith("fail:")) {
                        // if a more specific error was given, use it
                        nf.Dialog.showOkDialog({
                            headerText: 'Unable to Upload',
                            dialogContent: response.replace("fail:","")
                        });
                        $('#custom-jar-configuration').modal('hide');
                    }
                }
            }
        });
        if (nf.Common.isBlank(jarSelected)) {
            $("#uploadErrorMessage").css("display","block");
        } else {
            $("#uploadErrorMessage").css("display","none");
            exportJar.submit();
        }
    };
    
    var updateSQLPropertyFile = function () {
        var jarSelected = $("#jar-filetext-name").val();
        var jarFileName = jarSelected.replace(/.*[\/\\]/, '');
        $.ajax({
            type: 'POST',
            url: '../dataintegration-api/syncfusion/updateJarProperties',
            dataType: 'text',
            data: {
                dbType: databasetype,
                jarName: jarFileName,
                type: "pre-defined"
            },
            async: false
        }).done(function (response) {
            updateTextField(databasetype, jarFileName);
        }).fail(nf.ErrorHandler.handleAjaxError);
    };

    var updateDBCPTextField = function () {
        var selectedDbcpJar = $("#jar-filetext-name").val();
        var dbcpjarName = selectedDbcpJar.replace(/.*[\/\\]/, '');
        var dbcpControlServiceURI = nf.ControllerService.controllerServiceUrl;
        var controlServiceID = dbcpControlServiceURI.split("/")[5];
        
        updateControllerService("DBCP", controlServiceID, dbcpjarName);
    };
    
    var updateTextField =function(databasetype, jarFileName){
        var controlServiceURI = nf.ControllerService.controllerServiceUrl;
        var  controlServiceID = controlServiceURI.split("/")[5];
        
        updateControllerService(databasetype, controlServiceID, jarFileName);
    };
    
    var updateControllerService = function (ControllerServiceType, controlServiceID, jarName) {
        var propertyValue = "";
        
        if(ControllerServiceType === "DBCP")
            propertyValue = "DBCP-database-driver-locations";
        else if(ControllerServiceType === "MySQL")
            propertyValue = "MySQL-database-driver-locations";
        else if(ControllerServiceType === "Oracle")
            propertyValue = "Oracle-database-driver-locations";
        else if(ControllerServiceType === "SQLServer")
            propertyValue = "MicrosoftSQL-database-driver-locations";
        else
            propertyValue = "PostgreSQL-database-driver-locations";
            
        $.ajax({
            type: 'GET',
            url: '../dataintegration-api/controller-services/' + controlServiceID,
            dataType: 'json',
            async: false
        }).done(function (response) {
            var processorEntity = {
                "revision": {
                    "version": response.revision.version
                },
                "id": response.id,
                "component": {"id": response.id,
                    "properties": {
                        
                    }
                }
            };
            
            processorEntity.component.properties[propertyValue] = "SQL_jars\\" + jarName;
            
            updateControllerServiceEntity(response.id, processorEntity);
        }).fail(nf.ErrorHandler.handleAjaxError);
    };
    
    var updateControllerServiceEntity = function (controlServiceID, processorEntity) {
        $.ajax({
            type: 'PUT',
            async: false,
            url: '../dataintegration-api/controller-services/' + controlServiceID,
            data: JSON.stringify(processorEntity),
            dataType: 'json',
            contentType: 'application/json'
        }).done(function (response) {
            refreshGrid(controlServiceID);
        });
    };
    
    var refreshGrid =  function(controlServiceID){
        $.ajax({
            type: 'GET',
            url: '../dataintegration-api/controller-services/'+ controlServiceID ,
            dataType: 'json',
            async: false
        }).done(function (response) {
            var responseResult = response;
            var descriptorValue= responseResult.component["descriptors"];
            var PropertiesValue= responseResult.component["properties"];
            var loadHistory = $.ajax({
                type: 'GET',
                url: '../dataintegration-api/flow/history/components/' + controlServiceID,
                dataType: 'json',
                async: false
            }).done(function (response) {
                var controllerServiceHistory = response.componentHistory;
                var propertyHistory = controllerServiceHistory["propertyHistory"];
                $('#controller-service-properties')                    
                        .propertytable('loadProperties', PropertiesValue, descriptorValue, propertyHistory);
            }).fail(nf.ErrorHandler.handleAjaxError);
        }).fail(nf.ErrorHandler.handleAjaxError);
    };


    return{

        init: function () {
            customJarUploadDialog();
        },
        jaruploadpopup:function(data){
            if((data).hasClass("SQL")){
                $("#custom-jar-configuration").removeClass("small-modal");
                $("#jar-filetext-name").val("");
                databasetype = "MySQL";
                $("#uploadErrorMessage").css("display","none");
                $("#sqljar-jarinformation").css("display","block");
                $("#Ms-SQLJar-info-content").css("display", "none");
                $("#Oracle-jar-info-content").css("display", "none");
                $("#MySQLJar-info-content").css("display", "block");
                $('#custom-jar-configuration').modal('show');  
            } else if((data).hasClass("Oracle")){
                $("#custom-jar-configuration").removeClass("small-modal");
                $("#jar-filetext-name").val("");
                databasetype = "Oracle";
                $("#uploadErrorMessage").css("display","none");
                $("#Ms-SQLJar-info-content").css("display", "none");
                $("#MySQLJar-info-content").css("display", "none");
                $("#Oracle-jar-info-content").css("display", "block");
                $('#custom-jar-configuration').modal('show');  
            }else if((data).hasClass("MSSQL")){
                $("#custom-jar-configuration").removeClass("small-modal");
                $("#jar-filetext-name").val("");
                databasetype = "SQLServer";
                $("#uploadErrorMessage").css("display","none");
                $("#MySQLJar-info-content").css("display", "none");
                $("#Oracle-jar-info-content").css("display", "none");
                $("#Ms-SQLJar-info-content").css("display", "block");
                $('#custom-jar-configuration').modal('show');  
            }else if((data).hasClass("DBCP")){
                $("#custom-jar-configuration").addClass("small-modal");
                $("#jar-filetext-name").val("");
                databasetype = "DBCP";
                $("#uploadErrorMessage").css("display","none");
                $("#MySQLJar-info-content").css("display", "none");
                $("#Oracle-jar-info-content").css("display", "none");
                $("#Ms-SQLJar-info-content").css("display", "none");
                $('#custom-jar-configuration').modal('show');  
            }
        }
    };
}());