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
<nf-breadcrumbs
        breadcrumbs="appCtrl.serviceProvider.breadcrumbsCtrl.getBreadcrumbs();"
        click-func="appCtrl.nf.CanvasUtils.getComponentByType('ProcessGroup').enterGroup"
        highlight-crumb-id="appCtrl.nf.CanvasUtils.getGroupId();"
        separator-func="appCtrl.nf.Common.isDefinedAndNotNull">
</nf-breadcrumbs>
<div id="graph-controls">
    <div id="navigation-control" class="graph-control">
        <div class="graph-control-docked pointer fa icon-navigate" title="Navigate"
             ng-click="appCtrl.serviceProvider.graphControlsCtrl.undock($event)" style="margin:8px;">
        </div>
        <div class="graph-control-header-container hidden pointer"
             ng-click="appCtrl.serviceProvider.graphControlsCtrl.expand($event)">
            <div class="graph-control-header-icon fa icon-navigate" style="color:#448dd5">
            </div>
            <div class="graph-control-header" style="color:#448dd5;">Navigate</div>
            <div class="graph-control-header-action">
                <div class="graph-control-expansion fa fa-plus-square-o pointer"></div>
            </div>
            <div class="clear"></div>
        </div>
        <div class="graph-control-content hidden">
            <div id="navigation-buttons">
                <div id="naviagte-zoom-in" class="action-button" title="Zoom In"
                     ng-click="appCtrl.serviceProvider.graphControlsCtrl.navigateCtrl.zoomIn();">
                    <button><div class="graph-control-action-icon fa fa-search-plus"style="color:#000"></div></button>
                </div>
                <div class="button-spacer-small">&nbsp;</div>
                <div id="naviagte-zoom-out" class="action-button" title="Zoom Out"
                     ng-click="appCtrl.serviceProvider.graphControlsCtrl.navigateCtrl.zoomOut();">
                    <button><div class="graph-control-action-icon fa fa-search-minus" style="color:#000"></div></button>
                </div>
                <div class="button-spacer-large">&nbsp;</div>
                <div id="naviagte-zoom-fit" class="action-button" title="Fit"
                     ng-click="appCtrl.serviceProvider.graphControlsCtrl.navigateCtrl.zoomFit();">
                    <button><div class="graph-control-action-icon icon-fit"style="color:#000; padding-top: 1.3px;"></div></button>
                </div>
                <div class="button-spacer-small">&nbsp;</div>
                <div id="naviagte-zoom-actual-size" class="action-button" title="Actual"
                     ng-click="appCtrl.serviceProvider.graphControlsCtrl.navigateCtrl.zoomActualSize();">
                    <button><div class="graph-control-action-icon icon-actual"style="color:#000"></div></button>
                </div>
                <div class="clear"></div>
            </div>
            <div id="birdseye"></div>
        </div>
    </div>
    <div id="operation-control" class="graph-control">
        <div class="graph-control-docked pointer fa fa-hand-o-up" title="Operate"
             ng-click="appCtrl.serviceProvider.graphControlsCtrl.undock($event)">
        </div>
        <div class="graph-control-header-container hidden pointer"
             ng-click="appCtrl.serviceProvider.graphControlsCtrl.expand($event)">
            <div class="graph-control-header-icon fa fa-hand-o-up"style="color:#448dd5">
            </div>
            <div class="graph-control-header" style="color:#448dd5;">Operate</div>
            <div class="graph-control-header-action">
                <div class="graph-control-expansion fa fa-plus-square-o pointer"></div>
            </div>
            <div class="clear"></div>
        </div>
        <div class="graph-control-content operate-tab hidden disable-element">
            <div id="operation-context">
                <div id="operation-context-logo">
                    <i class="icon" ng-style="appCtrl.serviceProvider.graphControlsCtrl.getIcon()" ng-class="appCtrl.serviceProvider.graphControlsCtrl.getContextIcon()"></i>
                </div>
                <div id="operation-context-details-container">
                    <div id="operation-context-name">{{appCtrl.serviceProvider.graphControlsCtrl.getContextName()}}</div>
                    <div id="operation-context-type" ng-class="appCtrl.serviceProvider.graphControlsCtrl.hide()">{{appCtrl.serviceProvider.graphControlsCtrl.getContextType()}}</div>
                </div>
                <div class="clear"></div>
                <div id="operation-context-id" ng-class="appCtrl.serviceProvider.graphControlsCtrl.hide()">{{appCtrl.serviceProvider.graphControlsCtrl.getContextId()}}</div>
            </div>
            <div id="operation-buttons">
                <div>
                    <div id="operate-configure" class="action-button" title="Configuration">
                        <button class="action-button-permission permission-changes" ng-click="appCtrl.serviceProvider.graphControlsCtrl.openConfigureOrDetailsView();"
                                ng-disabled="!(appCtrl.serviceProvider.graphControlsCtrl.canConfigureOrOpenDetails())">
                            <div class="graph-control-action-icon fa fa-gear"style="color: #646464 !important;font-size: 17px;"></div></button>
                    </div>
