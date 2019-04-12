<%@ page contentType="text/html" pageEncoding="UTF-8" session="false" %>
<div id="security-management">
    <div id="security-management-content-pnl">
    <div id="security-header-and-filter">
        <div id="security-management-header-text">Security</div>
    </div>
    <div id="policy-selected-item-container" class="hidden policy-selected-item-container policy-header">
        <span id="selected-policy-item-action" class="hidden"></span>
        <span id="selected-policy-item-type" class="hidden"></span>
        <span id="selected-policy-item-id" class="hidden"></span>
        <span id="selected-policy-item-name" class="hidden"></span>
        <div class="policy-selected-item-type-icon policy-type-iconStyle" style="position: absolute;top: 36px">
            <i class="icon icon-drop" ng-style="appCtrl.serviceProvider.graphControlsCtrl.getIcon()" ng-class="appCtrl.serviceProvider.graphControlsCtrl.getContextIcon()"></i>
        </div>
        <div class="policy-selected-item-details-container policy-details-containerStyle" style="left: 42px;">
            <div class="policy-selected-item-name">{{appCtrl.serviceProvider.graphControlsCtrl.getContextName()}}</div>
            <div class="policy-selected-item-type" ng-class="appCtrl.serviceProvider.graphControlsCtrl.hide()">{{appCtrl.serviceProvider.graphControlsCtrl.getContextType()}}</div>
        </div>
        <div class="clear"></div>
    </div>
    <div id="security-tabs" class="tab-container securityGrid-alignmentSpaces">
        <div id="create-new-user-button-Pnl" class="create-new-user-button-PnlStyle">
        <button id="create-new-user-button" title="New User" ng-disabled="!(appCtrl.nf.Common.canModifyTenants())">New User</button>
        <button id="sync-users-button" title="Import users from User Management Server" ng-disabled="!(appCtrl.nf.Common.canModifyTenants())">Import user(s)</button>
        </div>
    </div>
    <div id="security-tabs-content">
        <div id="users-security-tab-content" class="configuration-tab">   
            <div id="users-security-table-Pnl">
                <div id="users-security-table"></div>
            </div>
        </div>
        <div id="usergroups-security-tab-content" class="configuration-tab">
            <div id="usergroups-security-table-Pnl">
                <div id="usergroups-security-table"></div>
            </div>
        </div>
    </div>        
</div>
<div id="security-policy-view-container">
<span class="link" id="policy-view">
   Policy based view
</span>
</div>    
<div id="security-refresh-container">
    <button id="security-refresh-button" class="refresh-button pointer fa fa-refresh" title="Refresh"></button>
    <div class="last-refreshed-container">
        Last updated:&nbsp;<span id="security-last-refreshed" class="last-refreshed"></span>
    </div>
    <div id="security-loading-container" class="loading-container"></div>
    <div class="clear"></div>            
</div>
    <div id="loader-icon" style="height: 50px;width: 49px;background-image: url(images/waitingpopup.gif);position: absolute;z-index: 2;margin-left: 43%;float: left;bottom:340px;display: none"></div>
</div>


<script type="text/javascript">
   
    function OpenGridDropDown() {
        document.getElementById("gridDropdownList").classList.toggle("show");
    }
    
    window.onclick = function(event) {
        if (!event.target.matches('.griddropdownbtn')) {
            var dropdowns = document.getElementsByClassName("griddropdown-content");
            var i;
            for (i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    };
</script>
