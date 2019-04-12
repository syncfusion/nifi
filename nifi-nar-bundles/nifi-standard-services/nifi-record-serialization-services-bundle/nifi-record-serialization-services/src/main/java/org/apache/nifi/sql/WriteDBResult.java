/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.apache.nifi.sql;


import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.Charset;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import org.apache.nifi.serialization.AbstractRecordSetWriter;
import org.apache.nifi.serialization.RecordSetWriter;
import org.apache.nifi.serialization.record.DataType;
import org.apache.nifi.serialization.record.Record;
import org.apache.nifi.serialization.record.RecordField;
import org.apache.nifi.serialization.record.RecordSchema;

public class WriteDBResult extends AbstractRecordSetWriter implements RecordSetWriter {
    private final RecordSchema recordSchema;
    private static final byte NEW_LINE = (byte) '\n';
    private final String tableName;
    private String insertQuery=null;
    private final String dateFormat;
    private final String timeFormat;
    private final String timeStampFormat;
    public WriteDBResult(final RecordSchema recordSchema, final OutputStream out, final String dateFormat, final String timeFormat, final String timestampFormat,
        final String tableName) {
        super(out);
        this.tableName=tableName;
        this.recordSchema = recordSchema;
        this.dateFormat = dateFormat;
        this.timeFormat = timeFormat;
        this.timeStampFormat = timestampFormat;
    }
        private String getFormat(final RecordField field) {
        final DataType dataType = field.getDataType();
        switch (dataType.getFieldType()) {
            case DATE:
                return dateFormat;
            case TIME:
                return timeFormat;
            case TIMESTAMP:
                return timeStampFormat;
        }

        return dataType.getFormat();
    }
    @Override
    public Map<String, String> writeRecord(final Record record) throws IOException {
        write(record, getOutputStream());
        return Collections.emptyMap();
    }

    private void write(final Record record, final OutputStream out) throws IOException {
     
        insertQuery="INSERT INTO "+tableName+" values(";
        List<RecordField> records= recordSchema.getFields();
           for (final RecordField recordField : records) {
            final String columnValue = record.getAsString(recordField.getFieldName(),getFormat(recordField));
             insertQuery=insertQuery+"'"+columnValue+"'"+",";
        }
        insertQuery=insertQuery.substring(0, insertQuery.length()-1)+")";
        out.write(insertQuery.getBytes(Charset.forName("UTF-8")));
        out.write(NEW_LINE);
    }

    @Override
    public String getMimeType() {
        return "text/plain";
    }
}