<!--                    <div class="button-spacer-small" ng-if="appCtrl.nf.CanvasUtils.isManagedAuthorizer()">&nbsp;</div>
                    <div id="operate-policy" class="action-button" title="Access Policies" ng-if="appCtrl.nf.CanvasUtils.isManagedAuthorizer()">
                        <button class="action-button-permission permission-changes" ng-click="appCtrl.nf.Actions['managePolicies'](appCtrl.nf.CanvasUtils.getSelection());"
                                ng-disabled="!(appCtrl.nf.CanvasUtils.canManagePolicies())">
                            <div class="graph-control-action-icon fa fa-key"></div></button>
                    </div>-->
                    <div class="button-spacer-small" ng-if="appCtrl.nf.CanvasUtils.isManagedAuthorizer()">&nbsp;</div>
                    <div id="processgroup-policy" class="action-button" title="Access Policies" ng-if="appCtrl.nf.CanvasUtils.isManagedAuthorizer()">
                        <button class="action-button-permission permission-changes" ng-click="appCtrl.nf.Actions['managePermissions'](appCtrl.nf.CanvasUtils.getSelection());"
                                ng-disabled="!(appCtrl.nf.CanvasUtils.canManagePolicies())">
                            <div class="graph-control-action-icon fa fa-lock"></div></button>
                    </div>
                    <div class="button-spacer-large">&nbsp;</div>
                    <div id="operate-enable" class="action-button" title="Enable">
                        <button class="action-button-permission permission-changes" ng-click="appCtrl.nf.Actions['enable'](appCtrl.nf.CanvasUtils.getSelection());"
                                ng-disabled="!appCtrl.nf.CanvasUtils.canEnable(appCtrl.nf.CanvasUtils.getSelection());"style="color: #fcaf15;">
                            <div class="graph-control-action-icon fa fa-flash"></div></button>
                    </div>
                    <div class="button-spacer-small">&nbsp;</div>
                    <div id="operate-disable" class="action-button" title="Disable">
                        <button class="action-button-permission permission-changes" ng-click="appCtrl.nf.Actions['disable'](appCtrl.nf.CanvasUtils.getSelection());"
                                ng-disabled="!appCtrl.nf.CanvasUtils.canDisable(appCtrl.nf.CanvasUtils.getSelection());"style="color: #fcaf15;">
                            <div class="graph-control-action-icon icon icon-enable-false" style="font-size: 15px !important"></div></button>
                    </div>
                    <div class="button-spacer-large">&nbsp;</div>
                    <div id="operate-start" class="action-button" title="Start">
                        <button class="action-button-permission permission-changes" ng-click="appCtrl.nf.Actions['start'](appCtrl.nf.CanvasUtils.getSelection());"
                                ng-disabled="!appCtrl.nf.CanvasUtils.getSelection().empty() && !appCtrl.nf.CanvasUtils.canModify(appCtrl.nf.CanvasUtils.getSelection());"style="color:#49B748">
                            <div class="graph-control-action-icon fa fa-play"></div></button>
                    </div>
                    <div class="button-spacer-small">&nbsp;</div>
                    <div id="operate-stop" class="action-button" title="Stop">
                        <button class="action-button-permission permission-changes" ng-click="appCtrl.nf.Actions['stop'](appCtrl.nf.CanvasUtils.getSelection());"
                                ng-disabled="!appCtrl.nf.CanvasUtils.getSelection().empty() && !appCtrl.nf.CanvasUtils.canModify(appCtrl.nf.CanvasUtils.getSelection());">
                            <div class="graph-control-action-icon fa fa-stop"style="color:#ff6464"></div></button>
                    </div>
