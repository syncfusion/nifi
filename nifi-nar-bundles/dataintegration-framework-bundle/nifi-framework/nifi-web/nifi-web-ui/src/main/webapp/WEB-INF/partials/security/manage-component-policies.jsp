<%@ page contentType="text/html" pageEncoding="UTF-8" session="false" %>
<div id="manage-component-policies-dialog" class="hidden">
   <div class="componentPolicy-userInfo">
         <div class="setting-name" id="account-type">user</div>
            <div class="setting-field">
                <div id="account-name"></div>
            </div>
    </div>
  <div id="component-policy-top-pnl" class="add-policyBtnStyle">
        <button id="add-new-component-policy-Btn" title="Add Policy" ng-disabled="!(appCtrl.nf.Common.canModifyPolicies())">Add Policy</button>
    </div>
    <div class="dialog-content" style="top:90px">
        <div id="component-policy-pnl" class="componentPolicyGrid-positionStyle">
            <div id="component-policy-bottom-pnl">
                <div id="manage-component-policies-grid"></div>
            </div>
        </div>
        <span class="hidden" id="account-type"></span>
        <span class="hidden" id="account-name"></span>
    </div>
    <div id="component-policy-message-pnl"  style="float:left;width:95% !important">
        <div id="component-policy-refresh-container" style="float: left;width: 50%;">
            <button id="component-policy-refresh-button" class="refresh-button pointer fa fa-refresh" title="Refresh"></button>
            <div class="last-refreshed-container">
                Last updated:&nbsp;<span id="component-policy-last-refreshed" class="last-refreshed"></span>
            </div>
            <div id="component-policy-loading-container" class="loading-container"></div>
            <div class="clear"></div>            
        </div>        
    </div>
</div>
