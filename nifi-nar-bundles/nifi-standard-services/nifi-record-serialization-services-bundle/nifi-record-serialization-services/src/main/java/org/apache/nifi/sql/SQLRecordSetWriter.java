/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.apache.nifi.sql;

import org.apache.nifi.processor.util.StandardValidators;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import org.apache.nifi.annotation.documentation.CapabilityDescription;
import org.apache.nifi.annotation.documentation.Tags;

import org.apache.nifi.annotation.lifecycle.OnEnabled;
import org.apache.nifi.components.PropertyDescriptor;
import org.apache.nifi.controller.ConfigurationContext;
import org.apache.nifi.logging.ComponentLog;
import org.apache.nifi.schema.access.SchemaNotFoundException;
import org.apache.nifi.serialization.DateTimeTextRecordSetWriter;
import org.apache.nifi.serialization.RecordSetWriter;
import org.apache.nifi.serialization.RecordSetWriterFactory;
import org.apache.nifi.serialization.record.RecordSchema;
@Tags({"sql", "result", "recordset", "record writer"})
@CapabilityDescription("Writes the contents of a RecordSet as SQL queries using the schema given.")
public class SQLRecordSetWriter extends DateTimeTextRecordSetWriter implements RecordSetWriterFactory  {
    private String tableName;
    static final PropertyDescriptor TABLE_NAME = new PropertyDescriptor.Builder()
        .name("Table Name")
        .description("Specifies the table name in which the records are to be inserted.")
        .expressionLanguageSupported(true)
        .required(true)
        .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
        .build();


    @Override
    protected List<PropertyDescriptor> getSupportedPropertyDescriptors() {
        final List<PropertyDescriptor> properties = new ArrayList<>(super.getSupportedPropertyDescriptors());
        properties.add(TABLE_NAME);
        return properties;
    }

    @OnEnabled
    public void onEnabled(final ConfigurationContext context) {
         tableName = context.getProperty(TABLE_NAME).toString();
    }
   @Override
    public RecordSetWriter createWriter(final ComponentLog logger, final RecordSchema schema, final OutputStream out) throws SchemaNotFoundException, IOException {
        return new WriteDBResult(schema, out,getDateFormat().orElse(null), getTimeFormat().orElse(null), getTimestampFormat().orElse(null),tableName);
    }

}
