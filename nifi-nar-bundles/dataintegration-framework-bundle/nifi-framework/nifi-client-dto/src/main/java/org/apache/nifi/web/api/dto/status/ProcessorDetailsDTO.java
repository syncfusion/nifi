/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.apache.nifi.web.api.dto.status;

import com.wordnik.swagger.annotations.ApiModelProperty;
import javax.xml.bind.annotation.XmlType;

@XmlType(name = "ProcessorDetails")
public class ProcessorDetailsDTO {
    private String connectionType;
    private String connectionId;
    private String processorName;
    private String processorId;
    private String tableName;
    private String fileLocation;
    private String azureAccountName;
    private String azureAccountKey;
    
    @ApiModelProperty("Get connection type from custom processor")
    public String getConnectionType() {
        return connectionType;
    }

    public void setConnectionType(String connectionType) {
        this.connectionType = connectionType;
    }
    
    @ApiModelProperty("Get connection id from custom processor")
    public String getConnectionId() {
        return connectionId;
    }

    public void setConnectionId(String connectionId) {
        this.connectionId = connectionId;
    }
    
    @ApiModelProperty("Get name of custom processor")
    public String getProcessorName() {
        return processorName;
    }

    public void setProcessorName(String processorName) {
        this.processorName = processorName;
    }
    
    @ApiModelProperty("Get Id of custom processor")
    public String getProcessorId() {
        return processorId;
    }

    public void setProcessorId(String processorId) {
        this.processorId = processorId;
    }
    
    @ApiModelProperty("Get table name from custom processor")
    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }
    
    @ApiModelProperty("Get flatfile location from custom processor")
    public String getFileLocation() {
        return fileLocation;
    }

    public void setFileLocation(String fileLocation) {
        this.fileLocation = fileLocation;
    }
    
    @ApiModelProperty("Get azure account name from custom processor")
    public String getAzureAccountName() {
        return azureAccountName;
    }

    public void setAzureAccountName(String azureAccountName) {
        this.azureAccountName = azureAccountName;
    }
    
    @ApiModelProperty("Get azure account key from custom processor")
    public String getAzureAccountKey() {
        return azureAccountKey;
    }

    public void setAzureAccountKey(String azureAccountKey) {
        this.azureAccountKey = azureAccountKey;
    }
    
}
