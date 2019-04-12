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
package org.apache.nifi.processors.custom;

import org.apache.nifi.components.PropertyDescriptor;
import org.apache.nifi.flowfile.FlowFile;
import org.apache.nifi.annotation.behavior.ReadsAttribute;
import org.apache.nifi.annotation.behavior.ReadsAttributes;
import org.apache.nifi.annotation.behavior.WritesAttribute;
import org.apache.nifi.annotation.behavior.WritesAttributes;
import org.apache.nifi.annotation.lifecycle.OnScheduled;
import org.apache.nifi.annotation.documentation.CapabilityDescription;
import org.apache.nifi.annotation.documentation.Tags;
import org.apache.nifi.processor.exception.ProcessException;
import org.apache.nifi.processor.AbstractProcessor;
import org.apache.nifi.processor.ProcessContext;
import org.apache.nifi.processor.ProcessSession;
import org.apache.nifi.processor.ProcessorInitializationContext;
import org.apache.nifi.processor.Relationship;
import org.apache.nifi.dbcp.DBCPService;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.apache.nifi.components.Validator;

@Tags({"Syncfusion" , "DataSource" , "Publish"})
@CapabilityDescription("To publish the process group connection details into the Syncfusion Dashboard.")
@ReadsAttributes({@ReadsAttribute(attribute="", description="")})
@WritesAttributes({@WritesAttribute(attribute="", description="")})
public class PublishDataSource extends AbstractProcessor {

    public static final PropertyDescriptor CONNECTION_TYPE = new PropertyDescriptor.Builder()
            .name("Connection Type")
            .description("Select the required connection type and fill the required below properties.")
            .required(true)
            .defaultValue("Files")
            .allowableValues("Database connection","Files")
            .build();
    
    public static final PropertyDescriptor DBCP_SERVICE = new PropertyDescriptor.Builder()
            .name("Database Connection Pooling Service")
            .description("The Controller Service that is used to obtain connection to database. It is mandatory "
                    + "when select 'Database connection' in Connection type property.")
            .required(false)
            .identifiesControllerService(DBCPService.class)
            .build();
    
    public static final PropertyDescriptor TABLE_NAME = new PropertyDescriptor.Builder()
            .name("Table Name")
            .description("Enter table name. It is mandatory when select 'Database connection' in Connection type property.")
            .required(false)
            .addValidator(Validator.VALID)
            .build();

    public static final PropertyDescriptor FLATFILE_LOCATION = new PropertyDescriptor.Builder()
            .name("Flat file location")
            .description("Enter Flat file location with its name. It is mandatory when select 'Files' in Connection type property.")
            .required(false)
            .addValidator(Validator.VALID)
            .build();
    
//    public static final PropertyDescriptor AZURE_ACCOUNT_NUMBER = new PropertyDescriptor.Builder()
//            .name("Azure account number")
//            .description("Enter Azure account number. It is mandatory "
//                    + "when select 'Azure Table Storage' in Connection type property.")
//            .required(false)
//            .addValidator(Validator.VALID)
//            .build();
//    
//    public static final PropertyDescriptor AZURE_ACCOUNT_KEY = new PropertyDescriptor.Builder()
//            .name("Azure account key")
//            .description("Enter Azure Account key. It is mandatory "
//                    + "when select 'Azure Table Storage' in Connection type property.")
//            .required(false)
//            .addValidator(Validator.VALID)
//            .build();

    private List<PropertyDescriptor> descriptors;
    
    private Set<Relationship> relationships;

    @Override
    protected void init(final ProcessorInitializationContext context) {
        final List<PropertyDescriptor> descriptorsList = new ArrayList<>();
        descriptorsList.add(CONNECTION_TYPE);
        descriptorsList.add(DBCP_SERVICE);
        descriptorsList.add(TABLE_NAME);
        descriptorsList.add(FLATFILE_LOCATION);
//        descriptorsList.add(AZURE_ACCOUNT_NUMBER);
//        descriptorsList.add(AZURE_ACCOUNT_KEY);
        this.descriptors = Collections.unmodifiableList(descriptorsList);

        final Set<Relationship> relationshipsSet = new HashSet<>();
        this.relationships = Collections.unmodifiableSet(relationshipsSet);
    }

    @Override
    public Set<Relationship> getRelationships() {
        return this.relationships;
    }

    @Override
    public final List<PropertyDescriptor> getSupportedPropertyDescriptors() {
        return descriptors;
    }

    @OnScheduled
    public void onScheduled(final ProcessContext context) {

    }

    @Override
    public void onTrigger(final ProcessContext context, final ProcessSession session) throws ProcessException {
        FlowFile flowFile = session.get();
        if ( flowFile == null ) {
            return;
        }
        session.remove(flowFile);
    }
}
