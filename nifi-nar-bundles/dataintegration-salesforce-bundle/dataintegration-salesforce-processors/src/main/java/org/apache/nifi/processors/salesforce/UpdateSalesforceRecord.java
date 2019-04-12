/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.apache.nifi.processors.salesforce;

import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import static org.apache.commons.lang3.StringUtils.trimToEmpty;
import org.apache.nifi.annotation.documentation.CapabilityDescription;
import org.apache.nifi.annotation.documentation.Tags;
import org.apache.nifi.components.PropertyDescriptor;
import org.apache.nifi.flowfile.FlowFile;
import org.apache.nifi.processor.ProcessContext;
import org.apache.nifi.processor.ProcessSession;
import org.apache.nifi.processor.ProcessorInitializationContext;
import org.apache.nifi.processor.Relationship;
import org.apache.nifi.processor.exception.ProcessException;
import org.apache.nifi.processor.util.StandardValidators;
import org.apache.nifi.salesforce.SalesforceUserPassAuthentication;

@Tags({"salesforce", "update", "sobject","record"})
@CapabilityDescription("Processor to update records in required salesforce object. Provide the updated record information in requested message field "
        +"with a specific record ID to update that record. Records in a single file must be of the same object type.")
public class UpdateSalesforceRecord extends AbstractSalesForceProcessor {
    
    private static final String SALESFORCE_OP = "sobjects";
    
    public static final PropertyDescriptor SOBJECT_NAME = new PropertyDescriptor
            .Builder().name("Salesforce Object Name")
            .description("Enter Salesforce object name.")
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .expressionLanguageSupported(true)
            .required(true)
            .build();

    public static final PropertyDescriptor SOBJECT_ID = new PropertyDescriptor
            .Builder()
            .name("Salesforce Object Id")
            .description("Enter Salesforce object id to update corresponding record.")
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .expressionLanguageSupported(true)
            .required(true)
            .build();
    
    public static final PropertyDescriptor REQUEST_BODY = new PropertyDescriptor
            .Builder()
            .name("Request body message")
            .description("Enter request body message in valid Json format to update corresponding record. "
                    + "     Eg: "+ "{ \"key\" : \"value\" }")
            .defaultValue("{ \"key\" : \"value\" }")
            .addValidator(StandardValidators.JSON_STRING_VALIDATOR)
            .expressionLanguageSupported(true)
            .required(true)
            .build();

    private List<PropertyDescriptor> descriptors;

    private Set<Relationship> relationships;

    @Override
    protected void init(final ProcessorInitializationContext context) {
        final List<PropertyDescriptor> propertyDescriptor = new ArrayList<>();
        propertyDescriptor.add(SALESFORCE_AUTH_SERVICE);
        propertyDescriptor.add(SOBJECT_NAME);
        propertyDescriptor.add(SOBJECT_ID);
        propertyDescriptor.add(REQUEST_BODY);
        this.descriptors = Collections.unmodifiableList(propertyDescriptor);

        final Set<Relationship> relationship = new HashSet<>();
        relationship.add(REL_SUCCESS);
        relationship.add(REL_FAILURE);
        this.relationships = Collections.unmodifiableSet(relationship);
    }

    @Override
    public Set<Relationship> getRelationships() {
        return this.relationships;
    }

    @Override
    public final List<PropertyDescriptor> getSupportedPropertyDescriptors() {
        return descriptors;
    }

    @Override
    public void onTrigger(final ProcessContext context, final ProcessSession session) throws ProcessException {
        FlowFile flowFile = session.get();
        if ( flowFile == null ) {
            flowFile = session.create();
        }

        final SalesforceUserPassAuthentication sfAuthService = context.getProperty(SALESFORCE_AUTH_SERVICE)
                .asControllerService(SalesforceUserPassAuthentication.class);

        try {
            String sobjectName = context.getProperty(SOBJECT_NAME).evaluateAttributeExpressions().getValue();
            if(sobjectName == null || sobjectName.isEmpty())
                sobjectName = trimToEmpty(context.getProperty(SOBJECT_NAME).evaluateAttributeExpressions(flowFile).getValue());
            
            String sobjectId = context.getProperty(SOBJECT_ID).evaluateAttributeExpressions().getValue();
            if(sobjectId == null || sobjectId.isEmpty())
                sobjectId = trimToEmpty(context.getProperty(SOBJECT_ID).evaluateAttributeExpressions(flowFile).getValue());
            
            String endpoint = SALESFORCE_OP + "/" + sobjectName + "/" + sobjectId;
            
            String jsonString = context.getProperty(REQUEST_BODY).evaluateAttributeExpressions().getValue();
            if(jsonString == null || jsonString.isEmpty())
                jsonString = trimToEmpty(context.getProperty(REQUEST_BODY).evaluateAttributeExpressions(flowFile).getValue());
            
            final ArrayList<String> responseJsonList = getResponse("PATCH", generateSalesforceURL(endpoint), 
                    sfAuthService.getSalesforceAccessToken(), jsonString);
            
            String responseCode = responseJsonList.get(0);
            String responseMessage = responseJsonList.get(1);
            
            if (responseCode.equals("401") && responseMessage.contains("INVALID_SESSION_ID")) {
                sfAuthService.refreshSalesforceAccessToken();
                ArrayList<String> responseJsonLists = getResponse("PATCH", generateSalesforceURL(endpoint), 
                    sfAuthService.getSalesforceAccessToken(), jsonString);
                
                String newResponseCode = responseJsonLists.get(0);
                String newResponseMessage = responseJsonLists.get(1);
                if (newResponseCode.equals("200")) {
                    TransferGetSobjectsRelationship(session, flowFile, newResponseMessage);
                } else {
                    getLogger().error("Exception occurred: " + responseMessage);
                    session.transfer(flowFile, REL_FAILURE);
                }
            } else if (responseCode.equals("204")) {
                TransferGetSobjectsRelationship(session, flowFile, responseMessage);
            } else {
                getLogger().error("Exception occurred: " + responseMessage);
                session.transfer(flowFile, REL_FAILURE);
            }
        } catch (Exception ex) {
            getLogger().error(ex.getMessage());
            session.transfer(flowFile, REL_FAILURE);
        }
    }
    
    private void TransferGetSobjectsRelationship(ProcessSession session, FlowFile flowFile, String responseMessage) {
        FlowFile flowFileContent = session.write(flowFile, (OutputStream outputStream) -> {
            outputStream.write(responseMessage.getBytes());
        });
        session.transfer(flowFileContent, REL_SUCCESS);
    }
    
}