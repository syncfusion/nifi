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
<div class="dataintegration-container" id="header">
   <%-- Changed the default nifi logo --%>
<div class="main-header-container">
    <div id="group-context-menu" class="custom-group-menu">
    <ul>
        <li class="process-group-menu-item edit-menu"><a>Edit</a></li>
        <li class="process-group-menu-item remove-menu"><a>Remove</a></li>
    <li class="context-menu-item-separator"></li>  
    <li class="process-group-menu-item"><a>New Group</a></li>
    </ul>
    </div>
<div id="processor-sub-context-menu" class="custom-menu">
</div>
<div id="processor-context-menu" class="custom-menu move-menu processor-menu-item">
 <div id="move-menu">
     <div id="move-to-menu">Move to</div>
     <div class="fa fa-caret-right context-menu-group-item-img"></div>
 </div>
 <div id="copy-menu">
     <div id="copy-to-menu">Copy to</div>
     <div class="fa fa-caret-right context-menu-group-item-img"></div>
 </div>
     <div id="remove-menu">
     <div id="remove-processor-menu">Remove</div>
</div>
</div>
<div id="headercontent">
    <div id="ums-logo" class="applicationLogo" style="float: left" ng-if="appCtrl.nf.Common.isUMS()">
        <div class="applicationLogo icon-ums-logo"></div>
    </div>
    <div style="float: left" ng-if="!appCtrl.nf.Common.isUMS()">
        <img id="nifi-logo" src="images/logo_white.png" style="float: left;">
    </div>
    <div id="headertitle" title="Syncfusion Data Integration Platform">Syncfusion Data Integration Platform</div>
</div>
<div class="header-menu">
    <md-menu md-position-mode="target-right target" md-offset="-1 44" style="margin-top: -13px ! important;float: right;" class="md-menu">
  <button md-menu-origin="" id="global-menu-button" ng-click="$mdOpenMenu()" style="background-color: #263238;border: none;" type="button" aria-haspopup="true" aria-expanded="false" aria-owns="menu_container_0">
 <div class="fa fa-navicon" style="color:#fff;"></div>
  </button>                               
        <md-menu-content id="global-menu-content">
                    <md-menu-item layout-align="space-around center">
                        <a id="counters-link"
                           ng-click="appCtrl.serviceProvider.headerCtrl.globalMenuCtrl.counters.shell.launch();"
                           ng-class="{disabled: !appCtrl.nf.Common.canAccessCounters()}">
                            <i class="icon icon-counter"></i>Counters
                        </a>
                    </md-menu-item>
                    <md-menu-item ng-if="appCtrl.serviceProvider.headerCtrl.globalMenuCtrl.cluster.visible();"
                                  layout-align="space-around center">
                        <a id="cluster-link"
                           ng-click="appCtrl.serviceProvider.headerCtrl.globalMenuCtrl.cluster.shell.launch();"
                           ng-class="{disabled: !appCtrl.nf.Common.canAccessController()}">
                            <i class="fa fa-cubes"></i>Cluster
                        </a>
                    </md-menu-item>
                    <md-menu-item layout-align="space-around center">
                        <a id="history-link"
                           ng-click="appCtrl.serviceProvider.headerCtrl.globalMenuCtrl.flowConfigHistory.shell.launch();">
                            <i class="fa fa-history"></i>Flow Configuration History
                        </a>
                    </md-menu-item>
                    <md-menu-item layout-align="space-around center">
                        <a id="registry-link" layout="row" ng-class="{disabled: !appCtrl.nf.Common.canAccessConfigurations()}">
                            <i class="fa registry-icon"></i>Configurations
                        </a>
                    </md-menu-item>
                    <md-menu-divider ng-if="appCtrl.nf.CanvasUtils.isManagedAuthorizer()"></md-menu-divider>
<!--                    <md-menu-item layout-align="space-around center" ng-if="appCtrl.nf.CanvasUtils.isManagedAuthorizer()">
                        <a id="users-link" layout="row"
                           ng-click="appCtrl.serviceProvider.headerCtrl.globalMenuCtrl.users.shell.launch();"
                           ng-class="{disabled: !(appCtrl.nf.Common.canAccessTenants())}">
                            <i class="fa fa-users"></i>Users
                        </a>
                    </md-menu-item>
                    <md-menu-item layout-align="space-around center" ng-if="appCtrl.nf.CanvasUtils.isManagedAuthorizer()">
                        <a id="policies-link" layout="row"
                           ng-click="appCtrl.serviceProvider.headerCtrl.globalMenuCtrl.policies.shell.launch();"
                           ng-class="{disabled: !(appCtrl.nf.Common.canAccessTenants() && appCtrl.nf.Common.canModifyPolicies())}">
                            <i class="fa fa-key"></i>Policies
                        </a>
                    </md-menu-item>-->
                   <md-menu-divider  ng-if="appCtrl.nf.CanvasUtils.isManagedAuthorizer()===false"></md-menu-divider>
                    <md-menu-item layout-align="space-around center" ng-if="appCtrl.nf.CanvasUtils.isManagedAuthorizer()===false">
                        <a id="enablesecurity-link" layout="row">
                            <i class="fa fa-lock"></i>Enable Security
                        </a>
                    </md-menu-item>
                    <md-menu-item layout-align="space-around center" ng-if="appCtrl.nf.CanvasUtils.isManagedAuthorizer()">
                        <a id="security-link" layout="row"
                           ng-click="appCtrl.serviceProvider.headerCtrl.globalMenuCtrl.security.shell.launch();"
                           ng-class="{disabled: !(appCtrl.nf.Common.canAccessTenants())}">
                            <i class="fa fa-lock"></i>Security
                        </a>
                    </md-menu-item>
                    <md-menu-divider></md-menu-divider>
                    <md-menu-item layout-align="space-around center">
                        <a id="help-link">
                            <i class="fa fa-question-circle"></i>Help
                        </a>
                    </md-menu-item>
                    <md-menu-item layout-align="space-around center">
                        <a id="about-link"
                           ng-click="appCtrl.serviceProvider.headerCtrl.globalMenuCtrl.about.modal.show();">
                            <i class="fa fa-info-circle"></i>About
                        </a>
                    </md-menu-item>
                </md-menu-content>
    </md-menu>
 <div layout="row" layout-align="space-between center" style="
    float: right;
    margin-left: 10px;
    margin-right: 10px;
">
            <div id="user-session" class="session-common-class" layout-align="space-between end" layout="column" style="margin-right: 15px;cursor: pointer;height: 15px">
                <div layout="row" class="session-common-class" layout-align="space-between center" id="current-user-container">
<!--                    <span id="anonymous-user-alert" class="hidden fa fa-warning session-common-class" ></span>-->
                    <div class="session-common-class"></div>
                    <div class="session-common-class" style="background-image: url(images/Profile.png);background-repeat: no-repeat;width: 16px;height: 16px;margin-right: 5px;background-color: transparent;float: left;">
                    </div>
                    <div class="session-common-class" id="current-user" style="float: left"></div>
                    <div class="session-common-class" style="background-image: url(images/arrow-down.png);background-repeat: no-repeat;width: 16px;height: 16px;  
                    margin-left: 5px;margin-top: 1px;background-color: transparent;float: right"></div>
                </div>
                <div id="login-link" style="margin-top:3px">       
                <div id="login-link-container">
                    <span id="login-link" class="link" style="font-weight: normal">Login</span>
                </div>
            </div>
            </div>
 </div>
 <div class="sub-header">
    <div class="sub-header-text" ng-click="appCtrl.serviceProvider.headerCtrl.globalMenuCtrl.bulletinBoard.shell.launch();">Bulletin Board</div>
</div>
<div class="sub-header">
    <div class="sub-header-text"
         ng-click="appCtrl.serviceProvider.headerCtrl.globalMenuCtrl.controllerSettings.shell.launch();" 
         ng-class="{disabled: !appCtrl.nf.Common.canAccessController()}">Controller Settings</div>
</div>
 <div class="sub-header">
    <div class="sub-header-text"  ng-click="appCtrl.serviceProvider.headerCtrl.globalMenuCtrl.dataProvenance.shell.launch();" ng-class="{disabled: !appCtrl.nf.Common.canAccessProvenance()}">Data Provenance</div>
</div>
<div class="sub-header">
 <div class="sub-header-text"  ng-click="appCtrl.serviceProvider.headerCtrl.globalMenuCtrl.summary.shell.launch();">Summary</div>
</div>
</div>
    <div id="flow-status" flex layout="row" layout-align="space-between center">
    <div id="logout-session" style="width: 110px;top: 0px;right:50px;z-index: 1000;position: absolute;background: white;box-shadow: rgb(136, 136, 136) 2px 3px 9px;border-radius: 2px;display: none;">
        <div style="height: 25px;width: 100%;font-family: segoe UI;font-size: 12px;font-weight: 500;">
            <div class="canvas-session-logout" style="width: 100%;height: 15px;float: left;padding-top: 5px;cursor: pointer;">
                <div style="width:100%;height:100%;padding-left: 8px;padding-top: 1px">Log out</div>
            </div>
	</div>
	<div style="width: 100px;height: 1px;margin-left: 5px;border: rgba(128, 128, 128, 0.15);background-color: rgba(128, 128, 128, 0.15);"></div>
        <div style="height: 25px;width: 100%;font-family: segoe UI;font-size: 12px;font-weight: 500;" ng-if="!appCtrl.nf.Common.isSecured()">
            <div style="width: 100px;height: 15px;float: left;padding-top: 6px;padding-left: 7px;cursor: pointer;" onclick="return openChangePasswordDialog();">
                Change password
            </div>
        </div>
    </div>
    <div id="flow-status-container" layout="row" layout-align="space-around center">
        <div class="fa fa-cubes" style="color:#365976 !important" title="Connected nodes" ng-if="appCtrl.nf.ClusterSummary.isClustered()"><span id="connected-nodes-count">{{appCtrl.serviceProvider.headerCtrl.flowStatusCtrl.connectedNodesCount}}</span></div>
        <div class="icon icon-threads " title="Active threads" style="color:#868686  !important"><span id="active-thread-count">{{appCtrl.serviceProvider.headerCtrl.flowStatusCtrl.activeThreadCount}}</span></div>
        <div class="fa fa-list" title="Total queued" style="color:#868686  !important"><span id="total-queued">{{appCtrl.serviceProvider.headerCtrl.flowStatusCtrl.totalQueued}}</span></div>
        <div class="fa fa-bullseye" title="Transmitting count" style="color:#868686  !important"><span id="controller-transmitting-count">{{appCtrl.serviceProvider.headerCtrl.flowStatusCtrl.controllerTransmittingCount}}</span></div>
        <div class="icon icon-transmit-false" title="Non transmitting count" style="color:#868686  !important"><span id="controller-not-transmitting-count">{{appCtrl.serviceProvider.headerCtrl.flowStatusCtrl.controllerNotTransmittingCount}}</span></div>
        <div class="fa fa-play" title="Running count" style="color:#49B748  !important"><span id="controller-running-count">{{appCtrl.serviceProvider.headerCtrl.flowStatusCtrl.controllerRunningCount}}</span></div>
        <div class="fa fa-stop" title="Stopped count" style="color:#ff6464  !important"><span id="controller-stopped-count">{{appCtrl.serviceProvider.headerCtrl.flowStatusCtrl.controllerStoppedCount}}</span></div>
        <div class="fa fa-warning" title="Invalid count" style="color:rgb(186, 85, 74) !important"><span id="controller-invalid-count">{{appCtrl.serviceProvider.headerCtrl.flowStatusCtrl.controllerInvalidCount}}</span></div>
        <div class="icon icon-enable-false" title="Disabled count" style="color:#fcaf15  !important"><span id="controller-disabled-count">{{appCtrl.serviceProvider.headerCtrl.flowStatusCtrl.controllerDisabledCount}}</span></div>
        <div class="fa fa-refresh" title="Last refreshed" style="color:#868686!important"><span id="stats-last-refreshed">{{appCtrl.serviceProvider.headerCtrl.flowStatusCtrl.statsLastRefreshed}}</span></div>
        <div id="canvas-loading-container" class="loading-container"></div>
    </div>
    <div layout="row" layout-align="end center" style="background: #fff!important;">
        <div id="search-container">
            <button id="search-button" class="canvas-header-button" ng-click="appCtrl.serviceProvider.headerCtrl.flowStatusCtrl.search.toggleSearchField();"><i class="fa fa-search"></i></button>
            <input id="search-field" type="text" placeholder="Search"/>
        </div>
        <button id="bulletin-button" class="canvas-header-button"><i class="fa fa-sticky-note-o"></i></button>
    </div>
</div>
<div id="search-flow-results"></div>
<div id="application-container" style="display: none"></div>
 </div>
   <%-- <div flex layout="row" layout-align="space-between center"> --%>
   <%-- Modified the container in to left side of the UI --%>  

<div id="component-container" ondrop="return false;" class="component component-toolbar" style="height: 582px">
<div style="border-right:1px solid #cdcece; border-top:1px solid #aabbc3; background-color: #fff;position: absolute;height: 100%;width:100%">
<div id="component-tab-buttons" style="color: #2D2D2D;height:32px;font-size: 12px;">
<div class="main-tab-container">
<div id="ProcessorContainer" title="Components" style="cursor:pointer;height:30px;width:84px;float: left;line-height: 31px;">
<custom class="icons-tab_processer" style="height: 18px;width: 18px;margin-left:28px;color: #000000;font-size:18px;margin-top:1px;opacity: 0.7;"> 
</custom>
</div>
<div id="TemplateContainer" title="Templates">  
 <custom class="icons-tab_templetes" style="height: 18px;width: 18px;margin-left:34px;color:#000000;font-size:18px;margin-top:1px;opacity: 0.7;"></custom>   
</div>
<div id="serverContainer" title="Servers" style="width:81px;">  
<custom class="icons-tab_server" style="height: 18px;width: 18px;margin-left:32px;color: #000000;font-size: 18px;margin-top:1px;opacity: 0.7;"></custom></div>
</div>
</div>
<div id="component-permission" style="width:100%;height:100%;" class="disable-element">
<div class="searchbox-container">
<div id="SearchContainer" class="permission-changes">
  <input type="text" class="permission-changes search-textbox" id="SearchText" placeholder="Search">
  <button type="submit" id="cancelButton" style="
    width: 15px;
    height: 15px;
    float:left;
    margin-top: 7px;
    background-image: url(images/Remove_template.png);
    background-repeat: no-repeat;
    background-color: transparent;
    display: none;
    border: 0px;"></button>
   </div>
</div>
<div class="main-components-section">
<div class="components-container" style="max-height: 100%; overflow-y: auto;">
<div id="searcharea" class="searcharea" style="padding-top: 12px;height:100%;overflow-y:auto;overflow-x: hidden;">
<%-- Overall Processor's List Area --%>  
<div id="OverallListItems" class="searcharea" style="
color: rgb(45, 45, 45);font-size: 17px;text-overflow: ellipsis;display: block;padding-bottom: 15px;">
<div id="ListArea22" class="component-list other-component-list" style="width:100%;">
<%-- OutPut Port Container --%> 
<ul id="List22" class="processor-inner-list">
<div id="OutputPortContainer" class="searcharea selectedcomponent"  style="color: #2D2D2D;height: 32px;font-size: 12px;margin-left: 12px;">
<div id="ContainerText"></div>

<button title="Output Port" style="height: 100% ! important;line-height: 22px;" id="port-out-component" class="component-button ui-draggable searcharea other-component port-out-component icon icon-port-out"  ng-disabled="!appCtrl.nf.CanvasUtils.canWrite();" nf-draggable="appCtrl.serviceProvider.headerCtrl.toolboxCtrl.draggableComponentConfig(appCtrl.serviceProvider.headerCtrl.toolboxCtrl.outputPortComponent);">
<span class="component-button-grip"></span>
<span class="component-text" style="padding-left:15px;padding-top: 1px;float:right;">Output Port</span> </button>
</div>
 
<%-- Input Port Container --%> 
<div class="searcharea selectedcomponent"  style="color: rgb(45, 45, 45); height: 32px; font-size: 12px; margin-left: 12px;" id="InputPortContainer">
  <div id="ContainerText"></div>
<button  title="Input Port" style="height: 100% ! important;line-height: 22px;" id="port-in-component" class="component-button ui-draggable icon icon-port-in searcharea other-component port-in-component" ng-disabled="!appCtrl.nf.CanvasUtils.canWrite();" nf-draggable="appCtrl.serviceProvider.headerCtrl.toolboxCtrl.draggableComponentConfig(appCtrl.serviceProvider.headerCtrl.toolboxCtrl.inputPortComponent);">
    <span class="component-button-grip"></span>
    <span class="component-text" style="padding-left:15px;padding-top: 1px;float: right;">Input Port</span>
</button></div>

<%--  Process group Container --%> 
<div id="ProcessGroupContainer" class="searcharea selectedcomponent" style="color: rgb(45, 45, 45); height:32px; font-size: 12px; margin-left:12px;">
  <div id="ContainerText"></div>
  <button  title="Process Group" style="height: 100% ! important;line-height: 22px;" id="group-component" class="component-button ui-draggable icon icon-group searcharea other-component ProcessGroupContainer"  ng-disabled="!appCtrl.nf.CanvasUtils.canWrite();" nf-draggable="appCtrl.serviceProvider.headerCtrl.toolboxCtrl.draggableComponentConfig(appCtrl.serviceProvider.headerCtrl.toolboxCtrl.groupComponent);">
       <span class="component-button-grip"></span>
      <span class="component-text" style="padding-left:15px;padding-top: 1px;float: right;">Process Group</span>
            </button>
     </div>
   
<%-- RemoteProcessGroup Container --%> 
<div id="RemoteProcessGroupContainer" class="searcharea selectedcomponent" style="color: rgb(45, 45, 45); height:32px; font-size: 12px; margin-left: 12px;">
  <div id="ContainerText" class="searcharea"></div>
  <button  title="Remote Process Group" style="height: 100% ! important;line-height: 22px;" id="group-remote-component" class="component-button ui-draggable icon icon-group-remote searcharea other-component RemoteProcessGroupContainer"  ng-disabled="!appCtrl.nf.CanvasUtils.canWrite();" nf-draggable="appCtrl.serviceProvider.headerCtrl.toolboxCtrl.draggableComponentConfig(appCtrl.serviceProvider.headerCtrl.toolboxCtrl.remoteGroupComponent);">
<span class="component-button-grip"></span>
      <span class="component-text" style="padding-left: 15px;padding-top: 1px;float: right;">Remote Process Group</span>
          </button>
     </div>

