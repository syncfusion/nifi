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

package org.apache.nifi.processors.standard.util.record;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.nifi.controller.AbstractControllerService;
import org.apache.nifi.flowfile.FlowFile;
import org.apache.nifi.logging.ComponentLog;
import org.apache.nifi.serialization.MalformedRecordException;
import org.apache.nifi.serialization.RecordReader;
import org.apache.nifi.serialization.RowRecordReaderFactory;
import org.apache.nifi.serialization.SimpleRecordSchema;
import org.apache.nifi.serialization.record.MapRecord;
import org.apache.nifi.serialization.record.Record;
import org.apache.nifi.serialization.record.RecordField;
import org.apache.nifi.serialization.record.RecordFieldType;
import org.apache.nifi.serialization.record.RecordSchema;

public class MockRecordParser extends AbstractControllerService implements RowRecordReaderFactory {
    private final List<Object[]> records = new ArrayList<>();
    private final List<RecordField> fields = new ArrayList<>();
    private final int failAfterN;

    public MockRecordParser() {
        this(-1);
    }

    public MockRecordParser(final int failAfterN) {
        this.failAfterN = failAfterN;
    }


    public void addSchemaField(final String fieldName, final RecordFieldType type) {
        fields.add(new RecordField(fieldName, type.getDataType()));
    }

    public void addRecord(Object... values) {
        records.add(values);
    }

    @Override
    public RecordReader createRecordReader(FlowFile flowFile, InputStream in, ComponentLog logger) throws IOException {
        final Iterator<Object[]> itr = records.iterator();

        return new RecordReader() {
            private int recordCount = 0;

            @Override
            public void close() throws IOException {
            }

            @Override
            public Record nextRecord() throws IOException, MalformedRecordException {
                if (failAfterN >= recordCount) {
                    throw new MalformedRecordException("Intentional Unit Test Exception because " + recordCount + " records have been read");
                }
                recordCount++;

                if (!itr.hasNext()) {
                    return null;
                }

                final Object[] values = itr.next();
                final Map<String, Object> valueMap = new HashMap<>();
                int i = 0;
                for (final RecordField field : fields) {
                    final String fieldName = field.getFieldName();
                    valueMap.put(fieldName, values[i++]);
                }

                return new MapRecord(new SimpleRecordSchema(fields), valueMap);
            }

            @Override
            public RecordSchema getSchema() {
                return new SimpleRecordSchema(fields);
            }
        };
    }

    @Override
    public RecordSchema getSchema(FlowFile flowFile) throws MalformedRecordException, IOException {
        return null;
    }
}