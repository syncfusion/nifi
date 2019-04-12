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
import org.apache.nifi.components.AllowableValue;
import org.apache.nifi.components.PropertyDescriptor;
import org.apache.nifi.flowfile.FlowFile;
import org.apache.nifi.processor.ProcessContext;
import org.apache.nifi.processor.ProcessSession;
import org.apache.nifi.processor.ProcessorInitializationContext;
import org.apache.nifi.processor.Relationship;
import org.apache.nifi.processor.exception.ProcessException;
import org.apache.nifi.processor.util.StandardValidators;
import org.apache.nifi.salesforce.SalesforceUserPassAuthentication;

@Tags({"salesforce", "soql", "sobject", "query"})
@CapabilityDescription("Execute the specified SOQL select query. If the query results are too large, the response contains the first batch of results and a query identifier in the nextRecordsUrl field of the response."
        + "The identifier can be used in an additional request to retrieve the next batch.")
public class ExecuteSalesforceQuery
        extends AbstractSalesForceProcessor {
    
    static final AllowableValue QUERY = new AllowableValue("Query", "Query", "Executes the specified SOQL query.");
    static final AllowableValue QUERY_PERFORMANCE = new AllowableValue("Query Performance", "Query Performance", "Get feedback on how Salesforce will execute your query, report, or list view.");
    
    //https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_query.htm
    private static final String SALESFORCE_OP = "query";

    public static final PropertyDescriptor QUERY_TYPE = new PropertyDescriptor.Builder().name("Query Type")
            .description("Select Query type")
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .required(true)
            .allowableValues(QUERY, QUERY_PERFORMANCE)
            .defaultValue(QUERY.getValue())
            .expressionLanguageSupported(false)
            .build();

    public static final PropertyDescriptor SALESFORCE_QUERY = new PropertyDescriptor.Builder().name("SOQL Query")
            .description("Enter salesforce SOQL query E.g. SELECT+name+from+Account")
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
        propertyDescriptor.add(QUERY_TYPE);
        propertyDescriptor.add(SALESFORCE_QUERY);
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

        Boolean isQueryPerformance = context.getProperty(QUERY_TYPE).getValue().contains("Performance");
        try {
            
            String salesforceQuery = context.getProperty(SALESFORCE_QUERY).evaluateAttributeExpressions().getValue();
            if(salesforceQuery == null || salesforceQuery.isEmpty())
                salesforceQuery = trimToEmpty(context.getProperty(SALESFORCE_QUERY).evaluateAttributeExpressions(flowFile).getValue());
            
            String endpoint = null;
            if (isQueryPerformance != true) {
                endpoint = SALESFORCE_OP + "/?q=" + salesforceQuery;
            } else {
                endpoint = SALESFORCE_OP + "/?explain=" + salesforceQuery;
            }
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
                    TransferSQLQueryRelationship(session, flowFile, newResponseMessage);
                } else {
                    getLogger().error("Exception occurred: " + responseMessage);
                    session.transfer(flowFile, REL_FAILURE);
                }
            } else if (responseCode.equals("200")) {
                TransferSQLQueryRelationship(session, flowFile, responseMessage);
            } else {
                getLogger().error("Exception occurred: " + responseMessage);
                session.transfer(flowFile, REL_FAILURE);
            }

        } catch (Exception ex) {
            getLogger().error(ex.getMessage());
            session.transfer(flowFile, REL_FAILURE);
        }
    }

    private void TransferSQLQueryRelationship(ProcessSession session, FlowFile flowFile, String responseMessage) {
        FlowFile ff = session.write(flowFile, (OutputStream outputStream) -> {
            outputStream.write(responseMessage.getBytes());
        });
        session.transfer(ff, REL_SUCCESS);
    }
}
