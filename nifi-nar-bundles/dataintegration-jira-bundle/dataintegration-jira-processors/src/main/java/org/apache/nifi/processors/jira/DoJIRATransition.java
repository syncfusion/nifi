/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.apache.nifi.processors.jira;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.BufferedReader;
import java.io.IOException;
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
import java.util.Base64;
import static org.apache.commons.lang3.StringUtils.trimToEmpty;
import org.apache.nifi.annotation.behavior.DynamicProperty;
import org.apache.nifi.annotation.behavior.InputRequirement;
import org.apache.nifi.annotation.behavior.InputRequirement.Requirement;
import org.apache.nifi.annotation.behavior.SupportsBatching;
import org.apache.nifi.annotation.documentation.CapabilityDescription;
import org.apache.nifi.annotation.documentation.Tags;
import org.apache.nifi.components.PropertyDescriptor;
import org.apache.nifi.flowfile.FlowFile;
import org.apache.nifi.processor.AbstractProcessor;
import org.apache.nifi.processor.ProcessContext;
import org.apache.nifi.processor.ProcessSession;
import org.apache.nifi.processor.Relationship;
import org.apache.nifi.processor.exception.ProcessException;
import org.apache.nifi.processor.util.StandardValidators;

@SupportsBatching
@Tags({"issue", "task", "JIRA", "Transition Status"})
@InputRequirement(Requirement.INPUT_ALLOWED)
@CapabilityDescription("Processor to directly change issue status of the required task in JIRA. "
        + "You can achieve this by supply the required JIRA base URL, task Id along with user’s credentials.")
@DynamicProperty(name = "Header Name", value = "Attribute Expression Language", supportsExpressionLanguage = true, description = "Send request header "
        + "with a key matching the Dynamic Property Key and a value created by evaluating the Attribute Expression Language set in the value "
        + "of the Dynamic Property.")
public final class DoJIRATransition extends AbstractProcessor {

    public static final String DEFAULT_CONTENT_TYPE = "application/json";

    public static final PropertyDescriptor BASE_URL = new PropertyDescriptor.Builder()
            .name("JIRA Base URL")
            .description("Base URL which will be connected to JIRA.")
            .required(true)
            .expressionLanguageSupported(true)
            .addValidator(StandardValidators.URL_VALIDATOR)
            .defaultValue("https://jira.atlassian.net")
            .build();

    public static final PropertyDescriptor ISSUE_ID = new PropertyDescriptor.Builder()
            .name("Issue ID")
            .description("JIRA Task ID to get the status.")
            .required(true)
            .expressionLanguageSupported(true)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .required(true)
            .build();

    public static final PropertyDescriptor USERNAME = new PropertyDescriptor.Builder()
            .name("Username")
            .description("JIRA Username.")
            .required(true)
            .expressionLanguageSupported(true)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .build();

    public static final PropertyDescriptor PASSWORD = new PropertyDescriptor.Builder().name("Password")
            .description("JIRA Password.")
            .required(true)
            .sensitive(true)
            .expressionLanguageSupported(true)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .build();

    
      public static final PropertyDescriptor TRANSITION_STATUS = new PropertyDescriptor.Builder()
            .name("Transition Status")
            .description("Transition Status can be \"Open\",\"In Progress\",\"Closed\",\"Validated\" etc.")
            .required(true)
            .expressionLanguageSupported(true)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .build();
    public static final List<PropertyDescriptor> PROPERTIES = Collections.unmodifiableList(Arrays.asList(
            BASE_URL,
            ISSUE_ID,
            USERNAME,
            PASSWORD,
            TRANSITION_STATUS));

    // relationships
    public static final Relationship REL_SUCCESS = new Relationship.Builder()
            .name("success")
            .description("FlowFiles are routed to success if JIRA transition done successfully.")
            .build();

    public static final Relationship REL_FAILURE = new Relationship.Builder()
            .name("failure")
            .description("FlowFiles are routed to failure if unable to do transition in JIRA")
            .build();

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

        String url = context.getProperty(BASE_URL).evaluateAttributeExpressions().getValue();
        String username = context.getProperty(USERNAME).evaluateAttributeExpressions().getValue();
        String password = context.getProperty(PASSWORD).evaluateAttributeExpressions().getValue();
        String encodedCredentials = Base64.getEncoder().encodeToString((username + ":" + password).getBytes());

