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
package org.apache.nifi.processors.instagram;

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
@Tags({"Instagram", "Get", "social media"})
@InputRequirement(Requirement.INPUT_ALLOWED)
@CapabilityDescription("Processor to retrieve data from Instagram. "
        + "You can achieve this by supplying the required API endpoints and access token.")
@DynamicProperty(name = "Header Name", value = "Attribute Expression Language", supportsExpressionLanguage = true, description = "Send request header "
        + "with a key matching the Dynamic Property Key and a value created by evaluating the Attribute Expression Language set in the value "
        + "of the Dynamic Property.")
public final class GetInstagram extends AbstractProcessor {

    public static final String DEFAULT_CONTENT_TYPE = "application/json";  
   public static final PropertyDescriptor INSTAGRAM_HOST = new PropertyDescriptor
            .Builder().name("Instagram Host")
            .description("Instagram API url")
            .required(true)
            .defaultValue("https://api.instagram.com/v1")
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .build();
    public static final PropertyDescriptor END_POINT = new PropertyDescriptor
            .Builder().name("End Point")
            .description("Instagram API end point")
            .required(true)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .build();
    public static final PropertyDescriptor ACCESS_TOKEN = new PropertyDescriptor
         .Builder().name("Access Token")
         .description("OAuth2 access token")
         .required(true)
         .sensitive(true)
         .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
         .build();
    // relationships
    public static final Relationship REL_SUCCESS = new Relationship.Builder()
            .name("success")
            .description("FlowFiles are routed to success if data retrieved from Instagram successfully")
            .build();

    public static final Relationship REL_FAILURE = new Relationship.Builder()
            .name("failure")
            .description("FlowFiles are routed to failure if unable to get data from Instagram")
            .build();
  private static final List<PropertyDescriptor> PROPERTIES = Collections.unmodifiableList(Arrays.asList(
            INSTAGRAM_HOST,
            END_POINT,
            ACCESS_TOKEN));
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
        String hostUrl=context.getProperty(INSTAGRAM_HOST).evaluateAttributeExpressions().getValue();
        String endPoint=context.getProperty(END_POINT).evaluateAttributeExpressions().getValue();
        String accessToken = context.getProperty(ACCESS_TOKEN).evaluateAttributeExpressions().getValue();
        if(hostUrl.endsWith("/"))
        {
            hostUrl=hostUrl.substring(0, hostUrl.length()-1);
        }
        if(endPoint.startsWith("/")){
            endPoint=endPoint.substring(1, endPoint.length());
        }
        if(endPoint.endsWith("/")){
            endPoint=endPoint.substring(0, endPoint.length()-1);
        }
        String url=hostUrl+"/"+endPoint+"?access_token="+accessToken;
        try {            
            final ArrayList<String> responseJsonList = doGetRequest(url);
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
    private ArrayList<String> doGetRequest(String url) throws Exception {
        ArrayList<String> responseList = new ArrayList<>();
        URL getUrl = new URL(url);
        HttpURLConnection connection = (HttpURLConnection) getUrl.openConnection();
        StringBuilder response = new StringBuilder();
        connection.setRequestProperty("Content-Type", DEFAULT_CONTENT_TYPE);
        connection.setRequestMethod("GET");
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