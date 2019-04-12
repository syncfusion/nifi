
<%@ page contentType="text/html" pageEncoding="UTF-8" session="false" %>
<div id="custom-jar-configuration">
    <div class="dialog-content">
        <div id="Ms-SQLJar-info-content" class="jar-info-content" >
        Microsoft-SQL controller services require jar files to be present in the SQL_jars folder (DIP\v-x.x\SDK\NIFI\SQL_jars) to enable controller service.
        Requested jar is subject to a license set by the jars provider. You have to accept this license to use the jar in any manner. <a href="https://download.microsoft.com/download/0/2/A/02AAE597-3865-456C-AE7F-613F99F850A8/enu/license60.txt" target="_blank" style="text-decoration:none;"> Read License </a> and <a href="https://download.microsoft.com/download/0/2/A/02AAE597-3865-456C-AE7F-613F99F850A8/enu/sqljdbc_6.0.8112.100_enu.tar.gz" target="_blank" style="text-decoration:none;">click here</a> to download.
         </div>
         <div id="MySQLJar-info-content" class="jar-info-content">
         MySQL controller services require jar files to be present in SQL_jars folder (DIP\v-x.x\SDK\NIFI\SQL_jars) to enable controller service. Requested jar is subject to a license set by the jars provider.
         You have to accept this license to use the jar in any manner. <a href="http://www.gnu.org/licenses/old-licenses/gpl-2.0.html" target="_blank" style="text-decoration:none;"> Read License </a> and <a href="https://dev.mysql.com/get/Downloads/Connector-J/mysql-connector-java-5.1.39.zip" target="_blank" style="text-decoration:none;">click here</a> to download.
         </div>
         <div id="Oracle-jar-info-content" class="jar-info-content">
         Oracle controller services require jar files to be present in SQL_jars folder (DIP\v-x.x\SDK\NIFI\SQL_jars) to enable controller service. Requested jar is subject to a license set by the jars provider. 
         You have to accept this license to use the jar in any manner <a href="http://www.oracle.com/technetwork/licenses/distribution-license-152002.html" target="_blank" style="text-decoration:none;"> Read License </a> and <a href="http://www.oracle.com/technetwork/database/enterprise-edition/jdbc-112010-090769.html" target="_blank" style="text-decoration:none;">click here</a> to download.
         </div>
        <div id="existing-jarinfo-content">
          <div id="upload-jar-panel">
            <div id="sqljar-jarinformation" style="line-height: 160%;font-size: 12px;">Please browse for the jar file to upload.</div>
              <form method="post" action="upload" enctype="multipart/form-data" id="jar-upload-form" class="ng-pristine ng-valid">
                <input type="text" name="uploadJarText" value="" id="jar-filetext-name" style="width: 71%;position:relative;top: 10px;" readonly>
                <input type="file" name="uploadJar" accept=".jar" id="jar-file-upload" style="display:none" onchange="jarFileSelect()"> 
	      </form>
             <button id="jar-file-field" title="Choose file" class="upload-jarform-styles" onclick="document.getElementById('jar-file-upload').click()">Choose file</button>
             </div>
          </div>
        <div id="uploadErrorMessage">Please choose a valid file</div>
        </div>
     <div id="loader-icon" class="upload-jar-loader"></div>
    </div>
</div>

<script>
function jarFileSelect()
{
   var selectedJarName=$("#jar-file-upload").val();
   var fileName =selectedJarName.match(/[^\/\\]+$/);
   document.getElementById('jar-filetext-name').value = fileName[0];
}
</script>
    
