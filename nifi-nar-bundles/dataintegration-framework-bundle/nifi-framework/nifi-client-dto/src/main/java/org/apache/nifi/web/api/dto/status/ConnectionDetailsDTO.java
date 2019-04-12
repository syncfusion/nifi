/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.apache.nifi.web.api.dto.status;

import com.wordnik.swagger.annotations.ApiModelProperty;
import java.util.List;
import javax.xml.bind.annotation.XmlType;

@XmlType(name = "ConnectionDetails")
public class ConnectionDetailsDTO {
    private String processGroupId;
    private String name;
    private List<ConnectionsDTO> connections;
    
    @ApiModelProperty("Get Process group Id")
    public String getProcessGroupId() {
        return processGroupId;
    }

    public void setProcessGroupId(String processGroupId) {
        this.processGroupId = processGroupId;
    }
    
    @ApiModelProperty("Get Process group name")
    public String getProcessGroupName() {
        return name;
    }

    public void setProcessGroupName(String name) {
        this.name = name;
    }
    
    @ApiModelProperty("Get server details")
    public List<ConnectionsDTO> getConnections() {
        return connections;
    }

    public void setConnections(List<ConnectionsDTO> connections) {
        this.connections = connections;
    }
}

