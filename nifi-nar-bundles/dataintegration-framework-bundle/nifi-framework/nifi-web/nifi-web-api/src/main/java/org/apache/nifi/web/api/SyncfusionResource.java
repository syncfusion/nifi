package org.apache.nifi.web.api;

import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import com.wordnik.swagger.annotations.ApiResponse;
import com.wordnik.swagger.annotations.ApiResponses;
import com.wordnik.swagger.annotations.Authorization;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.CollectionType;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.sun.jersey.multipart.FormDataParam;
import com.google.gson.Gson;
import com.wordnik.swagger.annotations.ApiParam;
import java.io.File;
import java.io.FileInputStream;
import java.net.URI;
import java.util.ArrayList;
import java.util.Properties;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.apache.nifi.authentication.AuthenticationResponse;
import org.apache.nifi.authentication.LoginCredentials;
import org.apache.nifi.authentication.LoginIdentityProvider;
import org.apache.nifi.authentication.exception.IdentityAccessException;
import org.apache.nifi.authentication.exception.InvalidLoginCredentialsException;
import org.apache.nifi.util.NiFiProperties;
import org.apache.nifi.web.api.dto.ControllerServiceDTO;
import org.apache.nifi.web.api.dto.SyncfusionStatusDTO;
import org.apache.nifi.web.api.dto.status.ConnectionDetailsDTO;
import org.apache.nifi.web.api.dto.status.ControllerServiceDetailsDTO;
import org.apache.nifi.web.api.dto.status.ProcessGroupDetailsDTO;
import org.apache.nifi.web.api.dto.status.ProcessGroupStatusDTO;
import org.apache.nifi.web.api.dto.status.ProcessorDetailsDTO;
import org.apache.nifi.web.api.entity.ControllerServiceEntity;
import org.apache.nifi.web.api.entity.ControllerServicesEntity;
import org.apache.nifi.web.api.entity.ProcessGroupEntity;
import org.apache.nifi.web.api.entity.ProcessGroupsEntity;
import org.apache.nifi.web.api.entity.ProcessorEntity;
import org.apache.nifi.web.api.entity.ProcessorsEntity;
import org.apache.nifi.web.api.entity.SyncfusionStatusEntity;
import org.apache.nifi.web.security.jwt.JwtService;
import org.apache.nifi.web.security.token.LoginAuthenticationToken;
import org.apache.oltu.oauth2.client.OAuthClient;
import org.apache.oltu.oauth2.client.URLConnectionClient;
import org.apache.oltu.oauth2.client.request.OAuthClientRequest;
import org.apache.oltu.oauth2.client.response.OAuthAccessTokenResponse;
import org.apache.oltu.oauth2.common.exception.OAuthProblemException;
import org.apache.oltu.oauth2.common.exception.OAuthSystemException;
import org.apache.oltu.oauth2.common.message.types.GrantType;
import org.apache.oltu.oauth2.common.message.types.ResponseType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.cert.X509Certificate;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.xml.parsers.ParserConfigurationException;
import net.minidev.json.JSONObject;
import org.apache.http.HttpStatus;
import org.apache.nifi.controller.repository.claim.ContentDirection;
import org.apache.commons.io.FileUtils;
import org.apache.nifi.encrypt.StringEncryptor;
import org.apache.nifi.syncfusionutilities.QueryStringCasingHelper;
import org.apache.nifi.syncfusionutilities.AgentUtilities;
import org.apache.nifi.syncfusionutilities.SyncfusionConstants;
import org.apache.nifi.syncfusionutilities.TokenDetails;
import org.apache.nifi.syncfusionutilities.UMSApplication;
import org.apache.nifi.syncfusionutilities.TripleDESCipher;
import org.apache.nifi.syncfusionutilities.UMPClient;
import org.apache.nifi.syncfusionutilities.UMSCipher;
import org.apache.nifi.syncfusionutilities.UserResponseData;
import org.apache.nifi.web.DownloadableContent;
import org.apache.nifi.web.NiFiServiceFacade;
import static org.apache.nifi.web.api.AccessResource.GET;
import static org.apache.nifi.web.api.AccessResource.PASSWORD;
import static org.apache.nifi.web.api.AccessResource.SSL;
import static org.apache.nifi.web.api.AccessResource.USERNAME;
import static org.apache.nifi.web.api.ApplicationResource.NON_GUARANTEED_ENDPOINT;
import org.apache.nifi.web.api.dto.status.ConnectionsDTO;
import org.apache.nifi.web.api.dto.status.ProcessDTO;
import org.apache.nifi.web.api.dto.ReportingTaskDTO;
import org.apache.nifi.web.api.dto.RevisionDTO;
import org.apache.nifi.web.api.dto.UserDTO;
import org.apache.nifi.web.api.dto.provenance.ProvenanceDTO;
import org.apache.nifi.web.api.dto.provenance.ProvenanceEventDTO;
import org.apache.nifi.web.api.dto.provenance.ProvenanceResultsDTO;
import org.apache.nifi.web.api.entity.ProvenanceEntity;
import org.apache.nifi.web.api.entity.ReportingTaskEntity;
import org.apache.nifi.web.api.entity.ReportingTasksEntity;
import org.apache.nifi.web.api.entity.UserEntity;
import org.apache.nifi.web.api.entity.UsersEntity;
import org.apache.nifi.web.api.request.LongParameter;
import org.codehaus.jettison.json.JSONArray;
import org.xml.sax.SAXException;
import org.apache.nifi.syncfusion.util.SQLUpdater;

@Path("/syncfusion")
@Api(
        value = "/syncfusion",
        description = "Endpoints for obtaining an access token or checking access status."
)
public class SyncfusionResource extends ApplicationResource {
    
    private static final Logger logger = LoggerFactory.getLogger(SyncfusionResource.class);
    private LoginIdentityProvider loginIdentityProvider;
    
    private final String syncfusionProvider = "syncfusion-provider";
    private final String authorizeEndPoint = "/oauth/v1/authorize";
    private final String tokenEndPoint = "/oauth/token";
    private final String returnUrlEndPoint = "/dataintegration/login";
    private final String logoutEndPoint = "/dataintegration/logout";
    private final String startUpStr = "startUp";
    private final String baseUrlStr = "baseUrl";
    private final String clientIdStr = "clientId";
    private final String clientSecretStr = "clientSecret";
    private final String logoutStr = "logout";
    private final String providerFileStr="providerFile";
    private final String umpBaseUrlProperty="syncfusion.ump.server.base.address";
    private final String umpClientIdProperty="syncfusion.dip.client.id";
    private final String umpClientSecretProperty="syncfusion.dip.client.secret";
    private ProcessGroupResource processGroupResource;
    private FlowResource flowResource;
    private JwtService jwtService;
    private ControllerResource controllerResource;
    private TenantsResource tenantsResource;
    private ReportingTaskResource reportingTaskResource;
    private ProvenanceResource provenanceResource;
    private NiFiServiceFacade serviceFacade;
    
    public static NiFiProperties nifiProperties;
    
    List < String > defaultReportingTaskList = new ArrayList < > ();
     List < String > existingReportingTask = new ArrayList < > ();
     List < String > createdReprotingTaskId = new ArrayList();
    Connection con = null;
    Statement stmt = null;
    PreparedStatement statement = null;
    /**
     * Gets the status whether syncfusion provider enabled or not
     *
     * @param request the servlet request
     * @return A accessStatusEntity
     * @throws java.lang.Exception
     */
    @GET
    @Consumes(MediaType.WILDCARD)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/status")
    @ApiOperation(
            value = "Gets the status the client's access",
            notes = NON_GUARANTEED_ENDPOINT,
            response = SyncfusionStatusEntity.class
    )
    @ApiResponses(
            value = {
                    @ApiResponse(code = 400, message = "NiFi was unable to complete the request because it was invalid. The request should not be retried without modification."),
                    @ApiResponse(code = 401, message = "Unable to determine syncfusion provider status because the client could not be authenticated."),
                    @ApiResponse(code = 403, message = "Unable to determine syncfusion provider status because the client is not authorized to make this request."),
                    @ApiResponse(code = 409, message = "Unable to determine syncfusion provider status because NiFi is not in the appropriate state."),
                    @ApiResponse(code = 500, message = "Unable to determine syncfusion provider status because an unexpected error occurred.")
            }
    )
    public Response getEnabledStatus(@Context HttpServletRequest request) throws Exception {

        
        final SyncfusionStatusDTO syncfusionStatus = new SyncfusionStatusDTO();
        if(properties.getProperty(NiFiProperties.SECURITY_USER_LOGIN_IDENTITY_PROVIDER) != null &&
                syncfusionProvider.equals(properties.getProperty(NiFiProperties.SECURITY_USER_LOGIN_IDENTITY_PROVIDER))) {
            syncfusionStatus.setStatus(SyncfusionStatusDTO.Status.TRUE.name());
            syncfusionStatus.setMessage("Syncfusion Provider Enabled");
            
            if (loginIdentityProvider == null) {
                throw new IllegalStateException("Unable to get status whether Syncfusion provider enabled or not.");
            }
            
            String umpPropertiesFilePath=loginIdentityProvider.authenticate(new LoginCredentials(providerFileStr, "")).getUsername();
            Properties umpProperties=loadPropertiesFromUMPProviderFile(umpPropertiesFilePath);
            
            String umsBaseUrl=getUMPPropertyValue(baseUrlStr,umpProperties);
            String clientId=getUMPPropertyValue(clientIdStr,umpProperties);
            String clientSecret=getUMPPropertyValue(clientSecretStr,umpProperties);
            
            String returnUrl = request.getScheme() + "://" + request.getHeader("Host");
            
            if(clientId==null||clientSecret==null||"".equals(clientId)||"".equals(clientSecret)){
                syncfusionStatus.setKey(startUpStr);
                syncfusionStatus.setValue(trimUrl(umsBaseUrl)+"/en-us/startup?app_name=Syncfusion Data Integration Platform&app_url="+trimUrl(returnUrl)+"&app_configure=true&app_type=data-integration-platform&callback="+trimUrl(returnUrl)+returnUrlEndPoint);
            }
            else {
                syncfusionStatus.setKey(baseUrlStr);
                syncfusionStatus.setValue(
                        getAuthorizeUrl(getUMPPropertyValue(baseUrlStr, umpProperties), returnUrl + returnUrlEndPoint, getUMPPropertyValue(clientIdStr, umpProperties)));
            }
        }
        else {
            syncfusionStatus.setStatus(SyncfusionStatusDTO.Status.FALSE.name());
            syncfusionStatus.setMessage("Syncfusion Provider Not Enabled");
        }
        final SyncfusionStatusEntity entity = new SyncfusionStatusEntity();
        entity.setAccessStatus(syncfusionStatus);

        return generateOkResponse(entity).build();
    }
    
    /**
     * 
     * @param request
     * @return
     * @throws Exception 
     */
    @GET
    @Consumes(MediaType.WILDCARD)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/getumslogouturl")
    @ApiOperation(
            value = "Get UMS logout Url",
            notes = NON_GUARANTEED_ENDPOINT,
            response = SyncfusionStatusEntity.class,
            authorizations = {}
    )
    @ApiResponses(
            value = {
                    @ApiResponse(code = 400, message = "NiFi was unable to complete the request because it was invalid. The request should not be retried without modification."),
                    @ApiResponse(code = 401, message = "Unable to determine syncfusion provider status because the client could not be authenticated."),
                    @ApiResponse(code = 403, message = "Unable to determine syncfusion provider status because the client is not authorized to make this request."),
                    @ApiResponse(code = 409, message = "Unable to determine syncfusion provider status because NiFi is not in the appropriate state."),
                    @ApiResponse(code = 500, message = "Unable to determine syncfusion provider status because an unexpected error occurred.")
            }
    )
    public Response getUmsLogoutUrl(
            @Context HttpServletRequest request) throws Exception {
        final SyncfusionStatusDTO syncfusionStatus = new SyncfusionStatusDTO();
        
        String umpPropertiesFilePath=loginIdentityProvider.authenticate(new LoginCredentials(providerFileStr, "")).getUsername();
        Properties umpProperties=loadPropertiesFromUMPProviderFile(umpPropertiesFilePath);
        
        String umsBaseUrl=getUMPPropertyValue(baseUrlStr,umpProperties);
        String clientId=getUMPPropertyValue(clientIdStr,umpProperties);
        String redirectUri = request.getScheme() + "://" + request.getHeader("Host");
        
        syncfusionStatus.setKey(logoutStr);
        syncfusionStatus.setValue(trimUrl(umsBaseUrl)+"/oauth/logout?client_id=" + clientId + "&redirect_uri=" + trimUrl(redirectUri) + logoutEndPoint);
        final SyncfusionStatusEntity entity = new SyncfusionStatusEntity();
        entity.setAccessStatus(syncfusionStatus);
        
        return generateOkResponse(entity).build();
    }
    
      /**
     * Creates the reportingTask to monitor the disk space.
     * @param httpServletRequest
     * @return status code given path.
     * @throws java.net.MalformedURLException
     */  

 @GET
 @Consumes(MediaType.WILDCARD)
 @Produces(MediaType.APPLICATION_JSON)
 @Path("/reportingTask")
 @ApiOperation(
     value = "Create reporting task if the reportingTask not enabled",
     notes = NON_GUARANTEED_ENDPOINT,
     response = String.class,
     authorizations = {
         @Authorization(value = "Read - /flow", type = "")
     }
 )
 @ApiResponses(
     value = {
         @ApiResponse(code = 400, message = "Data Integration was unable to complete the request because it was invalid. The request should not be retried without modification."),
         @ApiResponse(code = 401, message = "Client could not be authenticated."),
         @ApiResponse(code = 403, message = "Client is not authorized to make this request."),
         @ApiResponse(code = 409, message = "The request was valid but Data Integration was not in the appropriate state to process it. Retrying the same request later may be successful.")
     }
 )

 public int CreateDataIntegrationReportingTask(@Context HttpServletRequest httpServletRequest) throws MalformedURLException, IOException {

     defaultReportingTaskList.clear();
     existingReportingTask.clear();
     createdReprotingTaskId.clear();
     //defaultReportingTaskList.add("Eden Space Memory Monitor");
     defaultReportingTaskList.add("Monitor Disk Usages in DIP");
     //defaultReportingTaskList.add("Survivor Space Memory Monitor");
     defaultReportingTaskList.add("Old Gen Memory Monitor");
     Response allReportingTaskId = flowResource.getReportingTasks();
     String sdkPath = new java.io.File(".").getCanonicalPath();
     String[] installedDrive=sdkPath.split(Pattern.quote("\\"));

     ReportingTasksEntity reportingTaskList = (ReportingTasksEntity) allReportingTaskId.getEntity();
     Set < ReportingTaskEntity > allReportingTask = reportingTaskList.getReportingTasks();

     allReportingTask.forEach((taskId) -> {
         String reportingTaskName = taskId.getComponent().getName();
         existingReportingTask.add(reportingTaskName);
     });
     defaultReportingTaskList.removeAll(existingReportingTask);
     
     if(defaultReportingTaskList.isEmpty()){
     return 200;
     }
     else{
     createReportingTask( httpServletRequest,installedDrive[0]);
     return updateCreatedReportingTask( httpServletRequest);
     }
 }
 
