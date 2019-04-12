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
package org.apache.nifi.processors.sharepoint;

import java.io.OutputStream;
import java.net.InetAddress;
import org.apache.nifi.components.PropertyDescriptor;
import org.apache.nifi.flowfile.FlowFile;
import org.apache.nifi.annotation.behavior.ReadsAttribute;
import org.apache.nifi.annotation.behavior.ReadsAttributes;
import org.apache.nifi.annotation.behavior.WritesAttribute;
import org.apache.nifi.annotation.behavior.WritesAttributes;
import org.apache.nifi.annotation.lifecycle.OnScheduled;
import org.apache.nifi.annotation.documentation.CapabilityDescription;
import org.apache.nifi.annotation.documentation.SeeAlso;
import org.apache.nifi.annotation.documentation.Tags;
import org.apache.nifi.processor.exception.ProcessException;
import org.apache.nifi.processor.AbstractProcessor;
import org.apache.nifi.processor.ProcessContext;
import org.apache.nifi.processor.ProcessSession;
import org.apache.nifi.processor.ProcessorInitializationContext;
import org.apache.nifi.processor.Relationship;
import org.apache.nifi.processor.util.StandardValidators;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.BasicResponseHandler;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.NTCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.codehaus.jettison.json.JSONObject;

@Tags({"SharePoint", "Microsoft"})
@CapabilityDescription("Fetches data from SharePoint 2010 using NTLM authentication.")
@SeeAlso({})
@ReadsAttributes({@ReadsAttribute(attribute="", description="")})
@WritesAttributes({@WritesAttribute(attribute="", description="")})
public class GetSharePoint extends AbstractProcessor {
    
    public static final PropertyDescriptor REST_API_URL = new PropertyDescriptor
            .Builder().name("SharePoint REST API URL")
            .displayName("SharePoint REST API URL")
            .description("Enter the SharePoint 2010 REST API URL. E.g., http://sharepoint.domain.com/rdu/sales/_vti_bin/ListData.svc/{title}")
            .required(true)
            .expressionLanguageSupported(true)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .build();

    public static final PropertyDescriptor USER_NAME = new PropertyDescriptor
            .Builder().name("User name")
            .displayName("User name")
            .description("Enter your user name or domain name for SharePoint 2010.")
            .required(true)
            .expressionLanguageSupported(false)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .build();
    
    public static final PropertyDescriptor PASSWORD = new PropertyDescriptor
            .Builder().name("Password")
            .displayName("Password")
            .description("Enter your password for SharePoint 2010.")
            .required(true)
            .sensitive(true)
            .expressionLanguageSupported(false)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .build();
    
    public static final PropertyDescriptor DOMAIN_NAME = new PropertyDescriptor
            .Builder().name("Domain name")
            .displayName("Domain name")
            .description("Enter your domain name for SharePoint 2010.")
            .required(true)
            .expressionLanguageSupported(false)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .build();
    
    public static final Relationship REL_SUCCESS = new Relationship.Builder()
            .name("success")
            .description("All created FlowFiles are routed to this relationship")
            .build();
    
    public static final Relationship REL_FAILURE = new Relationship.Builder()
            .name("failure")
            .description("All created FlowFiles are routed to this relationship")
            .build();

    private List<PropertyDescriptor> descriptors;

    private Set<Relationship> relationships;
    
    @Override
    protected void init(final ProcessorInitializationContext context) {
        final List<PropertyDescriptor> descriptorsList = new ArrayList<>();
        descriptorsList.add(REST_API_URL);
        descriptorsList.add(USER_NAME);
        descriptorsList.add(PASSWORD);
        descriptorsList.add(DOMAIN_NAME);
        this.descriptors = Collections.unmodifiableList(descriptorsList);

        final Set<Relationship> relationshipsSet = new HashSet<>();
        relationshipsSet.add(REL_SUCCESS);
        relationshipsSet.add(REL_FAILURE);
        this.relationships = Collections.unmodifiableSet(relationshipsSet);
    }

    @Override
    public Set<Relationship> getRelationships() {
        return this.relationships;
    }

    @Override
    public final List<PropertyDescriptor> getSupportedPropertyDescriptors() {
        return descriptors;
    }

    @OnScheduled
    public void onScheduled(final ProcessContext context) {

    }

    @Override
    public void onTrigger(final ProcessContext context, final ProcessSession session) throws ProcessException {
        FlowFile flowFile = session.get();
        if ( flowFile == null ) {
            flowFile = session.create();
        }
        
        String restApiUrl = context.getProperty(REST_API_URL).evaluateAttributeExpressions(flowFile).getValue();
        String userName = context.getProperty(USER_NAME).getValue();
        String password = context.getProperty(PASSWORD).getValue();
        String domainName = context.getProperty(DOMAIN_NAME).getValue();
        String responseMessage = "";
        
        session.putAttribute(flowFile, "mime.type", "application/json");
        
        try{
            if(!(restApiUrl).equals("")){
                CredentialsProvider credentialProvider = new BasicCredentialsProvider();
                credentialProvider.setCredentials(new AuthScope(AuthScope.ANY),
                        new NTCredentials(userName, password, InetAddress.getLocalHost().getHostName(), domainName));
                
                try (CloseableHttpClient httpclient = HttpClients.custom().setDefaultCredentialsProvider(credentialProvider).build()) {
                    transferSharePointJsonData(restApiUrl, httpclient, session, flowFile, responseMessage);
                }
            } else{
                session.remove(flowFile);
            }
        } catch(Exception ex){
            getLogger().error(ex.getMessage());
            session.transfer(flowFile, REL_FAILURE);
        }
    }
    
    private void transferSharePointJsonData(String pagingUrl, CloseableHttpClient httpClient, ProcessSession session,
            FlowFile flowFile, String responseMessage) throws Exception{
        HttpGet httpget = new HttpGet(pagingUrl);
        httpget.setHeader("Accept", "application/json");
        
        try (CloseableHttpResponse response = httpClient.execute(httpget)) {
            if(response.getStatusLine().getStatusCode() == 401){
                getLogger().error("Invalid credential: Please check whether the given credentials are valid.");
                session.transfer(flowFile, REL_FAILURE);
                return;
            }
            ResponseHandler<String> handler = new BasicResponseHandler();
            responseMessage = handler.handleResponse(response);
            
            JSONObject jsonObject = new JSONObject(responseMessage);
            JSONObject jsonData  = (JSONObject)jsonObject.get("d");
            
            if(jsonData.getJSONArray("results").length() > 0){
                if (jsonData.has("__next")){
                    session.putAttribute(flowFile, "SharePointUrl", jsonData.getString("__next"));
                    transferSuccessRelationship(session, flowFile, responseMessage);
                } else {
                    session.putAttribute(flowFile, "SharePointUrl", "");
                    transferSuccessRelationship(session, flowFile, responseMessage);
                }
            } else{
                getLogger().error("No data found for given URL. " + pagingUrl);
                session.transfer(flowFile, REL_FAILURE);
            }
        }
    }
    
    private void transferSuccessRelationship(ProcessSession session, FlowFile flowFile, String responseMessage) {
        FlowFile flowFileContent = session.write(flowFile, (OutputStream outputStream) -> {
            outputStream.write(responseMessage.getBytes());
        });
        
        session.transfer(flowFileContent, REL_SUCCESS);
    }
}
