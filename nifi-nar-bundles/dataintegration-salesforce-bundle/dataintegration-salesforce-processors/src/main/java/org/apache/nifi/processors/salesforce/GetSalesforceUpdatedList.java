/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.apache.nifi.processors.salesforce;

import java.io.IOException;
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
import org.apache.nifi.processor.io.OutputStreamCallback;
import org.apache.nifi.processor.util.StandardValidators;
import org.apache.nifi.salesforce.SalesforceUserPassAuthentication;

@Tags({"salesforce", "updated", "sobject"})
@CapabilityDescription("Retrieves the list of individual records that have been updated (added or changed) within the given timespan for the specified object. "
        + "SObject Get Updated is available in API version 29.0 and later")
public class GetSalesforceUpdatedList extends AbstractSalesForceProcessor {

    private static final String SALESFORCE_OP = "sobjects";

    public static final PropertyDescriptor SOBJECT_NAME = new PropertyDescriptor
            .Builder()
            .name("Salesforce Object Name")
            .description("Enter Salesforce object name.")
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .expressionLanguageSupported(true)
            .required(true)
            .build();

    public static final PropertyDescriptor START_DATE = new PropertyDescriptor
            .Builder()
            .name("Start Date and Time")
            .description("Enter ISO 8601 formatted start date to get updated records."
                    + "     Syntax: yyyy-mm-ddThh:mm:ssZ"
                    + "     Eg: 2017-09-29T00:00:00Z")
            .defaultValue("yyyy-mm-ddThh:mm:ssZ")
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .expressionLanguageSupported(true)
            .required(true)
            .build();

    public static final PropertyDescriptor END_DATE = new PropertyDescriptor
            .Builder()
            .name("End Date and Time")
            .description("Enter ISO 8601 formatted end date to get updated records."
                    + "     Syntax: yyyy-mm-ddThh:mm:ssZ "
                    + "     Eg: 2017-10-29T00:00:00Z ")
            .defaultValue("yyyy-mm-ddThh:mm:ssZ")
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
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
        propertyDescriptor.add(START_DATE);
        propertyDescriptor.add(END_DATE);
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
            String sobjectName = context.getProperty(SOBJECT_NAME).evaluateAttributeExpressions().getValue();
            if(sobjectName == null || sobjectName.isEmpty())
                sobjectName = trimToEmpty(context.getProperty(SOBJECT_NAME).evaluateAttributeExpressions(flowFile).getValue());
            
            String endpoint = SALESFORCE_OP + "/" + sobjectName + "/updated/?start="
                    + context.getProperty(START_DATE).evaluateAttributeExpressions(flowFile).getValue()
                    + "&end=" + context.getProperty(END_DATE).evaluateAttributeExpressions(flowFile).getValue();

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
                    TransferUpdatedRelationship(session, flowFile, newResponseMessage);
                } else {
                    getLogger().error("Exception occurred: " + responseMessage);
                    session.transfer(flowFile, REL_FAILURE);
                }
            } else if (responseCode.equals("200")) {
                TransferUpdatedRelationship(session, flowFile, responseMessage);
            } else {
                getLogger().error("Exception occurred: " + responseMessage);
                session.transfer(flowFile, REL_FAILURE);
            }
        } catch (Exception ex) {
            getLogger().error(ex.getMessage());
            session.transfer(flowFile, REL_FAILURE);
        }
    }

    private void TransferUpdatedRelationship(ProcessSession session, FlowFile flowFile, String responseMessage) {
        FlowFile flowFileContent = session.write(flowFile, new OutputStreamCallback() {
            @Override
            public void process(OutputStream outputStream) throws IOException {
                outputStream.write(responseMessage.getBytes());
            }
        });
        session.transfer(flowFileContent, REL_SUCCESS);
    }
}