 public void createReportingTask(@Context HttpServletRequest httpServletRequest, String installedDrive){
     
     for (int i = 0; i < defaultReportingTaskList.size(); i++) {
        ReportingTaskEntity requestReportingTaskEntity = new ReportingTaskEntity();
        Map setReportingTaskProperties = new HashMap();
        ReportingTaskDTO setComponent = new ReportingTaskDTO();
        RevisionDTO revision = new RevisionDTO();
         
         setComponent.setSchedulingPeriod("5 mins");
         setComponent.setState("STOPPED");
         revision.setVersion(0L);
         revision.setClientId(String.valueOf(i));
         requestReportingTaskEntity.setRevision(revision);
         String filteredReportingTaskName = defaultReportingTaskList.get(i);
         if ("Monitor Disk Usages in DIP".equals(filteredReportingTaskName)) {
             setComponent.setType("org.apache.nifi.controller.MonitorDiskUsage");
             setComponent.setName(filteredReportingTaskName);
             setReportingTaskProperties.put("Threshold", "75%");
             setReportingTaskProperties.put("Directory Location", installedDrive);
             setReportingTaskProperties.put("Directory Display Name", "Syncfusion Data Integration Platform");
         } else {
             setComponent.setType("org.apache.nifi.controller.MonitorMemory");
             setComponent.setName(filteredReportingTaskName);
             setReportingTaskProperties.put("Memory Pool", "G1 " + filteredReportingTaskName.replace(" Memory Monitor", ""));
             setReportingTaskProperties.put("Usage Threshold", "75%");
             setReportingTaskProperties.put("Reporting Interval", "15 min");
         }
         setComponent.setProperties(setReportingTaskProperties);
         requestReportingTaskEntity.setComponent(setComponent);
         Response createdReportedTask = controllerResource.createReportingTask(httpServletRequest, requestReportingTaskEntity);
         ReportingTaskEntity createdReportingTaskDetails = (ReportingTaskEntity) createdReportedTask.getEntity();
         String createdReportingTaskId = createdReportingTaskDetails.getId();
         createdReprotingTaskId.add(createdReportingTaskId);

     }
 }
 
 public int updateCreatedReportingTask(@Context HttpServletRequest httpServletRequest){
     
     int status=0;
     //Update the created ReportingTask
     for (int i = 0; i < createdReprotingTaskId.size(); i++) {
        ReportingTaskEntity requestReportingTaskEntity = new ReportingTaskEntity();
        ReportingTaskDTO setComponent = new ReportingTaskDTO();
        RevisionDTO revision = new RevisionDTO();
        String reportingTaskId = createdReprotingTaskId.get(i);
        revision.setVersion(1L);
        revision.setClientId(String.valueOf(i));
        setComponent.setState("RUNNING");
        setComponent.setId(reportingTaskId);
        requestReportingTaskEntity.setId(reportingTaskId);
        requestReportingTaskEntity.setComponent(setComponent);
        requestReportingTaskEntity.setRevision(revision);
        Response updateReportingTask = reportingTaskResource.updateReportingTask(httpServletRequest, reportingTaskId, requestReportingTaskEntity);
        status = updateReportingTask.getStatus();
     }
     return status;
 }
 
    /**
     * Creates a token for accessing the REST API via username/password.
     *
     * @param httpServletRequest the servlet request
     * @param code
     * @return A JWT (string)
     */
    @POST
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    @Path("/token")
    @ApiOperation(
            value = "Creates a token for accessing the REST API via username/password",
            notes = "The token returned is formatted as a JSON Web Token (JWT). The token is base64 encoded and comprised of three parts. The header, " +
                    "the body, and the signature. The expiration of the token is a contained within the body. The token can be used in the Authorization header " +
                    "in the format 'Authorization: Bearer <token>'.",
            response = String.class
    )
    @ApiResponses(
            value = {
                    @ApiResponse(code = 400, message = "NiFi was unable to complete the request because it was invalid. The request should not be retried without modification."),
                    @ApiResponse(code = 403, message = "Client is not authorized to make this request."),
                    @ApiResponse(code = 409, message = "Unable to create access token because NiFi is not in the appropriate state. (i.e. may not be configured to support username/password login."),
                    @ApiResponse(code = 500, message = "Unable to create access token because an unexpected error occurred.")
            }
    )
    public Response createAccessToken(
            @Context HttpServletRequest httpServletRequest,
            @FormParam("code") String code) throws UnsupportedEncodingException, UnsupportedEncodingException, UnsupportedEncodingException {

        String codeStr = "code";
        
        // only support access tokens when communicating over HTTPS
        if (!httpServletRequest.isSecure()) {
            throw new IllegalStateException("Access tokens are only issued over HTTPS.");
        }

        // if not configuration for login, don't consider credentials
        if (loginIdentityProvider == null) {
            throw new IllegalStateException("Username/Password login not supported by this NiFi.");
        }
        
        if(code == null) {
            throw new IllegalArgumentException("Invalid access token");
        }
        
        final LoginAuthenticationToken loginAuthenticationToken;

        try {
            String umpPropertiesFilePath=loginIdentityProvider.authenticate(new LoginCredentials(providerFileStr, "")).getUsername();
            Properties umpProperties=loadPropertiesFromUMPProviderFile(umpPropertiesFilePath);
            
            // attempt to authenticate
            String returnUrl = httpServletRequest.getScheme() + "://" + httpServletRequest.getHeader("Host")
                    + returnUrlEndPoint;
            String responseString = getResponseString(getUMPPropertyValue(baseUrlStr, umpProperties), returnUrl, getUMPPropertyValue(clientIdStr, umpProperties),
                            getUMPPropertyValue(clientSecretStr, umpProperties), code);
            
            final AuthenticationResponse authenticationResponse = loginIdentityProvider.authenticate(new LoginCredentials(codeStr, responseString));
            long expiration = validateTokenExpiration(authenticationResponse.getExpiration(), authenticationResponse.getIdentity());

            // create the authentication token
            loginAuthenticationToken = new LoginAuthenticationToken(authenticationResponse.getIdentity(), expiration, authenticationResponse.getIssuer());
        } catch (final InvalidLoginCredentialsException | IdentityAccessException | OAuthSystemException | OAuthProblemException ex) {
            throw new IllegalArgumentException("Invalid access code. Please check user log for more details", ex);
        }

        // generate JWT for response
        final String token = jwtService.generateSignedToken(loginAuthenticationToken);

        // build the response
        final URI uri = URI.create(generateResourceUri("access", "token"));
        return generateCreatedResponse(uri, token).build();
    }
    
    /**
     *
     * @param request
     * @param username
     * @return
     * @throws java.net.MalformedURLException
     */
    @POST
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/get-ums-apps")
    @ApiOperation(
            value = "Get the syncfusion UMS application details through client ID,client secret and UMP base URL",
            notes = "returns the application details of corresponding user",
            response = String.class
    )
    @ApiResponses(
            value = {
               @ApiResponse(code = 400, message = "NiFi was unable to complete the request because it was invalid. The request should not be retried without modification."),
               @ApiResponse(code = 403, message = "Client is not authorized to make this request."),
               @ApiResponse(code = 409, message = "Unable to get UMS application deatils because NiFi is not in the appropriate state."),
               @ApiResponse(code = 500, message = "Unable to get UMS application details because an unexpected error occurred.")
            }
    )
    public Response getUMSApplicationDetails(@Context HttpServletRequest request,
            @FormParam("username") String username) throws MalformedURLException, IOException {
        StringBuilder response = new StringBuilder();
        String umpPropertiesFilePath = loginIdentityProvider.authenticate(new LoginCredentials(providerFileStr, ""))
                    .getUsername();
        Properties umpProperties = loadPropertiesFromUMPProviderFile(umpPropertiesFilePath);
        String baseUrl = getUMPPropertyValue(baseUrlStr,umpProperties);
        String applicationId = getUMPPropertyValue(clientIdStr,umpProperties);
        String applicationSecret = getUMPPropertyValue(clientSecretStr,umpProperties);
        String urlStr = trimUrl(baseUrl) + "/api/v1.0/users/" + username + "/apps";
        //String urlStr = trimUrl(baseUrl) + "/v1.0/users/" + username + "/apps"; //only for development purpose
        URL url = new URL(urlStr);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        connection.setRequestProperty("Authorization", "Bearer " + getAccessToken(baseUrl, applicationId, applicationSecret));
        connection.connect();
        try (BufferedReader readData = new BufferedReader(
                new InputStreamReader(connection.getInputStream()))) {
            String line;
            while ((line = readData.readLine()) != null) {
                response.append(line);
            }
        }
        ObjectMapper mapper = new ObjectMapper();
        TypeFactory typeFactory = mapper.getTypeFactory();
        CollectionType collectionType = typeFactory.constructCollectionType(ArrayList.class, UMSApplication.class);
        List<UMSApplication> applications = mapper.readValue(response.toString(), collectionType);
        applications.add(0, getUMS());
        return generateOkResponse(applications).build();
    }

    
    
     /**
     * Gets the users details from UMP server
     *
     * @param request   
     * @param baseUrl
     * @param applicationId
     * @param applicationSecret
     * @return A accessStatusEntity
     * @throws java.lang.Exception
     */
    @POST
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/getumpusers")
    @ApiOperation(
            value = "Get the syncfusion UMS user account details through client ID,client secret and UMP base URL",
            notes = "The user account details returned is formatted as a JSON . The response is base64 encoded and comprised of two parts. The key, "
            + "and the value. The UMS user details is a contained within the body. The user details will be used to "
            + "configure secure proeprties and restart the service.",
            response = String.class
    )
    @ApiResponses(
            value = {
               @ApiResponse(code = 400, message = "NiFi was unable to complete the request because it was invalid. The request should not be retried without modification."),
               @ApiResponse(code = 403, message = "Client is not authorized to make this request."),
               @ApiResponse(code = 409, message = "Unable to get UMS user deatils because NiFi is not in the appropriate state."),
               @ApiResponse(code = 500, message = "Unable to get UMS user details because an unexpected error occurred.")
            }
    )
    public Response getUMPUserDetails(@Context HttpServletRequest request,
            @FormParam("baseUrl") String baseUrl,
            @FormParam("applicationId") String applicationId,
            @FormParam("applicationSecret") String applicationSecret) throws Exception {

        final SyncfusionStatusDTO syncfusionStatus = new SyncfusionStatusDTO();

        List<String> usernames = getUsernames(baseUrl, applicationId, applicationSecret);

        syncfusionStatus.setKey("users");
        syncfusionStatus.setValue(usernames.stream()
                .collect(Collectors.joining(",")));
        syncfusionStatus.setMessage("Syncfusion UMS user account list");

        final SyncfusionStatusEntity entity = new SyncfusionStatusEntity();
        entity.setAccessStatus(syncfusionStatus);

        return generateOkResponse(entity).build();
    }
    
    
    @GET
    @Consumes(MediaType.WILDCARD)
    @Produces(MediaType.TEXT_PLAIN)
    @Path("/importumsusers")
    @ApiOperation(
            value = "Import UMS users into NiFi",
            notes = NON_GUARANTEED_ENDPOINT,
            response = String.class
    )
    @ApiResponses(
            value = {
                    @ApiResponse(code = 400, message = "NiFi was unable to complete the request because it was invalid. The request should not be retried without modification."),      
            }
    )
    public String importUmsUsers(
        @Context HttpServletRequest request) throws UnsupportedEncodingException, MalformedURLException, IOException {
        try {
            UsersEntity users = (UsersEntity)tenantsResource.getUsers().getEntity();
            List<String> dipUsers = users
                    .getUsers()
                    .stream()
                    .map(u -> u.getComponent().getIdentity())
                    .collect(Collectors.toList());
            
            String umpPropertiesFilePath = loginIdentityProvider.authenticate(new LoginCredentials(providerFileStr, ""))
                    .getUsername();
            Properties umpProperties = loadPropertiesFromUMPProviderFile(umpPropertiesFilePath);
            String umsBaseUrl = getUMPPropertyValue(baseUrlStr,umpProperties);
            String clientId = getUMPPropertyValue(clientIdStr,umpProperties);
            String clientSecret = getUMPPropertyValue(clientSecretStr,umpProperties);
            
            List<String> umsUsers = getUsernames(umsBaseUrl, clientId, clientSecret);
            List<String> createUserList = umsUsers.stream().filter(u -> !dipUsers.contains(u)).collect(Collectors.toList());
            
            createUserList.stream().forEach((String user) -> {
                UserEntity userEntity = new UserEntity();
                UserDTO userDto = new UserDTO();
                userDto.setIdentity(user);
                userEntity.setComponent(userDto);
                RevisionDTO revisionDto = new RevisionDTO();
                revisionDto.setVersion(Long.valueOf(0));
                userEntity.setRevision(revisionDto);
                tenantsResource.createUser(request, userEntity);
            });
        }
        catch(InvalidLoginCredentialsException | IdentityAccessException | IOException ex) {
            logger.error(ex.getMessage(), ex);
            throw new IllegalStateException("Unable to import users from User Management Server");
        }
        return SyncfusionConstants.Success;
    }
    
    /**
     * Decrypt the client secret key
     *
     * @param httpServletRequest the servlet request
     * @param clientSecret
     * @return A JWT (string)
     */
    @POST
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    @Path("/decryptclientsecret")
    @ApiOperation(
            value = "Decrypts the client secret key for UMS",
            notes = "Used to get the user details",
            response = String.class
    )
    @ApiResponses(
            value = {
                    @ApiResponse(code = 400, message = "NiFi was unable to complete the request because it was invalid. The request should not be retried without modification."),
                    @ApiResponse(code = 403, message = "Client is not authorized to make this request."),
                    @ApiResponse(code = 409, message = "Unable to decrypt client secret key because NiFi is not in the appropriate state. (i.e. may not be configured to support username/password login."),
                    @ApiResponse(code = 500, message = "Unable to decrypt client secret key because an unexpected error occurred.")
            }
    )
    public String decryptClientSecret(
            @Context HttpServletRequest httpServletRequest,
            @FormParam("clientSecret") String clientSecret) {
        try {
            return new UMSCipher().decrypt(new QueryStringCasingHelper().DecodeCasing(clientSecret, '-'));

        }
        catch(Exception ex){
            logger.error(ex.getMessage(), ex);
            return null;
        }
    }
    
    /**
     * Configure the ump
     *
     * @param request
     * @param hostname
     * @param baseUrl
     * @param clientId
     * @param clientSecret
     * @param isSecured
     * @param admin
     * @return A JWT (string)
     * @throws java.io.UnsupportedEncodingException
     * @throws java.net.MalformedURLException
     */
    @POST
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    @Path("/configureump")
    @ApiOperation(
            value = "update UMP configuration",
            notes = "Used to update ump configuration files",
            response = String.class
    )
    @ApiResponses(
            value = {
                    @ApiResponse(code = 400, message = "NiFi was unable to complete the request because it was invalid. The request should not be retried without modification."),
                    @ApiResponse(code = 403, message = "Client is not authorized to make this request."),
                    @ApiResponse(code = 409, message = "Unable to decrypt client secret key because NiFi is not in the appropriate state. (i.e. may not be configured to support username/password login."),
                    @ApiResponse(code = 500, message = "Unable to decrypt client secret key because an unexpected error occurred.")
            }
    )
    public String configureUMP(
            @Context HttpServletRequest request,
            @FormParam("hostname") String hostname,
            @FormParam("baseUrl") String baseUrl,
            @FormParam("clientId") String clientId,
            @FormParam("clientSecret") String clientSecret,
            @FormParam("admin") String admin,
            @FormParam("isSecured") boolean isSecured) throws Exception {
        
        ObjectMapper mapper=new ObjectMapper();
        UMPClient umpClient=new UMPClient();
        umpClient.UMPBaseUrl=baseUrl;
        umpClient.ClientId=clientId;
        umpClient.ClientSecret=new TripleDESCipher().encrypt(clientSecret);
        umpClient.Admin=admin;
        String jsonData=mapper.writeValueAsString(umpClient);
        
        String url = (isSecured)?"http://" + hostname + ":" + SyncfusionConstants.DataIntegrationAgentPortNo + SyncfusionConstants.UpdataUMPConfigurationAPI + "?isRestart=false":
                "http://" + hostname + ":" + SyncfusionConstants.DataIntegrationAgentPortNo + SyncfusionConstants.EnableSecurityUMPConfigurationAPI;
        String response=new AgentUtilities().getPostResponse(url, jsonData, "application/json; charset=UTF-8");
        return response.replaceAll("^\"|\"$", "");
    }
    
