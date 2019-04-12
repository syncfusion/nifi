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
package org.apache.nifi.salesforce;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.apache.nifi.annotation.documentation.CapabilityDescription;
import org.apache.nifi.annotation.documentation.Tags;
import org.apache.nifi.annotation.lifecycle.OnDisabled;
import org.apache.nifi.annotation.lifecycle.OnEnabled;
import org.apache.nifi.components.PropertyDescriptor;
import org.apache.nifi.controller.AbstractControllerService;
import org.apache.nifi.controller.ConfigurationContext;
import org.apache.nifi.processor.exception.ProcessException;
import org.apache.nifi.processor.util.StandardValidators;
import org.apache.nifi.reporting.InitializationException;
import org.json.JSONObject;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.util.Map;
import java.util.HashMap;

@Tags({"Salesforce.com", "username-password", "oauth", "authentication"})
@CapabilityDescription("Service to provide authentication services against Salesforce.com")
public class  SalesforceAuthenticationService extends AbstractControllerService implements SalesforceUserPassAuthentication {

    //Salesforce.com Documentation around this authentication flow
    //https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_understanding_username_password_oauth_flow.htm
    public static String accessToken = null;
    public static String salesforceBaseURL = null;
    public static String salesforceVersion = null;
    public static ConfigurationContext salesforceContext = null;

    //TODO: create a custom validator. Make sure the user is entering a URL and it is using HTTPS which is required by Salesforce.
    public static final PropertyDescriptor AUTH_ENDPOINT = new PropertyDescriptor.
            Builder().name("REST Authentication Endpoint")
            .description("The URL for the authentication endpoint for Salesforce.com")
            .required(true)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .expressionLanguageSupported(false)
            .defaultValue("https://login.salesforce.com/services/oauth2/token")
            .build();

    public static final PropertyDescriptor SALESFORCE_VERSION = new PropertyDescriptor.Builder()
            .name("Version")
            .description("Enter Salesforce version")
            .required(true)
            .expressionLanguageSupported(false)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .defaultValue("v41.0")
            .build();

    public static final PropertyDescriptor CONSUMER_KEY = new PropertyDescriptor.Builder()
            .name("Consumer Key")
            .description("The 'Consumer Key' from the connected app definition.")
            .required(true)
            .expressionLanguageSupported(false)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .build();

    public static final PropertyDescriptor CONSUMER_SECRET = new PropertyDescriptor
            .Builder().name("Consumer Secret")
            .description("The 'Consumer Secret' from the connected app definition.")
            .required(true)
            .sensitive(true)
            .expressionLanguageSupported(false)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .build();

    public static final PropertyDescriptor USERNAME = new PropertyDescriptor.Builder()
            .name("Username")
            .description("End-user's username.")
            .required(true)
            .expressionLanguageSupported(false)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .build();

    public static final PropertyDescriptor PASSWORD = new PropertyDescriptor.
            Builder().name("Password")
            .description("End-user's password.")
            .required(true)
            .sensitive(true)
            .expressionLanguageSupported(false)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .build();

    public static final PropertyDescriptor USER_SECURITY_TOKEN = new PropertyDescriptor
            .Builder().name("User Security Token")
            .description("End-user's Security Token.")
            .required(true)
            .sensitive(true)
            .expressionLanguageSupported(false)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .build();

    private static final List<PropertyDescriptor> properties;

    static {
        final List<PropertyDescriptor> propertyDescriptor = new ArrayList<>();
        propertyDescriptor.add(AUTH_ENDPOINT);
        propertyDescriptor.add(SALESFORCE_VERSION);
        propertyDescriptor.add(CONSUMER_KEY);
        propertyDescriptor.add(CONSUMER_SECRET);
        propertyDescriptor.add(USERNAME);
        propertyDescriptor.add(PASSWORD);
        propertyDescriptor.add(USER_SECURITY_TOKEN);
        properties = Collections.unmodifiableList(propertyDescriptor);
    }

    @Override
    protected List<PropertyDescriptor> getSupportedPropertyDescriptors() {
        return properties;
    }

    /**
     * @param context the configuration context
     * @throws InitializationException if unable to create a database connection
     */
    @OnEnabled
    public void onEnabled(final ConfigurationContext context) throws InitializationException {
        salesforceContext = context;
        salesforceVersion = salesforceContext.getProperty(SALESFORCE_VERSION).evaluateAttributeExpressions().getValue();
        getAccessToken();
    }

    public void getAccessToken() throws InitializationException {
        StringBuilder response = new StringBuilder();
        URL url;
        try {

            url = new URL(salesforceContext.getProperty(AUTH_ENDPOINT).evaluateAttributeExpressions().getValue());
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();

            Map<String, String> params = new HashMap<>();
            params.put("client_id", salesforceContext.getProperty(CONSUMER_KEY).evaluateAttributeExpressions().getValue());
            params.put("client_secret", salesforceContext.getProperty(CONSUMER_SECRET).evaluateAttributeExpressions().getValue());
            params.put("grant_type", "password");
            params.put("username", salesforceContext.getProperty(USERNAME).evaluateAttributeExpressions().getValue());
            params.put("password", salesforceContext.getProperty(PASSWORD).evaluateAttributeExpressions().getValue() + salesforceContext.getProperty(USER_SECURITY_TOKEN).evaluateAttributeExpressions().getValue());

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

            JSONObject sfResponse = new JSONObject(response.toString());
            
            if (sfResponse.get("access_token") != null) {
                accessToken = sfResponse.getString("access_token");
                salesforceBaseURL = sfResponse.getString("instance_url");
                getLogger().info("Salesforce.com Access Token and base url received.");
            }

        } catch (IOException | ProcessException ex) {
            getLogger().error(ex.getMessage());
        }

    }

    @OnDisabled
    public void shutdown() {
        //TODO: Invalidate the access token here and "logout"
    }

    @Override
    public String getSalesforceAccessToken() throws ProcessException {
        return accessToken;
    }

    @Override
    public String getSalesforceBaseURL() {
        return salesforceBaseURL;
    }

    @Override
    public String getSalesforceVersion() {
        return salesforceVersion;
    }

    @Override
    public void refreshSalesforceAccessToken() throws Exception {
        getAccessToken();
    }
}
