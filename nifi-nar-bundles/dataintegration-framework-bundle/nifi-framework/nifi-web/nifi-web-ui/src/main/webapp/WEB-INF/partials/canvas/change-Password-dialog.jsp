
    <link rel="stylesheet" href="../dataintegration/js/jquery/modal/jquery.modal.css" type="text/css" />
    <script type="text/javascript" src="../dataintegration/js/jquery/modal/jquery.modal.js"></script>
    <%@ page contentType="text/html" pageEncoding="UTF-8" session="false" %>
    <div id="change-password" class="hidden small-dialog">
        <div class="dialog-header">
            <span class="dialog-header-text">Change password</span>
        </div>
        <div class="dialog-content">
            <div style="width: 100%;">
                <div style="width: 50%;height: auto;float: left;font-size: 12px;font-family: segoe UI;font-weight: 500;">
                    <div style="width: 120px;padding-top: 5px;padding-bottom: 35px;">New password*</div>
                    <div style="width: 120px;padding-top: 5px;padding-bottom: 35px;">Confirm password*</div>
                    <div style="width: 120px;padding-top: 5px;padding-bottom: 25px;display: none">Email ID*</div>
                </div>
                <div style="width: 50%;float: left;">
                    <div style="width: 100%;height: 30px;padding-bottom: 25px;">
                        <input type="password" id="new-password" style="height: 100%;">
                    </div>
                    <div style="width: 100%;height: 30px;padding-bottom: 25px;">
                        <input type="password" id="confirm-password" style="height: 100%;">
                    </div>
                    <div id="password-error-text" style="display: block;float: left;width: 170px;height: 20px;margin-top: -24px;color: red;font-family: segoe UI;font-size: 8px;">

                    </div>
                    <div style="width: 100%;height: 30px;padding-bottom: 25px;display: none">
                        <input type="text" id="email-id" style="height: 100%;">
                    </div>
                    <div id="email-id-error-text" style="display: none;float: left;width: 170px;height: 20px;margin-top: -22px;color: red;font-family: segoe UI;font-size: 8px;">

                    </div>
                </div>
            </div>
            <div id="common-error-text" style="width: 100%;overflow: hidden;float: left;height: 20px;white-space: nowrap;text-overflow: ellipsis;display: none;font-family: segoe UI;font-size: 10px"></div>
        </div>
    </div>
        
        <style>
            #change-password {
                min-width: 380px;
                background-color: #fff;
                min-height: 250px;
                height: auto!important;
            }
            
        </style>
       