<!--                    <div><input type="button" class="action-button-permission permission-changes" id="nifipropertiesSettings"></div>-->
                    <div class="button-spacer-large">&nbsp;</div>
                    <div id="operate-color" class="action-button" title="Fill Color">
                        <button class="action-button-permission permission-changes" ng-click="appCtrl.nf.Actions['fillColor'](appCtrl.nf.CanvasUtils.getSelection());"
                                ng-disabled="!appCtrl.nf.CanvasUtils.isColorable(appCtrl.nf.CanvasUtils.getSelection());">
                            <div class="graph-control-action-icon fa fa-paint-brush"style="color:#677CB7"></div></button>
                    </div>
                    <div class="clear"></div>
                </div>
                <div style="margin-top: 5px;">
                    <div id="operate-copy" class="action-button" title="Copy">
                        <button class="action-button-permission permission-changes" ng-click="appCtrl.nf.Actions['copy'](appCtrl.nf.CanvasUtils.getSelection());"
                                ng-disabled="!appCtrl.nf.CanvasUtils.isCopyable(appCtrl.nf.CanvasUtils.getSelection());">
                            <div class="graph-control-action-icon fa fa-copy"style=" color: #035B8B;"></div></button>
                    </div>
                    <div class="button-spacer-small">&nbsp;</div>
                    <div id="operate-paste" class="action-button" title="Paste">
                        <button class="action-button-permission permission-changes" ng-click="appCtrl.nf.Actions['paste'](appCtrl.nf.CanvasUtils.getSelection());"
                                ng-disabled="!appCtrl.nf.CanvasUtils.isPastable()"style=" color: #035B8B;">
                            <div class="graph-control-action-icon fa fa-paste"></div></button>
                    </div>
                    <div class="button-spacer-small">&nbsp;</div>
                    <div id="operate-publish" class="action-button" title="Publish">
                        <button class="action-button-permission permission-changes" ng-click="appCtrl.nf.Actions['publishTemplate'](appCtrl.nf.CanvasUtils.getSelection());"
                                ng-disabled="appCtrl.nf.CanvasUtils.getSelection().empty() || !appCtrl.nf.CanvasUtils.canPublish(appCtrl.nf.CanvasUtils.getSelection());">
                            <div class="graph-control-action-icon fa fa-publish"style="color:#ff6464"></div></button>
                    </div>
                    <div class="button-spacer-large">&nbsp;</div>
                    <div id="operate-group" class="action-button" title="Create process group">
                        <button class="action-button-permission permission-changes" ng-click="appCtrl.nf.Actions['group'](appCtrl.nf.CanvasUtils.getSelection());"
                                   ng-disabled="!(appCtrl.nf.CanvasUtils.getComponentByType('Connection').isDisconnected(appCtrl.nf.CanvasUtils.getSelection()) &amp;&amp; appCtrl.nf.CanvasUtils.canModify(appCtrl.nf.CanvasUtils.getSelection()));">
                            <div class="graph-control-action-icon Operate_Grouping"style="margin-top:-1px;"></div></button>
                    </div>
                    <div class="button-spacer-large">&nbsp;</div>
                    <div id="operate-template" class="action-button" title="Create Template">
                        <button class="action-button-permission permission-changes" ng-click="appCtrl.nf.Actions['template'](true, true);" 
                                ng-disabled="!(appCtrl.nf.CanvasUtils.canWrite() && (appCtrl.nf.CanvasUtils.getSelection().empty() || appCtrl.nf.CanvasUtils.canRead(appCtrl.nf.CanvasUtils.getSelection())));">
                            <div class="graph-control-action-icon icon icon-template-save" style="margin-left: -1px;margin-top: -3px;"></div></button>
                    </div>
                    <div class="button-spacer-large">&nbsp;</div>
                    <div id="operate-delete" class="action-button" title="Delete">
                        <button class="action-button-permission permission-changes" ng-click="appCtrl.nf.Actions['delete'](appCtrl.nf.CanvasUtils.getSelection());"
                                ng-disabled="!appCtrl.nf.CanvasUtils.areDeletable(appCtrl.nf.CanvasUtils.getSelection());"style="color: #BA554A;">
                            <div class="graph-control-action-icon fa fa-trash"></div><span>Delete</span></button>
                    </div>
                    <div class="clear"></div>
                </div>
            </div>
        </div>
    </div>
