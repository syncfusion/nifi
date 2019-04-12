<%@ page contentType="text/html" pageEncoding="UTF-8" session="false" %>
<div id="new-user-dialog" class="hidden">
    <div class="dialog-content">
        <div class="setting">
            <div class="setting-name">User Name</div>
            <div class="setting-field">
                <span id="new-user-id-edit-dialog" class="hidden"></span>
                <input type="text" id="new-user-identity-edit-dialog"/>
            </div>
            <div class="clear"></div>
        </div>
        <div id="existing-user-groups" class="setting">
            <div class="setting-name">Member of</div>
            <div class="setting-field">
                <ul id="existing-available-groups" class="usersGroupsList"></ul>
            </div>
            <div class="clear"></div>
        </div>
    </div>
</div>
