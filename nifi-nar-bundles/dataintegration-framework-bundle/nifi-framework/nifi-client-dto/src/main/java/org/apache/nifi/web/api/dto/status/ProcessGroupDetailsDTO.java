/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.apache.nifi.web.api.dto.status;

import com.wordnik.swagger.annotations.ApiModelProperty;
import javax.xml.bind.annotation.XmlType;

@XmlType(name = "processGroupDetails")
public class ProcessGroupDetailsDTO {
    private String processGroupName;
    private String ProcessGroupId;
    
    @ApiModelProperty("The name of the Process Group")
    public String getProcessGroupName() {
        return processGroupName;
    }

    public void setProcessGroupName(String processGroupName) {
        this.processGroupName = processGroupName;
    }
    
    @ApiModelProperty("The id of the Process Group")
    public String getProcessGroupId() {
        return ProcessGroupId;
    }

    public void setProcessGroupId(String ProcessGroupId) {
        this.ProcessGroupId = ProcessGroupId;
    }
}
