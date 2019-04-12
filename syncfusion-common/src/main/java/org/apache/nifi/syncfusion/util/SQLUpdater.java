package org.apache.nifi.syncfusion.util;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Properties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SQLUpdater {

    private static final Logger logger = LoggerFactory.getLogger(SQLUpdater.class);

    static final String mySQL = "MySQL";
    static final String postgreSQL = "PostgreSQL";
    static final String oracle = "Oracle";
    static final String sqlServer = "SQLServer";
    static final String fileURI = "SQL_jars";
    //static final String canonicalPathValue = getCanonicalPath() + "/SQL_jars";
    

    static {
        String strContent = "PostgreSQL=SQL_jars/postgresql-42.1.4.jar\nOracle=\nMySQL=\nSQLServer=";
        createOrWriteFile(strContent, true);
    }

    /**
     *
     * @param dbType
     * @return
     */
    public static String getValue(String dbType) {
        return getSQLPropertyValue(dbType).replace("/", "\\");
    }

    /**
     *
     * @param dbType
     * @param fileName
     */
    public static void updateValue(String dbType, String fileName, String updateType) {
        updateSQLPropertyValue(dbType, fileName, updateType);
    }

    public static void deleteValue(String dbType) {
        deleteSQLPropertyValue(dbType);
    }

    private static String createOrWriteFile(String strContent, boolean isFirstExecution) {
        Writer writer = null;
        BufferedWriter bufferedWriter = null;
        try {
            String sdkDir = new java.io.File(".").getCanonicalPath() + "/conf/sql.properties";
            File sqlPropertiesFile = new File(sdkDir);
            if (!sqlPropertiesFile.exists()) {
                sqlPropertiesFile.createNewFile();
                writer = new FileWriter(sqlPropertiesFile);
                bufferedWriter = new BufferedWriter(writer);
                bufferedWriter.write(strContent);
                bufferedWriter.flush();
            }
            if(!isFirstExecution){
                writer = new FileWriter(sqlPropertiesFile);
                bufferedWriter = new BufferedWriter(writer);
                bufferedWriter.write(strContent);
                bufferedWriter.flush();
            }
        } catch (IOException e) {
            logger.error("Unable to create SQLUpdater property file", e);
        } finally {
            try {
                if (writer != null) {
                    writer.close();
                }

                if (bufferedWriter != null) {
                    bufferedWriter.close();
                }
            } catch (IOException ex) {
                logger.error("Unable to create SQLUpdater property file", ex);
            }
        }
        return null;
    }

    private static Properties loadPropertiesFromSQLProviderFile() {
        FileInputStream inputStream = null;
        try {
            String sdkDir = new java.io.File(".").getCanonicalPath() + "/conf/sql.properties";
            File sqlPropertiesFile = new File(sdkDir);
            if (sqlPropertiesFile.exists()) {
                Properties sqlPropertiesvalue = new Properties();
                inputStream = new FileInputStream(sqlPropertiesFile);
                sqlPropertiesvalue.load(inputStream);
                return sqlPropertiesvalue;
            } else {
                throw new IllegalStateException("SQL properties file does not exist");
            }
        } catch (IOException | IllegalStateException e) {
            logger.error("SQL properties file does not exist", e);
        } finally {
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (IOException e) {
                    logger.error("SQL properties file does not exist", e);
                }
            }
        }
        return null;
    }

    private static String getSQLPropertyValue(String identity) {
        try {
            Properties sqlProperties = loadPropertiesFromSQLProviderFile();
            switch (identity) {
                case mySQL:
                    return sqlProperties.getProperty(mySQL);
                case postgreSQL:
                    return sqlProperties.getProperty(postgreSQL);
                case oracle:
                    return sqlProperties.getProperty(oracle);
                case sqlServer:
                    return sqlProperties.getProperty(sqlServer);
                default:
                    logger.error("SQL properties value does not exist");
                    return "";
            }
        } catch (Exception e) {
            logger.error("Unable to get SQL properties value");
        }
        return "";
    }

    private static void updateSQLPropertyValue(String identity, String fileName, String updateType) {
        Map<String, String> map;
        map = new HashMap<>();
        try {
            Properties sqlProperties = loadPropertiesFromSQLProviderFile();
            sqlProperties.stringPropertyNames().forEach((name) -> {
                map.put(name, sqlProperties.getProperty(name));
            });

            fileName = updateType.equals("custom-defined")? fileName : fileURI + "/" + fileName;
            switch (identity) {
                case mySQL:
                    map.put(mySQL, fileName);
                    break;
                case postgreSQL:
                    map.put(postgreSQL, fileName);
                    break;
                case oracle:
                    map.put(oracle, fileName);
                    break;
                case sqlServer:
                    map.put(sqlServer, fileName);
                    break;
            }
        } catch (Exception e) {
            logger.error("Unable to update SQL properties value");
        }
        Iterator itr = map.entrySet().iterator();
        StringBuilder strBuffer = new StringBuilder();
        while (itr.hasNext()) {
            Map.Entry pair = (Map.Entry) itr.next();
            strBuffer.append(pair.getKey()).append("=").append(pair.getValue()).append("\n");
            itr.remove(); // avoids a ConcurrentModificationException
        }

        createOrWriteFile(strBuffer.toString(), false);
    }

    private static void deleteSQLPropertyValue(String identity) {
        Map<String, String> map;
        map = new HashMap<>();
        try {
            Properties sqlProperties = loadPropertiesFromSQLProviderFile();
            sqlProperties.stringPropertyNames().forEach((name) -> {
                map.put(name, sqlProperties.getProperty(name));
            });

            switch (identity) {
                case mySQL:
                    map.put(mySQL, "");
                    break;
                case postgreSQL:
                    map.put(postgreSQL, "");
                    break;
                case oracle:
                    map.put(oracle, "");
                    break;
                case sqlServer:
                    map.put(sqlServer, "");
                    break;
            }
        } catch (Exception e) {
            logger.error("Unable to delete SQL properties value");
        }
        Iterator itr = map.entrySet().iterator();
        StringBuilder strBuffer = new StringBuilder();
        while (itr.hasNext()) {
            Map.Entry pair = (Map.Entry) itr.next();
            strBuffer.append(pair.getKey()).append("=").append(pair.getValue()).append("\n");
            itr.remove(); // avoids a ConcurrentModificationException
        }
        createOrWriteFile(strBuffer.toString(), false);
    }
    
    private static String getCanonicalPath(){
        String canonicalPath = "";
        try{
            canonicalPath = new java.io.File(".").getCanonicalPath();
        }
        catch(IOException ex)
        {
            logger.error("Unable to get canonical path value");
        }
        return canonicalPath;
    }
}
