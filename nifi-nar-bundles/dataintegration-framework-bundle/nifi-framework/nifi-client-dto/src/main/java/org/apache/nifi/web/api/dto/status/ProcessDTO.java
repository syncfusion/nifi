/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.apache.nifi.web.api.dto.status;

import com.wordnik.swagger.annotations.ApiModelProperty;
import java.util.List;
import javax.xml.bind.annotation.XmlType;

@XmlType(name = "ProcessDTO")
public class ProcessDTO {
    private List<ConnectionDetailsDTO> process;
    
    @ApiModelProperty("Get process details")
    public List<ConnectionDetailsDTO> getProcessDetails() {
        return process;
    }

    public void setProcessDetails(List<ConnectionDetailsDTO> process) {
        this.process = process;
    }
}
