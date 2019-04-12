/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.nifi.web.api;

import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import com.wordnik.swagger.annotations.ApiParam;
import com.wordnik.swagger.annotations.ApiResponse;
import com.wordnik.swagger.annotations.ApiResponses;
import com.wordnik.swagger.annotations.Authorization;
import org.apache.commons.lang3.StringUtils;
import org.apache.nifi.authorization.Authorizer;
import org.apache.nifi.authorization.RequestAction;
import org.apache.nifi.authorization.resource.Authorizable;
import org.apache.nifi.authorization.user.NiFiUserUtils;
import org.apache.nifi.persistence.TemplateSerializer;
import org.apache.nifi.web.NiFiServiceFacade;
import org.apache.nifi.web.api.dto.TemplateDTO;
import org.apache.nifi.web.api.entity.TemplateEntity;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.HttpMethod;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.Map;
import java.util.Set;
import org.apache.nifi.encrypt.StringEncryptor;
import org.apache.nifi.web.api.dto.ControllerServiceDTO;
import org.apache.nifi.web.api.dto.FlowSnippetDTO;
import org.apache.nifi.web.api.dto.ProcessGroupDTO;
import org.apache.nifi.web.api.dto.ProcessorConfigDTO;
import org.apache.nifi.web.api.dto.ProcessorDTO;
import org.apache.nifi.web.api.dto.PropertyDescriptorDTO;
import org.apache.nifi.web.api.dto.RemoteProcessGroupDTO;

/**
 * RESTful endpoint for managing a Template.
 */
@Path("/templates")
@Api(
        value = "/templates",
        description = "Endpoint for managing a Template."
)
public class TemplateResource extends ApplicationResource {

    private NiFiServiceFacade serviceFacade;
    private Authorizer authorizer;

    /**
     * Populate the uri's for the specified templates.
     *
     * @param templateEntities templates
     * @return templates
     */
    public Set<TemplateEntity> populateRemainingTemplateEntitiesContent(Set<TemplateEntity> templateEntities) {
        for (TemplateEntity templateEntity : templateEntities) {
            if (templateEntity.getTemplate() != null) {
                populateRemainingTemplateContent(templateEntity.getTemplate());
            }
        }
        return templateEntities;
    }

    /**
     * Populates the uri for the specified template.
     */
    public TemplateDTO populateRemainingTemplateContent(TemplateDTO template) {
        // populate the template uri
        template.setUri(generateResourceUri("templates", template.getId()));
        return template;
    }