    /**
     *
     * @param request
     * @param baseUrl
     * @return
     * @throws MalformedURLException
     * @throws IOException
     */
    @POST
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    @Path("/isumpconfigured")
    @ApiOperation(
            value = "whether ump configured",
            notes = "Used to check whether ump is configured or not",
            response = String.class
    )
    @ApiResponses(
            value = {
                    @ApiResponse(code = 400, message = "NiFi was unable to complete the request because it was invalid. The request should not be retried without modification.")                    
            }
    )
    public String isUMPConfigured(
            @Context HttpServletRequest request,
            @FormParam("baseUrl") String baseUrl) throws MalformedURLException, IOException {
        int status;
        try {
            URL url = new URL(trimUrl(baseUrl)+SyncfusionConstants.IsUMSConfiguredAPI);
            HttpURLConnection conn = (HttpURLConnection)url.openConnection();
            conn.setRequestMethod("GET");
            conn.connect();
            status = conn.getResponseCode();
        }
        catch (Exception ex) {
            throw new IllegalStateException("Unable to contact User Management Server. Make sure User Management server running properly.");
        }
        switch (status) {
            case 200:
                return "true";
            case 417:
                return "false";
            default:
                throw new IllegalStateException("Unable to contact User Management Server. Please restart User Management Server or contact Syncfusion support.");
        }
    }
    
      /**
     * Configure the ump
     * @param request
     * @param hostname
     * @return A JWT (string)
     * @throws java.io.UnsupportedEncodingException
     * @throws java.net.MalformedURLException
     * @throws javax.crypto.BadPaddingException
     */
    @POST
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    @Path("/getnifidetails")
    @ApiOperation(
            value = "update UMP configuration",
            notes = "Used to update ump configuration files",
            response = String.class
    )
    @ApiResponses(
            value = {
                    @ApiResponse(code = 400, message = "NiFi was unable to complete the request because it was invalid. The request should not be retried without modification."),      
            }
    )
    public String getnifidetails(
        @Context HttpServletRequest request,@FormParam("hostname") String hostname) throws Exception {
        String nifiDetailsUrl = "http://" + hostname + ":" + SyncfusionConstants.DataIntegrationAgentPortNo + SyncfusionConstants.getNiFiDetails;
        return new AgentUtilities().getResponse(nifiDetailsUrl);
    }
    
