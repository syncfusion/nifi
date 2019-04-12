/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.apache.nifi.processors.salesforce;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPatch;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

import org.apache.nifi.components.PropertyDescriptor;
import org.apache.nifi.processor.AbstractProcessor;
import org.apache.nifi.processor.ProcessContext;
import org.apache.nifi.processor.ProcessSession;
import org.apache.nifi.processor.Relationship;
import org.apache.nifi.processor.exception.ProcessException;
import org.apache.nifi.salesforce.SalesforceUserPassAuthentication;
import org.apache.nifi.salesforce.SalesforceAuthenticationService;

public class AbstractSalesForceProcessor extends AbstractProcessor {

    protected static final PropertyDescriptor SALESFORCE_AUTH_SERVICE = new PropertyDescriptor.Builder()
            .name("Salesforce Authentication Service")
            .description("Salesforce Authentication service for username-password OAuth Authentication flow")
            .required(true)
            .identifiesControllerService(SalesforceUserPassAuthentication.class)
            .build();

    protected static final Relationship REL_SUCCESS = new Relationship.Builder()
            .name("success")
            .description("Operation completed successfully")
            .build();

    protected static final Relationship REL_FAILURE = new Relationship.Builder()
            .name("failure")
            .description("Operation failed")
            .build();

    protected static final String RESPONSE_JSON = "json";
    protected static final String RESPONSE_XML = "xml";

    @Override
    public void onTrigger(ProcessContext processContext, ProcessSession processSession) throws ProcessException {

    }

    protected ArrayList<String> getResponse(String methodType, String url, String accessToken, String jsonData) throws Exception{
        ArrayList<String> responseList = new ArrayList<>();
        URL connectionUrl = new URL(url);
        HttpURLConnection connection = (HttpURLConnection) connectionUrl.openConnection();
        
        switch(methodType){
            case "GET": 
                responseList = accessGetMethod(connection, accessToken);                
                break;
            case "POST":
                responseList = accessPostMethod(jsonData, connection, accessToken);
                break;
            case "PATCH":
                responseList = accessPatchMethod(url, jsonData, accessToken);
                break;
             case "DELETE":
                responseList = accessDeleteMethod(connection, accessToken);
                break;    
        }
        
        return responseList;
    }
    
    // HTTP GET request
    protected ArrayList<String> accessGetMethod(HttpURLConnection connection, String accessToken) throws Exception {
        ArrayList<String> responseList = new ArrayList<>();
        StringBuilder response = new StringBuilder();
        connection.setRequestMethod("GET");
        connection.setRequestProperty("Authorization", "Bearer " + accessToken);
        connection.connect();
        try {
            try (BufferedReader in = new BufferedReader(
                    new InputStreamReader(connection.getInputStream()))) {
                String inputLine;
                response = new StringBuilder();
                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
            }
        } catch (Exception ex) {
            try (BufferedReader in = new BufferedReader(
                    new InputStreamReader(connection.getErrorStream()))) {
                String inputLine;
                response = new StringBuilder();
                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
            }
        }
        responseList.add(Integer.toString(connection.getResponseCode()));
        responseList.add(response.toString());
        return responseList;

    }

    // HTTP POST
    protected ArrayList<String> accessPostMethod(String jsonData, HttpURLConnection connection, String accessToken)
            throws Exception {
        ArrayList<String> responseList = new ArrayList<>();
        StringBuilder response = new StringBuilder();
        byte[] data = jsonData.getBytes();
        connection.setFixedLengthStreamingMode(data.length);
        connection.setRequestProperty("Authorization", "Bearer " + accessToken);
        connection.setRequestProperty("Content-Type", "application/json");
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
        String responseString = (connection.getResponseCode()==401)?
                "[{\"message\": \"Session expired or invalid\",\"errorCode\": \"INVALID_SESSION_ID\"}]":response.toString();
        readData.close();
        responseList.add(Integer.toString(connection.getResponseCode()));
        responseList.add(responseString);
        connection.disconnect();
        return responseList;
    }

    //HTTP PATCH
    protected ArrayList<String> accessPatchMethod(String url, String jsonData, String accessToken) 
            throws IOException{
        
        ArrayList<String> responseList = new ArrayList<>();
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpPatch httpPatch = new HttpPatch(url);
        httpPatch.setEntity(new StringEntity(jsonData, ContentType.APPLICATION_JSON));
        httpPatch.addHeader("Authorization", "Bearer " + accessToken);
        try (CloseableHttpResponse response = httpClient.execute(httpPatch)) {
            responseList.add(Integer.toString(response.getStatusLine().getStatusCode()));
            if(response.getEntity() != null)
                responseList.add(EntityUtils.toString(response.getEntity()));
            else
                responseList.add("Salesforce record updated successfully.");
        }
        
        return responseList;
    }
    
     // HTTP DELETE request
    protected ArrayList<String> accessDeleteMethod(HttpURLConnection connection, String accessToken) throws Exception {
        ArrayList<String> responseList = new ArrayList<>();
        StringBuilder response = new StringBuilder();
        connection.setRequestMethod("DELETE");
        connection.setRequestProperty("Authorization", "Bearer " + accessToken);
        connection.connect();
        try {
            try (BufferedReader in = new BufferedReader(
                    new InputStreamReader(connection.getInputStream()))) {
                String inputLine;
                response = new StringBuilder();
                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
            }
        } catch (Exception ex) {
            try (BufferedReader in = new BufferedReader(
                    new InputStreamReader(connection.getErrorStream()))) {
                String inputLine;
                response = new StringBuilder();
                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
            }
        }
        responseList.add(Integer.toString(connection.getResponseCode()));
        responseList.add(response.toString());
        return responseList;

    }
    
    protected String generateSalesforceURL(String apiEndpoint) {
        StringBuilder url = new StringBuilder();
        url.append(SalesforceAuthenticationService.salesforceBaseURL);
        url.append("/services/data/");
        url.append(SalesforceAuthenticationService.salesforceVersion);
        url.append("/");
        url.append(apiEndpoint);

        try {
            return url.toString();
        } catch (Exception ex) {
            getLogger().info("Error occurred while forming Salesforce URL.");
        }
        return null;
    }
}