    /**
     * Retrieves the specified template.
     *
     * @param id The id of the template to retrieve
     * @return A templateEntity.
     */
    @GET
    @Consumes(MediaType.WILDCARD)
    @Produces(MediaType.APPLICATION_XML)
    @Path("{id}/download")
    @ApiOperation(
            value = "Exports a template",
            response = String.class,
            authorizations = {
                    @Authorization(value = "Read - /templates/{uuid}", type = "")
            }
    )
    @ApiResponses(
            value = {
                    @ApiResponse(code = 400, message = "NiFi was unable to complete the request because it was invalid. The request should not be retried without modification."),
                    @ApiResponse(code = 401, message = "Client could not be authenticated."),
                    @ApiResponse(code = 403, message = "Client is not authorized to make this request."),
                    @ApiResponse(code = 404, message = "The specified resource could not be found."),
                    @ApiResponse(code = 409, message = "The request was valid but NiFi was not in the appropriate state to process it. Retrying the same request later may be successful.")
            }
    )
    public Response exportTemplate(
            @ApiParam(
                    value = "The template id.",
                    required = true
            )
            @PathParam("id") final String id) {
        
        if (isReplicateRequest()) {
            return replicate(HttpMethod.GET);
        }
        
        // authorize access
        serviceFacade.authorizeAccess(lookup -> {
            final Authorizable template = lookup.getTemplate(id);
            template.authorize(authorizer, RequestAction.READ, NiFiUserUtils.getNiFiUser());
        });
        
        // get the template
        final TemplateDTO template = serviceFacade.exportTemplate(id);
        
        final Set<ProcessorDTO> processors;
        final Set<ControllerServiceDTO> controllerServices;
        final Set<RemoteProcessGroupDTO> remoteGroupProperty;
        final Set<ProcessGroupDTO> processGroupDetails;
        
        //get processor property values from the created snippet
        processors = template.getSnippet().getProcessors();
        processors.forEach((processorDTO) -> {
            encryptProcessorSensitiveValue(processorDTO);
        });
        
        //get process group property values from the created snippet
        processGroupDetails = template.getSnippet().getProcessGroups();
        processGroupDetails.forEach((processGroupDTO) -> {
            updateProcessGroupSensitiveValue(processGroupDTO);
        });
        
        //get controllerservice property values from the created snippet
        controllerServices = template.getSnippet().getControllerServices();
        controllerServices.forEach((serviceDTO) -> {
            encryptControllerSensitiveValue(serviceDTO);
        });
        
        //get remoteGroup property values from the created snippet
        remoteGroupProperty= template.getSnippet().getRemoteProcessGroups();
        remoteGroupProperty.forEach((remoteProcessGroupDTO) -> {
            encryptRemoteGroupSensitiveValue(remoteProcessGroupDTO);
        });
        // prune the template id
        template.setId(null);
        
        // determine the name of the attachement - possible issues with spaces in file names
        String attachmentName = template.getName();
        if (StringUtils.isBlank(attachmentName)) {
            attachmentName = "template";
        } else {
            attachmentName = attachmentName.replaceAll("\\s", "_");
        }
        
        // generate the response
        /*
        * Here instead of relying on default JAXB marshalling we are simply
        * serializing template to String (formatted, indented etc) and sending
        * it as part of the response.
        */
        String serializedTemplate = new String(TemplateSerializer.serialize(template), StandardCharsets.UTF_8);
        return generateOkResponse(serializedTemplate).header("Content-Disposition", String.format("attachment; filename=\"%s.xml\"", attachmentName)).build();
    }
    
    private void updateProcessGroupSensitiveValue(ProcessGroupDTO processGroupDTO){
        FlowSnippetDTO processGroupContents = processGroupDTO.getContents();
        processGroupContents.getProcessors().forEach((processorDTO) -> {
            encryptProcessorSensitiveValue(processorDTO);
        });
        processGroupContents.getControllerServices().forEach((controllerServiceDTO) -> {
            encryptControllerSensitiveValue(controllerServiceDTO);
        });
        processGroupContents.getRemoteProcessGroups().forEach((remoteProcessGroupDTO) -> {
            encryptRemoteGroupSensitiveValue(remoteProcessGroupDTO);
        });
        processGroupContents.getProcessGroups().forEach((inheritedProcessGroupDTO) -> {
            updateProcessGroupSensitiveValue(inheritedProcessGroupDTO);
        });
    }
    
    private void encryptProcessorSensitiveValue(ProcessorDTO processorDTO){
        final ProcessorConfigDTO processorConfig = processorDTO.getConfig();
            // ensure that some property configuration have been specified
            if (processorConfig != null) {
                //if properties have been specified, remove sensitive ones
                if (processorConfig.getProperties() != null) {
                    Map< String, String> processorProperties = processorConfig.getProperties();
                    // look for sensitive properties and remove them
                    if (processorConfig.getDescriptors() != null) {
                        final Collection< PropertyDescriptorDTO> descriptors = processorConfig.getDescriptors().values();
                        descriptors.stream().filter((descriptor) -> (Boolean.TRUE.equals(descriptor.isSensitive()))).forEachOrdered((descriptor) -> {
                            processorProperties.entrySet().forEach((entry) -> {
                                String processorKey = entry.getKey();
                                String processorProperty = entry.getValue();
                                if (descriptor.getName().equals(processorKey)) {
                                    if (processorProperty != null) {
                                        StringEncryptor nifiEncryptor = StringEncryptor.createEncryptor(properties);
                                        String propertyValue = nifiEncryptor.encrypt(processorProperty);
                                        processorProperties.put(descriptor.getName(), propertyValue);
                                    }
                                }
                            });
                        });
                    }
                }
                processorConfig.setCustomUiUrl(null);
                processorConfig.setDefaultConcurrentTasks(null);
                processorConfig.setDefaultSchedulingPeriod(null);
                processorConfig.setAutoTerminatedRelationships(null);
            }
    }
    
