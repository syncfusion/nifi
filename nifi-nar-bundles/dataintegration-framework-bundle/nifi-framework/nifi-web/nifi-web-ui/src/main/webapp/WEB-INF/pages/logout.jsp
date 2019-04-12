<%@ page contentType="text/html" pageEncoding="UTF-8" session="false" %>
<!DOCTYPE html>
<html>
    <head>
        <title>Logout</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta http-equiv="X-UA-Compatible" content="IE=Edge">
        <link rel="stylesheet" href="assets/reset.css/reset.css" type="text/css" />
        <link rel="shortcut icon" href="images/data-integration.ico"/>
        <link rel="stylesheet" href="fonts/flowfont/flowfont.css" type="text/css" />
        <link rel="stylesheet" href="assets/font-awesome/css/font-awesome.min.css" type="text/css" />
        ${nf.logout.style.tags}
        ${nf.syncfusion.style.tags}
        <link rel="stylesheet" href="js/jquery/modal/jquery.modal.css?${project.version}" type="text/css" />
        <link rel="stylesheet" href="assets/qtip2/dist/jquery.qtip.min.css?" type="text/css" />
        <link rel="stylesheet" href="assets/jquery-ui-dist/jquery-ui.min.css" type="text/css" />
        <link rel="stylesheet" href="fonts/flowfont/flowfont.css" type="text/css" />
        <link rel="stylesheet" href="assets/angular-material/angular-material.min.css" type="text/css" />
        <link rel="stylesheet" href="assets/font-awesome/css/font-awesome.min.css" type="text/css" />
        <script type="text/javascript" src="assets/jquery/dist/jquery.min.js"></script>
        <script type="text/javascript" src="js/jquery/jquery.base64.js"></script>
        <script type="text/javascript" src="js/jquery/jquery.count.js"></script>
        <script type="text/javascript" src="js/jquery/jquery.center.js"></script>
        <script type="text/javascript" src="js/jquery/modal/jquery.modal.js?${project.version}"></script>
        <script type="text/javascript" src="assets/qtip2/dist/jquery.qtip.min.js"></script>
        <script type="text/javascript" src="assets/jquery-ui-dist/jquery-ui.min.js"></script>
        <script type="text/javascript" src="js/nf/nf-namespace.js?${project.version}"></script>
        ${nf.logout.script.tags}
    </head>
    <body id="ump-logout-page">
        <div id="ump-logout-container">
            <div id="ump-logout-logo">
                <div style="width: 100%;height: 100%;background: url(images/Login_Logo.png) no-repeat center;"></div>
            </div>
            <div class="ump-logout-align" style="margin-top: 20px; padding-bottom: 0px">
                <img src="images/divider_light.png" class="upper-divider" style="width: 100%;height:2px;">
            </div>
            <div class="ump-logout-align" id="ump-logout-msg">
                Welcome to Data Integration Platform
            </div>
            <div class="ump-logout-align" id="ump-login-btn-pnl">
                <button class="ump-button" id="umpLoginBtn">Login</button>
            </div>
        </div>
    </body>
</html>