        try {
            String issueID = context.getProperty(ISSUE_ID).evaluateAttributeExpressions().getValue();
            if(issueID == null || issueID.isEmpty())
                issueID = trimToEmpty(context.getProperty(ISSUE_ID).evaluateAttributeExpressions(flowFile).getValue());
            
            String transitionStatus = context.getProperty(TRANSITION_STATUS).evaluateAttributeExpressions().getValue();
            if(transitionStatus == null || transitionStatus.isEmpty())
                transitionStatus = trimToEmpty(context.getProperty(TRANSITION_STATUS).evaluateAttributeExpressions(flowFile).getValue());
            
            url = url + "/" + "rest/api/2/issue" + "/" + issueID + "/" + "transitions";
            final ArrayList<String> responseJsonList = doGetRequest(url, encodedCredentials);
            switch (responseJsonList.get(0)) {
                case "200":
                    ObjectMapper mapper = new ObjectMapper();
                    TransitionResponse transitionResponse = mapper.readValue(responseJsonList.get(1), TransitionResponse.class);
                    url += "?expand=transitions.fields";
                    String body = "{\"transition\": {\"id\": \"" + getTransitionId(transitionResponse, transitionStatus) + "\"}}";
                    final ArrayList<String> postResponseList = doPostRequest(url, encodedCredentials, body);
                    String newResponseCode = postResponseList.get(0);
                    switch (newResponseCode) {
                        case "204":
                            getLogger().info("Transition was successful.");
                            session.transfer(flowFile, REL_SUCCESS);
                            break;
                        case "404":
                            getLogger().error("The issue does not exist or the user does not have permission to view it");
                            session.transfer(flowFile, REL_FAILURE);
                            break;
                        case "400":
                            getLogger().error("There is no transition specified.");
                            session.transfer(flowFile, REL_FAILURE);
                            break;
                        default:
                            getLogger().error("Exception occurred:");
                            session.transfer(flowFile, REL_FAILURE);
                            break;
                    }   break;
                case "404":
                    getLogger().error(responseJsonList.get(1));
                    session.transfer(flowFile, REL_FAILURE);
                    break;
                default:
                    getLogger().error(responseJsonList.get(1));
                    session.transfer(flowFile, REL_FAILURE);
                    break;
            }

        } catch (Exception ex) {
            getLogger().error(ex.getMessage());
            session.transfer(flowFile, REL_FAILURE);
        }
    }
    
    private String getTransitionId(TransitionResponse transitionResponse, String transitionStatus) throws IOException {
        for (Transition transition : transitionResponse.Transitions) {
            if(transition.Name.toLowerCase().equals(transitionStatus.toLowerCase())) {
                return transition.ID;
            }
        }
        throw new IOException("Given transition status is not available for this issue ID");
    }
    
    private ArrayList<String> doPostRequest(String url, String encodedCredentials, String body)
            throws Exception {
        ArrayList<String> responseList = new ArrayList<>();
        StringBuilder response = new StringBuilder();
        byte[] data = body.getBytes();
        URL postUrl = new URL(url);
        HttpURLConnection connection = (HttpURLConnection) postUrl.openConnection();
        connection.setRequestProperty("Content-Type", DEFAULT_CONTENT_TYPE);
        connection.setRequestMethod("POST");
        connection.setDoOutput(true);
        connection.setRequestProperty("Authorization", "Basic " + encodedCredentials);
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
        responseList.add(Integer.toString(connection.getResponseCode()));
        connection.disconnect();
        return responseList;
    }

    private ArrayList<String> doGetRequest(String url, String encodedCredentials) throws Exception {
        ArrayList<String> responseList = new ArrayList<>();
        URL getUrl = new URL(url);
        HttpURLConnection connection = (HttpURLConnection) getUrl.openConnection();
        StringBuilder response = new StringBuilder();
        connection.setRequestProperty("Content-Type", DEFAULT_CONTENT_TYPE);
        connection.setRequestMethod("GET");
        connection.setRequestProperty("Authorization", "Basic " + encodedCredentials);
        connection.connect();
        try {
            try (BufferedReader in = new BufferedReader(
                    new InputStreamReader(connection.getInputStream()))) {
                String inputLine;
                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
            }
        } catch (IOException ex) {
            try (BufferedReader in = new BufferedReader(
                    new InputStreamReader(connection.getErrorStream()))) {
                String inputLine;
                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
            }
        }
        responseList.add(Integer.toString(connection.getResponseCode()));
        responseList.add(response.toString());
        return responseList;

    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TransitionResponse {

        public TransitionResponse() {}
        
        @JsonProperty("transitions")
        public List<Transition> Transitions;

    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Transition {

        public Transition() {}
        
        @JsonProperty("id")
        public String ID;

        @JsonProperty("name")
        public String Name;
    }

}