    private void encryptControllerSensitiveValue(ControllerServiceDTO serviceDTO){
        final Map< String, String> controllerProperties = serviceDTO.getProperties();
            final Map< String, PropertyDescriptorDTO> descriptors = serviceDTO.getDescriptors();
 
            if (controllerProperties != null && descriptors != null) {
                descriptors.values().stream().filter((descriptor) -> (Boolean.TRUE.equals(descriptor.isSensitive()))).forEachOrdered((descriptor) -> {
                    controllerProperties.entrySet().forEach((entry) -> {
                        String controllerKey = entry.getKey();
                        String controllerValue = entry.getValue();
                        if (descriptor.getName().equals(controllerKey)) {
                            if (controllerValue != null) {
                                StringEncryptor nifiEncryptor = StringEncryptor.createEncryptor(properties);
                                String propertyValue = nifiEncryptor.encrypt(controllerValue);
                                controllerProperties.put(descriptor.getName(), propertyValue);
                            }
                        }
                    });
            });
            }
            serviceDTO.setCustomUiUrl(null);
            serviceDTO.setValidationErrors(null);
    }
    
    private void encryptRemoteGroupSensitiveValue(RemoteProcessGroupDTO remoteProcessGroupDTO){
        String remoteProperties = remoteProcessGroupDTO.getProxyPassword();
        StringEncryptor nifiEncryptor = StringEncryptor.createEncryptor(properties);
        String propertyValue = nifiEncryptor.encrypt(remoteProperties);
        remoteProcessGroupDTO.setProxyPassword(propertyValue);;
    }
    
    /**
     * Removes the specified template.
     *
     * @param httpServletRequest request
     * @param id                 The id of the template to remove.
     * @return A templateEntity.
     */
    @DELETE
    @Consumes(MediaType.WILDCARD)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("{id}")
    @ApiOperation(
            value = "Deletes a template",
            response = TemplateEntity.class,
            authorizations = {
                    @Authorization(value = "Write - /templates/{uuid}", type = ""),
                    @Authorization(value = "Write - Parent Process Group - /process-groups/{uuid}", type = "")
            }
    )
    @ApiResponses(
            value = {
                    @ApiResponse(code = 400, message = "NiFi was unable to complete the request because it was invalid. The request should not be retried without modification."),
                    @ApiResponse(code = 401, message = "Client could not be authenticated."),
                    @ApiResponse(code = 403, message = "Client is not authorized to make this request."),
                    @ApiResponse(code = 404, message = "The specified resource could not be found."),
                    @ApiResponse(code = 409, message = "The request was valid but NiFi was not in the appropriate state to process it. Retrying the same request later may be successful.")
            }
    )
    public Response removeTemplate(
            @Context final HttpServletRequest httpServletRequest,
            @ApiParam(
                    value = "The template id.",
                    required = true
            )
            @PathParam("id") final String id) {

        if (isReplicateRequest()) {
            return replicate(HttpMethod.DELETE);
        }

        final TemplateEntity requestTemplateEntity = new TemplateEntity();
        requestTemplateEntity.setId(id);

        return withWriteLock(
                serviceFacade,
                requestTemplateEntity,
                lookup -> {
                    final Authorizable template = lookup.getTemplate(id);

                    // ensure write permission to the template
                    template.authorize(authorizer, RequestAction.WRITE, NiFiUserUtils.getNiFiUser());

                    // ensure write permission to the parent process group
                    template.getParentAuthorizable().authorize(authorizer, RequestAction.WRITE, NiFiUserUtils.getNiFiUser());
                },
                null,
                (templateEntity) -> {
                    // delete the specified template
                    serviceFacade.deleteTemplate(templateEntity.getId());

                    // build the response entity
                    final TemplateEntity entity = new TemplateEntity();

                    return generateOkResponse(entity).build();
                }
        );
    }

    // setters

    public void setServiceFacade(NiFiServiceFacade serviceFacade) {
        this.serviceFacade = serviceFacade;
    }

    public void setAuthorizer(Authorizer authorizer) {
        this.authorizer = authorizer;
    }
}