     /**
     * Imports the specified Jar.
     *
     * @param jarName
     * @param httpServletRequest request
     * @param in                 The template stream
     * @return A templateEntity or an errorResponse XML snippet.
     * @throws InterruptedException if interrupted
     * @throws java.io.IOException
     */
    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.TEXT_PLAIN)
    @Path("{name}/uploadJar")
    @ApiResponses(
            value = {
                    @ApiResponse(code = 400, message = "NiFi was unable to complete the request because it was invalid. The request should not be retried without modification."),      
            }
    )
    public String uploadJar(
            @Context final HttpServletRequest httpServletRequest,
            @ApiParam(
                    value = "The jar name.",
                    required = true
            )
            @PathParam("name") final String jarName,
            @FormDataParam("uploadJar") final InputStream in) throws InterruptedException, IOException {
            String sdkDir = new java.io.File(".").getCanonicalPath();
            try {
            File sqlDir = new File(sdkDir + "/SQL_jars");
            if(!sqlDir.exists())
                sqlDir.mkdir();
            FileUtils.copyInputStreamToFile(in, new File(sqlDir + "/" + jarName));
            return "Success";
             }
            catch (IOException ex){
                 return "fail:" + ex;
             }
    }
    
     /**
     * Update the path in sql property Jar.
     *
     * @param request
     * @param dbType
     * @param jarFileName
     * @param updateType
     * @return A templateEntity or an errorResponse XML snippet.
     * @throws InterruptedException if interrupted
     * @throws java.io.IOException
     */
    @POST
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    @Path("/updateJarProperties")
    @ApiResponses(
            value = {
                    @ApiResponse(code = 400, message = "NiFi was unable to complete the request because it was invalid. The request should not be retried without modification."),      
            }
    )
    
    public String updateJarProperties(
        @Context HttpServletRequest request,@FormParam("dbType") String dbType,@FormParam("jarName") String jarFileName, 
            @FormParam("type") String updateType) throws Exception {
        SQLUpdater.updateValue(dbType, jarFileName, updateType);
        return "Success";
    }
     
    
     /**
     * Get the path value from sql property Property.
     *
     * @param request
     * @param dbType
     * @return A templateEntity or an errorResponse XML snippet.
     * @throws InterruptedException if interrupted
     * @throws java.io.IOException
     */
    @POST
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    @Path("/getSQLPropertiesValue")
    @ApiResponses(
            value = {
                    @ApiResponse(code = 400, message = "NiFi was unable to complete the request because it was invalid. The request should not be retried without modification."),      
            }
    )
    
    public String getSQLPropertiesValue(
        @Context HttpServletRequest request,@FormParam("dbType") String dbType) throws Exception {
        return SQLUpdater.getValue(dbType);
    }
    
    /**
     * Configure the ump
     * @param request
     * @param baseUrl
     * @param applicationId
     * @param applicationSecret
     * @return A JWT (string)
     * @throws java.io.UnsupportedEncodingException
     * @throws java.net.MalformedURLException
     */
    @POST
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    @Path("/enable-ums-user-access")
    @ApiOperation(
            value = "enable ums user access",
            notes = "Used to enable UMS user access",
            response = String.class
    )
    @ApiResponses(
            value = {
                    @ApiResponse(code = 400, message = "NiFi was unable to complete the request because it was invalid. The request should not be retried without modification."),      
            }
    )
    public String EnableUMSUserAccess(@Context HttpServletRequest request,
            @FormParam("baseUrl") String baseUrl,
            @FormParam("clientId") String applicationId,
            @FormParam("clientSecret") String applicationSecret) throws IOException {
        StringBuilder response=new StringBuilder();
        String token = getAccessToken(baseUrl, applicationId, applicationSecret);
        
        URL url = new URL(trimUrl(baseUrl) + "/api/v1.0/apps/"+applicationId);
        //URL url = new URL(trimUrl(baseUrl) + "/v1.0/apps/"+applicationId); //only for development purposes
		
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();

        Map<String, String> params = new HashMap<>();
        params.put("HasAccessToAllUsers", "true");

       StringBuilder parameters = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            parameters.append(URLEncoder.encode(entry.getKey(), "UTF-8")).append("=").append(URLEncoder.encode(entry.getValue(), "UTF-8")).append("&");
        }
        byte[] data = parameters.toString().getBytes();
        connection.setFixedLengthStreamingMode(data.length);
        connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        connection.setRequestMethod("PUT");
        connection.setRequestProperty("Authorization", "Bearer " + token);
        connection.setDoOutput(true);
        connection.connect();
        BufferedReader readData;
        try (OutputStream writeData = connection.getOutputStream()) {
            writeData.write(data);
            writeData.flush();
            readData = new BufferedReader(
                    new InputStreamReader(connection.getInputStream()));
            String line;
           while ((line = readData.readLine()) != null) {
               response.append(line);
            }
        }
        readData.close();
        return SyncfusionConstants.Success;
    }
    
    private String getResponseString(String baseUrl, String returnUrl, String clientId, String clientSecret,
            String accessCode) throws OAuthSystemException, OAuthProblemException {      
        OAuthClientRequest request = OAuthClientRequest
            	.tokenLocation(trimUrl(baseUrl) + tokenEndPoint)
                .setGrantType(GrantType.AUTHORIZATION_CODE)
                .setClientId(clientId)
                .setClientSecret(clientSecret)
                .setRedirectURI(returnUrl)
                .setCode(accessCode)
                .buildBodyMessage();

        OAuthClient oAuthClient = new OAuthClient(new URLConnectionClient());
        OAuthAccessTokenResponse oAuthResponse = oAuthClient.accessToken(request);
        return oAuthResponse.getAccessToken();
    }
    
    private String getAuthorizeUrl(String baseUrl, String returnUrl, String clientId) throws Exception {
        OAuthClientRequest oauthRequest = OAuthClientRequest
                .authorizationLocation(trimUrl(baseUrl) + authorizeEndPoint)
                .setClientId(clientId)
                .setRedirectURI(returnUrl)
                .setResponseType(ResponseType.CODE.toString())
                .setScope("ums:profile")
                .buildQueryMessage();
        return oauthRequest.getLocationUri();
    }
    
    private String trimUrl(String url) {
        if(url.endsWith("/")) {
            url = url.substring(0, url.length()-1);
        }
        return url;
    }
    
    private long validateTokenExpiration(long proposedTokenExpiration, String identity) {
        final long maxExpiration = TimeUnit.MILLISECONDS.convert(12, TimeUnit.HOURS);
        final long minExpiration = TimeUnit.MILLISECONDS.convert(1, TimeUnit.MINUTES);

        if (proposedTokenExpiration > maxExpiration) {
            logger.warn(String.format("Max token expiration exceeded. Setting expiration to %s from %s for %s", maxExpiration,
                    proposedTokenExpiration, identity));
            proposedTokenExpiration = maxExpiration;
        } else if (proposedTokenExpiration < minExpiration) {
            logger.warn(String.format("Min token expiration not met. Setting expiration to %s from %s for %s", minExpiration,
                    proposedTokenExpiration, identity));
            proposedTokenExpiration = minExpiration;
        }

        return proposedTokenExpiration;
    }
    
    public void setJwtService(JwtService jwtService) {
        this.jwtService = jwtService;
    }
    
    public void setLoginIdentityProvider(LoginIdentityProvider loginIdentityProvider) {
        this.loginIdentityProvider = loginIdentityProvider;
    }
    
    private Properties loadPropertiesFromUMPProviderFile(String path){
        try {
            File umpPropertiesFile=new File(path);
            if(umpPropertiesFile.exists()){
                Properties umpProperties = new Properties();
                try (FileInputStream inputStream = new FileInputStream(umpPropertiesFile)) {
                    umpProperties.load(inputStream);
                }
                return umpProperties;
            }
            else
                throw new IllegalStateException("UMS properties file does not exist");
        } catch (IOException | IllegalStateException e) {
            throw new IllegalStateException(e);
        }
    }
    
    private String getUMPPropertyValue(String identity, Properties umpProperties){
        switch(identity){
            case baseUrlStr:
                return umpProperties.getProperty(umpBaseUrlProperty);
            case clientIdStr:
                return umpProperties.getProperty(umpClientIdProperty);
            case clientSecretStr:
                return umpProperties.getProperty(umpClientSecretProperty);
            default:
                throw new IllegalStateException("Invalid syncfusion provider property");
        }
    }   
    
     private String getAccessToken(String baseUrl, String applicationId,
        String applicationSecret) throws MalformedURLException, IOException {
        StringBuilder response = new StringBuilder();
		
        URL url = new URL(trimUrl(baseUrl) + "/api/token");
        //URL url = new URL(trimUrl(baseUrl) + "/token"); //only for development purposes
		
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();

        Map<String, String> params = new HashMap<>();
        params.put("grant_type", "client_credentials");
        params.put("client_id", applicationId);
        params.put("client_secret", applicationSecret);

       StringBuilder parameters = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            parameters.append(URLEncoder.encode(entry.getKey(), "UTF-8")).append("=").append(URLEncoder.encode(entry.getValue(), "UTF-8")).append("&");
        }
        byte[] data = parameters.toString().getBytes();
        connection.setFixedLengthStreamingMode(data.length);
        connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        connection.setRequestMethod("POST");
        connection.setDoOutput(true);
        connection.connect();
        BufferedReader readData;
        try (OutputStream writeData = connection.getOutputStream()) {
            writeData.write(data);
            writeData.flush();
            readData = new BufferedReader(
                    new InputStreamReader(connection.getInputStream()));
            String line;
           while ((line = readData.readLine()) != null) {
               response.append(line);
            }
        }
        readData.close();
       ObjectMapper mapper = new ObjectMapper();
        String accessToken = mapper.readValue(response.toString(), TokenDetails.class).Access_Token;
        return accessToken;
    }

    private UserResponseData getUserDetails(String baseUrl, String applicationId, String token, 
            int page, int pageSize) throws MalformedURLException, IOException {
        StringBuilder response = new StringBuilder();
        String urlStr = trimUrl(baseUrl) + "/api/v1.0/apps/" + applicationId + "/users";
        //String urlStr = trimUrl(baseUrl) + "/v1.0/apps/" + applicationId + "/users"; //only for development purpose
        if(page != 0 && pageSize != 0) {
            urlStr += "?page=" + page + "&page_size=" + pageSize;
        }
        URL url = new URL(urlStr);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        connection.setRequestProperty("Authorization", "Bearer " + token);
        connection.connect();
        try (BufferedReader readData = new BufferedReader(
                new InputStreamReader(connection.getInputStream()))) {
            String line;
            while ((line = readData.readLine()) != null) {
                response.append(line);
            }
        }
        ObjectMapper mapper = new ObjectMapper();
        return mapper.readValue(response.toString(), UserResponseData.class);
    }

    private List<String> getUsernames(String baseUrl, String applicationId,
            String applicationSecret) throws IOException {
        String token = getAccessToken(baseUrl, applicationId, applicationSecret);
        List<String> users = new ArrayList<>();
        UserResponseData userData = getUserDetails(baseUrl, applicationId, 
                token, 0, 0);
        users.addAll(userData.Data.stream().map(u -> u.Username).collect(Collectors.toList()));
        int pageSize = 25;
        int pages = (int) ((userData.TotalCount + pageSize - 1) / pageSize);        
        for(int page=2; page<=pages; page++) {
            users.addAll(getUserDetails(baseUrl, applicationId, 
                token, page, pageSize).Data.stream().map(u -> u.Username).collect(Collectors.toList()));
        }
        return users;
    }
    
    @GET
    @Consumes(MediaType.WILDCARD)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/getdatasource")
    @ApiResponses(
            value = {
                    @ApiResponse(code = 400, message = "DataIntegration was unable to complete the request because it was invalid. The request should not be retried without modification."),
                    @ApiResponse(code = 401, message = "Client could not be authenticated."),
                    @ApiResponse(code = 403, message = "Client is not authorized to make this request."),
                    @ApiResponse(code = 404, message = "The specified resource could not be found."),
                    @ApiResponse(code = 409, message = "The request was valid but DataIntegration was not in the appropriate state to process it. Retrying the same request later may be successful.")
            }
    )
    public String getDataSource() throws IOException, InterruptedException{
        return generateJsonResult();
    }
    
    private String generateJsonResult() throws IOException, InterruptedException{
        Map<String, List<ControllerServiceDetailsDTO>> sourceServiceList = getAllSource();
        List<ProcessDTO> processGroup = new ArrayList<>();
        String JsonString = "";
        
        for(int count=0; count<sourceServiceList.size(); count++){
            processGroup.add(getProcessGroupDetails(sourceServiceList.get(Integer.toString(count))));
        }
        
        ObjectMapper mapper = new ObjectMapper();
        JsonString = mapper.writeValueAsString(processGroup);
        
        return JsonString;
    }
    
    private Map<String, List<ControllerServiceDetailsDTO>> getAllSource() throws InterruptedException{
        Map<String, List<ControllerServiceDetailsDTO>> processGroupDetails = new HashMap<>();
        int controllerServiceCount = 0;
        
        List<ProcessGroupDetailsDTO> processGroupsDetails = getAllProcessGroups();
        for(int iteration=0; iteration<processGroupsDetails.size(); iteration++){
            List<ControllerServiceDetailsDTO> controllerServiceList = getControllerService(processGroupsDetails, iteration);
            if(controllerServiceList.size()>0){
                processGroupDetails.put(Integer.toString(controllerServiceCount), getControllerService(processGroupsDetails, iteration));
                controllerServiceCount = controllerServiceCount+1;
            }
        }
        
        return processGroupDetails;
    }    
    
    private List<ProcessGroupDetailsDTO> getAllProcessGroups(){
        List<ProcessGroupDetailsDTO> processGroupDetailsList = new ArrayList<>();
        processGroupDetailsList = getProcessGroups("root", processGroupDetailsList);
        return processGroupDetailsList;
    }
    
     private List<ProcessGroupDetailsDTO> getProcessGroups(String groupId, List<ProcessGroupDetailsDTO> processGroupDetailsList){
        Response response = processGroupResource.getProcessGroups(groupId);
        ProcessGroupsEntity processGroups = (ProcessGroupsEntity)response.getEntity();
        Set<ProcessGroupEntity> entities =  processGroups.getProcessGroups();
        List<ProcessGroupEntity> procesGroupList = new ArrayList<>(entities);
        
        for(int iteration = 0; iteration<procesGroupList.size(); iteration++) {
            ProcessGroupStatusDTO processGroupStatus = procesGroupList.get(iteration).getStatus();
            ProcessGroupDetailsDTO processGroupDetails = new ProcessGroupDetailsDTO();
            processGroupDetails.setProcessGroupId(processGroupStatus.getId());
            processGroupDetails.setProcessGroupName(processGroupStatus.getName());
            processGroupDetailsList.add(processGroupDetails);
            List<ProcessGroupDetailsDTO> processGroup = getProcessGroups(processGroupStatus.getId(), processGroupDetailsList);
        }
        return processGroupDetailsList;
    }
    
    private List<ControllerServiceDetailsDTO> getControllerService(List<ProcessGroupDetailsDTO> processGroupsDetails, int iteration) 
            throws InterruptedException{
        List<ControllerServiceDetailsDTO> controllerServiceList = new ArrayList<>();
        String groupId = processGroupsDetails.get(iteration).getProcessGroupId();
        String groupName = processGroupsDetails.get(iteration).getProcessGroupName();
        Response controllerServiceResponse = null;
        
        controllerServiceResponse = flowResource.getControllerServicesFromGroup(groupId, true, false);
            
        ControllerServicesEntity services = (ControllerServicesEntity)controllerServiceResponse.getEntity();
        controllerServiceList = getControllerServiceList(groupId, groupName, services, controllerServiceList);
        return controllerServiceList;
    }
    
    private List<ControllerServiceDetailsDTO> getControllerServiceList(String groupId, String groupName, ControllerServicesEntity services,
            List<ControllerServiceDetailsDTO> controllerServiceList){
        
        List<ProcessorDetailsDTO> userDefinedServiceList = getUserDefinedValues(groupId);
        Set<ControllerServiceEntity> controllerServiceEntities = services.getControllerServices();
        
        userDefinedServiceList.forEach((service) -> {
            if(service.getConnectionId().length()==0){
                ControllerServiceDetailsDTO serviceDetailsObject = new ControllerServiceDetailsDTO();
                ControllerServiceEntity controllerService = new ControllerServiceEntity();
                controllerService.setComponent(new ControllerServiceDTO());
                serviceDetailsObject.setControllerService(controllerService);
                serviceDetailsObject = setServiceDetails(groupId, groupName, service, serviceDetailsObject);
                controllerServiceList.add(serviceDetailsObject);
                return;
            }
            controllerServiceEntities.forEach((entity) -> {
                if(service.getConnectionId().contains(entity.getComponent().getId())){
                    ControllerServiceDetailsDTO serviceDetailsObject = new ControllerServiceDetailsDTO();
                    serviceDetailsObject.setControllerService(entity);
                    serviceDetailsObject = setServiceDetails(groupId, groupName, service, serviceDetailsObject);
                    controllerServiceList.add(serviceDetailsObject);
                }
            });
        });
        
        return controllerServiceList;
    }
    
    private List<ProcessorDetailsDTO> getUserDefinedValues(String groupId){
        List<ProcessorDetailsDTO> processorDetails = new ArrayList<>();
        Response response = processGroupResource.getProcessors(groupId, false);
        ProcessorsEntity processorsEntity = (ProcessorsEntity)response.getEntity();
        Set<ProcessorEntity> processorSet = processorsEntity.getProcessors();
        processorSet.forEach((entity) -> {
            String processorType = entity.getComponent().getType();
            if(processorType.contains("PublishDataSource")){
                processorDetails.add(getProcessDetailsList(entity));
            }
        });  
        return processorDetails;
    }
    
    private ProcessorDetailsDTO getProcessDetailsList(ProcessorEntity entity){
        ProcessorDetailsDTO processorDetailsObj = new ProcessorDetailsDTO();
        String processorName = entity.getComponent().getName();
        processorDetailsObj.setProcessorName(processorName!=null?processorName:"");
        String processorId = entity.getComponent().getId();
        processorDetailsObj.setProcessorId(processorId!=null?processorId:"");
        String connectionType = entity.getComponent().getConfig().getProperties().get("Connection Type");
        processorDetailsObj.setConnectionType(connectionType!=null?connectionType:"");
        String connectionId = entity.getComponent().getConfig().getProperties().get("Database Connection Pooling Service");
        processorDetailsObj.setConnectionId(connectionId!=null?connectionId:"");
        String tableName = entity.getComponent().getConfig().getProperties().get("Table Name");
        processorDetailsObj.setTableName(tableName!=null?tableName:"");
        String flatFileLocation = entity.getComponent().getConfig().getProperties().get("Flat file location");
        processorDetailsObj.setFileLocation(flatFileLocation!=null?flatFileLocation:"");
        String azureAccountNumber = entity.getComponent().getConfig().getProperties().get("Azure account number");
        processorDetailsObj.setAzureAccountName(azureAccountNumber!=null?azureAccountNumber:"");
        String azureAccountKey = entity.getComponent().getConfig().getProperties().get("Azure account key");
        processorDetailsObj.setAzureAccountKey(azureAccountKey!=null?azureAccountKey:"");

        return processorDetailsObj;
    }
    
    private ControllerServiceDetailsDTO setServiceDetails(String groupId, String groupName, ProcessorDetailsDTO service,
            ControllerServiceDetailsDTO serviceDetailsObject){
        serviceDetailsObject.setProcessGroupId(groupId);
        serviceDetailsObject.setProcessGroupName(groupName);
        serviceDetailsObject.setProcessorId(service.getProcessorId());
        serviceDetailsObject.setProcessorName(service.getProcessorName());
        serviceDetailsObject.setConnectionType(service.getConnectionType());
        serviceDetailsObject.setTableName(service.getTableName()!=null?service.getTableName():"");
        serviceDetailsObject.setflatFileLocation(service.getFileLocation()!=null?service.getFileLocation():"");
        serviceDetailsObject.setAzureConnectionName(service.getAzureAccountName()!=null?service.getAzureAccountName():"");
        serviceDetailsObject.setAzureConnectionKey(service.getAzureAccountKey()!=null?service.getAzureAccountKey():"");

        return serviceDetailsObject;
    }
    
    private ProcessDTO getProcessGroupDetails(List<ControllerServiceDetailsDTO> connections){
        ConnectionDetailsDTO connectionDetail = new ConnectionDetailsDTO();
        List<ConnectionDetailsDTO> connectionDetails = new ArrayList<>();
        ProcessDTO process = new ProcessDTO();
        List<ConnectionsDTO> connectionList = new ArrayList();
        String processGroupName = "";
        String processGroupId = "";
        
        for(int count=0;count<connections.size(); count++){
            processGroupId = connections.get(count).getProcessGroupId();
            processGroupName = connections.get(count).getProcessGroupName();
            if(processGroupId != null && processGroupName != null){
                connectionDetail.setProcessGroupId(processGroupId);
                connectionDetail.setProcessGroupName(processGroupName);
                break;
            }
        }        
        
        connections.forEach((serviceDetails) -> {
            connectionList.add(getConnectionDetails(serviceDetails));
        });
        connectionDetail.setConnections(connectionList);
        connectionDetails.add(connectionDetail);
        process.setProcessDetails(connectionDetails);
        return process;
    }
    
    private ConnectionsDTO getConnectionDetails(ControllerServiceDetailsDTO connection){
        String connectionType = connection.getControllerService().getComponent().getType();
        String connectionUrl = "", newConnectionType = "";
        String type = "";
        
        if(connectionType != null){
            if(connectionType.contains("DBCPConnectionPool")){
                connectionUrl = connection.getControllerService().getComponent().getProperties().get("Database Connection URL");
                type = "dbcpConnection";
            } else if(connectionType.contains("MicrosoftSQLServer")||connectionType.contains("MySQL")||
                    connectionType.contains("PostgreSQL")||connectionType.contains("Oracle")){
                if(connectionType.contains("MicrosoftSQLServer"))
                    newConnectionType = "sqlserver";
                else if(connectionType.contains("MySQL"))
                    newConnectionType = "mysql";
                else if(connectionType.contains("PostgreSQL"))
                    newConnectionType = "postgresql";
                else if(connectionType.contains("Oracle"))
                    newConnectionType = "oracle";
                connectionUrl = "custom:" + newConnectionType;
                type = "dbcpConnection";
            } else{
                connectionUrl = connection.getControllerService().getComponent().getProperties().get("hive-db-connect-url");
                type = "hiveConnection";
            }
        }
        
        return GetDetailsFromType(connection, connectionUrl, type);
    }
    
    private ConnectionsDTO GetDetailsFromType(ControllerServiceDetailsDTO connection, String connectionUrl, String type){
        String serverName = "", portNumber = "", databaseName = "";        
        ConnectionsDTO connectionDetails = new ConnectionsDTO();
        connectionUrl = (connectionUrl!=null&&connectionUrl !="")?connectionUrl:"";
        String connectionType = (connectionUrl !="" && connectionUrl.contains(":"))?connectionUrl.split(":")[1]:"";
        
        switch(connectionType){
            case "sqlserver": //sampl Url: jdbc:sqlserver://<ipaddress>or<hostname>:<portno>;databse=<databasename> 
                connectionDetails = getSqlServerConnectionDetails(connectionUrl, connection, type);
                break;
            case "oracle": //sample Url: jdbc:oracle:thin:@{IP address}:<portno>:{ dbname } 
                connectionDetails = getOracleConnectionDetails(connectionUrl, connection, type);                
                break;
            case "mysql": //sample Url: jdbc:mysql://{IP address}:<portno>/{dbname} 
                connectionDetails = getMySqlConnectionDetails(connectionUrl, connection, type);
                break;
            case "postgresql": //sample Url: jdbc:postgresql://host:port/database
                connectionDetails = getPostgresqlConnectionDetails(connectionUrl, connection, type);
                break;
            case "sqlite": //sample Url: jdbc:sqlite:<dbfile.db>
                databaseName = (connectionUrl.contains(":"))? connectionUrl.split(":")[(connectionUrl.split(":").length)-1]:"";
                
                connectionDetails = generateResponse(serverName, databaseName, connection, connectionUrl, "SQLite", type, portNumber);
                break;
            case "hive2": //sample Url: jdbc:hive2://localhost:10000/default;auth=noSasl;
                String tempHiveDetails = connectionUrl.contains("//")?connectionUrl.split("//")[1]:"";
                String tempHiveDatabaseName = tempHiveDetails.contains("/")?tempHiveDetails.split("/")[1]:"";
                databaseName = tempHiveDatabaseName.contains(";")?tempHiveDatabaseName.split(";")[0]:tempHiveDatabaseName;
                String hiveDbDetails = tempHiveDetails.contains("/")?tempHiveDetails.split("/")[0]:tempHiveDetails;
                serverName = hiveDbDetails.contains(":")?hiveDbDetails.split(":")[0]:hiveDbDetails;
                portNumber = hiveDbDetails.contains(":")?hiveDbDetails.split(":")[1]:"";
                
                connectionDetails = generateResponse(serverName, databaseName, connection, connectionUrl, "Hive2", type, portNumber);
                break;
            default:                
                connectionDetails = generateResponse(serverName, databaseName, connection, connectionUrl, "", type, portNumber);
                break;
        }
        return connectionDetails;
    }
    
    private ConnectionsDTO getSqlServerConnectionDetails(String connectionUrl, ControllerServiceDetailsDTO connection, String type){
        String serverName ="";
        String databaseName = "";
        String portNumber = "";
        if(connectionUrl.split(":")[0].equals("custom")){
            Map<String, String> connectionProperties = connection.getControllerService().getComponent().getProperties();
            if(connectionProperties == null)
                connectionProperties = new HashMap<>();
            serverName = (connectionProperties.get("Server Name")!=null)?connectionProperties.get("Server Name"):"";
            portNumber = (connectionProperties.get("Server Port")!=null)?connectionProperties.get("Server Port"):"1433";
            databaseName = (connectionProperties.get("Database Name")!=null)?connectionProperties.get("Database Name"):"";
            connectionUrl = "jdbc:sqlserver://"+serverName+":"+portNumber+";databse="+ databaseName;
        } else {
            String tempSqlServerDetails = connectionUrl.contains("//")?connectionUrl.split("//")[1]:"";
            String tempDatabaseName = tempSqlServerDetails.contains(";")?tempSqlServerDetails.split(";")[1]:"";
            databaseName = tempDatabaseName.contains("=")? tempDatabaseName.split("=")[1]: "";
            String tempSqlServerName = tempSqlServerDetails.contains(";")?tempSqlServerDetails.split(";")[0]:"";
            serverName = tempSqlServerName.contains(":")?tempSqlServerName.split(":")[0]:tempSqlServerName;
            portNumber = tempSqlServerName.contains(":")?tempSqlServerName.split(":")[1]:"";
        }
        
        return generateResponse(serverName, databaseName, connection, connectionUrl, "Microsoft SQL Server", type, portNumber);
    }
    
    private ConnectionsDTO getOracleConnectionDetails(String connectionUrl, ControllerServiceDetailsDTO connection, String type){
        String serverName ="";
        String databaseName = "";
        String portNumber = "";
        if(connectionUrl.split(":")[0].equals("custom")){
            Map<String, String> connectionProperties = connection.getControllerService().getComponent().getProperties();
            if(connectionProperties == null)
                connectionProperties = new HashMap<>();
            serverName = (connectionProperties.get("Server Name")!=null)?connectionProperties.get("Server Name"):"";
            portNumber = (connectionProperties.get("Server Port")!=null)?connectionProperties.get("Server Port"):"1521";
            databaseName = (connectionProperties.get("Database Name")!=null)?connectionProperties.get("Database Name"):"";
            connectionUrl = "jdbc:oracle:thin:@"+serverName+":"+portNumber+":"+databaseName; 
        } else {
            String tempOracleDetails = connectionUrl.contains("@")?connectionUrl.split("@")[1]:"";
            String tempServerName = tempOracleDetails.contains(":")?tempOracleDetails.split(":")[0]:"";
            serverName = tempServerName.contains("//")?tempServerName.replace("//", ""):tempServerName;
            if(tempOracleDetails.contains(":")){
                if(tempOracleDetails.split(":").length >= 3){
                    databaseName = tempOracleDetails.split(":")[2];
                    portNumber = tempOracleDetails.split(":")[1];
                }
                if(tempOracleDetails.split(":").length >= 2)
                    databaseName = tempOracleDetails.split(":")[1];
            }
        }
        
        return generateResponse(serverName, databaseName, connection, connectionUrl, "Oracle", type, portNumber);
    }
    
    private ConnectionsDTO getMySqlConnectionDetails(String connectionUrl, ControllerServiceDetailsDTO connection, String type){
        String serverName ="";
        String databaseName = "";
        String portNumber = "";
        if(connectionUrl.split(":")[0].equals("custom")){
            Map<String, String> connectionProperties = connection.getControllerService().getComponent().getProperties();
            if(connectionProperties == null)
                connectionProperties = new HashMap<>();
            serverName = (connectionProperties.get("Server Name")!=null)?connectionProperties.get("Server Name"):"";
            portNumber = (connectionProperties.get("Server Port")!=null)?connectionProperties.get("Server Port"):"3306";
            databaseName = (connectionProperties.get("Database Name")!=null)?connectionProperties.get("Database Name"):"";
            connectionUrl = "jdbc:mysql://"+serverName+":"+portNumber+"/"+databaseName; 
        } else {
            String tempMySqlDetails = connectionUrl.contains("//")?connectionUrl.split("//")[1]:"";
            databaseName = tempMySqlDetails.contains("/")?tempMySqlDetails.split("/")[1]:"";
            String tempMySqlServer = tempMySqlDetails.contains("/")?tempMySqlDetails.split("/")[0]:tempMySqlDetails;
            serverName = tempMySqlServer.contains(":")?tempMySqlServer.split(":")[0]:tempMySqlServer;
            portNumber = tempMySqlServer.contains(":")?tempMySqlServer.split(":")[1]:"";
        }
        
        return generateResponse(serverName, databaseName, connection, connectionUrl, "MySQL", type, portNumber);
    }
    
    private ConnectionsDTO getPostgresqlConnectionDetails(String connectionUrl, ControllerServiceDetailsDTO connection, String type){
        String serverName ="";
        String databaseName = "";
        String portNumber = "";
        if(connectionUrl.split(":")[0].equals("custom")){
            Map<String, String> connectionProperties = connection.getControllerService().getComponent().getProperties();
            if(connectionProperties == null)
                connectionProperties = new HashMap<>();
            serverName = (connectionProperties.get("Server Name")!=null)?connectionProperties.get("Server Name"):"";
            portNumber = (connectionProperties.get("Server Port")!=null)?connectionProperties.get("Server Port"):"5432";
            databaseName = (connectionProperties.get("Database Name")!=null)?connectionProperties.get("Database Name"):"";
            connectionUrl = "jdbc:postgresql://"+serverName+":"+portNumber+"/"+databaseName;
        } else {
            String tempDetails = connectionUrl.contains("//")?connectionUrl.split("//")[1]:connectionUrl;
            if(connectionUrl.contains("//")){
                databaseName = tempDetails.contains("/")?tempDetails.split("/")[1]:"";
                String dbDetails = tempDetails.contains("/")?tempDetails.split("/")[0]:"";
                serverName = dbDetails.contains(":")?dbDetails.split(":")[0]:dbDetails;
                portNumber = dbDetails.contains(":")?dbDetails.split(":")[1]:"";
            } else{
                if(tempDetails.contains(":") && tempDetails.split(":").length >= 3)
                    databaseName = tempDetails.split(":")[2];
            }
        }
        
        return generateResponse(serverName, databaseName, connection, connectionUrl, "PostgreSQL", type, portNumber);
    }
    
    private ConnectionsDTO generateResponse(String serverName, String databaseName, ControllerServiceDetailsDTO connection, 
            String connectionUrl, String datasourceName, String type, String portNumber){
        ConnectionsDTO connectionDetails = new ConnectionsDTO();
        String connectionType = connection.getConnectionType()!=null?connection.getConnectionType():"";
        connectionDetails.setProcessorId(connection.getProcessorId());
        connectionDetails.setProcessorName(connection.getProcessorName());
        if(connectionType.contains("Database connection")){
            connectionDetails = getDatabaseConnection(serverName, databaseName, connection, connectionUrl, 
                    datasourceName, type, connectionDetails, portNumber);
        } else if(connectionType.contains("Files")){
            String flatFileLocation = connection.getflatFileLocation()!=null? connection.getflatFileLocation():"";
            connectionDetails.setFilePath(flatFileLocation);
        } else if(connectionType.contains("Azure Table Storage")){
            connectionDetails.setAccountName(connection.getAzureConnectionName()!=null?connection.getAzureConnectionName():"");
            connectionDetails.setAccountKey(connection.getAzureConnectionKey()!=null?connection.getAzureConnectionKey():"");
        }
        
        return connectionDetails;
    }
    
    private ConnectionsDTO getDatabaseConnection(String serverName, String databaseName, ControllerServiceDetailsDTO connection, 
            String connectionUrl, String datasourceName, String type, ConnectionsDTO connectionDetails, String portNumber){
        Map<String, String> connectionProperties = connection.getControllerService().getComponent().getProperties();
        if(connectionProperties == null)
            connectionProperties = new HashMap<>();
        String connectionId = connection.getControllerService().getId();
        connectionDetails.setConnectionId(connectionId!=null?connectionId:"");
        String connectionName = connection.getControllerService().getComponent().getName();
        connectionDetails.setConnectionName(connectionName!=null?connectionName:"");
        connectionDetails.setConnectionType(datasourceName);
        connectionDetails.setserverName(serverName);
        if(connectionProperties.get("Authentication Type")!=null)
             connectionDetails.setAuthenticationType(connectionProperties.get("Authentication Type")!=null?connectionProperties.get("Authentication Type"):"SQL Server Authentication");
        else
            connectionDetails.setAuthenticationType(connectionUrl.toLowerCase().contains("integrated security")?"Windows Authentication":"SQL Server Authentication");
        if(type.contains("dbcpConnection")){
            connectionDetails.setuserName((connectionProperties.get("Database User")!=null)?connectionProperties.get("Database User"):"");
            connectionDetails.setPassword((connectionProperties.get("Password")!=null)?connectionProperties.get("Password"):"");
        } else{
            connectionDetails.setuserName((connectionProperties.get("hive-db-user")!=null)?connectionProperties.get("hive-db-user"):"");
            connectionDetails.setPassword((connectionProperties.get("hive-db-password")!=null)?connectionProperties.get("hive-db-password"):"");
        }
        connectionDetails.setDatabase(databaseName);
        connectionDetails.setPortNumber(portNumber);
        String hiveType = portNumber.contains("10000")||portNumber.contains("10001")
                ?portNumber.contains("10000")?"Hive":"Spark Sql"
                :"";
        connectionDetails.setHiveType(hiveType!=""?hiveType:null);
        connectionDetails.setConnectionUrl(connectionUrl);
        connectionDetails.setservice(null);
        String tableName = connection.getTableName();
        connectionDetails.setTableName(tableName!=null?tableName:"");
        return connectionDetails;
    }
    
    /**
     * Gets the data for the specified component id.
     *
     * @param httpServletRequest
     * @param requestProvenanceEntity
     * @return A DataPreviewResponse
     */
    @POST
    @Consumes(MediaType.WILDCARD)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("getdatapreview")
    @ApiOperation(
            value = "Gets a provenance query",
            response = ProvenanceEntity.class,
            authorizations = {
                @Authorization(value = "Read - /provenance", type = ""),
                @Authorization(value = "Read - /data/{component-type}/{uuid}", type = "")
    }
    )
    @ApiResponses(
            value = {
                @ApiResponse(code = 400, message = "NiFi was unable to complete the request because it was invalid. The request should not be retried without modification."),
                @ApiResponse(code = 401, message = "Client could not be authenticated."),
                @ApiResponse(code = 403, message = "Client is not authorized to make this request."),
                @ApiResponse(code = 404, message = "The specified resource could not be found."),
                @ApiResponse(code = 409, message = "The request was valid but NiFi was not in the appropriate state to process it. Retrying the same request later may be successful.")
            }
    )
    public JSONArray getDataPreview(@Context final HttpServletRequest httpServletRequest,
            @ApiParam(
                    value = "The provenance query details.",
                    required = true
            ) ProvenanceEntity requestProvenanceEntity) {
        JSONArray responseArray = new JSONArray();
        try {
            Response provenanceResponse = provenanceResource.submitProvenanceRequest(httpServletRequest, requestProvenanceEntity);
            ProvenanceEntity provenanceResponseEntity = (ProvenanceEntity) provenanceResponse.getEntity();
            ProvenanceDTO provenance = provenanceResponseEntity.getProvenance();
            String provenanceId = provenance.getId();
            Thread.sleep(1000);
            Response provenanceEventResponse = provenanceResource.getProvenance(null, true, false, provenanceId);
            ProvenanceEntity provenanceEventEntity = (ProvenanceEntity) provenanceEventResponse.getEntity();
            ProvenanceDTO eventResponse = provenanceEventEntity.getProvenance();
            ProvenanceResultsDTO resultsDTO = eventResponse.getResults();
            return generateJsonResponse(resultsDTO, provenanceId, httpServletRequest);
        } catch (Exception e) {
            java.util.logging.Logger.getLogger(ProvenanceResource.class.getName()).log(Level.SEVERE, null, e);
        }
        return responseArray;
    }
    
    private JSONArray generateJsonResponse(ProvenanceResultsDTO resultsDTO, String provenanceId, HttpServletRequest httpServletRequest){
        JSONArray responseArray = new JSONArray();
        List < ProvenanceEventDTO > provenanceEventDTO = resultsDTO.getProvenanceEvents();
        Date lastRefreshedTime= resultsDTO.getGenerated();
        StringBuilder inputResponse = new StringBuilder();
        StringBuilder outputResponse = new StringBuilder();
        StringBuilder inputJsonResponse = new StringBuilder();
        StringBuilder outputJsonResponse = new StringBuilder();
        JSONObject responseObject = new JSONObject();
        if (provenanceEventDTO != null) {
            if(!provenanceEventDTO.isEmpty()){
                for (ProvenanceEventDTO event: provenanceEventDTO) {
                    try {
                        String id = event.getId();
                        LongParameter eventId = new LongParameter(id);
                        ProvenanceEventDTO provenanceEvent = serviceFacade.getProvenanceEvent(Long.parseLong(id));
                        Boolean isInputAvailable = provenanceEvent.getInputContentAvailable();
                        if (isInputAvailable)
                            generateInputResponse(responseObject, inputJsonResponse, inputResponse, id, eventId);
                        else{
                            responseObject.put("InputContentType", null);
                            responseObject.put("InputFileName", null);
    }
    
                        Boolean isOutputAvailable = provenanceEvent.getOutputContentAvailable();
                        if (isOutputAvailable)
                            generateOutputResponse(responseObject, outputJsonResponse, outputResponse, id, eventId);
                        else{
                            responseObject.put("OutputFileName", null);
                            responseObject.put("OutputContentType", null);
    }
    
                    } catch (IOException | NumberFormatException e) {
                        java.util.logging.Logger.getLogger(ProvenanceResource.class.getName()).log(Level.SEVERE, null, e);
    }
                    break;
                }
            } else {
                responseObject.put("InputContentType", null);
                responseObject.put("InputFileName", null);
                responseObject.put("OutputFileName", null);
                responseObject.put("OutputContentType", null);
            }
    
            provenanceResource.deleteProvenance(httpServletRequest, null, provenanceId);
            responseObject.put("OutputResponse", outputResponse);
            responseObject.put("OutputJsonResponse", outputJsonResponse);
            responseObject.put("InputResponse", inputResponse);
            responseObject.put("InputJsonResponse", inputJsonResponse);
            responseObject.put("LastRefreshed", lastRefreshedTime);
            responseArray.put(responseObject);
    }
        return responseArray;
    }

    private void generateInputResponse(JSONObject responseObject, StringBuilder inputJsonResponse, StringBuilder inputResponse, 
            String id, LongParameter eventId) throws IOException{
        boolean isJsonInput = false;
        // get the uri of the request
        final String uri = generateResourceUri("provenance", "events", id, "content", "input");
        final DownloadableContent content = serviceFacade.getContent(eventId.getLong(), uri, ContentDirection.INPUT);
        // generate a streaming response
        InputStream inputStream = content.getContent();
        String InputContentType = content.getType();
        String InputFileName = content.getFilename();
        InputContentType = (InputContentType == null && InputFileName.contains("csv")) ? "Text/csv" : InputContentType;
        InputContentType = InputContentType == null ? MediaType.APPLICATION_OCTET_STREAM : InputContentType;
        if (InputContentType.equals("application/json")){
            inputJsonResponse.append("[");
            isJsonInput = true;
    }  
        try (BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream))) {
            String line;
            while ((line = bufferedReader.readLine()) != null) {
                inputResponse.append(line).append('\n');
                if (isJsonInput)
                    inputJsonResponse.append(line.replaceAll("[\\[\\]]", "")).append(',').append("]").setLength(inputJsonResponse.length() - 1);
            }
        }
        responseObject.put("InputResponse", inputResponse);
        responseObject.put("InputContentType", InputContentType);
    }
    
    private void generateOutputResponse(JSONObject responseObject, StringBuilder outputJsonResponse, StringBuilder outputResponse,
            String id, LongParameter eventId) throws IOException{
        boolean isJsonOutput = false;
        // get the uri of the request
        final String uri = generateResourceUri("provenance", "events", id, "content", "output");
        final DownloadableContent content = serviceFacade.getContent(eventId.getLong(), uri, ContentDirection.OUTPUT);
        // generate a streaming response
        InputStream inputStream = content.getContent();
        String OutputContentType = content.getType();
        String OutputFileName = content.getFilename();
        OutputContentType = (OutputContentType == null && OutputFileName.contains("csv")) ? "Text/csv" : OutputContentType;
        OutputContentType = OutputContentType == null ? MediaType.APPLICATION_OCTET_STREAM : OutputContentType;
        if (OutputContentType.equals("application/json") && isJsonOutput) {
            isJsonOutput = true;
            outputJsonResponse.append("[");
        }
        try (BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream))) {
            String line;
            while ((line = bufferedReader.readLine()) != null) {
                outputResponse.append(line).append('\n');
                if (isJsonOutput) {
                    outputJsonResponse.append(line.replaceAll("[\\[\\]]", "")).append(',').append("]").setLength(outputJsonResponse.length() - 1);;
                }
            }
        }
        responseObject.put("OutputFileName", OutputFileName);
        responseObject.put("OutputContentType", OutputContentType);
    }
    
    @POST
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    @Path("/manage-credential")
    @ApiOperation(
            value = "Manage user credentials details",
            notes = "It performs authentication to Data Integration URL by using given username and password. "
                    + "Also it performs resetting password operation.",
            response = String.class
    )
    @ApiResponses(
            value = {
                    @ApiResponse(code = 400, message = "Data Integration was unable to complete the request because it was invalid. The request should not be retried without modification."),
                    @ApiResponse(code = 403, message = "Client is not authorized to make this request."),
                    @ApiResponse(code = 409, message = "It could not be completed due to a conflict with the current state of the resource."),
                    @ApiResponse(code = 500, message = "Data Integration encountered an unexpected condition which prevented it from fulfilling the request.")
            }
    )
    public Response manageCredential(@Context HttpServletRequest httpServletRequest, @FormParam("username") String userName, 
            @FormParam("password") String password, @FormParam("operationtype") String operationType){
        String response = "Authentication failure";
        try {
            String dbLocation = "conf/dataintegrationDB.db",
                    tableName = "login",
                    connectionUrl = "jdbc:sqlite:"+dbLocation;
            Class.forName("org.sqlite.JDBC");
            StringEncryptor nifiEncryptor = StringEncryptor.createEncryptor(properties);
            String encryptedPassword = nifiEncryptor.encrypt(password);
            con = DriverManager.getConnection(connectionUrl);
            stmt = con.createStatement();
            if (operationType.equals("changePassword")) {
                String emailId = "sample.mail@gmail.com";
                String query = "update "+tableName+" set password='" + encryptedPassword + "',emailid='" + emailId + "' where username='" + userName + "'";
                stmt.executeUpdate(query);
                response = "Success";
            } else {
                String query = "select * from "+ tableName +" where username='" + userName + "'";
                ResultSet result = stmt.executeQuery(query);
                if (result.next())
                    if (password.equals(nifiEncryptor.decrypt(result.getString("password"))))
                        response = "Success";
            }
        } catch (ClassNotFoundException | SQLException ex) {
            logger.error(ex.getMessage(), ex);
            throw new IllegalStateException("Exception occurred while authenticate credential. "
                    + "Please check log for more details.");
        }finally {
            dispose();
        }
        return Response.ok(response).build();
    }
    
     /**
     * Retrieves the running state of the server given.
     *
     * @param hostName host name of the server to be checked.
     * @param portNumber port number of the server to be checked.
     * @return status code of the host name given.
     * @throws java.lang.InterruptedException
     * @throws java.io.IOException
     * @throws java.security.NoSuchAlgorithmException
     * @throws javax.crypto.NoSuchPaddingException
     * @throws java.security.InvalidKeyException
     * @throws java.security.InvalidAlgorithmParameterException
     * @throws javax.crypto.BadPaddingException
     * @throws javax.crypto.IllegalBlockSizeException
     */
    @GET
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    @Path("restart-dataintegration")
    @ApiOperation(
            value = "Retrieves the running status of Data Integration",
            notes = NON_GUARANTEED_ENDPOINT,
            response = String.class,
            authorizations = {
                    @Authorization(value = "Read - /flow", type = "")
            }
    )
    @ApiResponses(
            value = {
                    @ApiResponse(code = 400, message = "Data Integration was unable to complete the request because it was invalid. The request should not be retried without modification."),
                    @ApiResponse(code = 401, message = "Client could not be authenticated."),
                    @ApiResponse(code = 403, message = "Client is not authorized to make this request."),
                    @ApiResponse(code = 409, message = "The request was valid but Data Integration was not in the appropriate state to process it. Retrying the same request later may be successful.")
            }
    )
    public String restartDataIntegration(
            @ApiParam(
                    value = "hostname of the server to be verified",
                    required = false
            )
            @QueryParam("hostName") String hostName,
             @ApiParam(
                    value = "portnumber of the server",
                    required = false
            )
            @QueryParam("portNumber") String portNumber) throws Exception {
            AgentUtilities getResponseFromAgent = new AgentUtilities();
            String authUrl = "http://" +hostName+":"+portNumber+"/DataIntegration/RestartDataIntegrationService"; 
            String responseStatus=getResponseFromAgent.getResponse(authUrl);        
            return responseStatus;
    }
    
    /**
     * Retrieves the running state of the server given.
     *
     * @param PropertyValues content of the modified file.
     * @param FileName filename of the selected file.
     * @return status code of the saved file.
     * @throws java.lang.InterruptedException
     */
    @GET
    @Consumes(MediaType.WILDCARD)
    @Produces(MediaType.WILDCARD)
    @Path("saveregistryvariables")
    @ApiOperation(
            value = "Saves the changed property to the registryvalues.Properties file",
            notes = NON_GUARANTEED_ENDPOINT,
            response = String.class,
            authorizations = {
                @Authorization(value = "Read - /flow", type = "")
            }
    )
    @ApiResponses(
            value = {
                @ApiResponse(code = 400, message = "Data Integration was unable to complete the request because it was invalid. The request should not be retried without modification."),
                @ApiResponse(code = 401, message = "Client could not be authenticated."),
                @ApiResponse(code = 403, message = "Client is not authorized to make this request."),
                @ApiResponse(code = 409, message = "The request was valid but Data Integration was not in the appropriate state to process it. Retrying the same request later may be successful.")
            }
    )
    public int saveRegistryVariables(
            @ApiParam(
                    value = "Property value",
                    required = false
            ) @QueryParam("PropertyValues") String PropertyValues,
            @ApiParam(
                    value = "Selected filename",
                    required = false
            ) @QueryParam("FileName") String FileName
    ) throws InterruptedException {
        try {
            int status;
            String sdkPath = new java.io.File(".").getCanonicalPath();
            List < String > allLines = null;
            if (FileName.contains(".xml")||FileName.contains(".conf")) {
                
                FileUtils.writeStringToFile(new File(sdkPath + "\\conf\\" + FileName), PropertyValues, StandardCharsets.UTF_8);
                status = 200;
                return status;
            } else {
                allLines = Files.readAllLines(Paths.get(sdkPath + "\\conf\\" + FileName), StandardCharsets.UTF_8);
                String[] Lines = allLines.toArray(new String[allLines.size()]);
                String[] Properties = PropertyValues.split(",,");
                for (String Property: Properties) {
                    String name = Property.split("=")[0];
                    String propertyValue = Property.split("=")[1];
                    String value = propertyValue.split("%%")[0];
                    String action = propertyValue.split("%%")[1];
                    String line = name + "=" + value;
                    switch (action) {
                        case "add":
                            allLines.add(line);
                            break;
                        case "edit":
                            for (String prop: Lines) {
                                if (prop.contains(name)) {
                                    allLines.remove(prop);
                                    allLines.add(line);
                                    break;
                                }
                            }
                            break;
                        case "delete":
                            for (String propertyline: Lines) {
                                if (propertyline.contains(name)) {
                                    allLines.remove(propertyline);
                                    break;
                                }
                            }
                            break;
                    }
                }
            }
            Files.write(Paths.get(sdkPath + "\\conf\\" + FileName), allLines, StandardCharsets.UTF_8);
            status = 200;
            return status;
        } catch (IOException ex) {
            return HttpStatus.SC_BAD_REQUEST;
        }
    }
    
    /**
     * Retrieves file content of the selected file.
     *
     * @param fileName filename of the selected file.
     * @return the selected file content.
     * @throws java.lang.InterruptedException
     * @throws javax.xml.parsers.ParserConfigurationException
     * @throws org.xml.sax.SAXException
     */
    @GET
    @Consumes(MediaType.WILDCARD)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("readconfigurationfiles")
    @ApiOperation(
            value = "Get the Property from the registryvalues.Properties file",
            notes = NON_GUARANTEED_ENDPOINT,
            response = String.class,
            authorizations = {
                @Authorization(value = "Read - /flow", type = "")
            }
    )
    @ApiResponses(
            value = {
                @ApiResponse(code = 400, message = "Data Integration was unable to complete the request because it was invalid. The request should not be retried without modification."),
                @ApiResponse(code = 401, message = "Client could not be authenticated."),
                @ApiResponse(code = 403, message = "Client is not authorized to make this request."),
                @ApiResponse(code = 409, message = "The request was valid but Data Integration was not in the appropriate state to process it. Retrying the same request later may be successful.")
            }
    )
    public JSONArray readConfigurationFiles(
            @ApiParam(
                    value = "file name of the selected file",
                    required = false
            ) @QueryParam("fileName") String fileName) throws InterruptedException, ParserConfigurationException, SAXException {
        
        JSONArray jarray = new JSONArray();
        JSONObject obj = new JSONObject();
        try {
            String sdkPath = new java.io.File(".").getCanonicalPath();
            List < String > allLines = Files.readAllLines(Paths.get(sdkPath + "\\conf\\" + fileName), StandardCharsets.UTF_8);
            String[] propertyValue = allLines.toArray(new String[allLines.size()]);
            if (fileName.contains(".xml")||fileName.contains(".conf")) {
                for (String properties: propertyValue) {
                    obj.put("Lines", properties);
                    jarray.put(obj);
                }
                
                return jarray;
            }
            for (String properties: propertyValue) {
                if (properties.contains("=")) {
                    String[] property = properties.split("=");
                    obj.put("Property", property[0]);
                    if (property.length > 1) {
                        String value = property[1];
                        for (int i = 2; i < property.length; i++) {
                            value = value + "=" + property[i];
                        }
                        obj.put("Value", value);
                    } else {
                        obj.put("Value", "");
                    }
                    jarray.put(obj);
                }
            }
            return jarray;
            
        } catch (IOException ex) {
            return jarray;
        }
    } 
    
    /**
     * Retrieves editable file list.
     *
     * @return editable file name list.
     * @throws java.lang.InterruptedException
     */
    @GET
    @Consumes(MediaType.WILDCARD)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("showconfigurationfile")
    @ApiOperation(
            value = "Get the configuraion  file name from the conf folder",
            notes = NON_GUARANTEED_ENDPOINT,
            response = String.class,
            authorizations = {
                @Authorization(value = "Read - /flow", type = "")
            }
    )
    @ApiResponses(
            value = {
                @ApiResponse(code = 400, message = "Data Integration was unable to complete the request because it was invalid. The request should not be retried without modification."),
                @ApiResponse(code = 401, message = "Client could not be authenticated."),
                @ApiResponse(code = 403, message = "Client is not authorized to make this request."),
                @ApiResponse(code = 409, message = "The request was valid but Data Integration was not in the appropriate state to process it. Retrying the same request later may be successful.")
            }
    )
    public JSONArray showConfigurationFile() throws InterruptedException {
        List < String > defaultFileList = new ArrayList < > ();
        List < String > getFileList = new ArrayList < > ();
        defaultFileList.add("bootstrap-notification-services.xml");
        defaultFileList.add("logback.xml");
        defaultFileList.add("nifi.properties");
        defaultFileList.add("bootstrap.conf");
        defaultFileList.add("registryvariables.properties");
        defaultFileList.add("state-management.xml");
        
        JSONArray jarray = new JSONArray();
        JSONObject obj = new JSONObject();
        try {
            String sdkPath = new java.io.File(".").getCanonicalPath();
            File folder = new File(sdkPath + "\\conf");
            File[] listOfFiles = folder.listFiles();
            for (File fileName: listOfFiles) {
                getFileList.add(fileName.getName());
            }
            getFileList.retainAll(defaultFileList);
            
            for (String fileName: getFileList) {
                obj.put("FileName", fileName);
                jarray.put(obj);
            }
            return jarray;
            
        } catch (IOException ex) {
            return jarray;
        }
    }

    @GET
    @Consumes(MediaType.WILDCARD)
    @Produces(MediaType.TEXT_PLAIN)
    @Path("nifipropertiesfile")
    @ApiOperation(
            value = "Get the Property from the Nifi.Properties file",
            notes = NON_GUARANTEED_ENDPOINT,
            response = String.class,
            authorizations = {
                @Authorization(value = "Read - /flow", type = "")
            }
    )
    @ApiResponses(
            value = {
                @ApiResponse(code = 400, message = "Data Integration was unable to complete the request because it was invalid. The request should not be retried without modification."),
                @ApiResponse(code = 401, message = "Client could not be authenticated."),
                @ApiResponse(code = 403, message = "Client is not authorized to make this request."),
                @ApiResponse(code = 409, message = "The request was valid but Data Integration was not in the appropriate state to process it. Retrying the same request later may be successful.")
            }
    )
    public String getNifiProperties() throws InterruptedException {
        try {
            
            String sdkPath = new java.io.File(".").getCanonicalPath();
            List < String > allLines = Files.readAllLines(Paths.get(sdkPath + "\\conf\\nifi.properties"), StandardCharsets.UTF_8);
            String[] propertyValues = allLines.toArray(new String[allLines.size()]);
            ArrayList < String > requiredProperty = new ArrayList <> ();
            for (String propertyValue : propertyValues) {
                String[] property = propertyValue.split("=");
                switch (property[0]) {
                    case "nifi.ui.autorefresh.interval":
                        if (property.length > 1) {
                            requiredProperty.add(propertyValue);
                        } else {
                            requiredProperty.add(propertyValue + "None");
                        }
                        break;
                    case "nifi.web.https.host":
                        if (property.length > 1) {
                            requiredProperty.add(propertyValue);
                        } else {
                            requiredProperty.add(propertyValue + "None");
                        }
                        break;
                    case "nifi.web.https.port":
                        if (property.length > 1) {
                            requiredProperty.add(propertyValue);
                        } else {
                            requiredProperty.add(propertyValue + "None");
                        }
                        break;
                    case "nifi.variable.registry.properties":
                        if (property.length > 1) {
                            requiredProperty.add(propertyValue);
                        } else {
                            requiredProperty.add(propertyValue + "None");
                        }
                        break;
                    default:
                        break;
                }
            }
            String getSavedProperties = new Gson().toJson(requiredProperty);
            return getSavedProperties;
            
        } catch (IOException ex) {
            return "Failed";
        }
    }
    
    @GET
    @Consumes(MediaType.WILDCARD)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("nifipropertiesfile-change")
    @ApiOperation(
            value = "Saves the changed property to the Nifi.Properties file",
            notes = NON_GUARANTEED_ENDPOINT,
            response = String.class,
            authorizations = {
                @Authorization(value = "Read - /flow", type = "")
            }
    )
    @ApiResponses(
            value = {
                @ApiResponse(code = 400, message = "Data Integration was unable to complete the request because it was invalid. The request should not be retried without modification."),
                @ApiResponse(code = 401, message = "Client could not be authenticated."),
                @ApiResponse(code = 403, message = "Client is not authorized to make this request."),
                @ApiResponse(code = 409, message = "The request was valid but Data Integration was not in the appropriate state to process it. Retrying the same request later may be successful.")
            }
    )
    public int getNifiPropertiesChange(
            @ApiParam(
                    value = "hostname of the server",
                    required = false
            ) @QueryParam("hostName") String hostName,
            @ApiParam(
                    value = "portnumber of the server",
                    required = false
            ) @QueryParam("portNumber") String portNumber,
            @ApiParam(
                    value = "Duration of of Autorefresh",
                    required = false
            ) @QueryParam("autoRefresh") String autoRefresh,
            @ApiParam(
                    value = "File Location of the registry files",
                    required = false
            ) @QueryParam("registry") String registry
    ) throws InterruptedException {
        try {
            int status;
            String sdkPath = new java.io.File(".").getCanonicalPath();
            List < String > allLines = Files.readAllLines(Paths.get(sdkPath + "\\conf\\nifi.properties"), StandardCharsets.UTF_8);
            try (BufferedWriter writer = new BufferedWriter(new FileWriter(sdkPath + "\\conf\\nifi.properties"))) {
                String[] propertyValue = allLines.toArray(new String[allLines.size()]);
                for (int i = 0; i < propertyValue.length; i++) {
                    String[] property = propertyValue[i].split("=");
                    
                    switch (property[0]) {
                        case "nifi.ui.autorefresh.interval":
                            if ("None".equals(autoRefresh)) {
                                propertyValue[i] = property[0] + "=";
                            } else {
                                propertyValue[i] = property[0] + "=" + autoRefresh;
                            }
                            break;
                        case "nifi.web.https.host":
                            if ("None".equals(hostName)) {
                                propertyValue[i] = property[0] + "=";
                            } else {
                                propertyValue[i] = property[0] + "=" + hostName;
                            }
                            
                            break;
                        case "nifi.web.https.port":
                            if ("None".equals(portNumber)) {
                                propertyValue[i] = property[0] + "=";
                            } else {
                                propertyValue[i] = property[0] + "=" + portNumber;
                            }
                            break;
                        case "nifi.variable.registry.properties":
                            if ("None".equals(registry)) {
                                propertyValue[i] = property[0] + "=";
                            } else {
                                propertyValue[i] = property[0] + "=" + registry;
                            }
                            break;
                        default:
                            break;
                    }
                    writer.write(propertyValue[i] + "\n");
                    
                }
            }
            status = 200;
            return status;
            
        } catch (IOException ex) {
            return HttpStatus.SC_BAD_REQUEST;
        }
    }
    
    /**
     * Retrieves the running state of the server given.
     *
     * @param hostName host name of the server to be checked.
     * @param portNumber port number of the server to be checked.
     * @param userName username of the server to be checked.
     * @param password password of the server to be checked.
     * @param isSecured
     * @return status code of the host name given.
     * @throws java.lang.InterruptedException
     */
    @GET
    @Consumes(MediaType.WILDCARD)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("dataintegration-status")
    @ApiOperation(
            value = "Retrieves the running status of Data Integration",
            notes = NON_GUARANTEED_ENDPOINT,
            response = String.class,
            authorizations = {
                @Authorization(value = "Read - /flow", type = "")
            }
    )
    @ApiResponses(
            value = {
                    @ApiResponse(code = 400, message = "Data Integration was unable to complete the request because it was invalid. The request should not be retried without modification."),
                    @ApiResponse(code = 401, message = "Client could not be authenticated."),
                    @ApiResponse(code = 403, message = "Client is not authorized to make this request."),
                    @ApiResponse(code = 409, message = "The request was valid but Data Integration was not in the appropriate state to process it. Retrying the same request later may be successful.")
            }
    )
    public int getDataIntegrationStatus(
            @ApiParam(
                    value = "hostname of the server to be verified",
                    required = false
            )
            @QueryParam("hostName") String hostName,
            @ApiParam(
                    value = "portnumber of the server",
                    required = false
            )
            @QueryParam("portNumber") String portNumber,
            @ApiParam(
                    value = "username of the server",
                    required = false
            )
            @QueryParam("userName") String userName,
            @ApiParam(
                    value = "password of the server",
                    required = false
            )
            @QueryParam("password") String password,
            @ApiParam(
                    value = "flag value for checking whether given server is secured or not",
                    required = false
            )
            @QueryParam("isSecured") boolean isSecured) throws InterruptedException {
        try {
            TrustManager[] trustAllCerts = new TrustManager[]{
                new X509TrustManager() {
                    @Override
                    public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                        return null;
                    }
                    @Override
                    public void checkClientTrusted(X509Certificate[] certs, String authType) {
                    }
                    @Override
                    public void checkServerTrusted(X509Certificate[] certs, String authType) {
                    }
                }
            };
            String authUrl;
            SSLContext sc = SSLContext.getInstance(SSL);
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
        
            // Here we are ignoring certificate validation for ssl
            HostnameVerifier validAllHosts = new HostnameVerifier() {
                @Override
                public boolean verify(String hostname, SSLSession session) {
                    return true;
                }
            };
            
            HttpsURLConnection.setDefaultHostnameVerifier(validAllHosts);
            if(isSecured)
            authUrl = "https://" +hostName+":"+portNumber+"/dataintegration/";
            else
            authUrl = "http://" +hostName+":"+portNumber+"/dataintegration/"; 
            URL url = new URL(authUrl);
            HttpURLConnection connection = (HttpURLConnection)url.openConnection();
            connection.setRequestMethod(GET);
            if(isSecured){
            connection.setRequestProperty(USERNAME, userName);
            connection.setRequestProperty(PASSWORD, password);
            }
            connection.connect();
            
            return connection.getResponseCode();
            
        } catch (Exception ex) {
            return HttpStatus.SC_BAD_REQUEST;
        }
    }
    
    /**
     * Retrieves processor list with their group name
     *
     * @return the processordetails table content.
     * @throws java.lang.InterruptedException
     * @throws java.lang.ClassNotFoundException
     * @throws java.sql.SQLException
     */
    @GET
    @Consumes(MediaType.WILDCARD)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("getprocessordetails")
    @ApiOperation(
            value = "Get the processor list from the processortreeview table",
            notes = NON_GUARANTEED_ENDPOINT,
            response = String.class,
            authorizations = {
                @Authorization(value = "Read - /flow", type = "")
            }
    )
    @ApiResponses(
            value = {
                @ApiResponse(code = 400, message = "Data Integration was unable to complete the request because it was invalid. The request should not be retried without modification.")
                ,
  @ApiResponse(code = 401, message = "Client could not be authenticated.")
                ,
  @ApiResponse(code = 403, message = "Client is not authorized to make this request.")
                ,
  @ApiResponse(code = 409, message = "The request was valid but Data Integration was not in the appropriate state to process it. Retrying the same request later may be successful.")
            }
    )
    public List<ProcessorDetails> getProcessorDetails() throws InterruptedException, ClassNotFoundException, SQLException {
        String dbUrl = "conf/dataintegrationDB.db";
        HashMap groupList = new HashMap<Integer, String>();
        String url = "jdbc:sqlite:" + dbUrl;
        List<ProcessorDetails> processorGroupingList = new ArrayList<>();
        ResultSet processorResult = null;
        Class.forName("org.sqlite.JDBC");
        try {
            con = DriverManager.getConnection(url);
        } catch (SQLException ex) {
            java.util.logging.Logger.getLogger(SyncfusionResource.class.getName()).log(Level.SEVERE, null, ex);
        }
        if (con != null) {
            try {
                stmt = con.createStatement();
                //Get all the group names and their ids
                String sql = "select * from processgroup GROUP BY id";
                try (ResultSet result = stmt.executeQuery(sql)) {
                    while (result.next()) {
                        groupList.put(result.getString("id"), result.getString("groupname"));
                    }
                }
                //Get all the processor from dynamicgrouping table based on groupid and add it into list
                for (Object groupId : groupList.keySet()) {
                    HashMap processorList = new HashMap<String,Boolean>();
                    sql = "select * from dynamicgrouping WHERE groupid='" + groupId + "';";
                    ResultSet resultSet = stmt.executeQuery(sql);
                    while (resultSet.next()) {
                        String processorId = resultSet.getString("processorid");
                        Boolean isCopied = resultSet.getBoolean("iscopiedprocessor");
                        processorList.put(processorId,isCopied);
                    }
                    for(Object processorId: processorList.keySet()){
                        resultSet.close();
                        if (processorId != null) {
                            sql = "select * from processors WHERE id='" + processorId.toString() + "';";
                            processorResult = stmt.executeQuery(sql);
                            if (processorResult.next()) {
                                ProcessorDetails processorDetail = new ProcessorDetails();
                                processorDetail.Name = processorResult.getString("processorname");
                                processorDetail.Group = groupList.get(groupId).toString();
                                processorDetail.GroupId = groupId.toString();
                                processorDetail.Type = processorResult.getString("type");
                                processorDetail.Artifact = processorResult.getString("artifact");
                                processorDetail.BundleGroup = processorResult.getString("bundlegroup");
                                processorDetail.Version = processorResult.getString("version");
                                processorDetail.Tags = processorResult.getString("tags");
                                processorDetail.IsCopied = processorList.get(processorId.toString()).toString();
                                processorGroupingList.add(processorDetail);
                            }
                        }
                    }
                    processorResult.close();
                }
            } catch (SQLException ex) {
                logger.error(ex.getMessage(), ex);
            } finally {
                dispose();
            }
        }
        return processorGroupingList;
    }

    /**
     * Retrieves process group list
     *
     * @return
     * @throws java.lang.InterruptedException
     * @throws java.lang.ClassNotFoundException
     * @throws java.sql.SQLException
     */
    @GET
    @Consumes(MediaType.WILDCARD)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("getprocessgrouplist")
    @ApiOperation(
            value = "Get the processor list from the processortreeview table",
            notes = NON_GUARANTEED_ENDPOINT,
            response = String.class,
            authorizations = {
                @Authorization(value = "Read - /flow", type = "")
            }
    )
    @ApiResponses(
            value = {
                @ApiResponse(code = 400, message = "Data Integration was unable to complete the request because it was invalid. The request should not be retried without modification.")
                ,
  @ApiResponse(code = 401, message = "Client could not be authenticated.")
                ,
  @ApiResponse(code = 403, message = "Client is not authorized to make this request.")
                ,
  @ApiResponse(code = 409, message = "The request was valid but Data Integration was not in the appropriate state to process it. Retrying the same request later may be successful.")
            }
    )
    public List<GroupDetails> getProcessGroupList() throws InterruptedException, ClassNotFoundException, SQLException {
        String dbUrl = "conf/dataintegrationDB.db";
        String url = "jdbc:sqlite:" + dbUrl;
        List<GroupDetails> processGroupList = new ArrayList<>();
        Class.forName("org.sqlite.JDBC");
        try {
            con = DriverManager.getConnection(url);
        } catch (SQLException ex) {
            logger.error(ex.getMessage(), ex);
        }
        if (con != null) {
            try {
                stmt = con.createStatement();
                //Get process group which are not deleted
                String sql = "select * from processgroup where isdeleted = 0 GROUP BY groupname";
                try (ResultSet result = stmt.executeQuery(sql)) {
                    while (result.next()) {
                        GroupDetails groupDetail = new GroupDetails();
                        groupDetail.GroupName = result.getString("groupname");
                        groupDetail.Id = result.getString("id");
                        groupDetail.IsDefault = result.getBoolean("isdefaultgroup");
                        groupDetail.IsDeleted = result.getBoolean("isdeleted");
                        processGroupList.add(groupDetail);
                    }
                }
            } catch (SQLException ex) {
                logger.error(ex.getMessage(), ex);
            } finally {
                dispose();
            }
        }
        return processGroupList;
    }

    /**
     * moves the selected processor to specific group
     *
     * @param groupName
     * @param version
     * @param processorName
     * @param type
     * @param artifact
     * @param bundlegroup
     * @param changeversion
     * @param tags
     * @throws java.lang.ClassNotFoundException
     */
    @GET
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    @Path("moveprocessor")
    @ApiOperation(
            value = "Updates the group name of the processor",
            notes = NON_GUARANTEED_ENDPOINT,
            response = String.class,
            authorizations = {
                @Authorization(value = "Read - /flow", type = "")
            }
    )
    @ApiResponses(
            value = {
                @ApiResponse(code = 400, message = "Data Integration was unable to complete the request because it was invalid. The request should not be retried without modification.")
                ,
                    @ApiResponse(code = 401, message = "Client could not be authenticated.")
                ,
                    @ApiResponse(code = 403, message = "Client is not authorized to make this request.")
                ,
                    @ApiResponse(code = 409, message = "The request was valid but Data Integration was not in the appropriate state to process it. Retrying the same request later may be successful.")
            }
    )
   public void moveProcessor(
           @ApiParam(
                    value = "group name of the processor",
                    required = false
            )
            @QueryParam("groupName") String groupName,
            @ApiParam(
                    value = "name of the processor",
                    required = false
            )
            @QueryParam("processorName") String processorName,
            @ApiParam(
                    value = "version of the processor",
                    required = false
            )
            @QueryParam("version") String version,
            @ApiParam(
                    value = "type of the processor",
                    required = false
            )
            @QueryParam("type") String type,
            @ApiParam(
                    value = "artifact id of the processor",
                    required = false
            )
            @QueryParam("artifact") String artifact,
            @ApiParam(
                    value = "bundle group name of the processor",
                    required = false
            )
            @QueryParam("bundlegroup") String bundlegroup,
            @ApiParam(
                    value = "changed version of the processor",
                    required = false
            )
            @QueryParam("changeversion") String changeversion,
            @ApiParam(
                    value = "tags of the processor",
                    required = false
            )
            @QueryParam("tags") String tags            
    ) throws Exception {
        String dbUrl = "conf/dataintegrationDB.db";
        boolean isProcessorExist = false;
        boolean isDuplicate = false;
        boolean isElementAvailable = false;
        String url = "jdbc:sqlite:" + dbUrl;
        int groupId = 0;
        int processorId=0;
        Class.forName("org.sqlite.JDBC");
        try {
            con = DriverManager.getConnection(url);
        } catch (SQLException ex) {
        }
        if (con != null) {
            try {
                String newProcessorName = processorName + " " + version;
                stmt = con.createStatement();
                //Check whether given processor is in processors table
                String getProcessorquery = "select id from processors WHERE processorname= '" + newProcessorName + "';";
                ResultSet result = stmt.executeQuery(getProcessorquery);
                if (result.next()) {
                    isProcessorExist = true;
                    //Get processor id 
                    processorId = result.getInt("id");
                }
                //Check whether given process group is available
                String getGroupQuery = "select id from processgroup where groupname='" + groupName + "'";
                result = stmt.executeQuery(getGroupQuery);
                if (result.next()) {
                    //Get process group id
                    groupId = result.getInt("id");
                }
                // Check whether process already exist in group given
                String isAvailable = "select * from dynamicgrouping WHERE processorid= '" + processorId + "';";
                result = stmt.executeQuery(isAvailable);
                 while(result.next()) {
                    if(result.getInt("groupid")==groupId){
                        isDuplicate = true;
                    }
                    isElementAvailable=true;
                }
                if(!isElementAvailable){
                   statement = con.prepareStatement(
                            "INSERT INTO dynamicgrouping (groupid,processorid,iscopiedprocessor) VALUES(?,?,?)");
                   statement.setInt(1, groupId);
                   statement.setInt(2, processorId);
                   statement.setBoolean(3,false);
                   statement.executeUpdate();
                }
                result.close();
                //Move processor only when it is available in processors table and not available in given group
                if (!isDuplicate && isProcessorExist) {
                    String query = "update dynamicgrouping set groupid= '" + groupId + "' WHERE processorid= '" + processorId + "';";
                    stmt.execute(query);
                }
                //Add processor to processors table and add in dynamicgroup table with created processor id to group given.
                if (!isProcessorExist) {
                    dispose();
                    addNewProcessor(newProcessorName, groupId, type, artifact, bundlegroup, version, tags);
                }
            } catch (SQLException ex) {
                logger.error(ex.getMessage(), ex);
            } finally {
                dispose();
            }

        }

    }

    /**
     * Add the given processor into processor table and dynamicgrouping table
     * with created processor id
     *
     * @param processorName
     * @param groupId
     * @param type
     * @param artifact
     * @param bundlegroup
     * @param version
     * @throws java.lang.ClassNotFoundException
     */
    @GET
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    @Path("addnewprocessor")
    @ApiOperation(
            value = "Updates the group name of the processor",
            notes = NON_GUARANTEED_ENDPOINT,
            response = String.class,
            authorizations = {
                @Authorization(value = "Read - /flow", type = "")
            }
    )
    @ApiResponses(
            value = {
                @ApiResponse(code = 400, message = "Data Integration was unable to complete the request because it was invalid. The request should not be retried without modification.")
                ,
                    @ApiResponse(code = 401, message = "Client could not be authenticated.")
                ,
                    @ApiResponse(code = 403, message = "Client is not authorized to make this request.")
                ,
                    @ApiResponse(code = 409, message = "The request was valid but Data Integration was not in the appropriate state to process it. Retrying the same request later may be successful.")
            }
    )
    public void addNewProcessor(
            @ApiParam(
                    value = "name of the processor",
                    required = false
            )
            @QueryParam("processorName") String processorName,
            @ApiParam(
                    value = "name of the group",
                    required = false
            )
            @QueryParam("groupId") int groupId,
            @ApiParam(
                    value = "type of the processor",
                    required = false
            )
            @QueryParam("type") String type,
            @ApiParam(
                    value = "artifact of the processor",
                    required = false
            )
            @QueryParam("artifact") String artifact,
            @ApiParam(
                    value = "bundle group name of the processor",
                    required = false
            )
            @QueryParam("bundlegroup") String bundlegroup,
            @ApiParam(
                    value = "version of the processor",
                    required = false
            )
            @QueryParam("version") String version,
            @ApiParam(
                    value = "tags of the processor",
                    required = false
            )
            @QueryParam("tags") String tags) throws Exception {
        String dbUrl = "conf/dataintegrationDB.db";
        Connection con = null;
        String url = "jdbc:sqlite:" + dbUrl;
        Class.forName("org.sqlite.JDBC");
        try {
            con = DriverManager.getConnection(url);
        } catch (SQLException ex) {
            java.util.logging.Logger.getLogger(SyncfusionResource.class.getName()).log(Level.SEVERE, null, ex);
        }
        if (con != null) {
            try {
                int processorId = 0;
                stmt = con.createStatement();
                //insert processor into processors table
                statement = con.prepareStatement(
                        "INSERT INTO processors (processorname,type,artifact,bundlegroup,version,tags) VALUES(?,?,?,?,?,?)");
                statement.setString(1, processorName);
                statement.setString(2, type);
                statement.setString(3, artifact);
                statement.setString(4, bundlegroup);
                statement.setString(5, version);
                statement.setString(6, tags);
                statement.executeUpdate();
                //get processor id
                String getProcessorId = "select id from processors where processorname='" + processorName + "'";
                ResultSet processorResult = stmt.executeQuery(getProcessorId);
                if (processorResult.next()) {
                    processorId = processorResult.getInt("id");
                }
                    statement = con.prepareStatement(
                            "INSERT INTO dynamicgrouping (groupid,processorid,iscopiedprocessor) VALUES(?,?,?)");
                    statement.setInt(1, groupId);
                    statement.setInt(2, processorId);
                    statement.setBoolean(3,false);
                    statement.executeUpdate();
                processorResult.close();
            } catch (SQLException ex) {
                java.util.logging.Logger.getLogger(SyncfusionResource.class.getName()).log(Level.SEVERE, null, ex);
            } finally {
                dispose();
            }
        }
    }

    /**
     * Copy processor to another group
     *
     * @param groupName
     * @param version
     * @param processorName
     * @param type
     * @param artifact
     * @param bundlegroup
     * @param changeversion
     * @return
     * @throws java.lang.ClassNotFoundException
     */
    @GET
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    @Path("copyprocessordetails")
    @ApiOperation(
            value = "Copies the details of the processor",
            notes = NON_GUARANTEED_ENDPOINT,
            response = String.class,
            authorizations = {
                @Authorization(value = "Read - /flow", type = "")
            }
    )
    @ApiResponses(
            value = {
                @ApiResponse(code = 400, message = "Data Integration was unable to complete the request because it was invalid. The request should not be retried without modification.")
                ,
                    @ApiResponse(code = 401, message = "Client could not be authenticated.")
                ,
                    @ApiResponse(code = 403, message = "Client is not authorized to make this request.")
                ,
                    @ApiResponse(code = 409, message = "The request was valid but Data Integration was not in the appropriate state to process it. Retrying the same request later may be successful.")
            }
    )
    public String copyProcessorDetails(
            @ApiParam(
                    value = "group name of the processor",
                    required = false
            )
            @QueryParam("groupName") String groupName,
            @ApiParam(
                    value = "name of the processor",
                    required = false
            )
            @QueryParam("processorName") String processorName,
            @ApiParam(
                    value = "version of the processor",
                    required = false
            )
            @QueryParam("version") String version,
            @ApiParam(
                    value = "type of the processor",
                    required = false
            )
            @QueryParam("type") String type,
            @ApiParam(
                    value = "artifact id of the processor",
                    required = false
            )
            @QueryParam("artifact") String artifact,
            @ApiParam(
                    value = "bundle group name of the processor",
                    required = false
            )
            @QueryParam("bundlegroup") String bundlegroup,
            @ApiParam(
                    value = "changed version of the processor",
                    required = false
            )
            @QueryParam("changeversion") String changeversion
    ) throws Exception {
        String dbUrl = "conf/dataintegrationDB.db";
        boolean isProcessorExist = false;
        String url = "jdbc:sqlite:" + dbUrl;
        Class.forName("org.sqlite.JDBC");
        try {
            con = DriverManager.getConnection(url);
        } catch (SQLException ex) {
            java.util.logging.Logger.getLogger(SyncfusionResource.class.getName()).log(Level.SEVERE, null, ex);
        }
        if (con != null) {
            try {
                int groupId = 0;
                int processorId = 0;
                String newProcessorName = processorName + " " + version;
                stmt = con.createStatement();
                //get processor id
                String getProcessorId = "select id from processors where processorname='" + newProcessorName + "'";
                try (ResultSet processorResult = stmt.executeQuery(getProcessorId)) {
                if (processorResult.next()) {
                    processorId = processorResult.getInt("id");
                    //get group id
                    String getGroupQuery = "select id from processgroup where groupname='" + groupName + "'";
                    processorResult.close();
                    try (ResultSet groupResult = stmt.executeQuery(getGroupQuery)) {
                    if (groupResult.next()) {
                        groupId = groupResult.getInt("id");
                        //check whether given processor already exist in given group
                        String getProcessorquery = "select * from dynamicgrouping WHERE processorid= '" + processorId + "' AND groupid='" + groupId + "';";
                        groupResult.close();
                        try (ResultSet result = stmt.executeQuery(getProcessorquery)) {
                            if (result.next()) {
                                isProcessorExist = true;
                            }
                            result.close();
                        }
                    }
                }
                    }
                }
                //Copy processor to given group when it is not exist
                if (!isProcessorExist) {

                    statement = con.prepareStatement(
                            "INSERT INTO dynamicgrouping (groupid,processorid,iscopiedprocessor) VALUES(?,?,?)");
                    statement.setInt(1, groupId);
                    statement.setInt(2, processorId);
                    statement.setBoolean(3, true);
                    statement.executeUpdate();
                    return "Success";
                } else {
                    return "Already Exists";
                }
            } catch (SQLException ex) {
                java.util.logging.Logger.getLogger(SyncfusionResource.class.getName()).log(Level.SEVERE, null, ex);
            } finally {
                dispose();
            }
        }
        return "Fail";
    }

    /**
     * Updates the name of the group
     *
     * @param oldGroupName
     * @param newGroupName
     * @throws java.lang.ClassNotFoundException
     */
    @GET
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    @Path("editprocessgroup")
    @ApiOperation(
            value = "Updates the group name of the processor",
            notes = NON_GUARANTEED_ENDPOINT,
            response = String.class,
            authorizations = {
                @Authorization(value = "Read - /flow", type = "")
            }
    )
    @ApiResponses(
            value = {
                @ApiResponse(code = 400, message = "Data Integration was unable to complete the request because it was invalid. The request should not be retried without modification.")
                ,
                    @ApiResponse(code = 401, message = "Client could not be authenticated.")
                ,
                    @ApiResponse(code = 403, message = "Client is not authorized to make this request.")
                ,
                    @ApiResponse(code = 409, message = "The request was valid but Data Integration was not in the appropriate state to process it. Retrying the same request later may be successful.")
            }
    )
    public void editProcessGroup(
            @ApiParam(
                    value = "old group name of the processor",
                    required = false
            )
            @QueryParam("oldGroupName") String oldGroupName,
            @ApiParam(
                    value = "new group name of the processor",
                    required = false
            )
            @QueryParam("newGroupName") String newGroupName) throws Exception {
        String dbUrl = "conf/dataintegrationDB.db";
        boolean isGroupExist = false;

        String url = "jdbc:sqlite:" + dbUrl;
        Class.forName("org.sqlite.JDBC");
        try {
            con = DriverManager.getConnection(url);
        } catch (SQLException ex) {
            java.util.logging.Logger.getLogger(SyncfusionResource.class.getName()).log(Level.SEVERE, null, ex);
        }
        if (con != null) {
            try {
                stmt = con.createStatement();
                //check whether new group name already exist
                String getGroupQuery = "select * from  processgroup where groupname='" + newGroupName + "'";
                ResultSet result = stmt.executeQuery(getGroupQuery);
                if (result.next()) {
                    isGroupExist = true;
                    result.close();
                }
                //Update group name if not exist
                if (!isGroupExist) {
                    String updateQuery = "update processgroup set groupname= '" + newGroupName + "' WHERE groupname= '" + oldGroupName + "';";
                    stmt.execute(updateQuery);

                }
            } catch (SQLException ex) {
                java.util.logging.Logger.getLogger(SyncfusionResource.class.getName()).log(Level.SEVERE, null, ex);
            } finally {
                dispose();
            }
        }
    }

    /**
     * Removes the given process group and move the processors to Others group
     *
     * @param groupName
     * @throws java.lang.ClassNotFoundException
     */
    @GET
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    @Path("removegroup")
    @ApiOperation(
            value = "Updates the group name of the processor",
            notes = NON_GUARANTEED_ENDPOINT,
            response = String.class,
            authorizations = {
                @Authorization(value = "Read - /flow", type = "")
            }
    )
    @ApiResponses(
            value = {
                @ApiResponse(code = 400, message = "Data Integration was unable to complete the request because it was invalid. The request should not be retried without modification.")
                ,
                    @ApiResponse(code = 401, message = "Client could not be authenticated.")
                ,
                    @ApiResponse(code = 403, message = "Client is not authorized to make this request.")
                ,
                    @ApiResponse(code = 409, message = "The request was valid but Data Integration was not in the appropriate state to process it. Retrying the same request later may be successful.")
            }
    )
    public void removeGroup(
            @ApiParam(
                    value = "group name",
                    required = false
            )
            @QueryParam("groupName") String groupName) throws Exception {
        String dbUrl = "conf/dataintegrationDB.db";
        List<String> processorList = new ArrayList<>();
        String url = "jdbc:sqlite:" + dbUrl;
        Class.forName("org.sqlite.JDBC");
        try {
            con = DriverManager.getConnection(url);
        } catch (SQLException ex) {
            java.util.logging.Logger.getLogger(SyncfusionResource.class.getName()).log(Level.SEVERE, null, ex);
        }
        if (con != null) {
            try {
                stmt = con.createStatement();
                ResultSet result;
                String getProcessorquery= "select * from dynamicgrouping WHERE groupid=(select id from processgroup where groupname='" + groupName + "')";
                //Get processor id
                result = stmt.executeQuery(getProcessorquery);
                while (result.next()) {
                    processorList.add(result.getString("processorid"));
                }
                //Move all the processors to others group if it does not already exist in others group
                for (String processor : processorList) {
                   String updateQuery = "update dynamicgrouping set groupid= '1' where NOT EXISTS (SELECT * FROM dynamicgrouping WHERE processorid = '" + processor + "')"; 
                   stmt.execute(updateQuery);
                };
                result.close();
                //Remove group selected
                String deleteQuery = "update processgroup set isdeleted=1 where groupname='" + groupName + "'";
                stmt.execute(deleteQuery);
            } catch (SQLException ex) {
                java.util.logging.Logger.getLogger(SyncfusionResource.class.getName()).log(Level.SEVERE, null, ex);
            } finally {
                dispose();
            }
        }
    }

    /**
     * Add new group for processors
     *
     * @param groupName
     * @throws java.lang.ClassNotFoundException
     */
    @GET
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    @Path("addnewgroup")
    @ApiOperation(
            value = "Updates the group name of the processor",
            notes = NON_GUARANTEED_ENDPOINT,
            response = String.class,
            authorizations = {
                @Authorization(value = "Read - /flow", type = "")
            }
    )
    @ApiResponses(
            value = {
                @ApiResponse(code = 400, message = "Data Integration was unable to complete the request because it was invalid. The request should not be retried without modification.")
                ,
                    @ApiResponse(code = 401, message = "Client could not be authenticated.")
                ,
                    @ApiResponse(code = 403, message = "Client is not authorized to make this request.")
                ,
                    @ApiResponse(code = 409, message = "The request was valid but Data Integration was not in the appropriate state to process it. Retrying the same request later may be successful.")
            }
    )
    public void addNewGroup(
            @ApiParam(
                    value = "group name",
                    required = false
            )
            @QueryParam("groupName") String groupName) throws Exception {
        String dbUrl = "conf/dataintegrationDB.db";
        String url = "jdbc:sqlite:" + dbUrl;
        Class.forName("org.sqlite.JDBC");
        try {
            con = DriverManager.getConnection(url);
        } catch (SQLException ex) {
            java.util.logging.Logger.getLogger(SyncfusionResource.class.getName()).log(Level.SEVERE, null, ex);
        }
        if (con != null) {
            try {
                stmt = con.createStatement();
                //Check whether given groupname already exist in processgroup table and it is deleted
                String getGroupQuery = "select * from processgroup where groupname='" + groupName + "' AND isdeleted='1'";
                ResultSet groupResult = stmt.executeQuery(getGroupQuery);
                //Update isdeleted property
                if (groupResult.next()) {
                    String updateQuery = "update processgroup set isdeleted=0 where groupname='" + groupName + "'";
                    stmt.execute(updateQuery);
                } //Add new group into processgroup table
                else {
                groupResult.close();    
                    try (PreparedStatement statement = con.prepareStatement(
                            "INSERT INTO processgroup (groupname,isdeleted,isdefaultgroup) VALUES(?,?,?)")) {
                        statement.setString(1, groupName);
                        statement.setBoolean(2, false);
                        statement.setBoolean(3, false);
                        statement.executeUpdate();
                    }
                }
            } catch (SQLException ex) {
                java.util.logging.Logger.getLogger(SyncfusionResource.class.getName()).log(Level.SEVERE, null, ex);
            } finally {
                dispose();
            }
        }
    }

    /**
     * Reset dynamicgrouping table using defaultgrouping table
     *
     * @throws java.sql.SQLException
     */
    @GET
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    @Path("resetgrouping")
    @ApiOperation(
            value = "Updates the group name of the processor",
            notes = NON_GUARANTEED_ENDPOINT,
            response = String.class,
            authorizations = {
                @Authorization(value = "Read - /flow", type = "")
            }
    )
    @ApiResponses(
            value = {
                @ApiResponse(code = 400, message = "Data Integration was unable to complete the request because it was invalid. The request should not be retried without modification.")
                ,
                    @ApiResponse(code = 401, message = "Client could not be authenticated.")
                ,
                    @ApiResponse(code = 403, message = "Client is not authorized to make this request.")
                ,
                    @ApiResponse(code = 409, message = "The request was valid but Data Integration was not in the appropriate state to process it. Retrying the same request later may be successful.")
            }
    )
    public void resetGrouping() throws SQLException {
        String dbUrl = "conf/dataintegrationDB.db";
        String url = "jdbc:sqlite:" + dbUrl;
        try {
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException ex) {
            java.util.logging.Logger.getLogger(SyncfusionResource.class.getName()).log(Level.SEVERE, null, ex);
        }
        try {
            con = DriverManager.getConnection(url);
        } catch (SQLException ex) {
            java.util.logging.Logger.getLogger(SyncfusionResource.class.getName()).log(Level.SEVERE, null, ex);
        }
        if (con != null) {
            try {
                Statement stmt = con.createStatement();
                //Delete all newly added processgroup from processgroup table
                String deleteGroup = "DELETE FROM processgroup WHERE isdefaultgroup='0'";
                stmt.execute(deleteGroup);
                //delete and insert defaultgrouping values into dynamicgrouping table
                String deleteQuery = "DELETE FROM dynamicgrouping;";
                //delete table
                stmt.execute(deleteQuery);
                String insertQuery = "insert into dynamicgrouping select * from defaultgrouping";
                //update table
                stmt.execute(insertQuery);

            } catch (SQLException e) {
                java.util.logging.Logger.getLogger(SyncfusionResource.class.getName()).log(Level.SEVERE, null, e);
            } finally {
                dispose();
            }
        }
    }
      /**
     * Removes the given processor
     *
     * @param groupName
     * @param processorName
     * @param version
     * @throws java.lang.ClassNotFoundException
     */
    @GET
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    @Path("removeprocessor")
    @ApiOperation(
            value = "Updates the group name of the processor",
            notes = NON_GUARANTEED_ENDPOINT,
            response = String.class,
            authorizations = {
                @Authorization(value = "Read - /flow", type = "")
            }
    )
    @ApiResponses(
            value = {
                @ApiResponse(code = 400, message = "Data Integration was unable to complete the request because it was invalid. The request should not be retried without modification.")
                ,
                    @ApiResponse(code = 401, message = "Client could not be authenticated.")
                ,
                    @ApiResponse(code = 403, message = "Client is not authorized to make this request.")
                ,
                    @ApiResponse(code = 409, message = "The request was valid but Data Integration was not in the appropriate state to process it. Retrying the same request later may be successful.")
            }
    )
    public void removeProcessor(
            @ApiParam(
                    value = "group name",
                    required = false
            )
            @QueryParam("groupName") String groupName,
              @ApiParam(
                    value = "processor name",
                    required = false
            )
            @QueryParam("processorName") String processorName,
            @ApiParam(
                    value = "version of the processor",
                    required = false
            )
           @QueryParam("version") String version) throws Exception {
        String dbUrl = "conf/dataintegrationDB.db";
        String url = "jdbc:sqlite:" + dbUrl;
        Class.forName("org.sqlite.JDBC");
        try {
            con = DriverManager.getConnection(url);
        } catch (SQLException ex) {
            java.util.logging.Logger.getLogger(SyncfusionResource.class.getName()).log(Level.SEVERE, null, ex);
        }
        if (con != null) {
            try {
               stmt = con.createStatement();
               String newProcessorName = processorName + " " + version;
               //delete processor 
               String deleteQuery="delete from dynamicgrouping WHERE processorid=(select id from processors where processorname='" + newProcessorName + "')" + "AND groupid=(select id from processgroup where groupname='" + groupName + "')";
               stmt.execute(deleteQuery);       
            } catch (SQLException ex) {
                java.util.logging.Logger.getLogger(SyncfusionResource.class.getName()).log(Level.SEVERE, null, ex);
            } finally {
                dispose();
            }
        }
    }

   /**
     * Close the connection and its related properties
     */
    private void dispose() {
        try {
            if (stmt != null) {
                stmt.close();
            }
            if (con != null) {
                con.close();
            }
            if (statement != null) {
                statement.close();
            }
        } catch (Exception ex) {
            java.util.logging.Logger.getLogger(SyncfusionResource.class.getName()).log(Level.SEVERE, null, ex);
        }
    }  
    
    private UMSApplication getUMS() {
        List<String> umsBaseUrlList = new ArrayList<>();
        String umpPropertiesFilePath = loginIdentityProvider.authenticate(new LoginCredentials(providerFileStr, ""))
                    .getUsername();
        Properties umpProperties = loadPropertiesFromUMPProviderFile(umpPropertiesFilePath);
        String umsBaseUrl = getUMPPropertyValue(baseUrlStr,umpProperties).toLowerCase();
        umsBaseUrlList.add(umsBaseUrl);
        UMSApplication application=new UMSApplication();
        application.Name="Syncfusion User Management Server";
        application.Url=umsBaseUrlList;
        application.Type="UMS";
        application.Icon="images/UMS.png";
        return application;
}
    
    public void setProcessGroupResource(ProcessGroupResource processGroupResource) {
        this.processGroupResource = processGroupResource;
    }
    
    public void setFlowResource(FlowResource flowResource) {
        this.flowResource = flowResource;
    }
    
    public void setControllerResource(ControllerResource controllerResource){
        this.controllerResource = controllerResource;
    }
    
    public void setTenantsResource(TenantsResource tenantsResource){
        this.tenantsResource = tenantsResource;
    }
    
    public void setReportingTaskResource(ReportingTaskResource reportingTaskResource){ 
        this.reportingTaskResource = reportingTaskResource;
    }

    public void setProvenanceResource(ProvenanceResource provenanceResource){ 
        this.provenanceResource = provenanceResource;
    }
    
    public void setServiceFacade(NiFiServiceFacade serviceFacade) {
        this.serviceFacade = serviceFacade;
    }  
}
