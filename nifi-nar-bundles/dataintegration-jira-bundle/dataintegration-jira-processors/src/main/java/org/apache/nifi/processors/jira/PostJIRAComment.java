/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.nifi.processors.jira;

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
@Tags({"Post", "JIRA", "AddComment","task","issue"})
@InputRequirement(Requirement.INPUT_ALLOWED)
@CapabilityDescription("Processor to Adding the Comment to corresponding status in JIRA. You can achieve this by supply the required JIRA base URL, task Id along with user’s credentials.")
@DynamicProperty(name = "Header Name", value = "Attribute Expression Language", supportsExpressionLanguage = true, description = "Send request header "
        + "with a key matching the Dynamic Property Key and a value created by evaluating the Attribute Expression Language set in the value "
        + "of the Dynamic Property.")
public final class PostJIRAComment extends AbstractProcessor {

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

    public static final PropertyDescriptor Message = new PropertyDescriptor.Builder()
            .name("Message")
            .description("Enter the message to be post in JIRA task")
            .required(true)
            .expressionLanguageSupported(true)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .build();
    public static final List<PropertyDescriptor> PROPERTIES = Collections.unmodifiableList(Arrays.asList(
            BASE_URL,
            ISSUE_ID,
            USERNAME,
            PASSWORD,
            Message));

    // relationships
    public static final Relationship REL_SUCCESS = new Relationship.Builder()
            .name("success")
            .description("FlowFiles are routed to success if comment posted successfully in JIRA")
            .build();

    public static final Relationship REL_FAILURE = new Relationship.Builder()
            .name("failure")
            .description("FlowFiles are routed to failure if unable to do post the comment")
            .build();

    public static final Set<Relationship> relationships = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList(REL_SUCCESS, REL_FAILURE)));

    /**
     * Pattern used to compute RFC 2616 Dates (#sec3.3.1). This format is used
     * by the HTTP Date header and is optionally sent by the processor. This
     * date is effectively an RFC 822/1123 date string, but HTTP requires it to
     * be in GMT (preferring the literal 'GMT' string).
     *
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
            
            String commentMessage = context.getProperty(Message).evaluateAttributeExpressions().getValue();
            if(commentMessage == null || commentMessage.isEmpty())
                commentMessage = trimToEmpty(context.getProperty(Message).evaluateAttributeExpressions(flowFile).getValue());
            String constructedMessage = "{\"body\": \"" + commentMessage + "\"}";
            
            url = url + "/" + "rest/api/2/issue" + "/" + issueID + "/" + "comment";
            final ArrayList<String> responseJsonList = doPostRequest(url, encodedCredentials, constructedMessage);
            String responseCode = responseJsonList.get(0);
            String responseMessage = responseJsonList.get(1);
            switch (responseCode) {
                case "201":
                    getLogger().info("Transition was successful.");
                    session.transfer(flowFile, REL_SUCCESS);
                    break;
                case "400":
                    getLogger().error("Exception occurred: " + responseMessage);
                    session.transfer(flowFile, REL_FAILURE);
                    break;
                default:
                    getLogger().error("Exception occurred: " + responseMessage);
                    session.transfer(flowFile, REL_FAILURE);
                    break;
            }

        } catch (Exception ex) {
            getLogger().error(ex.getMessage());
            session.transfer(flowFile, REL_FAILURE);
        }
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
         responseList.add(response.toString());
        connection.disconnect();
        return responseList;
    }
}
