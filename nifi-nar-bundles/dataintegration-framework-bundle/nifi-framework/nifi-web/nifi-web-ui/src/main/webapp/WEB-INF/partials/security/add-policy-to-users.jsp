<%@ page contentType="text/html" pageEncoding="UTF-8" session="false" %>
<div id="add-policies-user-dialog">
    <div class="dialog-content">   
        <span id="add-policy-selected-policy-type" class="hidden"></span>
        <span id="add-policy-selected-policy-action" class="hidden"></span>
        <span id="selectItem" class="hidden"></span>
        <span id ="selectItemType" class="hidden"></span>
        <div class="generalAlignment">            
            <div class="generalAlignment">
                <div class="add-policy-lbl-align">
                    <div class="entity-textstyle">Policy</div>
                </div>
                <div class="add-policy-combo-box-align" style="width: 50%">
                    <div id="manage-policy-type-list"  data-policyId="" style="width:195px !important"></div>   
                </div>
            </div>
            <div class="generalAlignment" style="margin-top: 30px;">
                <div class="add-policy-lbl-align">
                    <div class="accessmode-textstyle">Access Mode</div>
                </div>
                <div class="add-policy-combo-box-align" style="width: 49%">
                    <div id="actions-selection" style="width: 100%"></div>
                </div>
            </div>
        </div>
        <div id="loader-icon" style="height: 50px;width: 49px;background-image: url(images/waitingpopup.gif);position: absolute;z-index: 2;margin-top: 18%;margin-left: 50%;float: left;display: none"></div>
    </div>
</div>
