/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.apache.nifi.web.api.dto.status;

import com.wordnik.swagger.annotations.ApiModelProperty;
import javax.xml.bind.annotation.XmlType;

@XmlType(name = "ConnectionsDTO")
public class ConnectionsDTO {
    private String processorId;
    private String processorName;
    private String connectionId;
    private String name;
    private String connectionType;
    private String serverName;
    private String authenticationType;
    private String userName;
    private String password;
    private String database;
    private String portNumber;
    private String service;
    private String hiveType;
    private String tableName;
    private String filePath;
    private String accountName;
    private String accountKey;
    private String connectionUrl;
    
    @ApiModelProperty("Get Processor Id")
    public String getProcessorId() {
        return processorId;
    }

    public void setProcessorId(String processorId) {
        this.processorId = processorId;
    }
    
    @ApiModelProperty("Get Processor name")
    public String getProcessorName() {
        return processorName;
    }

    public void setProcessorName(String processorName) {
        this.processorName = processorName;
    }
    
    @ApiModelProperty("Get connection Id")
    public String getConnectionId() {
        return connectionId;
    }

    public void setConnectionId(String connectionId) {
        this.connectionId = connectionId;
    }
    
    @ApiModelProperty("Get connection name")
    public String getConnectionName() {
        return name;
    }

    public void setConnectionName(String name) {
        this.name = name;
    }
    
    @ApiModelProperty("Get connection Type")
    public String getConnectionType() {
        return connectionType;
    }

    public void setConnectionType(String connectionType) {
        this.connectionType = connectionType;
    }
    
    @ApiModelProperty("Get server name")
    public String getServerName() {
        return serverName;
    }

    public void setserverName(String serverName) {
        this.serverName = serverName;
    }
    
    @ApiModelProperty("Get authentication Type")
    public String getAuthenticationType() {
        return authenticationType;
    }

    public void setAuthenticationType(String authenticationType) {
        this.authenticationType = authenticationType;
    }
    
    @ApiModelProperty("Get user Name")
    public String getuserName() {
        return userName;
    }

    public void setuserName(String userName) {
        this.userName = userName;
    }
    
     @ApiModelProperty("Get password")
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
    
    @ApiModelProperty("Get database name")
    public String getDatabase() {
        return database;
    }

    public void setDatabase(String database) {
        this.database = database;
    }
    
    @ApiModelProperty("Get port number")
    public String getPortNumber() {
        return portNumber;
    }

    public void setPortNumber(String portNumber) {
        this.portNumber = portNumber;
    }
    
    @ApiModelProperty("Get service")
    public String getservice() {
        return service;
    }

    public void setservice(String service) {
        this.service = service;
    }
    
    @ApiModelProperty("Gets hive type")
    public String getHiveType() {
        return hiveType;
    }

    public void setHiveType(String hiveType) {
        this.hiveType = hiveType;
    }
    
    @ApiModelProperty("Gets table name")
    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }
    
    @ApiModelProperty("Gets filePath location")
    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
    
    @ApiModelProperty("Gets account name")
    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }
    
    @ApiModelProperty("Gets account key")
    public String getAccountKey() {
        return accountKey;
    }

    public void setAccountKey(String accountKey) {
        this.accountKey = accountKey;
    }
    
    @ApiModelProperty("Gets connection Url")
    public String getConnectionUrl() {
        return connectionUrl;
    }

    public void setConnectionUrl(String connectionUrl) {
        this.connectionUrl = connectionUrl;
    }
}
