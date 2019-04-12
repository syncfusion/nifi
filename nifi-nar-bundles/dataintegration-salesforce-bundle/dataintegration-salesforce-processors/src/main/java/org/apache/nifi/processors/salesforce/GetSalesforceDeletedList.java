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

@Tags({"salesforce", "deleted", "sobject"})
@CapabilityDescription("Retrieves the list of individual records that have been deleted within the given timespan for the specified object."
        +"SObject Get Deleted is available in API version 29.0 and later.\n" 
        +"Information on deleted records are returned only if the current session user has access to them. Results are returned for no more than 15 days before the day the call is executed.")
public class GetSalesforceDeletedList extends AbstractSalesForceProcessor {
    //https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_getdeleted.htm
    
    private static final String SALESFORCE_OP = "sobjects";

    public static final PropertyDescriptor SALESFORCE_OBJECT_NAME = new PropertyDescriptor.Builder().name("Salesforce Object Name")
            .description("Enter Salesforce object name.")
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .expressionLanguageSupported(true)
            .required(true)
            .build();

    public static final PropertyDescriptor START_DATE_AND_TIME = new PropertyDescriptor.Builder().name("Start Date and Time")
            .description("Enter ISO 8601 formatted start date to get deleted records.")
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .defaultValue("yyyy-mm-ddThh:mm:ssZ")
            .required(true)
            .expressionLanguageSupported(true)
            .build();

    public static final PropertyDescriptor END_DATE_AND_TIME = new PropertyDescriptor.Builder().name("End Date and Time")
            .description("Enter ISO 8601 formatted end date to get deleted records.")
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .required(true)
            .required(true)
            .defaultValue("yyyy-mm-ddThh:mm:ssZ")
            .expressionLanguageSupported(true)
            .build();

    private List<PropertyDescriptor> descriptors;

    private Set<Relationship> relationships;

    @Override
    protected void init(final ProcessorInitializationContext context) {
        final List<PropertyDescriptor> propertyDescriptor = new ArrayList<>();
        propertyDescriptor.add(SALESFORCE_AUTH_SERVICE);
        propertyDescriptor.add(SALESFORCE_OBJECT_NAME);
        propertyDescriptor.add(START_DATE_AND_TIME);
        propertyDescriptor.add(END_DATE_AND_TIME);
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
        if (flowFile == null) {
            flowFile = session.create();
        }

        final SalesforceUserPassAuthentication sfAuthService = context.getProperty(SALESFORCE_AUTH_SERVICE)
                .asControllerService(SalesforceUserPassAuthentication.class);

        try {
            String salesforceQuery = context.getProperty(SALESFORCE_OBJECT_NAME).evaluateAttributeExpressions().getValue();
            if(salesforceQuery == null || salesforceQuery.isEmpty())
                salesforceQuery = trimToEmpty(context.getProperty(SALESFORCE_OBJECT_NAME).evaluateAttributeExpressions(flowFile).getValue());
            
            String endpoint = SALESFORCE_OP + "/" + salesforceQuery + "/deleted/?start="
                    + context.getProperty(START_DATE_AND_TIME).evaluateAttributeExpressions(flowFile).getValue() + 
                    "&end=" + context.getProperty(END_DATE_AND_TIME).evaluateAttributeExpressions(flowFile).getValue();

            final ArrayList<String> responseJsonList = getResponse("GET", generateSalesforceURL(endpoint), 
                    sfAuthService.getSalesforceAccessToken(), null);
            
            String responseCode = responseJsonList.get(0);
            String responseMessage = responseJsonList.get(1);
            
            if (responseCode.equals("401") && responseMessage.contains("INVALID_SESSION_ID")) {
                sfAuthService.refreshSalesforceAccessToken();
                ArrayList<String> responseJsonLists = getResponse("GET", generateSalesforceURL(endpoint), 
                    sfAuthService.getSalesforceAccessToken(), null);
                
                String newResponseCode = responseJsonLists.get(0);
                String newResponseMessage = responseJsonLists.get(1);
                if (newResponseCode.equals("200")) {
                    TransferDeletedRelationship(session, flowFile, newResponseMessage);
                } else {
                    getLogger().error("Exception occurred: " + responseMessage);
                    session.transfer(flowFile, REL_FAILURE);
                }
            } else if (responseCode.equals("200")) {
                TransferDeletedRelationship(session, flowFile, responseMessage);
            } else {
                getLogger().error("Exception occurred: " + responseMessage);
                session.transfer(flowFile, REL_FAILURE);
            }
        } catch (Exception ex) {
            getLogger().error(ex.getMessage());
            session.transfer(flowFile, REL_FAILURE);
        }
    }

    private void TransferDeletedRelationship(ProcessSession session, FlowFile flowFile, String responseMessage) {
        FlowFile ff = session.write(flowFile, (OutputStream outputStream) -> {
            outputStream.write(responseMessage.getBytes());
        });
        session.transfer(ff, REL_SUCCESS);
    }
}
