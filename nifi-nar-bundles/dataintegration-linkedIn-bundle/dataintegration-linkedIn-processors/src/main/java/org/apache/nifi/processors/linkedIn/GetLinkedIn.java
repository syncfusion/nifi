/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.apache.nifi.processors.linkedIn;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.util.ArrayList;
import org.apache.nifi.annotation.behavior.DynamicProperty;
import org.apache.nifi.annotation.behavior.InputRequirement;
import org.apache.nifi.annotation.behavior.InputRequirement.Requirement;
import org.apache.nifi.annotation.behavior.SupportsBatching;
import org.apache.nifi.annotation.documentation.CapabilityDescription;
import org.apache.nifi.annotation.documentation.Tags;
import org.apache.nifi.components.AllowableValue;
import org.apache.nifi.components.PropertyDescriptor;
import org.apache.nifi.flowfile.FlowFile;
import org.apache.nifi.processor.AbstractProcessor;
import org.apache.nifi.processor.ProcessContext;
import org.apache.nifi.processor.ProcessSession;
import org.apache.nifi.processor.Relationship;
import org.apache.nifi.processor.exception.ProcessException;
import org.apache.nifi.processor.util.StandardValidators;

@SupportsBatching
@Tags({"LinkedIn", "Get", "social media"})
@InputRequirement(Requirement.INPUT_ALLOWED)
@CapabilityDescription("Processor to retrieve data from LinkedIn. "
        + "Supply the required API endpoints, access token, and content type of the response.")
@DynamicProperty(name = "Header Name", value = "Attribute Expression Language", supportsExpressionLanguage = true, description = "Send request header "
        + "with a key matching the Dynamic Property Key and a value created by evaluating the Attribute Expression Language set in the value "
        + "of the Dynamic Property.")
public final class GetLinkedIn extends AbstractProcessor {

    public static final String DEFAULT_CONTENT_TYPE = "application/json";
    public static final AllowableValue RESPONSE_JSON = new AllowableValue("JSON",
            "JSON", "Returns the information that you requested in the JSON data format.");
    public static final AllowableValue RESPONSE_XML = new AllowableValue("XML",
            "XML", "Returns the information that you requested in the XML data format.");    
   public static final PropertyDescriptor PROP_API_METHOD = new PropertyDescriptor
            .Builder().name("LinkedIn Host")
            .description("Base URL for the LinkedIn API.")
            .required(true)
            .defaultValue("https://api.linkedin.com/v1")
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .build();
   public static final PropertyDescriptor PROP_ENDPOINT = new PropertyDescriptor
            .Builder().name("Endpoint")
            .description("End point of the LinkedIn API.")
            .required(true)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .build();
    public static final PropertyDescriptor PROP_ACCESS_TOKEN = new PropertyDescriptor
            .Builder().name("Access Token")
            .description("Access token to access an API.")
            .required(true)
            .sensitive(true)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .build();
   public static final PropertyDescriptor PROP_RESPONSE_TYPE = new PropertyDescriptor
            .Builder().name("Response Type")
            .description("Select the format in which the response should be retrieved.")
            .required(true)
            .defaultValue(RESPONSE_JSON.getValue())
            .allowableValues(RESPONSE_XML,RESPONSE_JSON)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .build();
    // relationships
    public static final Relationship REL_SUCCESS = new Relationship.Builder()
            .name("success")
            .description("FlowFiles are routed to success if data retrieved from LinkedIn successfully.")
            .build();

    public static final Relationship REL_FAILURE = new Relationship.Builder()
            .name("failure")
            .description("FlowFiles are routed to failure if unable to get data from LinkedIn.")
            .build();
  private static final List<PropertyDescriptor> PROPERTIES = Collections.unmodifiableList(Arrays.asList(
            PROP_API_METHOD,
            PROP_ENDPOINT,
            PROP_ACCESS_TOKEN,
            PROP_RESPONSE_TYPE));
    public static final Set<Relationship> relationships = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList(REL_SUCCESS, REL_FAILURE)));

    /**
     * Pattern used to compute RFC 2616 Dates (#sec3.3.1). This format is used
     * by the HTTP Date header and is optionally sent by the processor. This
     * date is effectively an RFC 822/1123 date string, but HTTP requires it to
     * be in GMT (preferring the literal 'GMT' string).
     * @return 
     */
    @Override
    protected List<PropertyDescriptor> getSupportedPropertyDescriptors() {
        return PROPERTIES;
    }

    @Override
    public Set<Relationship> getRelationships() {
        return relationships;
    }

    @Override
    public void onTrigger(ProcessContext context, ProcessSession session) throws ProcessException {
        FlowFile flowFile = session.get();

        if (flowFile == null) {
            flowFile = session.create();
        }
        String accessToken = context.getProperty(PROP_ACCESS_TOKEN).evaluateAttributeExpressions().getValue();
        String responseType=context.getProperty(PROP_RESPONSE_TYPE).toString();
        String url=getUrl(context.getProperty(PROP_API_METHOD).toString(),context.getProperty(PROP_ENDPOINT).toString(),responseType);
        try {            
            final ArrayList<String> responseJsonList = doGetRequest(url, accessToken);
            switch (responseJsonList.get(0)) {
                case "200":
                    transferResponseToFlowFile(session,flowFile,responseJsonList.get(1),REL_SUCCESS);
                    break;
                default:
                    getLogger().error(responseJsonList.get(1));
                    transferResponseToFlowFile(session,flowFile,responseJsonList.get(1),REL_FAILURE);       
                    break;
            }

        } catch (Exception ex) {
            getLogger().error(ex.getMessage());
            transferResponseToFlowFile(session,flowFile,ex.getMessage(),REL_FAILURE); 
        }
    }
    private void transferResponseToFlowFile(ProcessSession session, FlowFile flowFile, String responseMessage,Relationship relationship) {
        FlowFile flowFileContent = session.write(flowFile, (OutputStream outputStream) -> {
            outputStream.write(responseMessage.getBytes());
        });
       session.transfer(flowFileContent, relationship);
    }
    private String getUrl(String baseUrl,String endpoint,String type){
        String url;
        if(baseUrl.endsWith("/")){
             baseUrl= baseUrl.substring(0, baseUrl.length() - 1);
        }
        if(endpoint.startsWith("/")){
            endpoint= endpoint.substring(1, endpoint.length());
        }
        if(endpoint.endsWith("/")){
            endpoint= endpoint.substring(0, endpoint.length() - 1);
        }
        url=baseUrl+"/"+endpoint;
        if(type.equals("JSON"))
            url=url+"?format=json";
        return url;
    }
    private ArrayList<String> doGetRequest(String url, String encodedCredentials) throws Exception {
        ArrayList<String> responseList = new ArrayList<>();
        URL getUrl = new URL(url);
        HttpURLConnection connection = (HttpURLConnection) getUrl.openConnection();
        StringBuilder response = new StringBuilder();
        connection.setRequestProperty("Content-Type", DEFAULT_CONTENT_TYPE);
        connection.setRequestMethod("GET");
        connection.setRequestProperty("Authorization", "Bearer " + encodedCredentials);
        connection.connect();
            try (BufferedReader in = new BufferedReader(
                    new InputStreamReader(connection.getInputStream()))) {
                String inputLine;
                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
            }
        responseList.add(Integer.toString(connection.getResponseCode()));
        responseList.add(response.toString());
        return responseList;

    }

}