<%-- Label Container --%> 
<div id="LabelContainer" class="searcharea selectedcomponent" style="color: rgb(45, 45, 45);height:32px;font-size: 12px;margin-left:12px;">
<div id="ContainerText" class="searcharea"></div>
    <button  title="Label" style="height: 100% ! important;line-height: 22px;" id="label-component" class="component-button ui-draggable icon icon-label searcharea other-component LabelContainer"  ng-disabled="!appCtrl.nf.CanvasUtils.canWrite();" nf-draggable="appCtrl.serviceProvider.headerCtrl.toolboxCtrl.draggableComponentConfig(appCtrl.serviceProvider.headerCtrl.toolboxCtrl.labelComponent);">
<span class="component-button-grip"></span>
        <span class="component-text" style="padding-left:15px;padding-top: 1px;float: right;">Label</span> 
</button> 
</div>

<%-- Funnel Container --%> 
<div id="FunnelContainer" class="searcharea selectedcomponent" style="color: rgb(45, 45, 45); height:32px; font-size: 12px; margin-left:12px;">
<div id="ContainerText" class="searcharea"></div>
<button title="Funnel" style="height: 100% ! important;line-height: 22px;" id="funnel-component" class="component-button ui-draggable icon icon-funnel searcharea other-component FunnelContainer"  ng-disabled="!appCtrl.nf.CanvasUtils.canWrite();" nf-draggable="appCtrl.serviceProvider.headerCtrl.toolboxCtrl.draggableComponentConfig(appCtrl.serviceProvider.headerCtrl.toolboxCtrl.funnelComponent);">
<span class="component-text" style="padding-left:15px;padding-top: 1px;">Funnel</span>
</button> 
</div>
</ul>
</div>    
<div id="Processors" class="processor-components headercomponent selectedcomponent component-group" style="
     width: 209px;
    height: 18px;
    font-size: 12px;
    margin-left: 23px;
    padding-left: 0px;
    padding-top: 13px;
    display: block;
">
<div id="ProcessorTitle" style="margin-left: 24px;margin-top: -3px;">Processors</div>
<div id="ListTreeIconProcessor" class="treeview-icon" style="background-image: url(&quot;images/icon_Expand.png&quot;); margin-left: -20px;"></div>
<div class="processor-icon">     
</div>      
</div>
<div class ="processor-components-area component-list">
</div>
 </div>
</div>
</div>
 <div class="templateContainer">
 <div class="template-operations">
      <div class="operations create-template-container" title="Create Template"><a class="create-template" ng-click="appCtrl.nf.Actions['template'](false);"
     ng-disabled="!(appCtrl.nf.CanvasUtils.canWrite() && (appCtrl.nf.CanvasUtils.getSelection().empty() || appCtrl.nf.CanvasUtils.canRead(appCtrl.nf.CanvasUtils.getSelection())));">Create</a></div>
  <div class="operations" title="Upload Template"><a class="upload-template"style="margin-left:10px;"
  onclick="document.getElementById('template-file-property').click()">Upload</a>
  <form id="template-upload-form-container" enctype="multipart/form-data" method="post">
  <input type="file" name="template" id="template-file-property" title="Browse" style="width: 28px;display: none"/>
  </form>
  </div>
        </div>
 </div>
 </div>
<div class="main-server-section">
<div class="add-server-container" title="Add Server">
    <a class="add-server" onclick="openAddExistingServerDialog()">Add</a></div>
</div>

</div>
</div>
<div class="description-container">
<div class="description-title-section permission-changes">
    <span class="description-title">Description</span><div class="description-icon minimize-description"></div>
</div>
    <span class="description-section">Description not available</span>
</div>
</div>
</div>

