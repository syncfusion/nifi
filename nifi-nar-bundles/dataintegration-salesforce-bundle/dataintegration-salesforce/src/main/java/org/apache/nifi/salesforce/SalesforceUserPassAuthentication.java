/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.apache.nifi.salesforce;

import org.apache.nifi.annotation.documentation.CapabilityDescription;
import org.apache.nifi.annotation.documentation.Tags;
import org.apache.nifi.controller.ControllerService;
import org.apache.nifi.processor.exception.ProcessException;

@Tags({ "Salesforce.com", "username-password", "oauth", "authentication"})
@CapabilityDescription("Service to provide authentication services against Salesforce.com")
public interface SalesforceUserPassAuthentication extends ControllerService {

    public String getSalesforceAccessToken() throws ProcessException;
    
    public String getSalesforceBaseURL();
    
    public String getSalesforceVersion();

    public void refreshSalesforceAccessToken() throws Exception;
    
}
