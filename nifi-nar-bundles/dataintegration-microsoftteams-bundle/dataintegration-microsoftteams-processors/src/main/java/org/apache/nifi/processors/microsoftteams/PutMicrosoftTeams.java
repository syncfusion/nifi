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
package org.apache.nifi.processors.microsoftteams;

import java.net.URL;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import static org.apache.commons.lang3.StringUtils.trimToEmpty;
import org.apache.nifi.annotation.behavior.DynamicProperty;
import org.apache.nifi.annotation.behavior.InputRequirement;
import org.apache.nifi.annotation.behavior.InputRequirement.Requirement;
import org.apache.nifi.annotation.behavior.SupportsBatching;
import org.apache.nifi.annotation.documentation.CapabilityDescription;
import org.apache.nifi.annotation.documentation.Tags;
import org.apache.nifi.components.PropertyDescriptor;
import org.apache.nifi.expression.AttributeExpression;
import org.apache.nifi.flowfile.FlowFile;
import org.apache.nifi.processor.AbstractProcessor;
import org.apache.nifi.processor.ProcessContext;
import org.apache.nifi.processor.ProcessSession;
import org.apache.nifi.processor.Relationship;
import org.apache.nifi.processor.exception.ProcessException;
import org.apache.nifi.processor.util.StandardValidators;


@SupportsBatching
@Tags({"put", "Microsoft Teams", "Message","alert","notification"})
@InputRequirement(Requirement.INPUT_ALLOWED)
@CapabilityDescription("Processor to send message or any data to require teams in Microsoft."
        + "You can supply the required web hook URL and message in JSON format to send a message in Microsoft teams.")
@DynamicProperty(name = "Header Name", value = "Attribute Expression Language", supportsExpressionLanguage = true, description = "Send request header "
        + "with a key matching the Dynamic Property Key and a value created by evaluating the Attribute Expression Language set in the value "
        + "of the Dynamic Property.")
public final class PutMicrosoftTeams extends AbstractProcessor {

    public static final String DEFAULT_CONTENT_TYPE = "application/octet-stream";

    public static final PropertyDescriptor PROP_URL = new PropertyDescriptor.Builder()
            .name("Webhook URL")
            .description("Webhook URL which will be connected to microsot teams.")
            .required(true)
            .expressionLanguageSupported(false)
            .addValidator(StandardValidators.URL_VALIDATOR)
            .build();

    public static final PropertyDescriptor PROP_BODY = new PropertyDescriptor.Builder()
            .name("Message")
            .description("Enter message in valid Json format.For E.g. Please refer https://msdn.microsoft.com/en-us/microsoft-teams/connectors")
            //.addValidator(StandardValidators.JSON_STRING_VALIDATOR)
            .required(true)
            .defaultValue("{\"text\": \"Test Message\"}")
            .expressionLanguageSupported(true)
            .addValidator(StandardValidators.createAttributeExpressionLanguageValidator(AttributeExpression.ResultType.STRING))
            .build();

    public static final List<PropertyDescriptor> PROPERTIES = Collections.unmodifiableList(Arrays.asList(
            PROP_URL,
            PROP_BODY));

    // relationships
    public static final Relationship REL_SUCCESS = new Relationship.Builder()
            .name("success")
            .description("FlowFiles are routed to success after being successfully sent to microsoft teams")
            .build();

    public static final Relationship REL_FAILURE = new Relationship.Builder()
            .name("failure")
            .description("FlowFiles are routed to failure if unable to be sent to microsoft teams")
            .build();

    public static final Set<Relationship> relationships = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList(REL_SUCCESS, REL_FAILURE)));

    /**
     * Pattern used to compute RFC 2616 Dates (#sec3.3.1). This format is used
     * by the HTTP Date header and is optionally sent by the processor. This
     * date is effectively an RFC 822/1123 date string, but HTTP requires it to
     * be in GMT (preferring the literal 'GMT' string).
     */
    private static final String RFC_1123 = "EEE, dd MMM yyyy HH:mm:ss 'GMT'";

    @Override
    protected List<PropertyDescriptor> getSupportedPropertyDescriptors() {
        return PROPERTIES;
    }

    @Override
    protected PropertyDescriptor getSupportedDynamicPropertyDescriptor(String propertyDescriptorName) {
        return new PropertyDescriptor.Builder()
                .required(false)
                .name(propertyDescriptorName)
                .addValidator(StandardValidators.createAttributeExpressionLanguageValidator(AttributeExpression.ResultType.STRING, true))
                .dynamic(true)
                .expressionLanguageSupported(true)
                .build();
    }

    @Override
    public Set<Relationship> getRelationships() {
        return this.relationships;
    }

    @Override
    public void onTrigger(ProcessContext context, ProcessSession session) throws ProcessException {
        FlowFile flowFile = session.get();

        
        if (flowFile == null) {
            flowFile = session.create();
        }
        
        // Message could not be sent for the requested URL. Please verify the channel url again. 
        String url = context.getProperty(PROP_URL).evaluateAttributeExpressions().getValue();
        String userMessage = context.getProperty(PROP_BODY).evaluateAttributeExpressions().getValue();
        String output = trimToEmpty(context.getProperty(PROP_BODY).evaluateAttributeExpressions(flowFile).getValue());
        if (userMessage == null || userMessage.isEmpty()) {
            userMessage = output;
        }
        try {
            if (doPostRequest(url, userMessage)) {
                getLogger().info("Successfully posted message to Microsoft teams");
                session.transfer(flowFile, REL_SUCCESS);
            } else {
                getLogger().error("Message could not be sent for the requested URL. Please verify the channel url again.");
                session.transfer(flowFile, REL_FAILURE);
            }
        } catch (Exception ex) {
             getLogger().error(ex.getMessage());
            session.transfer(flowFile, REL_FAILURE);
        }
    }

    protected boolean doPostRequest(String url, String message)
            throws Exception {
        URL postUrl = new URL(url);
        HttpURLConnection connection = (HttpURLConnection) postUrl.openConnection();
        byte[] data = message.getBytes();
        connection.setFixedLengthStreamingMode(data.length);
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestMethod("POST");
        connection.setDoOutput(true);
        connection.connect();
        try (OutputStream writeData = connection.getOutputStream()) {
            writeData.write(data);
            writeData.flush();
        }
        if (connection.getResponseCode() != 200) {
            connection.disconnect();
            return false;
        }
        return true;
    }

}