<script>
    var dynamicListarea;
    var options;
    var accessToken;
    var hostName;
    var portNumber;
    var userName;
    var password;
    var groupName;
    var isValid = true;
    var currentTemplateId;
    var canvasSelection;
    var isNewTemplate = false;
    var groupProcessorCount = 1;
    var groupId;
    var groupName;
    var componentUrl;
    var componentResponse;
    var componentName;
    var getStatus;
    var actionType;
    var serverName;
    var isSecured;
    var isRootGroup = false;
    var currentTab = "components";
    var checkStatus;
    var properties;
    var isModified;
    var isRegistryModified=false;
    var registryProperties=[];
    var index=0;
    var editor;
    var xmlEditor;
    var fileName;
    var notSaved=false;
    var restartButtonEnable=false;
    var securityEnabled=false;
    var canModifyConfiguration;
    var serverDetailsArray = [];
    var templateCount=1;
    var isPasswordChangedProperly=false;
    var groupList=[];
    var selectedProcessor;
    var selectedProcessorElement;
    var selectedprocessorType;
    var artifactId;
    var bundleGroup;
    var tags;
    var processorVersion;
    var selectedGroup;
    var isNewGroup=false;
    var moveGroup=false;
    var copyGroup=false;
    var processgroupList;
    // Tree View for ChildListitem1
    $(document).on("click", ".header-component", function() {
        var id = $(this).attr("id");
        var parentId = id.replace(/headercontent/, '');
        var listId = $("#ContainerText" + parentId).text();
		var component = $("div").find('[data-group='+'"'+listId+'"'+']');
        if (component.css("display") === "none") {
            component.css("display", "block");
            $("#ListTreeIcon" + parentId).css("background-image", "url(images/icon_Expand.png)");
            component.removeClass("hidden-elements");
        } else {
            component.css("display", "none");
            component.addClass("hidden-elements");
            $("#ListTreeIcon" + parentId).css("background-image", "url(images/icon_Collapse.png)");
        }
    });        
    $("#CustomProcessorHeader").click(function() {
	      var othersGroupComponent= $("div").find('[data-group="Others"]');
        if (othersGroupComponent.css("display") === "none") {
            othersGroupComponent.css("display", "block");
            $("#ProcessorTreeIcon").css("background-image", "url(images/icon_Expand.png)");
            othersGroupComponent.removeClass("hidden-elements");
        } else {
            othersGroupComponent.css("display", "none");
            othersGroupComponent.addClass("hidden-elements");
            $("#ProcessorTreeIcon").css("background-image", "url(images/icon_Collapse.png)");
        }
    });
    $("#Processors").click(function() {
        if ($(".processor-components-area").css("display") === "none") {
            $(".processor-components-area").css("display", "block");
            $("#ListTreeIconProcessor").css("background-image", "url(images/icon_Expand.png)");
            $(".processor-components-area").removeClass("hidden-elements");
            $(".Processorlistarea").css("display", "none");
            $(".initial-collapse").css("background-image", "url(images/icon_Collapse.png)");
        } else {
            $(".processor-components-area").css("display", "none");
            $(".processor-components-area").addClass("hidden-elements");
            $("#ListTreeIconProcessor").css("background-image", "url(images/icon_Collapse.png)");
            $(".selectedcomponent").removeClass("selected-component");
        }
    });

    /* Search components */
    $("#SearchText").on("keyup", function() {
        $(".selected").each(function() {
            var className = $(this).attr("class");
            $(this).attr("class", className.replace("selected", ""));
        });
        var searchBoxText = $(this).val().toLowerCase().trim();
        var displayMode = $(".components-container").css("display");
        if ($("#TemplateContainer").hasClass("template-selected")) {
            filterTemplateList(searchBoxText);
        } else if ($("#ProcessorContainer").hasClass("template-selected")) {
            filterProcessorList(searchBoxText);
        } else {
            filterServerList(searchBoxText);
        }
    });
    $("#cancelButton").on("click", function() {
        $("#SearchText").val("");
        clearFilter();
        $("#cancelButton").css("display", "none");
        $(".template-list").css("display", "block");
    });
    
    function isPasswordChanged(){
        return isPasswordChangedProperly;
    }
    // Search template
    function filterTemplateList(searchBoxText) {
            $("#cancelButton").css("display", "block");
            $(".template-list").each(function() {
                var templateText = $(this).find('.drag-template').text().toLowerCase();
                if (templateText.indexOf(searchBoxText) === -1) {
                    $(this).parent(".selectedtemplate").addClass("hide-text");
                } else {
                    $(this).parent(".selectedtemplate").removeClass("hide-text");
                }
            });
        }
        // Search servers
    function filterServerList(searchBoxText) {
            $("#cancelButton").css("display", "block");
            $(".selected-server").each(function() {
                var templateText = $(this).find(".server-block").text().toLowerCase();
                if (templateText.indexOf(searchBoxText) === -1) {
                    $(this).addClass("hide-text");
                } else {
                    $(this).removeClass("hide-text");
                }
            });
        }
        // Search processors
    function filterProcessorList(searchBoxText) {
            $(".component-list").removeClass("filtered-li");
            $(".component-group").removeClass("has-filtered-elements");
            $(".processor-element").each(function() {
                var processorText = $(this).attr("data-tags");
		processorText=processorText.toLowerCase();
                if (searchBoxText === "") {
                    $("#cancelButton").css("display", "none");
                    clearFilter();
                } else {
                    $("#cancelButton").css("display", "block");if(processorText!==undefined){
                    if (processorText.indexOf(searchBoxText) !== -1) {
                        var display = $(this).closest(".processor-inner-list").parent().css("display");
                        if (display === "none") {
                            $(this).closest(".processor-inner-list").parent().css("display", "block")
                        }
                        $(this).closest('.create-processor-list').show();
                        var componentGroup = $(this).parents(".component-list").prev(".component-group");
                        componentGroup.addClass("has-filtered-elements");
                        componentGroup.children().children(".initial-collapse").css("background-image", "url(images/icon_Expand.png)");
                        $(this).parents(".component-list").addClass("filtered-li");
                    } else {
                        $(this).closest('.create-processor-list').hide();
                    }
                }

                    $(".component-group").not('.has-filtered-elements').css("display", "none");
                    $(".has-filtered-elements").css("display", "block");
                    $(".component-list").not('.filtered-li').css("display", "none");
                    $(".other-component-list").css("display", "none");
                    $(".filtered-li").css("display", "block");
                }
            });
        }
        //Clear filters
    function clearFilter() {
            $(".create-processor").each(function() {
                if ($(this).parents(".component-list").css("display") === "none") {
                    var componentGroup = $(this).parents(".component-list").prev(".component-group");
                    componentGroup.children().children(".initial-collapse").css("background-image", "url(images/icon_Collapse.png)");
                }
            });
            $(".component-group").css("display", "block");
            $(".create-processor-list").css("display", "block");
            $(".hidden-elements").css("display", "none");
            $(".hide-text").removeClass("hide-text");
            $(".other-component-list").css("display", "block");
        }
        /* */
        /* Drop components */
        $('body').droppable({
        drop: function(event, ui, draggable, pt) {
            var allowDrop = false;
            var componentOffset = $("#component-container")[0].getBoundingClientRect();
            var leftPosition = componentOffset.width;
            var canvasOffset = $("#canvas-container")[0].getBoundingClientRect();
            var topPosition = canvasOffset.top;
            var graphPosition = $("#graph-controls")[0].getBoundingClientRect();
            var elementPosition = ui.position;
            var draggableElement = ui.draggable;
            var draggedElementClass = draggableElement.attr("class");
            if(draggedElementClass.indexOf('prioritizer-element')===-1){
               if(draggedElementClass.indexOf("searcharea")===0){
                      var processorName = draggableElement.attr("title").split(" (")[0];  
                   }
                   else
                      var processorName = draggableElement.attr("title")
                var processorType = draggableElement.attr("value");
                var selectedProcessorClass = draggedElementClass.split(" ")[1];
                var selectedComponentClass = draggedElementClass.split(" ")[7];
                var selectedTemplateClass = draggedElementClass.split(" ")[0];
                var artifact = draggableElement.children(".artifact").attr("value");
                var version = draggableElement.children(".artifact").attr("id");
                var group = draggableElement.children(".artifact").text();
                var createdGroupId;
                if (elementPosition.top > topPosition && elementPosition.left > leftPosition) {
                    allowDrop = true;
                    if (elementPosition.left > graphPosition.left) {
                        if (elementPosition.top > graphPosition.height)
                            allowDrop = true;
                        else
                            allowDrop = false;
                    }
                }
                if (allowDrop) {
                    var translate = nf.Canvas.View.translate();
                    var scale = nf.Canvas.View.scale();
                    
                    var mouseX = event.originalEvent.pageX;
                    var mouseY = event.originalEvent.pageY - nf.Canvas.CANVAS_OFFSET;
                    
                    // invoke the drop handler if we're over the canvas
                    if (mouseX >= 0 && mouseY >= 0) {
                        // adjust the x and y coordinates accordingly
                        elementPosition.left = (mouseX / scale) - (translate[0] / scale) - 500;
                        elementPosition.top = (mouseY / scale) - (translate[1] / scale) - 60;
                    }
                    if(draggableElement.hasClass("other-component")){
                        createdGroupId = nf.Canvas.getGroupId(); 
                    }
                    if (nf.Canvas.getParentGroupId()=== null && !draggableElement.hasClass("other-component")) {
                        $.ajax({
                            type: 'GET',
                            url: '../dataintegration-api/process-groups/root/process-groups',
                            async: false,
                            success: function(data) {
                                var count = 0;
                                var processorNameList = [];
                                var isGroupNameCreated = false;
                                for (count; count < data.processGroups.length; count++) {
                                    var processorName = data.processGroups[count].status.name;
                                    if (processorName.indexOf("Data Flow_") > -1)
                                        processorNameList.push(processorName.split("Data Flow_")[1]);
                                }
                                var maxProcessorGroupNumber = Math.max.apply(Math, processorNameList);
                                if (maxProcessorGroupNumber !== -Infinity) {
                                    for (count = 1; count <= maxProcessorGroupNumber; count++) {
                                        if (processorNameList.indexOf(count.toString()) === -1) {
                                            groupProcessorCount = count;
                                            isGroupNameCreated = true;
                                            break;
                                        }
                                    }
                                    if (!isGroupNameCreated)
                                        groupProcessorCount = maxProcessorGroupNumber + 1;
                                }
                            }
                        });
                        groupName = "Data Flow_" + groupProcessorCount;
                        groupId = nf.Canvas.getGroupId();
                        var processGroupEntity = {
                            'revision': nf.Client.getRevision({
                                'revision': {
                                    'version': 0
                                }
                            }),
                            'component': {
                                'name': groupName,
                                'position': {
                                    'x': elementPosition.left,
                                    'y': elementPosition.top
                                }
                            }
                        };
                        isRootGroup = true;
                        componentUrl = '../dataintegration-api/process-groups/' + groupId + '/process-groups';
                        createComponent(processGroupEntity, componentUrl, componentName).done(function(response) {
                            createdGroupId = response.id;
                            selectComponent(selectedProcessorClass, selectedComponentClass, selectedTemplateClass,
                            processorType, processorName, elementPosition, createdGroupId, draggableElement, event, artifact, version, group);
                            gotoProcessGroup(createdGroupId);
                            // update component visibility
                            nf.Canvas.View.updateVisibility();
                            // update the birdseye
                            nf.Birdseye.refresh();
                            nf.Canvas.View.refresh({
                                transition: true
                            });
                        }).fail(nf.Common.handleAjaxError);
                        nf.Canvas.View.refresh({
                            transition: true
                        });
                    } else {
                        isRootGroup = false;
                        selectComponent(selectedProcessorClass, selectedComponentClass, selectedTemplateClass, processorType, 
                        processorName, elementPosition, createdGroupId, draggableElement, event, artifact, version, group);
                        nf.Canvas.View.refresh({
                            transition: true
                        });
                    }
                }
            }
        }
    });
    function gotoProcessGroup(selectedGroupId) {
        nf.ProcessGroup.enterGroup(selectedGroupId);
         nf.Canvas.View.refresh({
            transition: true
        });
    }

    function createComponent(componentEntity, componentUrl, componentName) {
        return $.ajax({
            type: 'POST',
            aysnc: false,
            url: componentUrl,
            data: JSON.stringify(componentEntity),
            dataType: 'json',
            contentType: 'application/json'
        }).done(function(responseData) {
            response = responseData;
            addToGraph(componentName, responseData);
            // update component visibility
           nf.Canvas.View.updateVisibility();
            nf.Canvas.View.refresh({
                transition: true
            });
            // update the birdseye
            nf.Birdseye.refresh();
            if(location.protocol !== "http:" && responseData.uri !== undefined){
            var responseDataURL = responseData.uri;
            var hostName = location.hostname;
            var portNo  = location.port;
            var constructedSecureLink = "https://"+hostName+":"+portNo+"/"+"dataintegration-api";
            responseDataURL = responseDataURL.replace(constructedSecureLink, "");
            nf.InheritComponentPolicy.inheritComponentPolicy(responseDataURL,responseData);  
        }
        }).fail(function(xhr, status, error) {
            if (xhr.status === 400) {
                var errors = xhr.responseText.split('\n');

                var content;
                if (errors.length === 1) {
                    content = $('<span></span>').text(errors[0]);
                } else {
                    content = nf.Common.formatUnorderedList(errors);
                }

                nf.Dialog.showOkDialog({
                    dialogContent: content,
                    headerText: 'Configuration Error'
                });
            } else {
               nf.ErrorHandler.handleAjaxError(xhr, status, error);
            }
        });

    }

    function addToGraph(componentType, response) {
                switch (componentType) {
                    case "Labels":
                       nf.Graph.add({
                            'labels': [response]
                        }, {
                            'selectAll': true
                        });
                        break;
                    case "Funnels":
                        nf.Graph.add({
                            'funnels': [response]
                        }, {
                            'selectAll': true
                        });
                        break;
                    case "RemoteProcessGroups":
                        nf.Graph.add({
                            'remoteProcessGroups': [response]
                        }, {
                            'selectAll': true
                        });
                        break;
                    case "Templates":
                       if (nf.Canvas.getParentGroupId() !== null) {
                        nf.Graph.add(response.flow, {
                            'selectAll': true
                        });
                        var canvasContainer = $('#canvas-container');
                        if (canvasContainer.width() >= 1800 && isRootGroup === true) {
                            $("#naviagte-zoom-fit").click();
                            $("#naviagte-zoom-out").click();
                        }
                    }
                        break;
                    case "Processors":
                   if (nf.Canvas.getParentGroupId() !== null) {
                         nf.Graph.add({
                            'processors': [response]
                        }, {
                            'selectAll': true
                        });
                    }
                        break;
                    case "ProcessorGroups":
                         nf.Graph.add({
                            'processGroups': [response]
                        }, {
                            'selectAll': true
                        });
                        break;
                    case "InputPorts":
                         nf.Graph.add({
                            'inputPorts': [response]
                        }, {
                            'selectAll': true
                        });
                        break;
                    case "OutputPorts":
                         nf.Graph.add({
                            'outputPorts': [response]
                        }, {
                            'selectAll': true
                        });
                        break;
                }
                  if (response.flow !== undefined) {
                     nf.Graph.add(response.flow, {
                        'selectAll': true
                    });
                    var canvasContainer = $('#canvas-container');
                    if (canvasContainer.width() >= 1800 && isRootGroup === true) {
                        setTimeout(function() {
                            $("#naviagte-zoom-fit").click();
                            $("#naviagte-zoom-out").click();
                        }, 200);

                    }
                }
            }
        /*  */
        /* Create component based on dropped element  */
    function selectComponent(selectedProcessorClass, selectedComponentClass, selectedTemplateClass,
        processorType, processorName, elementPosition, createdGroupId, draggableElement, event, artifact, version, group) {
        if (selectedProcessorClass === "create-processor-list") {
            createProcessor(processorType, processorName, elementPosition, createdGroupId, artifact, version, group);
        } else if (selectedComponentClass === "icon-port-out" || selectedComponentClass === "icon-port-in") {
            dropInputOutputPort(elementPosition, selectedComponentClass, createdGroupId);
        } else if (selectedComponentClass === "icon-label") {
            createLabel(elementPosition, createdGroupId);
        } else if (selectedComponentClass === "icon-funnel") {
            createFunnel(elementPosition, createdGroupId);
        } else if (selectedComponentClass === "icon-group") {
            dropGroupProcessor(elementPosition);
           nf.Canvas.View.refresh({
                transition: true
            });
        } else if (selectedComponentClass === "icon-group-remote") {
            dropRemoteGroupProcessor(elementPosition, createdGroupId);
        } else if (selectedTemplateClass === "drag-container") {
            $(".dropbtn").removeClass("dropbtn-icon");
            var id = $(draggableElement).attr("id");
            createTemplate(id, elementPosition, createdGroupId);
        }
         nf.Canvas.View.refresh({
            transition: true
        });
    }

    function createProcessor(processorType, name, elementPosition, selectedGroupId, artifact, version, group) {
        componentName = "Processors";
        var processorEntity = {
            'revision': nf.Client.getRevision({
                'revision': {
                    'version': 0
                }
            }),
            'component': {
                'bundle':{
                  'artifact': artifact,
                  'group': group,
                  'version': version
                },
                'type': processorType,
                'name': name,
                'position': {
                    'x': elementPosition.left,
                    'y': elementPosition.top
                }
            }
        };
        if (nf.Canvas.getParentGroupId() === null) {
            groupId = selectedGroupId;
        } else {
            groupId = (nf.Canvas.getGroupId());
        }
        componentUrl = '../dataintegration-api/process-groups/' + groupId + '/processors';
        createComponent(processorEntity, componentUrl, componentName);
    }

    function dropInputOutputPort(elementPosition, elementType, selectedGroupId) {
        var self = this;
        var addOutputPort = function() {
            // get the name of the output port and clear the textfield
            var portName = $('#new-port-name').val();
            // hide the dialog
            self.modal.hide();
            // create the output port
            createOutputPort(portName, elementPosition, selectedGroupId);
        };
        var addInputPort = function() {
            // get the name of the input port and clear the textfield
            var portName = $('#new-port-name').val();
            // hide the dialog
            self.modal.hide();
            // create the input port
            createInputPort(portName, elementPosition, selectedGroupId);
        };
        this.modal = {
            /**
             * Gets the modal element.
             *
             * @returns {*|jQuery|HTMLElement}
             */
            getElement: function() {
                return $('#new-port-dialog'); //Reuse the input port dialog....
            },
            /**
             * Initialize the modal.
             */
            init: function() {
                //Reuse the input port dialog....
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
            buttonText: 'Add',
            color: {
                base: '#728E9B',
                hover: '#004849',
                text: '#ffffff'
            },
            handler: {
                click: function() {
                    if (elementType === "icon-port-out") {
                        addOutputPort();
                    } else {
                        addInputPort();
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
                    self.modal.hide();
                }
            }
        }]);
        if (elementType === "icon-port-out") {
            // update the port type
            $('#new-port-type').text('Output');
        } else {
            $('#new-port-type').text('Input');
        }

        // set the focus and show the dialog
        this.modal.show();

        // set up the focus and key handlers
        $('#new-port-name').focus().off('keyup').on('keyup', function(e) {
            var code = e.keyCode ? e.keyCode : e.which;
            if (code === $.ui.keyCode.ENTER) {
                if (elementType === "icon-port-out") {
                    addOutputPort();
                } else {
                    addInputPort();
                }
            }
        });
    }

    function createOutputPort(portName, elementPosition, selectedGroupId) {
        componentName = "OutputPorts"
        var outputPortEntity = {
            'revision': nf.Client.getRevision({
                'revision': {
                    'version': 0
                }
            }),
            'component': {
                'name': portName,
                'position': {
                    'x': elementPosition.left,
                    'y': elementPosition.top
                }
            }
        };
        if(nf.Canvas.getParentGroupId() === null) {
            groupId = selectedGroupId;
        } else {
            groupId = (nf.Canvas.getGroupId());
        }
        componentUrl = '../dataintegration-api/process-groups/' + groupId + '/output-ports';
        createComponent(outputPortEntity, componentUrl, componentName);
    }

    function createInputPort(portName, elementPosition, selectedGroupId) {
        componentName = "InputPorts";
        var inputPortEntity = {
            'revision': nf.Client.getRevision({
                'revision': {
                    'version': 0
                }
            }),
            'component': {
                'name': portName,
                'position': {
                    'x': elementPosition.left,
                    'y': elementPosition.top
                }
            }
        };
        if (nf.Canvas.getParentGroupId() === null) {
            groupId = selectedGroupId;
        } else {
            groupId = (nf.Canvas.getGroupId());
        }
        componentUrl = '../dataintegration-api/process-groups/' + groupId + '/input-ports';
        createComponent(inputPortEntity, componentUrl, componentName);
    }

    function createLabel(elementPosition, selectedGroupId) {
        componentName = "Labels";
        var labelEntity = {
            'revision':nf.Client.getRevision({
                'revision': {
                    'version': 0
                }
            }),
            'component': {
                'width': nf.Label.config.width,
                'height': nf.Label.config.height,
                'position': {
                    'x': elementPosition.left,
                    'y': elementPosition.top
                }
            }
        };
        if (nf.Canvas.getParentGroupId() === null) {
            groupId = selectedGroupId;
        } else {
            groupId = (nf.Canvas.getGroupId());
        }
        componentUrl = '../dataintegration-api/process-groups/' + groupId + '/labels';
        createComponent(labelEntity, componentUrl, componentName);
    }

    function createFunnel(elementPosition, selectedGroupId) {
        componentName = "Funnels"
        var funnelEntity = {
            'revision': nf.Client.getRevision({
                'revision': {
                    'version': 0
                }
            }),
            'component': {
                'position': {
                    'x': elementPosition.left,
                    'y': elementPosition.top
                }
            }
        };
        if (nf.Canvas.getParentGroupId() === null) {
            groupId = selectedGroupId;
        } else {
            groupId = (nf.Canvas.getGroupId());
        }
        componentUrl = '../dataintegration-api/process-groups/' + groupId + '/funnels';
        createComponent(funnelEntity, componentUrl, componentName);
    }

    function dropRemoteGroupProcessor(elementPosition, selectedgroupId) {
        var self = this;
        this.icon = 'icon icon-group-remote';

        this.hoverIcon = 'icon icon-group-remote-add';

        /**
         * The remote group component's modal.
         */
        this.modal = {

            /**
             * Gets the modal element.
             *
             * @returns {*|jQuery|HTMLElement}
             */
            getElement: function() {
                return $('#new-remote-process-group-dialog');
            },

            /**
             * Initialize the modal.
             */
            init: function() {
                var defaultTimeout = "30 sec";
                var defaultYieldDuration = "10 sec";
                // configure the new remote process group dialog
                this.getElement().modal({
                    scrollableContentStyle: 'scrollable',
                    headerText: 'Add Remote Process Group',
                    handler: {
                        close: function() {
                            $('#new-remote-process-group-uris').val('');
                            $('#new-remote-process-group-timeout').val(defaultTimeout);
                            $('#new-remote-process-group-yield-duration').val(defaultYieldDuration);
                            $('#new-remote-process-group-transport-protocol-combo').combo('setSelectedOption', {
                                value: 'RAW'
                            });
                            $('#new-remote-process-group-proxy-host').val('');
                            $('#new-remote-process-group-proxy-port').val('');
                            $('#new-remote-process-group-proxy-user').val('');
                            $('#new-remote-process-group-proxy-password').val('');
                        }
                    }
                });
                // set default values
                $('#new-remote-process-group-timeout').val(defaultTimeout);
                $('#new-remote-process-group-yield-duration').val(defaultYieldDuration);
                // initialize the transport protocol combo
                $('#new-remote-process-group-transport-protocol-combo').combo({
                    options: [{
                        text: 'RAW',
                        value: 'RAW'
                    }, {
                        text: 'HTTP',
                        value: 'HTTP'
                    }]
                });
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
        var addRemoteProcessGroup = function() {
            // create the remote process group
            createRemoteProcessGroup(elementPosition, selectedgroupId);
        };

        this.modal.update('setButtonModel', [{
            buttonText: 'Add',
            color: {
                base: '#728E9B',
                hover: '#004849',
                text: '#ffffff'
            },
            handler: {
                click: addRemoteProcessGroup
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
                    self.modal.hide();
                }
            }
        }]);

        // show the dialog
        this.modal.show();

        // set the focus and key handlers
        $('#new-remote-process-group-uris').focus().off('keyup').on('keyup', function(e) {
            var code = e.keyCode ? e.keyCode : e.which;
            if (code === $.ui.keyCode.ENTER) {
                addRemoteProcessGroup();
            }
        });

    }

    function dropGroupProcessor(elementPosition) {
        var self = this;
        /**
         * The group component's modal.
         */
        this.icon = 'icon icon-group';
        this.hoverIcon = 'icon icon-group-add';
        this.modal = {

            /**
             * Gets the modal element.
             *
             * @returns {*|jQuery|HTMLElement}
             */
            getElement: function() {
                return $('#new-process-group-dialog');
            },

            /**
             * Initialize the modal.
             */
            init: function() {
                // configure the new process group dialog
                this.getElement().modal({
                    scrollableContentStyle: 'scrollable',
                    headerText: 'Add Process Group',
                    handler: {
                        close: function() {
                            $('#new-process-group-name').val('');
                        }
                    }
                });
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
        return $.Deferred(function(deferred) {
            var addGroup = function() {
                // get the name of the group and clear the textfield
                var groupName = $('#new-process-group-name').val();

                // hide the dialog
                self.modal.hide();

                // create the group and resolve the deferred accordingly
                createGroupProcessor(groupName, elementPosition).done(function(response) {
                    deferred.resolve(response.component);
                }).fail(function() {
                    deferred.reject();
                });
            };

            self.modal.update('setButtonModel', [{
                buttonText: 'Add',
                color: {
                    base: '#728E9B',
                    hover: '#004849',
                    text: '#ffffff'
                },
                handler: {
                    click: addGroup
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
                        // reject the deferred
                        deferred.reject();

                        // close the dialog
                        self.modal.hide();
                    }
                }
            }]);

            // show the dialog
            self.modal.show();

            // set up the focus and key handlers
            $('#new-process-group-name').focus().off('keyup').on('keyup', function(e) {
                var code = e.keyCode ? e.keyCode : e.which;
                if (code === $.ui.keyCode.ENTER) {
                    addGroup();
                }
            });
        }).promise();

    }

    function createGroupProcessor(groupName, elementPosition) {
        componentName = "ProcessorGroups";
        var processGroupEntity = {
            'revision': nf.Client.getRevision({
                'revision': {
                    'version': 0
                }
            }),
            'component': {
                'name': groupName,
                'position': {
                    'x': elementPosition.left,
                    'y': elementPosition.top
                },
                'state':"minimized"
            }
        };
        groupId = (nf.Canvas.getGroupId());
        componentUrl = '../dataintegration-api/process-groups/' + groupId + '/process-groups';
        componentResponse = createComponent(processGroupEntity, componentUrl, componentName);
        nf.Canvas.View.refresh({
            transition: true
        });
        return componentResponse;
    }

    function createRemoteProcessGroup(elementPosition, selectedGroupId) {
            componentName = "RemoteProcessGroups";
            var remoteProcessGroupEntity = {
                'revision': nf.Client.getRevision({
                    'revision': {
                        'version': 0
                    }
                }),
                'component': {
                    'targetUri': $('#new-remote-process-group-uris').val(),
                    'position': {
                        'x': elementPosition.left,
                        'y': elementPosition.top
                    },
                    'communicationsTimeout': $('#new-remote-process-group-timeout').val(),
                    'yieldDuration': $('#new-remote-process-group-yield-duration').val(),
                    'transportProtocol': $('#new-remote-process-group-transport-protocol-combo').combo('getSelectedOption').value,
                    'proxyHost': $('#new-remote-process-group-proxy-host').val(),
                    'proxyPort': $('#new-remote-process-group-proxy-port').val(),
                    'proxyUser': $('#new-remote-process-group-proxy-user').val(),
                    'proxyPassword': $('#new-remote-process-group-proxy-password').val()
                }
            };
            if (nf.Canvas.getParentGroupId() === null) {
                groupId = selectedGroupId;
            } else {
                groupId = (nf.Canvas.getGroupId());
            }
            $('#new-remote-process-group-dialog').modal('hide');
            componentUrl = '../dataintegration-api/process-groups/' + groupId + '/remote-process-groups';
            createComponent(remoteProcessGroupEntity, componentUrl, componentName);
        }
 /*  */
 /*Minimize  description panel */
    $(document).on("click", ".minimize-description", function() {
        $(".description-section").css("display", "none");
        if (currentTab === "components") {
            $(".components-container").removeClass("minimized-container");
            $(".components-container").addClass("maximized-container");
        } else if (currentTab === "templates") {
            $(".template-section").removeClass("minimized-template");
            $(".template-section").addClass("maximized-template");
        } else {
            $(".server-section").removeClass("minimized-template");
            $(".server-section").addClass("maximized-template");
        }
        $('.minimize-description').addClass('maximize-description').removeClass('minimize-description');
        nf.Canvas.updateComponentToolbar();
    });
  /* */   
/* Maximize  description panel */
    $(document).on("click", ".maximize-description", function() {
        $(".description-section").css("display", "block");
        if (currentTab === "components") {
            $(".components-container").addClass("minimized-container");
            $(".components-container").removeClass("maximized-container");
        } else if (currentTab === "templates") {
            $(".template-section").addClass("minimized-template");
            $(".template-section").removeClass("maximized-template");
        } else {
            $(".server-section").addClass("minimized-template");
            $(".server-section").removeClass("maximized-template");
        }
        $('.maximize-description').addClass('minimize-description').removeClass('maximize-description');
        nf.Canvas.updateComponentToolbar();
    });
 /* */     
    $(document).on("click", ".processor-selected", function(documentedType) {
        var processorName = $(this).find(".create-processor").attr("value");
        $.ajax({
            type: 'GET',
            url: '../dataintegration-api/flow/processor-types',
            dataType: 'json'
        }).done(function(response) {
            $.each(response.processorTypes, function(i, documentedType) {
                var selectedType = documentedType.type;
                if (processorName === selectedType) {
                    var selectedProcessorDescription = documentedType.description;
                    if (selectedProcessorDescription === "") {
                        $(".description-section").text("Description not available");
                    } else {
                        $(".description-section").text(selectedProcessorDescription);
                    }
                    return;
                }

            });
        }).fail(function (xhr, status, error) {
             nf.ErrorHandler.handleAjaxError(xhr, status, error);
        });
    });
    $(document).on("click", ".other-component", function(documentedType) {
        $(".description-section").text("Description not available");
    });
    $(document).on("click", "#redirect-link", function() {
        if ($(this).text() === "Logout") {
            if (window.location.protocol === "https:"){
                nf.Storage.removeItem('jwt');
                if(nf.SecurityCommon.isUMP()){
                    $.ajax({
                        type: 'GET',
                        url: '../dataintegration-api/syncfusion/getumslogouturl',
                        async: false,
                        dataType: 'json'
                    }).done(function (response) {
                        var syncfusionStatus = response.accessStatus;
                        
                        if (syncfusionStatus.key === 'logout') {
                            window.location.href = syncfusionStatus.value;
                        }
                    }).fail(function (xhr, status, error) {
                        window.location = '/dataintegration/logout';
                    });
                } else {
                    window.location = '/dataintegration/login';
                }
            } else {
                localStorage.setItem(window.location.hostname + "-status", false);
                window.location = "/dataintegration/login";
            }
        } else {
            window.location = "/dataintegration/login";
        }
    });
    $(function() {
           getProcessGroups(true);
           getprocessordetails(); 
        if (window.location.protocol === "https:") {
            securityEnabled=true;
            if (nf.Storage.getItem('jwt') !== null)
                $("#redirect-link").text("Logout");
            else
                $("#redirect-link").text("Login");
        }
     
        if (location.protocol === "http:") {
            if (localStorage.getItem(window.location.hostname + "-status") === null) {
                localStorage.setItem(window.location.hostname + "-status", false);
                $("#login-link").css("display", "block");
                $("#current-user").text("Anonymous user").attr("title", "Anonymous user");
                $("#current-user-container").css("display", "none");
                $("#component-permission,.operate-tab,#registry-link").addClass("disable-element");
                $("#SearchText,.description-title-section,.action-button-permission,#SearchContainer").addClass("permission-changes");
            } else if (localStorage.getItem(window.location.hostname + "-status") === "true") {
                $("#login-link").css("display", "none");
                var username = localStorage.getItem(window.location.hostname + "-username");
                $("#current-user").text(username).attr("title", username);
                $("#current-user-container").css("display", "block");
                $("#component-permission,.operate-tab,#registry-link").removeClass("disable-element");
                $("#SearchText,.description-title-section,.action-button-permission,#SearchContainer").removeClass("permission-changes");
            } else {
                $("#login-link").css("display", "block");
                $("#current-user").text("Anonymous user").attr("title", "Anonymous user");
                $("#current-user-container").css("display", "none");
                $("#component-permission,.operate-tab,#registry-link").addClass("disable-element");
                $("#SearchText,.description-title-section,.action-button-permission,#SearchContainer").addClass("permission-changes");
            }
        } else {
            $("#login-link").css("display", "none");
            $("#current-user-container").css("display", "block");
            $("#component-permission,.operate-tab").removeClass("disable-element");
            $("#SearchText,.description-title-section,.action-button-permission,#SearchContainer").removeClass("permission-changes");
        }
        var currentUser = $('#current-user').text();
        $(".logged-user-name").text(currentUser);
         $(document).on("click", function() {
            $(".dropdown-content").css("display", "none");
            closeContextMenu();
        });
        $(document).on("click","#canvas-container", function(event) {
            if(event.target.classList.value!== undefined){
            if($(".editable-process-group").css("display")=== "inline-block"){
            if(event.target.classList.value === "" && event.target.parentElement.classList.value.indexOf("process-group-menu-item")===-1 && event.target.parentElement.classList.value.indexOf("add-new-group")===-1){
               closeEditableGroup($(".editable-process-group"));  
             }        
            else if(event.target.classList.value.indexOf("editable-process-group")===-1 && event.target.classList.value.indexOf("process-group-menu-item")===-1 && event.target.parentElement.classList.value.indexOf("add-new-group")===-1){
               if(event.target.parentElement.classList.value.indexOf("process-group-menu-item")===-1)
                   closeEditableGroup($(".editable-process-group")); 
            }
           }
           }
        });
        $(document).on("click", ".dropbtn", function() {
            $(".dropdown-content").css("display", "none");
            $(this).next().closest(".dropdown-content").css("display", "block");
            $("#template-name").text($(this).parent().siblings("div").find(".drag-template").text());
            return false;
        });
        $("#ProcessorContainer").addClass('template-selected');
        $('#ProcessorContainer').click(function() {
            changeTab();
            if ($(".description-icon").hasClass("maximize-description")) {
                $(".components-container").addClass("maximized-container");
                $(".components-container").removeClass("minimized-container");
            } else {
                $(".components-container").removeClass("maximized-container");
                $(".components-container").addClass("minimized-container");
            }
            currentTab = "components";
            $("#TemplateContainer").removeClass('template-selected');
            $(".templateContainer").css("display", "none");
            $(".processors-operations").css("display", "block");
            $(".components-container").css("display", "block");
            $(".main-tab-container div").removeClass("template-selected");
            $(this).addClass('template-selected');
            $('#SearchText').prop('title', 'Search Processors');
//            clearInterval(getStatus);
//            getStatus = 0;
        });
        addTemplate(true);
        dragTemplate();
     //  getProcessorList(true);
        $('#TemplateContainer').click(function() {
            changeTab();
            dragTemplate();
            clearFilter();
            if ($(".description-icon").hasClass("maximize-description")) {
                $(".template-section").addClass("maximized-template");
                $(".template-section").removeClass("minimized-template");
            } else {
                $(".template-section").removeClass("maximized-template");
                $(".template-section").addClass("minimized-template");
            }
//            getStatus = setInterval(refreshTemplates, 30000);
            $(".templateContainer").css("display", "block");
            $(".processors-operations").css("display", "none");
            $(".components-container").css("display", "none");
            $('#SearchText').prop('title', 'Search Templates');
            $(this).addClass("template-selected");
            $("#ProcessorText").text("Templates");
            addTemplate(false);
            currentTab = "templates";
        });        
        $('#serverContainer').click(function() {
            clearFilter();
            $("#SearchText").val("");
            $(".main-server-section").css("display", "block");
            $(".main-components-section").css("display", "none");
            $(".processors-operations").css("display", "none");
            $(".main-tab-container div").removeClass("template-selected");
            $(this).addClass("template-selected");
            $("#ProcessorText").text("Servers");
            if ($(".description-icon").hasClass("maximize-description")) {
                $(".server-section").addClass("maximized-template");
                $(".server-section").removeClass("minimized-template");
            } else {
                $(".server-section").removeClass("maximized-template");
                $(".server-section").addClass("minimized-template");
            }
            getServerDetails();
            currentTab = "servers";
        });
        $(document).on("click", ".drag-container", function(element) {
            changeDescription(element.target.parentElement.parentElement.getAttribute("value"));
        });
     function changeDescription(Description){    
      if(Description === "" || Description==="1"){
         $(".description-section").text("Description not available"); 
      }
      else
      $(".description-section").text(Description);
     }
        function changeTab() {
                $("#cancelButton").css("display", "none");
                $("#SearchText").val("");
                $(".description-section").text("Description not available");
                $(".main-server-section").css("display", "none");
                $(".main-components-section").css("display", "block");
                $(".main-tab-container div").removeClass("template-selected");
            }
/* Drag functionality for templates */
        function dragTemplate() {
                $(".drag-container").draggable({
                    helper: function(event) {
                        $(".dropdown-content").css("display", "none");
                        var targetClass = event.target.parentElement.childNodes[1];
                        var text = targetClass.textContent;
                        return $('<div class="icon template-icon RestrictDragComponent" style="margin-top: -2px;text-overflow: ellipsis;margin-left: -14px;font-Size: 12px;position: relative;color:#484D4E;height:20px!important;width: 135px ! important; line-height: 19px;background-color:#C9F0F8;border-radius:4px;overflow:hidden;border:2px solid #84D2F9"><span class="template-name" style="padding-left: 6px;padding-top: 0px;margin-top:-2px;font-size: 11px;color:black;overflow:hidden;text-overflow:ellipsis;">' + text + '</span></div>');
                    },
                    drag: function(event, ui, draggable, pt) {
                        ProcessorDragConstrain(event, ui, draggable, pt);
                    }
                });
            }
            /* */
        $(".templateContainer").css("display", "none");
        $(".component-button").qtip("destroy");
        $("input[type=radio][name='publish-group']").change(function(e) {
            $(".template-error-status").text("");
            $(".publish-loader-icon").css("display","block");
            $("#remote-server-host-name, #port-number, #server-user-name, #server-password").css("border", "1px solid rgb(170, 170, 170)");
            $("#remote-server-host-name, #port-number, #server-user-name, #server-password").css("box-shadow", "none");
            var selectedValue = $("input:radio[name ='publish-group']:checked").val();
            if (selectedValue === "New group") {
                $(".new-process-group-section").css("display", "block");
                $(".select-process-group-section").css("display", "none");
            } else {
                if ($("#remote-server-host-name").val() === "" || $("#port-number").val() === "") {
                    if($("#remote-server-host-name").val() === ""){
                        $("#remote-server-host-name").css("border", "1px solid #f7baba");
                        $("#remote-server-host-name").css("box-shadow", "#fc7474 0px 0px 5px");
                    }
                    if($("#port-number").val() === ""){
                        $("#port-number").css("border", "1px solid #f7baba");
                        $("#port-number").css("box-shadow", "#fc7474 0px 0px 5px");
                    }
                    $("input:radio[value='Existing group']").prop('checked', false);
                    $(".template-error-status").text('Please enter required fields (*) to proceed further');
                    $("input:radio[value='New group']").prop('checked', true);
                } else {
                    isSecured = $('.secured-checkbox').prop('checked');
                    if (isSecured) {
                        if ($("#server-user-name").val() === "" || $("#server-password").val() === "") {
                            if($("#server-user-name").val() === ""){ 
                                $("#server-user-name").css("border", "1px solid #f7baba");
                                $("#server-user-name").css("box-shadow", "#fc7474 0px 0px 5px");
                            }
                            if($("#server-password").val() === ""){ 
                                $("#server-password").css("border", "1px solid #f7baba");
                                $("#server-password").css("box-shadow", "#fc7474 0px 0px 5px");
                            }
                            $(".template-error-status").text('Please enter required fields (*) to proceed further');
                            $("input:radio[value='Existing group']").prop('checked', false);
                            $("input:radio[value='New group']").prop('checked', true);
                        } else 
                    appendProcessGroups();
                    } else 
                        appendProcessGroups();
                }
            }
            $(".publish-loader-icon").css("display","none");
        });
            
  $("#registry-variables-dialog").click(function(e) {
        if($("#GridEditForm").length>0){
        if (!$(e.target).closest("#registry-variables-dialog .e-rowcell").length) {
          var gridObj = $("#Grid").data("ejGrid");
          gridObj.endEdit(); 
        }
    }
    });    
    });
  /*Refresh template list*/
    function refreshTemplates() {
            if ($("#TemplateContainer").hasClass("template-selected")) {
                addTemplate(false);
            }
        }
        /* */
/* Add processors to toolbar */
    function appendProcessor(options) {
            dynamicListarea = '<div class="create-processor searcharea selectedcomponent processor-component processor-selected" style="height:100%;width: 194px;margin-left: 37px;padding-left: 0px;"><ul class="processor-inner-list">';
            for (i = 0; i < options.length; i++) {
                var title = options[i].name;
                var tags =options[i].tags;
                var imageurl= options[i].name.split(" ")[0];
                var isCopiedProcessor=options[i].isCopied;
                if(checkImageExists('images/' + imageurl + '.svg')){
                dynamicListarea = dynamicListarea + '<li class="searcharea create-processor-list" title="' + title + '" value=' + '"' + options[i].type + '"' + '><a class="template-icon" style="margin-top: -3px;margin-left:5px;background-image:url(images/' + imageurl + '.svg)!important;"></a><span class="artifact" id="'+options[i].version.replace("(","").replace(")","").trim()+'" value="'+options[i].artifact+'">'+options[i].bundlegroup+'</span><span class="create-processor processor-element" value=' + '"' + options[i].type + '"' + 'title="' + title + '"id="' + title.split(" ")[0] + '" data-tags="'+tags+'" data-iscopied-processor="'+isCopiedProcessor+'" style="font-size:12px;cursor: -moz-grab;margin-left: -34px;">' + title + '</span></li>';
                }
                else{              
                dynamicListarea = dynamicListarea + '<li class="searcharea create-processor-list" title="' + title + '" value=' + '"' + options[i].type + '"' + '><a class="template-icon" style="margin-top: -3px;margin-left:5px;background-image:url(images/CustomProcessor.svg)!important;"></a><span class="artifact" id="'+options[i].version.replace("(","").replace(")","").trim()+'" value="'+options[i].artifact+'">'+options[i].bundlegroup+'</span><span class="create-processor processor-element" value=' + '"' + options[i].type + '"' + 'title="' + title + '"id="' + title.split(" ")[0] + '" data-tags="'+tags+'" data-iscopied-processor="'+isCopiedProcessor+'" style="font-size:12px;cursor: -moz-grab;margin-left: -34px;">' + title + '</span></li>';
            }
        }
            dynamicListarea = dynamicListarea + '</ul></div>';
        }
  function checkImageExists(image_url){
    var http = new XMLHttpRequest();
    http.open('HEAD', image_url, false);
    http.send();
    return http.status !== 404;
}
        /* */
        /* Restriction for components drop area */
        function ProcessorDragConstrain(event, ui, draggable, pt) {
                $(".icon-port-out-add:before").css("margin-top", "0px!important");
                var allowDrop = true;
                var componentOffset = $("#component-container")[0].getBoundingClientRect();
                var leftPosition = componentOffset.width;
                var canvasOffset = $("#canvas-container")[0].getBoundingClientRect();
                var topPosition = canvasOffset.top;
                var graphPosition = $("#graph-controls")[0].getBoundingClientRect();
                var elementPosition = ui.position;
                var description = $(".description-container")[0].getBoundingClientRect();

                if (elementPosition.top > topPosition && elementPosition.left > leftPosition) {
                    allowDrop = true;

                    $(".RestrictDragComponent").css("display", "inline-flex");
                    if (elementPosition.left + 100 > graphPosition.left) {
                        if (elementPosition.top > graphPosition.bottom) {
                            allowDrop = true;
                        } else {
                            allowDrop = false;
                        }
                    }
                } else if (elementPosition.left < leftPosition && elementPosition.top > topPosition && (elementPosition.top - description.top) < 0) {
                    allowDrop = true;

                } else if ((elementPosition.top - description.top) > 0 && elementPosition.left < description.width) {
                    allowDrop = false;
                } else {
                    allowDrop = false;
                }
                if (allowDrop === false) {
                    $(".RestrictDragComponent").css("display", "none");
                } else {
                    $(".RestrictDragComponent").css("display", "inline-flex");
                }
            }
            /* */
/* Add templates to toolbar */
    function addTemplate(isFirstTime, canUpdateScrollbar) {
            $.ajax({
                type: 'GET',
                url: '../dataintegration-api/flow/templates',
                dataType: 'json'
            }).done(function(response) {
                     var templates = response.templates;
                    if (nf.Common.isDefinedAndNotNull(templates) && templates.length > 0) {
                        // sort the templates
                        templates = templates.sort(function (one, two) {
                            var oneDate = nf.Common.parseDateTime(one.template.timestamp);
                            var twoDate = nf.Common.parseDateTime(two.template.timestamp);

                            // newest templates first
                            return twoDate.getTime() - oneDate.getTime();
                        });
                        var options = [];
                        $.each(templates, function (_, templateEntity) {
                            if (templateEntity.permissions.canRead === true) {
                                options.push({
                                    text: templateEntity.template.name,
                                    value: templateEntity.id,
                                    description: nf.Common.escapeHtml(templateEntity.template.description),
                                    uri:templateEntity.template.uri
                                });
                            }
                        });
                    var templateArray;
                    if ($(".description-icon").hasClass("minimize-description"))
                        templateArray = '<div class="template-section minimized-template"><ul class="template-inner-container">';
                    else
                        templateArray = '<div class="template-section maximized-template"><ul class="template-inner-container">';
                    for (i = 0; i < options.length; i++) {
                        templateArray = templateArray + '<div class="selectedtemplate" style="height: 26px;"><li class="template-list"  value=' + '"' + options[i].description + '"' + '><div class="drag-container" id=' + options[i].value + '><a class="template-icon"></a><span class="drag-template" title=" ' + options[i].text + ' " >' + options[i].text + '</span></div><div class="dropdown"> <div class="dropbtn"></div><div class="dropdown-content"><a class="download-template dropdown-menu" href=' + options[i].uri + ' onclick="return downloadTemplate(this);">Download</a><a class="publish-template dropdown-menu" id= "' + options[i].value + '" onclick="return openPublishTemplateDialog(this);">Publish</a><a class="delete-template dropdown-menu" id= "' + options[i].text + '" href=' + options[i].uri + ' onclick="return deleteTemplateConfirmation(this);">Delete</a></div></div></li></div>';
                    }
                    templateArray = templateArray + '</ul></div>';
                    $(".template-section").remove();
                    $(".zero-template").remove();
                    $("#SearchText").val("");
                    $(".templateContainer").append(templateArray);
                } else {
                    $(".zero-template").remove();
                    $(".templateContainer").append('<span class="zero-template">No templates available</span>');
                }
                if (isFirstTime && !$("#TemplateContainer").hasClass("template-selected"))
                    $(".templateContainer").css("display", "none");
                else
                    $(".templateContainer").css("display", "block");

                if(canUpdateScrollbar === undefined){
                var templateComponentHeight = $(".templateContainer").outerHeight() - $(".template-operations").outerHeight();
                $(".template-section").height(templateComponentHeight);
                } else if(canUpdateScrollbar){
                    nf.Canvas.updateComponentToolbar();
                }

                isFirstTime = false;
                  $(".drag-container").draggable({
                    helper: function(event) {
                        $(".dropdown-content").css("display", "none");
                        var text = this.children[1].textContent;
                        return $('<div class="icon template-icon RestrictDragComponent" style="margin-top: -2px;text-overflow: ellipsis;margin-left: -14px;font-Size: 12px;position: relative;color:#484D4E;height: 22px ! important;width: 135px ! important; line-height: 19px;background-color:#C9F0F8;border-radius:4px;overflow:hidden;border:2px solid #84D2F9"><span class="template-name" style="padding-left: 6px;padding-top: 0px;margin-top:-2px;font-size: 11px;color:black;overflow:hidden;text-overflow:ellipsis;">' + text + '</span></div>');
                    },
                    drag: function(event, ui, draggable, pt) {
                        ProcessorDragConstrain(event, ui, draggable, pt);
                    }
                });
            }).fail(nf.Common.handleAjaxError);
        }
        /* */
 /* create template */
    function createTemplate(templateId, elementPosition, selectedGroupId) {
            componentName = "Templates";
            var instantiateTemplateInstance = {
                'templateId': templateId,
                'originX': elementPosition.left,
                'originY': elementPosition.top
            };
            if (nf.Canvas.getParentGroupId() === null) {
                groupId = selectedGroupId;
            } else {
                groupId = (nf.Canvas.getGroupId());
            }
            componentUrl = '../dataintegration-api/process-groups/' + groupId + '/template-instance';
            createComponent(instantiateTemplateInstance, componentUrl, componentName);
        }
        /* */
 /* download template */
    function downloadTemplate(template) {
            var templateUrl = template.href;
            var config = {
                urls: {
                    downloadToken: '../dataintegration-api/access/download-token'
                }
            };
            nf.Common.getAccessToken(config.urls.downloadToken).done(function(downloadToken) {
                var parameters = {};
                // conditionally include the download token
                if (!nf.Common.isBlank(downloadToken)) {
                    parameters['access_token'] = downloadToken;
                }

                // open the url
                if ($.isEmptyObject(parameters)) {
                    window.open(templateUrl + '/download');
                } else {
                    window.open(templateUrl + '/download' + '?' + $.param(parameters));
                }
            }).fail(function() {
                nf.Dialog.showOkDialog({
                    headerText: 'Download Template',
                    dialogContent: 'Unable to generate access token for downloading content.'
                });
            });
            return false;
        }
        /* */
 /* Delete template confirmation*/
    function deleteTemplateConfirmation(template) {
            var templateName = template.id;
            nf.Dialog.showYesNoDialog({
                headerText: 'Delete Template',
                dialogContent: 'Delete template \'' + nf.Common.escapeHtml(templateName) + '\'?',
                yesHandler: function() {
                    deleteTemplate(template.href, true);
                }
            });
            return false;
        }
        /* */
/* Delete template */
    function deleteTemplate(templateUrl, isRefreshTemplate) {
            $.ajax({
                type: 'DELETE',
                url: templateUrl,
                dataType: 'json'
            }).done(function() {
                $(".description-section").text("Description is not available");
                if (isRefreshTemplate !== undefined) {
                    $(".template-section").remove();
                    addTemplate(false);
                }

            }).fail( nf.Common.handleAjaxError);
        }
        /* */
 //Restrict Processor Dragging for Output port,Input Port,Group Processor,Remote Group Procesor, Funnel,Label:
    $('#port-out-component,#port-in-component,#group-component,#group-remote-component,#funnel-component,#label-component').draggable({
        drag: function(event, ui, draggable, pt) {
            ProcessorDragConstrain(event, ui, draggable, pt);
        }
    });
    // Script to empty the description area on switch over to template and processor tabs 
    $("#TemplateContainer").click(function() {
        $(".processorDescription").empty();
        $('#SearchText').prop('title', 'Search Templates');
    });
    $("#ProcessorContainer").click(function() {
        $(".description-section").empty();
        $('#SearchText').prop('title', 'Search Processors');
    });
    $("#serverContainer").click(function(){
        $(".description-section").empty();
        $('#SearchText').prop('title', 'Search Servers');
    });
    $(document).on("mouseover", ".template-list", function() {
        $(this).find(".dropbtn").addClass("dropbtn-icon");
    });
    $(document).on("mouseover", ".server-list", function() {
        $(this).find(".dropbtn").addClass("dropbtn-icon");
    });
    $(document).on("mouseleave", ".template-list", function() {
        $(this).find(".dropbtn").removeClass("dropbtn-icon");
    });
    $(document).on("mouseleave", ".server-list", function() {
        $(this).find(".dropbtn").removeClass("dropbtn-icon");
    });
    $(document).on("click", ".selectedcomponent", function() {
        $(".selectedcomponent").removeClass("selected-component");
        if(!$(this).hasClass("create-processor-list")){
         $(".description-section").text("Description not available");
        }
        $(this).addClass("selected-component");
    });
    $(document).on("click", ".selectedtemplate", function() {
        $(".selectedtemplate").removeClass("selected-template");
        $(this).addClass("selected-template");
    });
    $("#ProcessorContainer").click(function() {
        $(".description-section").empty();
        $('#SearchText').prop('title', 'Search Processors');
    });
    $(document).on("click", ".selectedtemplate", function() {
        $(".selectedtemplate").removeClass("selected-template");
        $(this).addClass("selected-template");
    });


    $("#login-link").click(function() {
        window.location = '/dataintegration/login';
    });

    $("#help-link").click(function() {
        window.open("https://help.syncfusion.com/data-integration/overview");
    });
    /*logout user*/
     $('.canvas-session-logout').on('click', function () {
        if(location.protocol === "https:"){
            nf.Storage.removeItem('jwt');
            if(nf.SecurityCommon.isUMP()){
                $.ajax({
                        type: 'GET',
                        url: '../dataintegration-api/syncfusion/getumslogouturl',
                        async: false,
                        dataType: 'json'
                    }).done(function (response) {
                        var syncfusionStatus = response.accessStatus;
                        
                        if (syncfusionStatus.key === 'logout') {
                            window.location.href = syncfusionStatus.value;
                        }
                    }).fail(function (xhr, status, error) {
                        window.location = '/dataintegration/logout';
                    });
            } else {
                window.location = '/dataintegration/login';
            }
        } else {
            localStorage.setItem(window.location.hostname + "-status",false);
            window.location = '/dataintegration/login';
        }        
    });
    /* */
    /* publish template section */
    //open publish template dialog
    function openPublishTemplateDialog(template) {
     canvasSelection = nf.CanvasUtils.getSelection();
     this.modal = {
         /**
          * Gets the modal element.
          *
          * @returns {*|jQuery|HTMLElement}
          */
         getElement: function() {
             return $('#publish-template-dialog');
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
         buttonText: 'Publish',
         color: {
             base: '#728E9B',
             hover: '#004849',
             text: '#ffffff'
         },
         handler: {
             click: function() {
                 var isEmpty = false;
                 $(".template-error-status").text("");
                 $('#publish-template-dialog input[type=text]').each(function() {
                     if ($(this).is(":visible")) {
                         if (this.value === "") {
                             isEmpty = true;
                             $(this).css("border", "1px solid #f7baba");
                             $(this).css("box-shadow", "#fc7474 0px 0px 5px");
                         }
                     }
                 });

                 $('#publish-template-dialog input[type=password]').each(function() {
                     if ($(this).is(":visible")) {
                         if (this.value === "") {
                             isEmpty = true;
                             $(this).css("border", "1px solid #f7baba");   
                             $(this).css("box-shadow", "#fc7474 0px 0px 5px");
                         }
                     }
                 });
                 if (!isEmpty) {
                     checkHostNameStatus(template);
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
                 resetPublishDialog();
                 isNewTemplate = false;
                 $('#publish-template-dialog').modal('hide');
             }
         }
     }]);
 bindServerDetailsToAutoComplete();
 // set the focus and show the dialog
     resetPublishDialog();
     if (template === "") {
         $(".template-name").prop("disabled",false).val("");
         isNewTemplate = true;
     } else{
         $(".template-name").val($("#template-name").text()).prop("disabled",true);
     }
     if(window.location.protocol === "https:"){
        $('.login-credentials').css('display','block');
        $(".secured-checkbox").prop("checked",true).prop("disabled",true);
    }
     $('#publish-template-dialog').addClass('dialog cancellable modal');
     var addedLoader = $("#publish-template-dialog").find(".publish-loader-icon");
     if(addedLoader.length === 0)
        $("#publish-template-dialog").append("<div class='publish-loader-icon'></div>");
     this.modal.show();
 }
 
 function publishToServer(formData) {
     var groupId;
     var selectedValue = $("input:radio[name ='publish-group']:checked").val();
     if (selectedValue === "New group") {
         var processGroup = createProcessorGroup(groupName);
         groupId = processGroup.id;
     } else {
         groupId = $('.group-name option:selected').attr("id");
     }
     if(isSecured)
     var url = 'https://'+ hostName +':'+portNumber+'/dataintegration-api/process-groups/' + groupId + '/templates/upload';
     else
     var url = 'http://'+ hostName +':'+portNumber+'/dataintegration-api/process-groups/' + groupId + '/templates/upload';
     $.ajax({
         type: 'POST',
         url: url,
         data: formData,
         dataType: 'xml',
         async: false,
         processData: false,
         contentType: false,
         beforeSend: function(xhr) {
             if(isSecured)
             xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
         },
         success: function(response, statusText, xhr, form) {
             // see if the import was successful and inform the user
             if (response.documentElement.tagName === 'templateEntity') {
                 nf.Dialog.showOkDialog({
                     headerText: 'Success',
                     dialogContent: 'Template successfully published.'
                 });
                var templateId = response.documentElement.childNodes[0].childNodes[2].textContent;
                 instantiateTemplate(templateId, groupId);
             } else {
                 // import failed
                 var statusText = 'Unable to publish template. Please check the log for errors.';
                 if (response.documentElement.tagName === 'errorResponse') {
                     // if a more specific error was given, use it
                     var errorMessage = response.documentElement.getAttribute('statusText');
                     if (!nf.Common.isBlank(errorMessage)) {
                         statusText = errorMessage;
                     }
                 }
                 // show reason
                 nf.Dialog.showOkDialog({
                     headerText: 'Unable to Publish',
                     dialogContent: nf.Common.escapeHtml(statusText)
                 });
             }
         },
         error: function(xhr, statusText, error) {
             var statusText = xhr.responseText;
             if (nf.Common.isBlank(statusText))
                 statusText = "Unexpected error occurred. Please check log file for more details."
             // request failed
             nf.Dialog.showOkDialog({
                 headerText: 'Unable to Publish',
                 dialogContent: nf.Common.escapeHtml(statusText)
             });
         }
     });
 }

 function createandPublishTemplate() {
     if (canvasSelection.empty()) {
         canvasSelection = d3.selectAll('g.component, g.connection');
     }

     // ensure that components have been specified
     if (canvasSelection.empty()) {
         nf.Dialog.showOkDialog({
             headerText: 'Publish Template',
             dialogContent: "The current selection is not valid to publish a template."
         });
         return;
     }
     canvasSelection = nf.CanvasUtils.trimDanglingEdges(canvasSelection);

     // ensure that components specified are valid
     if (canvasSelection.empty()) {
         nf.Dialog.showOkDialog({
             headerText: 'Publish Template',
             dialogContent: "The current selection is not valid to publish a template."
         });
         return;
     }
     var parentGroupId = nf.Canvas.getGroupId();
     var snippet = nf.Snippet.marshal(canvasSelection,parentGroupId);
     var snippetEntity = {
         'snippet': snippet
     };
     // create the snippet
     nf.Snippet.create(snippet).done(function(response) {
         var templateName = $(".template-name").val();
         var createSnippetEntity = {
             'name': templateName,
             'description': '',
             'snippetId': response.snippet.id
         };
         $.ajax({
             type: 'POST',
             url: '../dataintegration-api/process-groups/' + encodeURIComponent(nf.Canvas.getGroupId()) + '/templates',
             data: JSON.stringify(createSnippetEntity),
             dataType: 'json',
             contentType: 'application/json'
         }).done(function(response) {
             currentTemplateId = response.template.id;
             exportTemplate(response.template.id);
         }).always(function() {
             // clear the template dialog fields
             $('#new-template-name').val('');
             $('#new-template-description').val('');
         }).fail(nf.Common.handleAjaxError);
     }).fail(nf.Common.handleAjaxError);
 }
 function instantiateTemplate(templateId, groupId) {
     var instantiateTemplateInstance = {
         'templateId': templateId,
         'originX': "500",
         'originY': "200"
     };
     if(isSecured)
     var url='https://' + hostName +':'+portNumber+'/dataintegration-api/process-groups/' + groupId + '/template-instance';
    else
      var url='http://' + hostName +':'+portNumber+'/dataintegration-api/process-groups/' + groupId + '/template-instance';
     // create a new instance of the new template
     $.ajax({
         type: 'POST',
         url:url,
         data: JSON.stringify(instantiateTemplateInstance),
         dataType: 'json',
         contentType: 'application/json',
         beforeSend: function(xhr) {
             if(isSecured)
             xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
         }
     }).done(function(response) {
         if (currentTemplateId !== undefined) {
             var templateUrl = "../dataintegration-api/templates/" + currentTemplateId;
             //deleteTemplate(templateUrl);
         }
     }).fail(nf.Common.handleAjaxError);
 }
 function resetPublishDialog() {
    $('#publish-template-dialog input[type=text]').val("");
    $('#publish-template-dialog input[type=password]').val("");
    $("input:radio[value='Existing group']").prop('checked', false);
    $("input:radio[value='New group']").prop('checked', true);
    $('.secured-checkbox').prop('checked', false);
    $('.secured-checkbox').prop('disabled', false);
    $(".login-credentials").css("display", "none");
    $(".new-process-group-section").css("display", "block");
    $(".select-process-group-section").css("display", "none");
    clearCustomErrors();
document.getElementById("port-number").value = "60017";
}
$(document).on("change", "#publish-template-dialog input[type=password],#publish-template-dialog input[type=text]", function() {
 clearCustomErrors();
});
function clearCustomErrors(){
  $(".template-error-status").text('');
  $('#publish-template-dialog input[type=password]').css("border", "1px solid #aaa");
  $('#publish-template-dialog input[type=password]').css("box-shadow", "none");
  $('#publish-template-dialog input[type=text]').css("border", "1px solid #aaa");
  $('#publish-template-dialog input[type=text]').css("box-shadow", "none");
  $('.group-name').prop('disabled',false);
}
 function appendProcessGroups() {
     hostName = $("#remote-server-host-name").val();
     for (var i=0; i < serverDetailsArray.length; i++) {
        if (serverDetailsArray[i].name === hostName) {
          hostName = serverDetailsArray[i].value;
        }
    }
     portNumber = $("#port-number").val();
     if(isSecured){
     var url='https://' + hostName +':'+portNumber+'/dataintegration-api/process-groups/root/process-groups';
         userName = $("#server-user-name").val();
         password = $("#server-password").val();
         accessToken = getAccessToken(hostName);
     }
     else
     var url='http://' + hostName +':'+portNumber+'/dataintegration-api/process-groups/root/process-groups';
 
     
     $.ajax({
         type: 'GET',
         url:url,
         async: false,
         contentType: "application/x-www-form-urlencoded; charset=UTF-8", // this is the default value, so it's optional
         dataType: 'json',
         beforeSend: function(xhr) {
             if(isSecured)
             xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
         },
         success: function(response) {
             var processGroups = response.processGroups;
             if (nf.Common.isDefinedAndNotNull(processGroups) && processGroups.length > 0) {
                 $('.group-name').prop('disabled',false);
                 $('.group-name').find('option').remove();
                 $.each(processGroups, function(_, ProcessGroupEntity) {
                     if (ProcessGroupEntity.permissions.canRead === true) {
                         $('.group-name')
                             .append($("<option id='" + ProcessGroupEntity.component.id + "'></option>")
                                 .attr("value", ProcessGroupEntity.component.name)
                                 .text(ProcessGroupEntity.component.name));
                     }
                 });
                 $(".new-process-group-section").css("display", "none");
                 $(".select-process-group-section").css("display", "block");
             }
             else{
              $('.group-name').find('option').remove();
              $("input:radio[value='New group']").prop('checked', true);
              $(".new-process-group-section").css("display", "block");
              $(".select-process-group-section").css("display", "none");
              $(".template-error-status").text("No processor group is available in the remote server " + hostName);
              $('.group-name').prop('disabled', 'disabled');
             }
         },
           error: function(response) {
             $('.group-name').find('option').remove();
             $("input:radio[value='New group']").prop('checked', true);
             $(".new-process-group-section").css("display", "block");
             $(".select-process-group-section").css("display", "none");
             nf.Dialog.showOkDialog({
                    headerText: "Error",
                    dialogContent: nf.Common.escapeHtml(response.statusText)
                });
            }
     });
 }
 function createProcessorGroup(groupName) {
     var groupId;
     var processGroupEntity;
     if(isSecured){
         var clientUrl='https://'+ hostName +':'+portNumber+'/dataintegration-api/flow/client-id';
         var processGroupUrl='https://' + hostName +':'+portNumber+'/dataintegration-api/process-groups/root' + '/process-groups';
          if (accessToken === undefined) {
         userName = $("#server-user-name").val();
         password = $("#server-password").val();
         accessToken = getAccessToken(hostName);
       
     }
     }
     else{
         var clientUrl='http://'+ hostName +':'+portNumber+'/dataintegration-api/flow/client-id';
         var processGroupUrl='http://' + hostName +':'+portNumber+'/dataintegration-api/process-groups/root' + '/process-groups';
     }
     $.ajax({
         type: 'GET',
         url:clientUrl,
         beforeSend: function(xhr) {
             if(isSecured)
             xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
            },
         async: false,
         success: function(response) {
             processGroupEntity = {
                 'revision': {
                     'clientId': response,
                     'version': 0
                 },
                 'component': {
                     'name': groupName
                 }
             };
         },
     error: function(response) {
             nf.Dialog.showOkDialog({
                    headerText: "Error",
                    dialogContent: nf.Common.escapeHtml(response.statusText)
                });
         }
     });

     // create a new processor of the defined type
     $.ajax({
         type: 'POST',
         url:processGroupUrl,
         data: JSON.stringify(processGroupEntity),
         dataType: 'json',
         async: false,
         beforeSend: function(xhr) {
             if(isSecured)
             xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
         },
         async: false,
         contentType: 'application/json'
     }).done(function(response) {
         groupId = response;
     }).fail(nf.Common.handleAjaxError);
     return groupId;
 }

 function exportTemplate(templateId) {
     $.ajax({
         type: 'GET',
         url: '../dataintegration-api/templates/' + templateId + '/download',
         dataType: 'json',
         success: function(response) {},
         error: function(error, xhr) {
             var formData = new FormData();
             formData.append('template', error.responseText);
             publishToServer(formData);
         }
     });

 }
 /* */
 /* Change password functionality */
  function openChangePasswordDialog() {
     this.modal = {
         /**
          * Gets the modal element.
          *
          * @returns {*|jQuery|HTMLElement}
          */
         getElement: function() {
             return $('#change-password');
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
         buttonText: 'Update',
         color: {
             base: '#728E9B',
             hover: '#004849',
             text: '#ffffff'
         },
         handler: {
             click: function() {
                 $("#password-error-text").text("");
                 $('#change-password input[type=password]').css("border", "1px solid #aaa"); 
                 var newPassword = $("#new-password").val().trim();
                 var confirmPassword = $("#confirm-password").val().trim();
                 if(newPassword === "" && confirmPassword === ""){
                     $('#change-password input[type=password]').css("border", "1px solid red"); 
                     $("#password-error-text").text("Fill the required input fields.");
                     return;
                 }
                 if(newPassword === confirmPassword){
                        changeNewPassword();
                    }
                    else{
                        $('#change-password input[type=password]').css("border", "1px solid red"); 
                        $("#password-error-text").text("Confirm password and New password do not match.");
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
                 $('#change-password').modal('hide');
             }
         }
     }]);
 $("#change-password").addClass('dialog cancellable modal');
 this.modal.show();
 $('#change-password input[type=text], #change-password input[type=password]').val("");
 $("#password-error-text, #email-id-error-text").text("");
 $('#change-password input[type=text], #change-password input[type=password]').css("border", "1px solid #aaa");
 }
 function changeNewPassword(){
     var responseText = "Password changed successfully";
     $.ajax({
            type: 'POST',
            url: '../dataintegration-api/syncfusion/manage-credential',
            data: {
                username: $("#current-user").text(), 
                password: $("#new-password").val().trim(),
                operationtype: "changePassword"
            },
            success: function (data) {
                var headerText = "";
                if(data.indexOf("Success") >= 0){
                    $('#change-password').modal('hide'); 
                    headerText = "Success";
                    isPasswordChangedProperly=true;
                }
                else{
                    headerText = "Error";
                    responseText = "Error occurred while changing password";
                }
                
                nf.Dialog.showOkDialog({
                    headerText: headerText,
                    dialogContent: nf.Common.escapeHtml(responseText)
                });
            },
            error: function (xhr, statusText, error) {
                 nf.Dialog.showOkDialog({
                    headerText: "Error",
                    dialogContent: nf.Common.escapeHtml(xhr.responseText)
                });       
            }
        });
 }
  /* */
  /* check hostname status */
 function checkHostNameStatus(template) {
    hostName = $("#remote-server-host-name").val();
    portNumber = $("#port-number").val();
    userName = $("#server-user-name").val();
    password = $("#server-password").val();
    groupName = $(".new-process-group").val();
    isSecured= $('.secured-checkbox').prop('checked');
    for (var i=0; i < serverDetailsArray.length; i++) {
        if (serverDetailsArray[i].name === hostName) {
           hostName = serverDetailsArray[i].value;
           break;
        }
    }
    if (isValid) {
        $(".publish-loader-icon").css("display","block");
        setTimeout(function(){
        $.ajax({
            type: 'GET',
            url:'../dataintegration-api/syncfusion/dataintegration-status',
            data: {
                hostName: hostName,
                portNumber:portNumber,
                userName: userName,
                password: password,
                isSecured:isSecured
            },
            async: false,
            dataType: 'json',
            beforeSend: function () {
                
                $('#publish-template-dialog input[type=text]').prop("disabled", true);
                $('#publish-template-dialog input[type=password]').prop("disabled", true);
                $('#publish-template-dialog input[type=radio]').prop("disabled", true);
                $('#publish-template-dialog input[type=checkbox]').prop("disabled", true);
            },
            success: function(response) {
                if (response === 200) {
                    $('#publish-template-dialog').modal('hide');
                    if (template === "") {
                        createandPublishTemplate();
                    } else
                        exportTemplate(template.id);
                } else {
                    $(".template-error-status").text("Provided remote server is not running. Please check and try again.");
                }
                $('#publish-template-dialog input[type=text]').prop("disabled", false);
                $('#publish-template-dialog input[type=password]').prop("disabled", false);
                $('#publish-template-dialog input[type=radio]').prop("disabled", false);
                $('#publish-template-dialog input[type=checkbox]').prop("disabled", false);
                $(".publish-loader-icon").css("display","none");
            },
            error: function(response) {
                $('#publish-template-dialog input[type=text]').prop("disabled", false);
                $('#publish-template-dialog input[type=password]').prop("disabled", false);
                $('#publish-template-dialog input[type=radio]').prop("disabled", false);
                $('#publish-template-dialog input[type=checkbox]').prop("disabled", false);
                $(".template-error-status").text(response.responseText);
                $(".publish-loader-icon").css("display","none");
            }
        });
       },1000);
    }
}

  /* */
   /* get access token for given server */
 function getAccessToken(hostName) {
     accessToken = "";
     isValid = true;
     var data = {
         "username": userName,
         "password": password
     };
     var url = 'https://' + hostName +':'+portNumber+'/dataintegration-api/access/token';
     $.ajax({
         url: url,
         dataType: "html",
         type: "POST",
         async: false,
         contentType: "application/x-www-form-urlencoded; charset=UTF-8", // this is the default value, so it's optional
         data: data,
         success: function(response) {
             accessToken = response;
         },
         error: function(response) {
             if (response.responseText === undefined)
                 $(".template-error-status").text("please enter valid details to publish templates");
             else
                 $(".template-error-status").text(response.responseText);
             isValid = false;
         }
     });
     return accessToken;
 }
   /*  */
  /* Add existing server section */
 function openAddExistingServerDialog() {
    this.modal = {
        /**
         * Gets the modal element.
         *
         * @returns {*|jQuery|HTMLElement}
         */
        getElement: function() {
            return $('#add-existing-server-dialog');
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
        buttonText: 'Add',
        color: {
            base: '#728E9B',
            hover: '#004849',
            text: '#ffffff'
        },
        handler: {
            click: function() {
                $('#add-existing-server-dialog').find("#loader-icon").css("display","block");
                var isEmptyField = false;
                $('#add-existing-server-dialog input[type=text]').each(function() {
                if ($(this).is(":visible")) {
                    if (this.value === "") {
                        isEmptyField = true;
                        $(this).css("border", "1px solid red");
                        $(this).css("box-shadow", "0px 0px 10px darkgrey");
                          $('#add-existing-server-dialog').find("#loader-icon").css("display","none");
                    }
                }
                });
         $('#add-existing-server-dialog  input[type=password]').each(function() {
                     if ($(this).is(":visible")) {
                         if (this.value === "") {
                             isEmptyField = true;
                             $(this).css("border", "1px solid red");   
                             $(this).css("box-shadow", "0px 0px 10px darkgrey");
                         }
                     }
       });
                if (!isEmptyField)
                    addExistingServer("Add");
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
                $('#add-existing-server-dialog').modal('hide');
            }
        }
    }]);
    $('#add-existing-server-dialog').addClass('dialog cancellable modal');
    $('#add-existing-server-dialog').modal('setHeaderText', 'Add Remote Server').modal('show');
    resetAddExistingDialog();
    this.modal.show();
    $("#server-port-number").val("60017");
}

 $(document).on("change", ".secured-checkbox", function() {
        $(".template-error-status").text("");
           if(this.checked){
             $('.login-credentials').css('display','block');
           }
    else
    {
       $('.login-credentials').css('display','none');
    }
    });
function addExistingServer(action, serverName) {
    var primaryKey = serverName;
    var updatedValues = "";
    if (action.indexOf("Update") > -1) {
        if (portNumber !== $("#server-port-number").val()) {
            updatedValues = 'portNumber' + ",";
            portNumber = $("#server-port-number").val();
        }
        if (serverName !== $("#server-name").val()) {
            updatedValues = updatedValues + 'serverName' + ',';
            serverName = $("#server-name").val();
        }
        if (hostName !== $("#server-host-name").val()) {
            updatedValues = updatedValues + 'hostName' + "," ;
            hostName = $("#server-host-name").val();
        }
        if(isSecured !== $('.secure-checkbox').prop('checked')){
            updatedValues = updatedValues + 'issecured' + "," ;
            isSecured = $('.secure-checkbox').prop('checked');
        }
    } else
        hostName = $("#server-host-name").val();
    portNumber = $("#server-port-number").val();
    serverName = $("#server-name").val();

    if (portNumber !== $("#server-port-number").val()) {
        portNumber = $("#server-port-number").val();
    }
    if (serverName !== $("#server-name").val()) {
        serverName = $("#server-name").val();
    }
  var isSecuredServer=$('.secure-checkbox').prop('checked');
  if(isSecuredServer){
  userName = "admin";
  password = "admin";  
  }
    $.ajax({
        type: 'GET',
        url: '../dataintegration-api/syncfusion/dataintegration-status',
        data: {
            hostName: hostName,
            portNumber: portNumber,
            userName: userName,
            password: password,
            isSecured:isSecuredServer
        },
        async: false,
        dataType: 'json',
        success: function(response) {
            if (response === 200) {
                var data = {
                    serverName: serverName,
                    hostName: hostName,
                    portNumber: portNumber,
                    action: action,
                    issecured:isSecuredServer,
                    primaryKey: primaryKey,
                    updatedValues: updatedValues
                };
                var url = '../dataintegration-api/manageexistingserver';
                $.ajax({
                    url: url,
                    dataType: "html",
                    type: "POST",
                    async: false,
                    contentType: "application/x-www-form-urlencoded; charset=UTF-8", // this is the default value, so it's optional
                    data: data,
                    success: function(response) {
                        if (response.indexOf("Exists") > -1) {
                             $('#add-existing-server-dialog').find("#loader-icon").css("display","none");
                            $(".error-status").text(response);
                        } else {
                            getServerDetails();
                        }
                    },
                    error: function(response) {
                             $('#add-existing-server-dialog').find("#loader-icon").css("display","none");
                        if (response.responseText === undefined)
                            $(".error-status").text("Failed to add server please check logs and try again");
                        else
                            $(".error-status").text(response.responseText);
                    }
                });
            } else {
                     $('#add-existing-server-dialog').find("#loader-icon").css("display","none");
               if (response.responseText === undefined)
                   $(".error-status").text("Failed to add server please check logs and try again");
              else
                    $(".error-status").text(response.responseText);
            }
        },
        error: function(response) {
                 $('#add-existing-server-dialog').find("#loader-icon").css("display","none");
            if (response.responseText === undefined)
                $(".error-status").text("Provided remote server is not running. Please check and try again");
            else
                $(".error-status").text(response.responseText);
        }

    });
}
 //add server details to toolbar
function getServerDetails() {
    var url = '../dataintegration-api/manageexistingserver';
     $('#add-existing-server-dialog').find("#loader-icon").css("display","none");
    $('#add-existing-server-dialog').modal('hide');
    actionType = "GetRecords";
    var data = {
        serverName: serverName,
        action: actionType
    };
    $.ajax({
        url: url,
        type: "GET",
        data: data,
        async: false,
        success: function(response) {
            var hyperLink="http";
            $(".server-section").remove();
            var serverDetailsList = response.split(",");
            var serverArray = '<div class="server-section minimized-template"><ul class="server-inner-container">';
            for (i = 0; i < serverDetailsList.length - 1; i++) {
                var serverDetails = serverDetailsList[i].split(":");
                var hostName = serverDetails[0];
                var serverName = serverDetails[1];
                var portNumber = serverDetails[3];
                var isSecured=serverDetails[4];
                if(isSecured==="true"){
                    hyperLink="https";
                }
                  serverArray = serverArray + '<div class="selected-server"style="height: 30px;"><li class="server-list"><div class="server-block">'+
                          '<custom class="icons-tab_server" style="height: 18px;width: 18px;color: #000000;font-size: 14px;margin-top:3px;opacity: 0.7;float: left;">'+
                          '</custom><div style="width: 132px;padding-left: 10px;height: 85%; padding-top: 3px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">' + 
                          serverName + '</div></div><div class="dropdown server-dropdown"><div class="dropbtn"></div>'+
                          '<div class="dropdown-content"><a class="open-server dropdown-menu" href="'+hyperLink+'://' + hostName + ':' + portNumber + 
                          '/dataintegration" target="_blank">Open</a><a class="edit-server dropdown-menu" id="' + serverName + '" href="' + hostName + 
                          ':' + portNumber + ':' + serverName +':'+ isSecured + '" onclick="return editServerDetails(this);">Edit</a><a class="delete-server dropdown-menu" id="' +
                          serverName + '" onclick="return deleteServerConfirmation(this);">Delete</a></div></div></li></div>';
            }
            serverArray = serverArray + '</ul></div>';
            $(".main-server-section").append(serverArray);
            var serverComponentHeight = $(".main-server-section").outerHeight() -  $(".add-server-container").outerHeight();
            $(".server-section").height(serverComponentHeight - 2);
            $('.server-area').click();
        },
        error: function(response) {
            if (response.responseText === undefined)
                $(".error-status").text("Failed to add server please check logs and try again");
            else
                $(".error-status").text(response.responseText);
        }
    });
}
 //edit server dialog
function editServerDetails(target) {
    var isModified = false;
    var url = target.href.replace("%3","");
    var serverDetails = url.split(":");
    hostName = serverDetails[0];
    portNumber = serverDetails[1];
    serverName = serverDetails[2];
    isSecured=serverDetails[3];
    $("#add-existing-server-dialog input").change(function() {
        isModified = true;
    });
    $('#add-existing-server-dialog').modal('setButtonModel', [{
        buttonText: 'Update',
        color: {
            base: '#728E9B',
            hover: '#004849',
            text: '#ffffff'
        },
        handler: {
            click: function() {
                var isEmptyField = false;
                $('#add-existing-server-dialog input[type=text]').each(function() {
                    if (this.value === "") {
                        isEmptyField = true;
                        $(this).css("border", "1px solid red");
                    }
                });
                if (!isEmptyField) {
                    if (isModified)
                        addExistingServer("Update", target.id);
                    else
                        $(".error-status").text('No changes have been encountered.');
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
                $('#add-existing-server-dialog').modal('hide');
            }
        }
    }]);
    $('#add-existing-server-dialog').addClass('dialog cancellable modal');
    $('#add-existing-server-dialog').modal('setHeaderText', 'Edit Remote Server').modal('show');
    resetAddExistingDialog();
    $("#server-host-name").val(hostName);
    $("#server-port-number").val(portNumber);
    $("#server-name").val(serverName);
    if(isSecured==="true"){
       $('.secure-checkbox').prop('checked', true);
    }
 return false;
}
 //delete server confirmation dialog
function deleteServerConfirmation(server) {
    var serverName = server.id;
    nf.Dialog.showYesNoDialog({
        headerText: 'Delete Server',
        dialogContent: 'Are you sure you want to delete server \'' + nf.Common.escapeHtml(serverName) + '\'?',
        yesHandler: function() {
            deleteServerDetails(server);
        }
    });
    return false;
}
  //delete server 
function deleteServerDetails(target) {
    actionType = "Delete";
    var data = {
        serverName: target.id,
        action: actionType
    };
    var url = '../dataintegration-api/manageexistingserver';
    $.ajax({
        url: url,
        dataType: "html",
        type: "POST",
        async: false,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8", // this is the default value, so it's optional
        data: data,
        success: function(response) {
            getServerDetails();
        },
        error: function(response) {
            nf.Dialog.showOkDialog({
                headerText: 'Error',
                dialogContent: 'Error occurred while delete server details.'
            });
        }
    });
}
  //Reset add existing server dialog
function resetAddExistingDialog() {
    $('#add-existing-server-dialog input[type=text]').val("");
    $('#add-existing-server-dialog input[type=password]').val("");
    $(".error-status").text('');
    $('.secure-checkbox').prop('checked', false);
    $(".user-credentials").css("display", "none");
}
  /* */
  // Uploads the template to the UI
  $("#template-file-property").change(function() {
      var templateSelected = $("#template-file-property").val();
      var exportTemplate = $('#template-upload-form-container').ajaxForm({
          url: '../dataintegration-api/process-groups/',
          dataType: 'xml',
          beforeSubmit: function(formData, $form, options) {
              // ensure uploading to the current process group
              options.url += (encodeURIComponent(nf.Canvas.getGroupId()) + '/templates/upload');
          },
          success: function(response, statusText, xhr, form) {
              // see if the import was successful and inform the user
              if (response.documentElement.tagName === 'templateEntity') {
                  nf.Dialog.showOkDialog({
                      headerText: 'Success',
                      dialogContent: 'Template successfully imported.'
                  });
            if ($("#TemplateContainer").hasClass("template-selected")) {
                addTemplate(false);
            }
              } else {
                  // import failed
                  var statusText = 'Unable to import template. Please check the log for errors.';
                  if (response.documentElement.tagName === 'errorResponse') {
                      // if a more specific error was given, use it
                      var errorMessage = response.documentElement.getAttribute('statusText');
                      if (!nf.Common.isBlank(errorMessage)) {
                          statusText = errorMessage;
                      }
                  }

                  // show reason
                  nf.Dialog.showOkDialog({
                      headerText: 'Unable to Upload',
                      dialogContent: nf.Common.escapeHtml(statusText)
                  });
              }
          },
          error: function(xhr, statusText, error) {
              // request failed
              nf.Dialog.showOkDialog({
                  headerText: 'Unable to Upload',
                  dialogContent: nf.Common.escapeHtml(xhr.responseText)
              });
          }
      });
      if (nf.Common.isBlank(templateSelected)) {
          var statusText = "No template selected. Please browse to select a template.";
          nf.Dialog.showOkDialog({
              headerText: 'Unable to Upload',
              dialogContent: nf.Common.escapeHtml(statusText)
          });
      } else {
          exportTemplate.submit();
      }
      exportTemplate.resetForm();
  });
  $(document).on("click", "#ums-logo", function(){
      var propertyValue = $("#application-container").css("display");
      if(propertyValue === "none"){
          $("#application-container").empty();
          nf.Common.getUMSApplications();
          var newdiv = $('<div class="app-tile"></div>');
          var applications = nf.Common.umsApplications;
          for (var i = 0; i < applications.length; i++) {
              newdiv = $('<a class="app-tile" href="'+applications[i].Url[0]+'" target="_blank" title="'+applications[i].Name+'" data-appName="'+applications[i].Name+'" data-appUrl="'+applications[i].Url[0]+'"><div class="app-tile-icon"><img src="'+applications[i].Icon+'" style="width:36px;height:36px;"></div><div class="app-tile-caption">'+applications[i].Name+'</div></a>');
              $("#application-container").append(newdiv);
          }
          $("#application-container").css('display','block');
          $(".app-tile").tooltip({
              position: { 
                  my: 'center top', 
                  at: 'center bottom+8',
                  collision: 'fit fit' 
              },
              tooltipClass: 'bottom',
              content: function() {
                  var appUrl = $(this).attr('data-appUrl');
                  var appName = $(this).attr('data-appName');
                  return '<div class="applicationtooltiptext">'+
                          '<div style="padding:4px;">'+appName+'</div>'+
                          '<div style="padding:4px;">'+appUrl+'</div>'+
                          '</div>';
              }
          });
      } else {
          $("#application-container").css('display','none');
      }
  });
   $(document).on("click", "#registry-link", function() {
       if(nf.Common.canAccessConfigurations()){
           collectEditConfigFiles();
       }
   });
   function changingDropdown(){
       fileName= $('#SelectFile').val();
       openRegistryConfigDialog(fileName);
   }
   function collectEditConfigFiles(){
       this.modal = {
           /**
            * Gets the modal element.
            *
            * @returns {*|jQuery|HTMLElement}
            */
           getElement: function() {
               return $('#registry-variables-dialog');
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
               canModifyConfiguration=nf.Common.canModifyConfigurations();
               $.ajax({
                   type: 'GET',
                   url: '../dataintegration-api/syncfusion/showconfigurationfile',
                   async: false,
                   success: function(response) {
                        $('#Grid').css("display", "none");
                        $('#XmlFileContent').css("display", "none");
                        $('.CodeMirror').css("display", "none");
                        $('#SelectFile').ejDropDownList({
                                dataSource: response,
                                fields: {
                                        text: "FileName",
                                        value: "FileName"
                                },
                                watermarkText: "Select a file",
                                width: "100%",
                                float: "right",
                                create: "onCreate",
                                select: function(args) {
                                        fileName = args.model.value;
                                },
                                change: function(args) {
                                        if (notSaved) {
                                                notSaved = false;
                                        } else if (isRegistryModified) {
                                                showUnsavedFileChangeAlert(args.text);
                                        } else {
                                                filename = args.text;
                                                changingDropdown();
                                        }
                                }

                        });
                        $("#SelectFile").ejDropDownList({
                                value: "nifi.properties"
                        });
                            
                    },
                   error: function(response) {
                       $(".nifiProperties-error-status").text(response.responseText);
                   }
               });
               this.getElement().modal('show');
           },
           /**
            * Hide the modal.
            */
           hide: function() {
               this.getElement().modal('hide');
           }
       };
       $('#registry-variables-dialog').addClass('dialog cancellable modal');
       $('#registry-variables-dialog').find(".loader-icon").css("display","none");
       this.modal.show();
       $('.save-file-content').attr('disabled', true);
       $('.edit-cancel').attr('disabled', true);
       
   }
   
   function onCreate() {
       this.container.ejTooltip({
           content: this.model.value,
           open: "onOpen"
       });
   }

   function onOpen() {
       var ddlObj = $('#SelectFile').data("ejDropDownList");
       this.setModel({
           content: ddlObj.model.value
       });
   }

   function saveEditConfigFile() {
       if (isRegistryModified) {
           fileName = $("#SelectFile").val();
           saveRegistryProperties(fileName);
       }
   }

   function undoConfigFile() {
       if (restartButtonEnable) {
           $('.restart-button').attr('disabled', false);
       } else {
           $('.restart-button').attr('disabled', true);
       }
       registryProperties = [];
       fileName = $("#SelectFile").val();
       openRegistryConfigDialog(fileName);
   }
   function openRegistryConfigDialog(fileName) {
       this.modal = {
           /**
            * Gets the modal element.
            *
            * @returns {*|jQuery|HTMLElement}
            */
           getElement: function() {
               return $('#registry-variables-dialog');
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
               $.ajax({
                    type: 'GET',
                    url: '../dataintegration-api/syncfusion/readconfigurationfiles',
                    data: {
                        fileName: fileName
                    },
                    async: false,
                    success: function(response) {
                       if(fileName.indexOf(".xml") > -1 || fileName.indexOf(".conf") > -1 )
                       {
                           var value;
                           for (var i = 0; i < response.length; i++) {
                                if (value !== undefined) {
                                    value = value + "\n" + response[i].Lines;
                                } else {
                                    value = response[i].Lines;

                                }
                            }
                            /**
                            * Binding the xml file content to the xml editor and specifying the editor properties.
                            */
                            $('#Grid').css("display", "none");
                            $('.CodeMirror').css("display", "none");
                            var field = document.getElementById('XmlFileContent');
                            xmlEditor = CodeMirror.fromTextArea(field, {
                                mode: "application/xml",
                                lineNumbers: true,
                                matchBrackets: true,
                                foldGutter: true,
                                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                                readOnly: false,
                                extraKeys: {
                                    "Ctrl-S": function(instance) {
                                        var savingfileName = $("#SelectFile").val();
                                        saveRegistryProperties(savingfileName);
                                    }
                                }
                            });
                            xmlEditor.on('change', function() {
                                buttonEnableDisable();
                            });
                            xmlEditor.getDoc().setValue(value);
                            $('.CodeMirror').css("height", "90%");
                       }
                       else {
                           /**
                            * Binding the properties file content to the grid and specifying the grid properties.
                           */
                            $('.CodeMirror').css("display", "none");
                            $('#Grid').css("display", "none");
                            $('#Grid').ejGrid({
                                dataSource: response,
                                allowPaging: true,
                                allowResizing: true,
                                isResponsive: true,
                                minWidth: 500,
                                pageSettings: {
                                    pageSize: 8
                                },
                                allowScrolling: true,
                                editSettings: {
                                    allowEditing: true,
                                    allowAdding: true,
                                    allowDeleting: true
                                },
                                toolbarSettings: {
                                    showToolbar: true,
                                    toolbarItems: [ej.Grid.ToolBarItems.Add, ej.Grid.ToolBarItems.Delete]
                                },
                                columns: [{
                                    field: "Property",
                                    isPrimaryKey: true,
                                    headerText: "Property",
                                    textAlign: ej.TextAlign.Left,
                                    width: 50,
                                    validationRules: {
                                        required: true
                                    }
                                }, {
                                    field: "Value",
                                    headerText: 'Value',
                                    width: 50,
                                    textAlign: ej.TextAlign.Left,
                                    validationRules: {
                                        required: true
                                    }

                                }],
                                endAdd: "updateRegistryProperties",
                                endDelete: "updateRegistryProperties",
                                endEdit: "updateRegistryProperties"
                            });
                            $('#Grid').css("display", "block");
                            var gridObj = $("#Grid").data("ejGrid");
                            gridObj.refreshContent();
                        }
                    isRegistryModified=false;
                    
                   },
                   error: function(response) {
                       $(".nifiProperties-error-status").text(response.responseText);
                   }
               });
               this.getElement().modal('show');
           },
           /**
            * Hide the modal.
            */
           hide: function() {
               this.getElement().modal('hide');
           }
       };
       

       $('#registry-variables-dialog').addClass('dialog cancellable modal');
       $('#registry-variables-dialog').find(".loader-icon").css("display","none");
       this.modal.show();
       $('.save-file-content').attr('disabled', true);
       $('.edit-cancel').attr('disabled', true);
       if(restartButtonEnable){
           $('.restart-button').attr('disabled', false);
       }
       else{
           $('.restart-button').attr('disabled', true);
       }
   }
    function showUnsavedFileChangeAlert(selectedFileName) {
       nf.Dialog.showYesNoDialog({
           headerText: 'Information',
           dialogContent: 'Changes have not been saved yet. Do you want to save the changes and continue ?',
           yesHandler: function() {
               if(fileName.indexOf(".xml") === -1 || fileName.indexOf(".conf") === -1 ) {
                   var gridObj = $("#Grid").data("ejGrid");
                   gridObj.endEdit();
               }
               saveRegistryProperties(fileName);
               openRegistryConfigDialog(selectedFileName);
               $('#nf-yes-no-dialog-content').modal('hide');
           },
           noHandler: function() {
               registryProperties = [];
               $('#nf-yes-no-dialog-content').modal('hide');
               notSaved = true;
               if (fileName !== null) {
                   $("#SelectFile").ejDropDownList({
                       value: fileName
                   });
               }
           }

       });
   }
    function showUnsavedAlert(dialogContent,fileChanged) {
        nf.Dialog.showYesNoDialog({
            headerText: 'Information',
            dialogContent: dialogContent,
            yesHandler: function() {
                if(fileChanged)
                {
                    fileName= $('#SelectFile').val();
                    openRegistryConfigDialog(fileName);
                    $('#nf-yes-no-dialog-content').modal('hide');
                }
                else{
                    restartServices();
                    $('#nf-yes-no-dialog-content').modal('hide');
                    $('#registry-variables-dialog').modal('hide');
                }
                /*var gridObj = $("#Grid").data("ejGrid");
                gridObj.endEdit();
                restartServices();
                $('#registry-variables-dialog').modal('hide');
                $('#nf-yes-no-dialog-content').modal('hide');*/
            },
            noHandler: function() {
                if(fileChanged){
                    registryProperties = [];
                    $('#nf-yes-no-dialog-content').modal('hide');
                    notSaved = true;
                    if (fileName !== null) {
                        $("#SelectFile").ejDropDownList({
                        value: fileName
                    });
                    }    
                }
                else{
                    $('#nf-yes-no-dialog-content').modal('hide');
                }
            }
        });
    }
    function closeRegistryDialog() {
        var dialogContent;
        var fileChanged;
        if ($('.save-file-content').prop('disabled') === false) {
            dialogContent = "Changes have not been saved yet. Do you want to discard the changes ?";
            fileChanged=true;
            showUnsavedAlert(dialogContent,fileChanged);
        } else if ($('.restart-button').prop('disabled') === false) {
            dialogContent = "You must restart the data integration service to apply any changes.Do you want to restart ?";
            fileChanged=false;
            showUnsavedAlert(dialogContent,fileChanged);
        } else {
            $('#registry-variables-dialog').modal('hide');
            restartButtonEnable = false;
        }
    }
    function buttonEnableDisable() {
        if(canModifyConfiguration&&securityEnabled){
            $('.save-file-content').attr('disabled', false);
            $('.restart-button').attr('disabled', false);
            $('.edit-cancel').attr('disabled', false);
            isRegistryModified = true;
        }
        else if(securityEnabled&&canModifyConfiguration===false){
            $('.save-file-content').attr('disabled', true);
            $('.restart-button').attr('disabled', true);
            $('.edit-cancel').attr('disabled', true);
            isRegistryModified = false;
        }
        else{
            $('.save-file-content').attr('disabled', false);
            $('.restart-button').attr('disabled', false);
            $('.edit-cancel').attr('disabled', false);
            isRegistryModified = true;
        }
    }
   function updateRegistryProperties(args) {
       buttonEnableDisable();
       if (args.action === "delete" || args.action === "edit") {
           var valExists = false;
           for (var i = 0; i < registryProperties.length; i++) {
               if (registryProperties[i].text === args.data.Property) {
                   valExists = true;
                   if (args.action === "delete")
                       registryProperties.pop(args.data.Property);
                   else
                       registryProperties[i].value = args.data.Value;

                   break;
               }
           }
       }
       if (!valExists || args.action === "add") {
           registryProperties.push({
               text: args.data.Property,
               value: args.data.Value,
               action: args.action
           });
       }
   }
   function saveRegistryProperties(fileName) {
       if(fileName.indexOf(".xml") > -1 || fileName.indexOf(".conf") > -1 ) {
           properties = xmlEditor.getValue();
       } else {
           $.each(registryProperties, function(_, property) {
               if (properties !== undefined)
                   properties = properties + ",," + property.text + "=" + property.value + "%%" + property.action;
               else
                   properties = property.text + "=" + property.value + "%%" + property.action;
           });
       }
       registryProperties = [];
       $('#registry-variables-dialog').find(".loader-icon").css("display", "block");
       $('.save-file-content').attr('disabled', true);
       $('.edit-cancel').attr('disabled', true);
       isRegistryModified = false;
       if (properties !== undefined) {
           $.ajax({
               type: 'GET',
               url: '../dataintegration-api/syncfusion/saveregistryvariables',
               async: false,
               data: {
                   PropertyValues: properties,
                   FileName: fileName
               },
               dataType: 'json',
               success: function(response) {
                   $('#registry-variables-dialog').find(".loader-icon").css("display", "none");
                   properties = undefined;
                   isModified = true;
                   restartButtonEnable = true;
               },
               error: function(response) {
                   $(".nifiProperties-error-status").text(response.responseText);
                   $('#registry-variables-dialog').find(".loader-icon").css("display", "none");
               }
           });
       }
   }
 
 function restartServices() {
     fileName= $('#SelectFile').val();
        saveRegistryProperties(fileName);
        if (isModified===true) {
            $('#registry-variables-dialog').modal('hide');
            checkStatus = setInterval(checkServiceStatus, 30000);
            $.ajax({
                type: 'GET',
                url: '../dataintegration-api/syncfusion/restart-dataintegration',
                data: {
                    hostName: window.location.hostname,
                    portNumber:"60019"
                },
                async: false,
                dataType: 'json',
                
                success: function(response) {
                    
                },
                error: function(xhr, statusText, error) {
                    if(xhr.responseText !== undefined){
                        // request failed
                        nf.Dialog.showOkDialog({
                            headerText: 'Unable to Restart',
                            dialogContent: nf.Common.escapeHtml(xhr.responseText)
                        });
                    }
                }
            });
        }
    }
   function checkServiceStatus() {
       var http = new XMLHttpRequest();
       http.open("GET", window.location.protocol+ "//" + window.location.hostname + ":"+window.location.port, true);
       http.onreadystatechange = function() {
           if (http.status === 200) {
               clearInterval(checkStatus);
               checkStatus = 0;
               window.location = "/dataintegration";
           }
       };
       try {
           http.send(null);
       } catch (exception) {}
   } 
  function bindServerDetailsToAutoComplete() {     
    serverDetailsArray=[];     
    var url = '../dataintegration-api/manageexistingserver';
    $.ajax({
        url: url,
        type: "GET",
        async: false,
        success: function(response) {
            var serverDetailsList = response.split(",");       
            for (i = 0; i < serverDetailsList.length - 1; i++) {
                var serverDetails = serverDetailsList[i].split(":");
                var serverName = serverDetails[1];
                var hostName=serverDetails[0]; 
                 serverDetailsArray.push({
                     name:hostName,
                     index:index,
                     value:hostName
                 });
                 index++;
                 if(hostName!==serverName){
                 serverDetailsArray.push({
                     name:serverName,
                     index:index,
                     value:hostName
                 });
                  index++;
              }
        }
         $('#remote-server-host-name').ejAutocomplete({ dataSource: serverDetailsArray, fields: { key: "index", text: "name" }, width: 205 });
    },
        error: function(response) {

        }
    });
  }
    $(document).on("dblclick", "#canvas .component", function(targetElement) {
        var isEnabled=false;
      if (location.protocol === "http:"){
      if (localStorage.getItem(window.location.hostname + "-status") === "true"){
         isEnabled=true;
      }
     }
     else{
         isEnabled=true;    
     }
     if(isEnabled){
       var element=targetElement.currentTarget;
       if(!$(element).hasClass("process-group")&&!$(element).hasClass("funnel")){
        var selection = nf.CanvasUtils.getSelection();
       nf.Actions.showConfiguration(selection);
       }
     }
    });
    $(document).on("click", "#settings-reset", function() {
       nf.Dialog.showYesNoDialog({
        headerText: 'Reset Group',
        dialogContent: 'Are you sure you want to reset the processor categorization to default under component toolbar?',
        yesHandler: function() {
           $('#nf-ok-dialog').modal('hide');
           $(".settings-loader-icon").css("display","block");
             setTimeout(function(){
               resetGroup();
           },1000);
             }
            });
    });
  
  function getProcessGroups(isReset){
    $.ajax({
              type: 'GET',
              url: '../dataintegration-api/syncfusion/getprocessgrouplist',
              async: false,
              success: function(response) {
              processgroupList = response;
              $.each(processgroupList, function(i, group) {
                      if (jQuery.inArray(group.GroupName, groupList) === -1) {
                          groupList.push(group.GroupName);
                          if(isReset){
                          addGroupToList(group.GroupName, group.Id,group.IsDefault);
                          }
                      }
                  }); 
              },
              error: function(response) {
                  return response;
              }    
        });
  } 
  function getprocessordetails() {
          var processorList;
          $.ajax({
              type: 'GET',
              url: '../dataintegration-api/syncfusion/getprocessordetails',
              async: false,
              success: function(response) {
                  processorList = response;
                  $.ajax({
                      type: 'GET',
                      url: '../dataintegration-api/flow/processor-types',
                      dataType: 'json',
                      async: false
                  }).done(function(processorResponse) {
                      if (processorResponse.processorTypes.length !== processorList.length) {
                          var count = processorList.length + 1;
                          $.each(processorResponse.processorTypes, function(i, documentedType) {
                              var isAvailable = false;
                              dynamicListarea = "";
                              var processorType = documentedType.type;
                              var selectedType = nf.Common.substringAfterLast(processorType, '.') + " (" + documentedType.bundle.version + ")";
                              $.each(processorList, function(i, processor) {
                                  if (processor.Name === selectedType) {
                                      isAvailable = true;
                                  }
                              });
                              if (!isAvailable) {
                                  processorList.push({
                                      "Name": selectedType,
                                      "Group": "Others",
                                      "Type": processorType,
                                      "Artifact": documentedType.bundle.artifact,
                                      "BundleGroup": documentedType.bundle.group,
                                      "Version": documentedType.bundle.version,
                                      "Tags": documentedType.tags.toString(),
                                      "IsCopied":false
                                  });
                              }
                          });
                      }
                      $.each(processorList, function(i, processor) {
                          if(processor.Name!==" "){
                          var options = [];
                          options.push({
                              name: processor.Name,
                              type: processor.Type,
                              artifact: processor.Artifact,
                              bundlegroup: processor.BundleGroup,
                              version: processor.Version,
                              tags:processor.Name.split(" ")[0]+","+processor.Tags,
                              isCopied:processor.IsCopied
                          });
                          appendProcessor(options);
			 $("div").find('[data-group='+'"'+processor.Group+'"'+']').append(dynamicListarea);
                       }
                      });
                      bindContextmenu();
                      /* Drag functionality for components */
                      $('.create-processor-list').draggable({
                          revert: "invalid",
                          helper: function(event) {
                              var selectedText = event.target.getAttribute("title");
                              var imageurl = selectedText.split(" ")[0];
                              if (checkImageExists('images/' + imageurl + '.svg'))
                                  return $('<div class="icon RestrictDragComponent" style="margin-top:-2px;text-overflow:ellipsis;margin-left: -14px;font-Size: 12px;position: relative;color:#484D4E;height: 27px ! important;width: 135px ! important;line-height: 19px;background-color:#C9F0F8;border-radius:4px;overflow:hidden;border:2px solid #84D2F9;"><div style="background-image:url(images/' + imageurl + '.svg)!important;background-repeat: no-repeat;position: absolute;width: 18px;height: 18px;margin-top: 2px;"></div><span class="template-name" style="padding-left:20px;padding-top: 0px;font-size: 11px;color:black;overflow:hidden;text-overflow:ellipsis;">' + selectedText + '</span></div>');
                              else
                                  return $('<div class="icon RestrictDragComponent" style="margin-top:-2px;text-overflow:ellipsis;margin-left: -14px;font-Size: 12px;position: relative;color:#484D4E;height: 27px ! important;width: 135px ! important;line-height: 19px;background-color:#C9F0F8;border-radius:4px;overflow:hidden;border:2px solid #84D2F9;"><div style="background-image:url(images/CustomProcessor.svg)!important;background-repeat: no-repeat;position: absolute;width: 18px;height: 18px;margin-top: 2px;"></div><span class="template-name" style="padding-left:20px;padding-top: 0px;font-size: 11px;color:black;overflow:hidden;text-overflow:ellipsis;">' + selectedText + '</span></div>');

                          },
                          drag: function(event, ui, draggable, pt) {
                              ProcessorDragConstrain(event, ui, draggable, pt);
                          }
                      });
                      /* */
                      $(".processor-components-area").css("display", "none");
                      $(".processor-components-area").addClass("hidden-elements");
                      $("#ListTreeIconProcessor").css("background-image", "url(images/icon_Collapse.png)");
                  });
              },
              error: function(response) {}
          });
      }
      //creates new group for processor tree view
  function createGroup(group) {
          $.ajax({
              type: 'GET',
              url: '../dataintegration-api/syncfusion/addnewgroup',
              async: false,
              data: {
                  groupName: group
              },
              success: function(response) {

              },
              error: function(response) {}
          });

      }
      // Create and add groups to components tab
  function addGroupToList(groupName, Id,isDefault) {
          var group = '<div id="ListContent' + Id + '" class="component-group selectedcomponent"><div id="headercontent' + Id + '" class="header-component"><div id="ContainerText' + Id + '" class="group-label" style="margin-left: 29px;">' + groupName + '</div><div id="ListTreeIcon' + Id + '" class="treeview-icon initial-collapse"style="height:16px;width:16px;background-image:url(images/icon_Expand.png);"></div><div class="list-icon" ></div></div></div><div id="' + Id + '-ListArea" class="component-list Processorlistarea" style="width:100%;" data-group="'+groupName+'" data-isdefault="'+isDefault+'"></div>';
          if (isNewGroup) {
              var group = '<div id="ListContent' + Id + '" class="component-group selectedcomponent"><input type="text" class="editable-process-group" value="Newgroup"></input><div id="headercontent' + Id + '" class="header-component"><div id="ContainerText' + Id + '" class="group-label" style="margin-left: 29px;display:none">' + groupName + '</div><div id="ListTreeIcon' + Id + '" class="treeview-icon initial-collapse"style="height:16px;width:16px;background-image:url(images/icon_Expand.png);"></div><div class="list-icon" ></div></div></div><div id="' + Id + '-ListArea" class="component-list Processorlistarea" data-group="'+groupName+'" data-isdefault="'+isDefault+'" style="width:100%;"></div>';
          }
          $(".processor-components-area").append(group);
          $(".components-container").scrollTop($(".components-container")[0].scrollHeight);
          if(isNewGroup)
          $(".editable-process-group").select(); 
       bindContextmenu();
      }
      //Reset grouping to default
  function resetGroup() {
          $.ajax({
              type: 'GET',
              url: '../dataintegration-api/syncfusion/resetgrouping',
              async: false,
              success: function(response) {
               $(".processor-components-area").html("");
                  groupList=[];
                  getProcessGroups(true);
                 getprocessordetails();
                $(".settings-loader-icon").css("display","none"); 
              },
              error: function(response) {
               var statusText = xhr.responseText;
               nf.Dialog.showOkDialog({
                 dialogContent: statusText,
                  headerText: 'Error'
                });
              }
          });
      }
      // Update group of the processor selected
  function updateProcessGroup(groupName, processorName,version,type,artifact,bundleGroup,changeVersion) {
          $.ajax({
              type: 'GET',
              url: '../dataintegration-api/syncfusion/updateprocessordetails',
              async: false,
              data: {
                  groupName: groupName,
                  processorName: processorName,
                  version:version,
                  type:type,
                  artifact: artifact,
                  bundlegroup: bundleGroup,
                  changeversion: changeVersion
              },
              success: function(response) {},
              error: function(response) {

              }
          });
      }
            // move processor selected to specific group
  function moveProcessor(groupName, processorName,version,type,artifact,bundleGroup,changeVersion,tags) {
          $.ajax({
              type: 'GET',
              url: '../dataintegration-api/syncfusion/moveprocessor',
              async: false,
              data: {
                  groupName: groupName,
                  processorName: processorName,
                  version:version,
                  type:type,
                  artifact: artifact,
                  bundlegroup: bundleGroup,
                  changeversion: changeVersion,
                  tags:tags
              },
              success: function(response) {
                  
              },
              error: function(response) {

              }
          });
      }
    // Update group of the processor selected
    function copyProcessorToGroup(groupName, processorName,version,type,artifact,bundleGroup,changeVersion) {
          $.ajax({
              type: 'GET',
              url: '../dataintegration-api/syncfusion/copyprocessordetails',
              async: false,
              data: {
                  groupName: groupName,
                  processorName: processorName,
                  version:version,
                  type:type,
                  artifact: artifact,
                  bundlegroup: bundleGroup,
                  changeversion: changeVersion
              },
              success: function(response) {
                  if(response==="Success"){
                      var clonedProcessor=selectedProcessorElement.cloneNode(true);
                      var processor=$(clonedProcessor).find(".processor-element")
                      processor.attr("data-iscopied-processor","true");
                      $("div").find('[data-group='+'"'+groupName+'"'+']').append(clonedProcessor);
                  } else if(response==="Already Exists"){
                      nf.Dialog.showOkDialog({
                          dialogContent: "Processor "+processorName+" "+version+" already exists in this group",
                          headerText: 'Error'
                      });
                  } else if(response==="Fail"){
                      nf.Dialog.showOkDialog({
                          dialogContent: "Fail to copy the processor",
                          headerText: 'Error'
                      });
                  }
              },
              error: function(response) {

              }
          });
      }
      
      // Change the name of the group 
  function editProcessGroup(oldGroupName, newGroupName) {
      $.ajax({
          type: 'GET',
          url: '../dataintegration-api/syncfusion/editprocessgroup',
          async: false,
          data: {
              oldGroupName: oldGroupName,
              newGroupName: newGroupName
          },
          success: function(response) {},
          error: function(response) {

          }
      });
  }
 //Closes the context menu 
 function closeContextMenu() {
         if ($("#processor-context-menu").css("display") === "block") {
             $("#processor-context-menu").css("display", "none");
             $("#processor-sub-context-menu").css("display", "none");
         }
         if ($("#group-context-menu").css("display") === "block")
             $("#group-context-menu").css("display", "none");
     }
     //Bind context menu for groups
 function bindContextmenu() {
     $(".component-group").bind("contextmenu", function(event) {
         // Avoid the real one
         event.preventDefault();
         selectedGroup = event.target.closest(".component-group");
         closeContextMenu();
         // Show contextmenu
         if ($("#showgroup-context-menu").show() === true) {
             $("#group-context-menu").hide(100).
                 // In the right position (the mouse)
             css({
                 top: event.pageY + "px",
                 left: event.pageX + "px"
             });
         } else {
             var isDefaultGroup = $("#" + selectedGroup.id).next(".Processorlistarea").attr("data-isdefault");
             if(selectedGroup.id==="Processors"){
                 $(".remove-menu").css("display", "none");
                 $(".edit-menu").css("display", "none");
                 $(".context-menu-item-separator").css("display", "none");
             }
             else if (isDefaultGroup ==="true") {
                 $(".remove-menu").css("display", "none");
                 $(".edit-menu").css("display", "none");
                 $(".context-menu-item-separator").css("display", "none");
             }
            else{
            $(".remove-menu").css("display", "block");
            $(".context-menu-item-separator").css("display", "block");
            $(".edit-menu").css("display", "block");   
             }
             $("#group-context-menu").show(100).
                 // In the right position (the mouse)
             css({
                 top: event.pageY + "px",
                 left: event.pageX + "px"
             });
         }
     });
 }
     //Bind context menu for processor
  $(document).bind("contextmenu", function(event) {
      closeContextMenu();
      if (event.target.parentElement.classList.contains("create-processor-list") || event.target.classList.contains("create-processor-list")) {
          // Avoid the real one
          event.preventDefault();
          if (event.target.classList.contains("create-processor-list")){
              selectedProcessorElement = event.target.parentNode.parentNode;
              selectedprocessorType = event.target.attributes[2].value;
              artifactId = event.target.children[1].attributes[2].value;
              bundleGroup = event.target.children[1].textContent;
              version = event.target.children[1].attributes[1].value;
              tags = event.target.children[2].attributes.getNamedItem("data-tags").value;
              isCopied = event.target.children[2].attributes.getNamedItem("data-iscopied-processor").value;
              selectedProcessor=event.target.children[2].textContent;
          }
          else{
              selectedProcessorElement = event.target.parentNode.parentNode.parentNode;
              selectedprocessorType = event.target.parentNode.attributes[2].value;
              artifactId = event.target.previousElementSibling.attributes[2].value;
              bundleGroup = event.target.previousElementSibling.textContent;
              version = event.target.previousElementSibling.attributes[1].value;
              tags = event.target.attributes.getNamedItem("data-tags").value;
              isCopied = event.target.attributes.getNamedItem("data-iscopied-processor").value;
              selectedProcessor=event.target.closest(".processor-element").textContent;
              }
          $("#processor-sub-context-menu").html("");
          $("#processor-sub-context-menu").append('<ul class="context-menu-group"></ul>');
                groupList=[];
                 getProcessGroups();
                 $.each(groupList, function(i, group) {
                          if(group!=="Others")
                          $(".context-menu-group").append('<li class="processor-sub-menu-item"><a>' + group + '</a></li>');
                  }); 
          $(".context-menu-group").append('<div class="context-menu-item-separator"></div>');
          $(".context-menu-group").append('<li class="menu-item add-new-group processor-sub-menu-item"><a>New Group</a></li>');
          // Show contextmenu
          if ($("#showprocessor-context-menu").show() === true) {
              $("#processor-context-menu").hide(100).
                  // In the right position (the mouse)
              css({
                  top: event.pageY + "px",
                  left: event.pageX + "px"
              });
          } else {
              $("#remove-menu").css('display','none');  
              if(selectedProcessorElement.parentElement.getAttribute("data-group")==="Others"){
                  $("#move-menu").css('display','block');
                  $("#copy-menu").css('display','none');

              } else {
                  $("#copy-menu").css('display','block');
                  $("#move-menu").css('display','none');
              }
              if(isCopied==="true"){
                  $("#remove-menu").css('display','block'); 
              }
              $("#processor-context-menu").show(100).
                  // In the right position (the mouse)
              css({
                  top: event.pageY + "px",
                  left: event.pageX + "px"
              });
          }
      }
  });
  // Events for processor context menu items
  $(document).on("click", ".processor-sub-menu-item", function(event) {
      if($(".editable-process-group").css("display")!== "inline-block"){
      var selectedItem = event.target.textContent;
      closeContextMenu();
      if (selectedItem !== "New Group") {
          if(isCopyMenuSelected()){
              copyProcessorToGroup(selectedItem, selectedProcessor.split(" ")[0],selectedProcessor.split(" ")[1],selectedprocessorType,
              artifactId, bundleGroup, version);
              InitializeDragDrop();
          } else  {        
              moveProcessor(selectedItem, selectedProcessor.split(" ")[0],selectedProcessor.split(" ")[1],selectedprocessorType,
              artifactId, bundleGroup, version,tags);
              $("div").find('[data-group='+'"'+selectedItem+'"'+']').append(selectedProcessorElement);
          }          
      } else {
          isNewGroup = true;
          if(isCopyMenuSelected()){
              copyGroup = true;
              moveGroup = false;
          } else{
              copyGroup = false;
              moveGroup = true;
          }
          var grpId=$(".component-group").length;
          addGroupToList("NewGroup", grpId,false);
      }
      }
  });
   $(document).on("click", "#remove-processor-menu", function() {
       var groupName=selectedProcessorElement.parentElement.getAttribute("data-group");
       var processorName=selectedProcessor.split(" ")[0];
       var version=selectedProcessor.split(" ")[1];
       $.ajax({
              type: 'GET',
              url: '../dataintegration-api/syncfusion/removeprocessor',
              data: {
                  groupName: groupName,
                  processorName:processorName,
                  version:version
                          
              },
              success: function(response) {
                  selectedProcessorElement.remove();
              },
              error: function(response) {

              }
          });  
   });
  function InitializeDragDrop(){
      $('.create-processor-list').draggable({
          revert: "invalid",
          helper: function(event) {
              var selectedText = event.target.getAttribute("title");
              var imageurl = selectedText.split(" ")[0];
              if (checkImageExists('images/' + imageurl + '.svg'))
                  return $('<div class="icon RestrictDragComponent" style="margin-top:-2px;text-overflow:ellipsis;margin-left: -14px;font-Size: 12px;position: relative;color:#484D4E;height: 27px ! important;width: 135px ! important;line-height: 19px;background-color:#C9F0F8;border-radius:4px;overflow:hidden;border:2px solid #84D2F9;"><div style="background-image:url(images/' + imageurl + '.svg)!important;background-repeat: no-repeat;position: absolute;width: 18px;height: 18px;margin-top: 2px;"></div><span class="template-name" style="padding-left:20px;padding-top: 0px;font-size: 11px;color:black;overflow:hidden;text-overflow:ellipsis;">' + selectedText + '</span></div>');
              else
                  return $('<div class="icon RestrictDragComponent" style="margin-top:-2px;text-overflow:ellipsis;margin-left: -14px;font-Size: 12px;position: relative;color:#484D4E;height: 27px ! important;width: 135px ! important;line-height: 19px;background-color:#C9F0F8;border-radius:4px;overflow:hidden;border:2px solid #84D2F9;"><div style="background-image:url(images/CustomProcessor.svg)!important;background-repeat: no-repeat;position: absolute;width: 18px;height: 18px;margin-top: 2px;"></div><span class="template-name" style="padding-left:20px;padding-top: 0px;font-size: 11px;color:black;overflow:hidden;text-overflow:ellipsis;">' + selectedText + '</span></div>');
          },
          drag: function(event, ui, draggable, pt) {
              ProcessorDragConstrain(event, ui, draggable, pt);
          }
      });
  }
  
  function isCopyMenuSelected(){
      if($("#copy-menu").hasClass("isSelected"))
          return true;
      else
          return false;
  }
  
  // Events for process group context menu items
  $(document).on("click", ".process-group-menu-item", function(event) {
     if($(".editable-process-group").css("display")!== "inline-block"){
      var selectedItem = event.target.textContent;
      $("#group-context-menu").hide(100);
      if (selectedItem === "Edit") {
          addEditable();
      } else if (selectedItem === "Remove") {
          var grpName = $("#" + selectedGroup.id).next(".Processorlistarea").attr("data-group");
          var dialogContent = "Processors belongs to " + grpName + " group will be moved to Others group. Are you sure you want to remove?";
          nf.Dialog.showYesNoDialog({
              headerText: 'Remove Group',
              dialogContent: dialogContent,
              yesHandler: function() {
                  removeGroup();
              }
          });
      } else {
          isNewGroup = true;
          var grpId=$(".component-group").length;
          addGroupToList("NewGroup",grpId,false);
          bindContextmenu();
      }
  }
  });
  // Open sub context menu for processors
  $(document).on("mouseenter", "#move-menu", function(event) {
      $("#processor-sub-context-menu").hide();
      $("#copy-menu").removeClass("isSelected");
      $("#move-menu").addClass("isSelected");
      var parentOffset = $("#processor-context-menu").offset();
      var leftOffset = parentOffset.left + 110;
      var topOffset = parentOffset.top - 150;
      $("#processor-sub-context-menu").show(100).
          // In the right position (the mouse)
      css({
          left: leftOffset + "px",
          top: topOffset + "px"
      });
  });
   $(document).on("mouseenter", "#copy-menu", function(event) {
      $("#processor-sub-context-menu").hide();      
      $("#move-menu").removeClass("isSelected");
      $("#copy-menu").addClass("isSelected");
      var parentOffset = $("#processor-context-menu").offset();
      var leftOffset = parentOffset.left + 110;
      var topOffset = parentOffset.top - 150;
      $("#processor-sub-context-menu").show(100).
          // In the right position (the mouse)
      css({
          left: leftOffset + "px",
          top: topOffset + "px"
      });
  });
  //Add editable div to group
  function addEditable() {
          $(".editable-process-group").css("display", "none");
          var selectedGroupId = selectedGroup.id;
          if($("#" + selectedGroupId).hasClass("selected-component")){
          $("#" + selectedGroupId).removeClass("selected-component");  
          }
          $("#" + selectedGroupId).prepend("<input type='text' class='editable-process-group' value='" + selectedGroup.textContent.trim() + "'></input>");
          $(".editable-process-group").select();
        $("#" + selectedGroupId).find(".group-label").css("display", "none");
      }
      //Close editable group
  $(document).on("blur", ".editable-process-group", function() {
      closeEditableGroup($(this));
  });
   function closeEditableGroup(element) {
      var newGroupName = $(element).val();
      if(newGroupName!==""){
      var isModified=true;
      var isGroupExist=false;
      var oldgroupName = $(element).parent().find(".group-label").text();
      if(groupList.indexOf(newGroupName)!==-1 && (oldgroupName===newGroupName)){
         isModified=false; 
         $(element).parent().find(".group-label").css("display", "block");
         $(element).parent().find(".group-label").text(newGroupName);
         $("div").find('[data-group=' + '"' + oldgroupName + '"' + ']').attr("data-group", newGroupName);
         $(element).remove(); 
      }
       if(isModified){
          if (isNewGroup) {
             if(groupList.indexOf(newGroupName)===-1){
              $(element).parent().find(".group-label").css("display", "block");
              $(element).parent().find(".group-label").text(newGroupName);
              $("div").find('[data-group=' + '"' + oldgroupName + '"' + ']').attr("data-group", newGroupName);
              $(element).remove();  
              groupList.push(newGroupName);
              createGroup(newGroupName);
               var selectedElementProperties = $(selectedProcessorElement).find("span.artifact");
               var changeVersion = selectedElementProperties.attr('id');
               var artifact = selectedElementProperties.attr('value');
               var bundleGroup = selectedElementProperties.text();
               var tags = $(selectedProcessorElement).find(".processor-element").attr("data-tags");
              if (moveGroup) {
                  moveProcessor(newGroupName, selectedProcessor.split(" ")[0], selectedProcessor.split(" ")[1], selectedprocessorType,artifact, bundleGroup, changeVersion, tags);
                  $("div").find('[data-group=' + '"' + newGroupName + '"' + ']').append(selectedProcessorElement);
              } else if(copyGroup) {
                  copyProcessorToGroup(newGroupName, selectedProcessor.split(" ")[0], selectedProcessor.split(" ")[1], selectedprocessorType, artifact, bundleGroup, changeVersion);
                  InitializeDragDrop();
              }
              moveGroup = false;
              copyGroup = false;
              isNewGroup = false;
          }
          else
              isGroupExist=true;
          } else if (oldgroupName !== newGroupName) {
            if(groupList.indexOf(newGroupName)===-1){
              $(element).parent().find(".group-label").css("display", "block");
              $(element).parent().find(".group-label").text(newGroupName);
              $("div").find('[data-group=' + '"' + oldgroupName + '"' + ']').attr("data-group", newGroupName);
              $(element).remove();  
              editProcessGroup(oldgroupName, newGroupName);
              var index = groupList.indexOf(oldgroupName);
              groupList[index] = newGroupName;
               isNewGroup = false;
            }
            else
                isGroupExist=true; 
          }
      }   

       if(isGroupExist) {
          nf.Dialog.showOkDialog({
              dialogContent: "Group name should be unique",
              headerText: 'Error'
          });
      }
   bindContextmenu();
}
  }
 //Remove specific group from components
 function removeGroup() {
     var selectedGroupId = selectedGroup.id;
     var selectedGroupName=$("#"+selectedGroupId).text();
     var groupElement = $("#" + selectedGroupId).next(".Processorlistarea").attr("id");
     $("#" + groupElement + " .selectedcomponent").each(function() { 
        var id=$(this).find(".processor-element").attr("id");
        var processorCount=0;
           $(".processor-element").each(function() {
            if($(this).attr("id")===id){
            processorCount++;
         }
});
           if(processorCount<=1){
             $("div").find('[data-group="Others"]').append($(this));
           }
           else{
               $(this).remove();
           }
     });
          $.ajax({
              type: 'GET',
              url: '../dataintegration-api/syncfusion/removegroup',
              data: {
                  groupName: selectedGroupName,
              },
              success: function(response) {
                  
              },
              error: function(response) {

              }
          });
 
     $("#" + selectedGroupId).css("display", "none");
     var grpName = groupElement.split("-")[0];
     var index = groupList.indexOf(grpName);
     groupList.splice(index, 1);
 }

  function closeContextMenu() {
      if ($("#processor-context-menu").css("display") === "block") {
          $("#processor-context-menu").css("display", "none");
          $("#processor-sub-context-menu").css("display", "none");
      }
      if ($("#group-context-menu").css("display") === "block")
          $("#group-context-menu").css("display", "none");
  }
$(document).on("keypress",".editable-process-group",function(e){
var key = e.keyCode;
 if(key === 13)  // the enter key code
  {
   closeEditableGroup($(this));
  }
});
$(document).on("click","#data-preview-refresh-button",function(e){
var selection = nf.CanvasUtils.getSelection();
nf.Actions.requestPreviewData(selection);
});
</script>