</div>
<script>
var changesOccured = false;
$("#nifipropertiesSettings").click(function() {
    canvasSelection = nf.CanvasUtils.getSelection();
    this.modal = {
        /**
         * Gets the modal element.
         *
         * @returns {*|jQuery|HTMLElement}
         */
        getElement: function() {
            return $('#nifi-properties-change-dialog');
        },
        /**
         * Initialize the modal.
         */
        init: function() {

        },
        /**
         * Updates the modal config.
         *
         * @param {string} name             The name of the property to update.
         * @param {object|array} config     The config for the `name`.
         */
        update: function(name, config) {
            this.getElement().modal(name, config);
        },
        /**
         * Show the modal.
         */
        show: function() {
            this.getElement().modal('show');
        },
        /**
         * Hide the modal.
         */
        hide: function() {
            this.getElement().modal('hide');
        }
    };

    this.modal.update('setButtonModel', [{

        buttonText: 'Save',
        color: {
            base: '#728E9B',
            hover: '#004849',
            text: '#ffffff'
        },
        handler: {
            click: function() {
                var isEmpty = false;
                if (!isEmpty && changesOccured) {
                    changeNifiPropertiesFile();
                } else {
                    $(".nifiProperties-error-status").text("No changes has been done.");
                }
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
            click: function() {
                // hide the dialog
                isNewTemplate = false;
                $('#nifi-properties-change-dialog').modal('hide');
            }
        }
    }]);
    getNifiPropertiesFile();
    $('#nifi-properties-change-dialog').addClass('dialog cancellable modal');
    this.modal.show();
});
$('#auto-refresh,#port-number-value,#host-name,#registry').keyup(function() {
    changesOccured = true;
});

function getNifiPropertiesFile() {
    $.ajax({
        type: 'GET',
        url: '../dataintegration-api/syncfusion/nifipropertiesfile',

        async: false,
        success: function(response) {
            if (!response.indexOf("Failed") >= 0) {
                var propertyValue = JSON.parse(response);
                var serverName = propertyValue[1].split('=');
                var portNumber = propertyValue[2].split("=");
                var autoRefresh = propertyValue[0].split("=");
                var registry = propertyValue[3].split("=");

                $('#nifi-properties-change-dialog').modal('hide');
                $("#port-number-value").val(portNumber[1]);
                $("#host-name").val(serverName[1]);
                $("#auto-refresh").val(autoRefresh[1]);
                $("#registry").val(registry[1]);
            } else {
                $(".nifiProperties-error-status").text("Unable to read the file");
            }
        },
        error: function(response) {
            $(".nifiProperties-error-status").text(response.responseText);
        }
    });
}

function changeNifiPropertiesFile() {
    hostNameProperty = $("#host-name").val();
    portNumberProperty = $("#port-number-value").val();
    autoRefreshProperty = $("#auto-refresh").val();
    registryProperty = $("#registry").val();

    if (isValid) {
        $.ajax({
            type: 'GET',
            url: '../dataintegration-api/syncfusion/nifipropertiesfile-change',
            data: {
                hostName: hostNameProperty,
                portNumber: portNumberProperty,
                autoRefresh: autoRefreshProperty,
                registry: registryProperty
            },
            async: false,
            //beforeSend: function(xhr) {
            // xhr.setRequestHeader('Authorization', 'Bearer '  accessToken);
            // },
            dataType: 'json',
            success: function(response) {
                if (response === 200) {
                    $('#nifi-properties-change-dialog').modal('hide');

                } else {
                    $(".nifiProperties-error-status").text("Unable to save the modified properties in the file");
                }
            },
            error: function(response) {
                $(".nifiProperties-error-status").text(response.responseText);
            }
        });
    }
}
</script>