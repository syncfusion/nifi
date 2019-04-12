<%@ page contentType="text/html" pageEncoding="UTF-8" session="false" %>
<div id="manage-user-policies-dialog">
    <div class="dialog-content dialog-contentStyle" style="margin-bottom:30px">
        <div class="setting setting-alignment" style="float:left;width:95% !important">
            <div class="userinfo-alignmentStyle">
                <div class="setting-name" id="policies-setting-name">User</div>
                <div class="setting-field">
                    <div id="policies-dialog-user-name" ></div>
                </div>
            </div>
            <div id="policies-tabs" class="tab-container policiestab-Style securityGrid-alignmentSpaces">
            <div class="addicon-alignmentStyle">
                <button id="add-policy-user-button" title="Add Policy" ng-disabled="!(appCtrl.nf.Common.canModifyPolicies())">Add Policy</button>
            </div>
            </div>  
        </div>
        

        <div id="policy-tabs-content">
        <div id="global-policy-tab-content" class="configuration-tab">   
            <div style="float:left;width:100% !important;">
               <div id="manageuser-policies-table" class="manageuser-policies-tableStyle"></div>
            </div>
        </div>
        <div id="component-policy-tab-content" class="configuration-tab">
             <div style="float:left;width:100% !important;">
                <div id="manage-componentpolicies-table" class="manageuser-policies-tableStyle"></div>
            </div>
        </div>
    </div>   
    </div>
    <div id="global-policy-message-pnl"  style="float:left;width:95% !important">
        <div id="global-policy-refresh-container" style="float: left;width: 50%;">
            <button id="global-policy-refresh-button" class="refresh-button pointer fa fa-refresh" title="Refresh"></button>
            <div class="last-refreshed-container">
                Last updated:&nbsp;<span id="global-policy-last-refreshed" class="last-refreshed"></span>
            </div>
            <div id="global-policy-loading-container" class="loading-container"></div>
            <div class="clear"></div>
        </div>       
    </div>
     <div id="loader-icon" style="height: 50px;width: 49px;background-image: url(images/waitingpopup.gif);position: absolute;z-index: 2;margin-top: 18%;margin-left: 50%;float: left;display: none"></div>
</div>
