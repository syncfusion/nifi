<link rel="stylesheet" href="assets/syncfusion-javascript/Content/ej/web/material/ej.web.all.min.css" type="text/css" />
<script type="text/javascript" src="assets/syncfusion-javascript/node_modules/jsrender/jsrender.min.js"></script>
<script type="text/javascript" src="assets/syncfusion-javascript/Scripts/ej/web/ej.web.all.min.js"></script>
<%@ page contentType="text/html" pageEncoding="UTF-8" session="false" %>

<div id="enable-securityconfiguration-dialog" class="small-dialog">
    <div class="dialog-header dialog-header-style">
        <span class="dialog-UMPheader-text">User Management Server Authentication</span>
    </div>
    <div class="fa fa-question-circle-o question-icon-style" onclick="nf.EnableSecurityConfiguration.documentNavigate()" title="Help"></div>
    <div class="fa fa-times close-icon-style" onclick="nf.EnableSecurityConfiguration.closeUMPDlg()" title="Close"></div>
    <div id="idtext" style="display:none"></div>
    <div class="dialog-contentstyle">
        <div id="loader-icon" style="height: 50px;width: 50px;background-image: url(&quot;images/waitingpopup.gif&quot;);position: absolute;z-index: 2;margin-top: 21%;margin-left: 48%;display: none;"></div>
        <div id="register-pnl" class="registrpanel-styles">
            <div class="registration-headingstyle">Register Application</div>
            <div class="registration-messagestyle">Copy the URL for registering Data Integration with User Management Server</div>
            <div id="register-info" class="register-info-alignmentstyle">
                <div id="register-link" class="register-link-alignmentstyle" ></div>
                <div id=copylink" class="fa fa-clone linkcopy-iconstyle" onclick="nf.EnableSecurityConfiguration.urlCopyLink()" title="Copy to clipboard"></div>
                <div id="snackbar">URL Copied</div>
            </div>
        </div> 
        <div id="getapplicationdetails" class="getapplicationdetails-alignmentStyle" style="display:none;position: relative;top: 20px;left: -10px;">
            <div class="applicationdetail-messageone">Please enter the below detail to conforming registration</div>
            <div class="applicationdetail-messagetwo">with User Management Server</div>
            <div id="application-umpaddress" class="application-umpaddressstyle">
                <div id="applicationdetails-messageinfo" class="registrationContent-style" >UMS base address</div>
                <input id="umpaddress" type="text" class="e-textbox e-animation border-style" placeholder="Base address"  />
                <span class="e-ripple-bar"></span>
            </div>
            <div id="application-id" class="application-idstyle">
                <span id="applicationID-info" class="registrationContent-style">Client id</span>
                <input id="applicationid" type="text" class="e-textbox e-animation border-style" placeholder="Client id" />
                <span class="e-ripple-bar"></span>
            </div>
            <div id="application-secret" class="application-secretstyle">
                <span id="applicationsecret-info" class="registrationContent-style">Client secret</span>
                <input id="applicationsecret" type="text" class="e-textbox e-animation border-style" placeholder="Client secret" />
                <span class="e-ripple-bar"></span>
            </div>
            <div id="application-errormessage" >Please verify the details you have entered</div>
        </div>

        <div id="getadminuserdetails-pnl" class="button-hidden" style="display:none">
            <div class="adminpanel-info">Please select the <b style="font-weight: bolder;">Admin</b> for Data Integration</div>
            <div id="selectadminuser" class="selectadminuser-style">
                <span id="adminuser-info" class="adminuser-info-style">Select Admin</span>
                <input type="text" id="selectuser" />
                <div id="adminpanel-errormessage">You must select admin user</div>
            </div>
        </div>

        <div id="enablingsecurity-pnl" style="display:none;position: relative;top: 40px;left: -30px;">
            <div class="securityenable-style">Restarting Data Integration Service to enable security. It may take 5-10 mins...</div>
            <div id="servicerestarting">
                <div id="restartservice-info" class="restartservice-infostyle">Secured Data Integration URL</div>
                <div id="secureregister-info" class="secureregister-info-alignmentstyle">
                    <div id="secureregister-link" class="secureregister-linkstyle"></div>
                    <div class="fa fa-clone linkcopy-iconstyle" onclick="nf.EnableSecurityConfiguration.UmsEnabledlCopyLink()" title="Copy to clipboard"></div>
                      <div id="secureSnackbar">URL Copied</div>
                </div>
            </div>
        </div>

    </div>


</div>

<script id="sample" type="text/x-jsrender">
    <div class="footerspan" style="float:right">
    <button id='Backbtn' class="backbtn-style" style="position: absolute;top: 5px;">Back</button>
    <button id='Nextbtn' class="nextbtn-style" style="position: absolute;top: 5px;">Next</button>
    <button title="Navigate to secure Data Integration Platform URL" id='Closebtn' class="nextbtn-style" style="position: absolute;top: 5px;display:none" >Launch</button>
    </div>
</script>
