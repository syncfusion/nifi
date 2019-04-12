/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.apache.nifi.web.api.dto.status;

import com.wordnik.swagger.annotations.ApiModelProperty;
import javax.xml.bind.annotation.XmlType;
import org.apache.nifi.web.api.entity.ControllerServiceEntity;

@XmlType(name = "controllerServiceDetails")
public class ControllerServiceDetailsDTO {
    private ControllerServiceEntity controllerServiceDetails;
    private String processorId;
    private String processorName;
    private String processGroupId;
    private String processGroupName;
    private String connectionType;
    private String tableName;
    private String flatFileLocation;
    private String azureConnectionName;
    private String azureConnectionKey;
    
    @ApiModelProperty("Get processor Id")
    public String getProcessorId() {
        return processorId;
    }

    public void setProcessorId(String processorId) {
        this.processorId = processorId;
    }
    
    @ApiModelProperty("Get processor name")
    public String getProcessorName() {
        return processorName;
    }

    public void setProcessorName(String processorName) {
        this.processorName = processorName;
    }
    
    @ApiModelProperty("ControllerService Details in process group")
    public ControllerServiceEntity getControllerService() {
        return controllerServiceDetails;
    }

    public void setControllerService(ControllerServiceEntity controllerServiceDetails) {
        this.controllerServiceDetails = controllerServiceDetails;
    }
    
    @ApiModelProperty("Get process group Id for particular controller service")
    public String getProcessGroupId() {
        return processGroupId;
    }

    public void setProcessGroupId(String processGroupId) {
        this.processGroupId = processGroupId;
    }
    
    @ApiModelProperty("Get connection type from custom processor")
    public String getConnectionType() {
        return connectionType;
    }

    public void setConnectionType(String connectionType) {
        this.connectionType = connectionType;
    }
    
    @ApiModelProperty("Get process group name for particular controller service")
    public String getProcessGroupName() {
        return processGroupName;
    }

    public void setProcessGroupName(String processGroupName) {
        this.processGroupName = processGroupName;
    }
    
    @ApiModelProperty("Get table name for particular controller service")
    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }
    
    @ApiModelProperty("Get flatefile location for particular controller service")
    public String getflatFileLocation() {
        return flatFileLocation;
    }

    public void setflatFileLocation(String flatFileLocation) {
        this.flatFileLocation = flatFileLocation;
    }
    
    @ApiModelProperty("Get azure connection name for particular controller service")
    public String getAzureConnectionName() {
        return azureConnectionName;
    }

    public void setAzureConnectionName(String azureConnectionName) {
        this.azureConnectionName = azureConnectionName;
    }
    
    @ApiModelProperty("Get azure connection key for particular controller service")
    public String getAzureConnectionKey() {
        return azureConnectionKey;
    }

    public void setAzureConnectionKey(String azureConnectionKey) {
        this.azureConnectionKey = azureConnectionKey;
    }
}