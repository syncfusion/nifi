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
package org.apache.nifi.lookupservice;

import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.locks.ReentrantLock;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.apache.commons.lang3.StringUtils;
import org.apache.nifi.annotation.documentation.CapabilityDescription;
import org.apache.nifi.annotation.documentation.Tags;
import org.apache.nifi.annotation.lifecycle.OnDisabled;
import org.apache.nifi.annotation.lifecycle.OnEnabled;
import org.apache.nifi.components.PropertyDescriptor;
import org.apache.nifi.controller.AbstractControllerService;
import org.apache.nifi.controller.ConfigurationContext;
import org.apache.nifi.dbcp.DBCPService;
import org.apache.nifi.logging.ComponentLog;
import org.apache.nifi.lookup.LookupFailureException;
import org.apache.nifi.processor.util.StandardValidators;
import org.apache.nifi.reporting.InitializationException;
import org.apache.nifi.serialization.SimpleRecordSchema;
import org.apache.nifi.serialization.record.MapRecord;
import org.apache.nifi.serialization.record.Record;
import org.apache.nifi.serialization.record.RecordField;
import org.apache.nifi.serialization.record.RecordFieldType;
import org.apache.nifi.serialization.record.RecordSchema;

@Tags({"lookup","transformation","database","sql"})
@CapabilityDescription("SQL record-based lookup service.")
public class SQLLookupService extends AbstractControllerService implements DBLookupService {
    private static final String KEY = "key";

    private static final Set<String> REQUIRED_KEYS = Collections.unmodifiableSet(Stream.of(KEY).collect(Collectors.toSet()));
 public static final PropertyDescriptor CONTROLLER_SERVICE = new PropertyDescriptor.Builder()
            .name("Database connection service")
            .description("The controller service used to obtain a connection to the database.")
            .required(true)
            .identifiesControllerService(DBCPService.class)
            .build();
  public static final PropertyDescriptor TABLE_NAME = new PropertyDescriptor.Builder()
            .name("Table Name")
            .description("The name of the database table to be used for lookup.")
            .required(true)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .expressionLanguageSupported(true)
            .build();
    public static final PropertyDescriptor LOOKUP_KEY_COLUMN = new PropertyDescriptor.Builder()
            .name("Lookup Key Column")
            .description("A column name to be used as lookup key.")
            .required(true)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .expressionLanguageSupported(true)
            .build();
     public static final PropertyDescriptor LOOKUP_VALUE_COLUMN = new PropertyDescriptor.Builder()
            .name("Lookup Value Column")
            .displayName("Lookup Value Column")
            .description("Columns to be returned from lookup table.")
            .required(true)
            .expressionLanguageSupported(true)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .build();
    private static final List<PropertyDescriptor> properties;
    private DBCPService controllerService;
    private String tableName;
    private String lookupValueColumn;
    private String lookupKeyColumn;
    String [] lookupValueColumnList;
    static {
        final List<PropertyDescriptor> property = new ArrayList<>();
        property.add(CONTROLLER_SERVICE);
        property.add(TABLE_NAME);
        property.add(LOOKUP_VALUE_COLUMN);
        property.add(LOOKUP_KEY_COLUMN);
        properties = Collections.unmodifiableList(property);
    }

    @Override
    protected List<PropertyDescriptor> getSupportedPropertyDescriptors() {
        return properties;
    }

    /**
     * @param context
     *            the configuration context
     * @throws InitializationException
     *             if unable to create a database connection
     */
    @OnEnabled
    public void onConfigured(final ConfigurationContext context) throws InitializationException, IOException, SQLException {
        controllerService = context.getProperty(CONTROLLER_SERVICE).asControllerService(DBCPService.class);
        tableName = context.getProperty(TABLE_NAME).evaluateAttributeExpressions().getValue();
        lookupKeyColumn = context.getProperty(LOOKUP_KEY_COLUMN).evaluateAttributeExpressions().getValue();
        lookupValueColumn = context.getProperty(LOOKUP_VALUE_COLUMN).getValue();
       lookupValueColumnList=lookupValueColumn.split("\\s*,\\s*");
        try {
            loadCache();
        } catch (final IllegalStateException e) {
            throw new InitializationException(e.getMessage(), e);
        }
    }

  private volatile ConcurrentMap<String,Record> cache;
    private final ReentrantLock lock = new ReentrantLock();

    private void loadCache() throws IllegalStateException, IOException, SQLException {
        if (lock.tryLock()) {
            try {
                final ComponentLog logger = getLogger();
                if (logger.isDebugEnabled()) {
                    logger.debug("Loading lookup table from file: " + tableName);
                }
            final Connection con = controllerService.getConnection();
            final Statement st = con.createStatement();
            String selectQuery="select * FROM "+tableName;
            final ResultSet resultSet = st.executeQuery(selectQuery);  
           ConcurrentHashMap<String,Record> cache = new ConcurrentHashMap<>();
                while (resultSet.next()) {
                    HashMap property = new HashMap<String,Object>();
                    for (int i = 0; i < lookupValueColumnList.length; i++) {
                        if (!lookupKeyColumn.equals(lookupValueColumnList[i])) {
                            property.put(lookupValueColumnList[i], resultSet.getString(lookupValueColumnList[i]));
                        }
                    }
                    
                    RecordSchema lookupRecordSchema = null;
                    if (lookupRecordSchema == null) {
                        List<RecordField> recordFields = new ArrayList<>(properties.size());
                        property.forEach((k, v) -> recordFields.add(new RecordField(k.toString(), RecordFieldType.STRING.getDataType())));
                        lookupRecordSchema = new SimpleRecordSchema(recordFields);
                    }
                    cache.put(resultSet.getString(lookupKeyColumn), new MapRecord(lookupRecordSchema, property));
                }
              this.cache = cache;
                if (cache.isEmpty()) {
                    logger.warn("Lookup table is empty after reading table: " + tableName);
                }
            }
            finally {
                lock.unlock();
            }
        }
    }   
    @OnDisabled
    public void shutdown() {

    }
    @Override
    public Optional<Record> lookup(final Map<String, Object> coordinates) throws LookupFailureException {
       if (coordinates == null) {
            return Optional.empty();
        }
        final String key = (String)coordinates.get(KEY);
        if (StringUtils.isBlank(key)) {
            return Optional.empty();
        }  
         return Optional.ofNullable(cache.get(key));
}
    @Override
    public Set<String> getRequiredKeys() {
        return REQUIRED_KEYS;
    }

}
