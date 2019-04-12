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
package org.apache.nifi.processors.googleanalytics;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.analytics.Analytics;
import com.google.api.services.analytics.AnalyticsScopes;
import com.google.api.services.analytics.model.GaData;
import com.google.gson.Gson;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.text.DateFormat;
import java.text.SimpleDateFormat;

import java.util.*;
import java.util.Date;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.commons.io.IOUtils;
import org.apache.nifi.annotation.behavior.ReadsAttribute;
import org.apache.nifi.annotation.behavior.ReadsAttributes;
import org.apache.nifi.annotation.behavior.WritesAttribute;
import org.apache.nifi.annotation.behavior.WritesAttributes;
import org.apache.nifi.annotation.documentation.CapabilityDescription;
import org.apache.nifi.annotation.documentation.SeeAlso;
import org.apache.nifi.annotation.documentation.Tags;
import org.apache.nifi.annotation.lifecycle.OnScheduled;
import org.apache.nifi.components.PropertyDescriptor;
import org.apache.nifi.flowfile.FlowFile;
import org.apache.nifi.processor.*;
import org.apache.nifi.processor.exception.ProcessException;
import org.apache.nifi.processor.io.StreamCallback;
import org.apache.nifi.processor.util.StandardValidators;

@Tags({"Syncfusion, Google, Analytics, GoogleAnalytics"})
@CapabilityDescription("Get the data you need to make intelligent marketing and business decisions with Google Analytics.")
@SeeAlso({})
@ReadsAttributes({@ReadsAttribute(attribute="", description="")})
@WritesAttributes({@WritesAttribute(attribute="ga.total.rows", description="The total number of rows used for the query pararmeter used."),
@WritesAttribute(attribute="ga.start-index.value", description="The start index value for next iteration.")})
public class GoogleAnalytics extends AbstractProcessor {

    public static final String GA_TOTAL_ROW_COUNT = "ga.total.rows";
    public static final String GA_START_INDEX_VALUE="ga.start-index.value";
    //JSON or P12 FilePath
    public static final PropertyDescriptor File_Path = new PropertyDescriptor.Builder()
    .name("JSON or P12 FilePath")
    .description("Enter the path of Private Key file. It should be either in JSON or P12 file format."
            +" E.g. C:\\TestFolder\\keys.Json or keys.p12")
    .required(true)
    .expressionLanguageSupported(false)
    .addValidator(StandardValidators.GA_JSON_P12_VALIDATOR)
    .build();
    
    //ServiceAccount Mail ID
    public static final PropertyDescriptor ServiceAccount_Mailid = new PropertyDescriptor.Builder()
    .name("ServiceAccount Mail-id")
    .description("Enter the ServiceAccount Mail-id."
            + "\n E.g: test-user.iam.gserviceaccount.com")
    .required(true)
    .expressionLanguageSupported(false)
    .addValidator(StandardValidators.GA_SERVICE_ACCOUNT_MAIL_VALIDATOR)
    .build();
    
    //Start date
    public static final PropertyDescriptor Start_date = new PropertyDescriptor.Builder()
    .name("Start date")
    .description("All Analytics data requests must specify a date range.  If you do not include start-date parameters in the request, the server returns an error. Date values can be for a specific date by using the pattern YYYY-MM-DD or relative by using today, yesterday, or the NdaysAgo pattern. Values must match [0-9]{4}-[0-9]{2}-[0-9]{2}|today|yesterday|[0-9]+(daysAgo).")
    .required(true)
    .defaultValue("30daysAgo")
    .expressionLanguageSupported(false)
    .addValidator(StandardValidators.GA_DATE_VALIDATOR)
    .build();
    
    //End Date
    public static final PropertyDescriptor End_date = new PropertyDescriptor.Builder()
    .name("End date")
    .description("All Analytics data requests must specify a date range.  If you do not include end-date parameters in the request, the server returns an error. Date values can be for a specific date by using the pattern YYYY-MM-DD or relative by using today, yesterday, or the NdaysAgo pattern. Values must match [0-9]{4}-[0-9]{2}-[0-9]{2}|today|yesterday|[0-9]+(daysAgo). If End Date is not mentioned today's date will be considered as End Date")
    .required(false)
    .defaultValue("yesterday")
    .expressionLanguageSupported(false)
    .addValidator(StandardValidators.GA_DATE_VALIDATOR)
    .build();
    
    //PageView id
    public static final PropertyDescriptor Pageview_id = new PropertyDescriptor.Builder()
    .name("Profile ID")
    .description("The profile ID used to retrieve the Analytics data. This ID is the concatenation of the namespace ga: with the Analytics view (profile) ID. This ID must match the following regular expression: 'ga:[0-9]+'.")
    .required(true)
    .defaultValue("ga:")
    .expressionLanguageSupported(false)
    .addValidator(StandardValidators.GA_PROFILE_ID_VALIDATOR)
    .build();
    
    //Metrics
    public static final PropertyDescriptor Metrics = new PropertyDescriptor.Builder()
    .name("Metrics")
    .description("Enter the Metric details. The aggregated statistics for user activity to your site, such as clicks or pageviews. You can supply a maximum of 10 metrics for any query."
            + " E.g: ga:sessions,ga:bounces")
    .required(true)
    .defaultValue("ga:pageviews")
    .expressionLanguageSupported(false)
    .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
    .build();
    
    //Dimensions
    public static final PropertyDescriptor Dimensions = new PropertyDescriptor.Builder()
    .name("Dimensions")
    .description("The dimensions parameter breaks down metrics by common criteria; for example, by ga:browser or ga:city. While you can ask for the total number of pageviews to your site, it might be more interesting to ask for the number of pageviews broken down by browser. In this case, you'll see the number of pageviews from Firefox, Internet Explorer, Chrome, and so forth. You can supply a maximum of 7 dimensions in any query."
            +" E.g: ga:browser,ga:city")
    .defaultValue("ga:country")
    .required(false)
    .expressionLanguageSupported(false)
    .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
    .build();
    
    //Sort
    public static final PropertyDescriptor Sort = new PropertyDescriptor.Builder()
    .name("sort")
    .description("A list of metrics and dimensions indicating the sorting order and sorting direction for the returned data.")
    .required(false)
    .expressionLanguageSupported(false)
    .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
    .build();
    
    //Filters
    public static final PropertyDescriptor Filters = new PropertyDescriptor.Builder()
    .name("filters")
    .description("The filters query string parameter restricts the data returned from your request.")
    .required(false)
    .expressionLanguageSupported(false)
    .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
    .build();
    
    //Segment
    public static final PropertyDescriptor Segment = new PropertyDescriptor.Builder()
    .name("segment")
    .description("Enter the segment details."
            + " E.g: gaid::-10")
    .required(false)
    .expressionLanguageSupported(false)
    .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
    .build();
    
    //SamplingLevel
    public static final PropertyDescriptor SamplingLevel = new PropertyDescriptor.Builder()
    .name("samplinglevel")
    .description("Use this parameter to set the sampling level (i.e. the number of sessions used to calculate the result) for a reporting query.")
    .allowableValues("DEFAULT", "FASTER", "HIGHER_PRECISION")
    .defaultValue("DEFAULT")
    .required(true)
    .expressionLanguageSupported(false)
    .build();
    
    //Include-Empty-Rows
    public static final PropertyDescriptor Include_Empty_Rows = new PropertyDescriptor.Builder()
    .name("include-empty-rows")
    .description("Defaults to true; if set to false, rows where all metric values are zero will be omitted from the response. For example if you include more than one metric in a query, the rows are only removed if all metric values are zero. This can be useful when making a request where it is expected that the number of valid rows is much smaller then the number of expected dimension values.")
    .allowableValues("true", "false")
    .defaultValue("true")
    .required(true)
    .expressionLanguageSupported(false)
    .addValidator(StandardValidators.BOOLEAN_VALIDATOR)
    .build();
    
    //start-index
    public static final PropertyDescriptor start_index = new PropertyDescriptor.Builder()
    .name("start-index")
    .description("If not supplied, the starting index is 1.Use this parameter as a pagination mechanism along with the max-results parameter for situations when totalResults exceeds 10,000 and you want to retrieve rows indexed at 10,001 and beyond.")
    .required(false)
    .expressionLanguageSupported(false)
    .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
    .build();
    
    //Max-Results
    public static final PropertyDescriptor Max_Results = new PropertyDescriptor.Builder()
    .name("max-results")
    .description("Maximum number of rows to include in this response. You can use this in combination with start-index to retrieve a subset of elements, or use it alone to restrict the number of returned elements, starting with the first. If max-results is not supplied, the query returns the default maximum of 1000 rows.")
    .required(false)
    .defaultValue("1000")
    .expressionLanguageSupported(false)
    .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
    .build();
    
    public static final Relationship REL_SUCCESS = new Relationship.Builder()
    .name("success")
    .description("All created FlowFiles are routed to this relationship")
    .build();
    
    public static final Relationship REL_FAILURE = new Relationship.Builder()
    .name("failure")
    .description("All created FlowFiles are routed to this relationship")
    .build();

    private static void createScoped(Set<String> all) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
    
    @Override
    public Set<Relationship> getRelationships() {
        final Set<Relationship> rels = new HashSet<>();
        rels.add(REL_SUCCESS);
        rels.add(REL_FAILURE);
        return rels;
    }
    
    @Override
    protected List<PropertyDescriptor> getSupportedPropertyDescriptors() {
        final List<PropertyDescriptor> properties = new ArrayList<>();        
        properties.add(File_Path);
        properties.add(ServiceAccount_Mailid);
        properties.add(Pageview_id);
        properties.add(Start_date);
        properties.add(End_date);
        properties.add(Metrics);
        properties.add(Dimensions);
        properties.add(Sort);
        properties.add(Filters);
        properties.add(Segment);
        properties.add(SamplingLevel);
        properties.add(Include_Empty_Rows);
        properties.add(start_index);
        properties.add(Max_Results);
        return properties;
    }
    @Override
    protected PropertyDescriptor getSupportedDynamicPropertyDescriptor(final String propertyDescriptorName) {
        return new PropertyDescriptor.Builder()
        .name(propertyDescriptorName)
        .description("Sets the environment variable '" + propertyDescriptorName + "' for the process' environment")
        .dynamic(true)
        .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
        .build();
    }
  private static final String APPLICATION_NAME = "Hello Analytics";
  private static String KEY_FILE_LOCATION;
  private static String SERVICE_ACCOUNT_EMAIL;
  private static FlowFile flowFile;
  private static int TOTAL_ROWS;
  private static String COMPONENT_ID;
  private static int DYNAMIC_START_INDEX=1;
    

    @OnScheduled
    public void onScheduled(final ProcessContext context) {

    }

    @Override
    public void onTrigger(final ProcessContext context, final ProcessSession session) throws ProcessException {
        String component_details=context.getStateManager().toString();
        String componentId=component_details.split("=")[1];
        String processorId=componentId.replace("]", "");
        if(COMPONENT_ID!=null&& !processorId.equals(COMPONENT_ID)){
            DYNAMIC_START_INDEX=1;
        }
        COMPONENT_ID=processorId;
        flowFile = session.create();
        SERVICE_ACCOUNT_EMAIL=context.getProperty(ServiceAccount_Mailid).getValue();
        KEY_FILE_LOCATION=context.getProperty(File_Path).getValue();
        //String totalrows=TOTAL_ROWS.toString();
        try {
            GaData result=GoogleAnalytics(context);
            Gson gson = new Gson();
            final String output = gson.toJson(result);

            flowFile = session.write(flowFile, new StreamCallback() {
            @Override
            
            public void process(InputStream inputStream, OutputStream outputStream) throws IOException {
                        //String s = IOUtils.toString(inputStream);
                        IOUtils.write(output, outputStream);
        }
        
        // TODO implement
    });
            session.putAttribute(flowFile,GA_START_INDEX_VALUE , String.valueOf(DYNAMIC_START_INDEX));
    session.putAttribute(flowFile, GA_TOTAL_ROW_COUNT, String.valueOf(TOTAL_ROWS));
    session.transfer(flowFile, REL_SUCCESS);
        } 
        catch (Exception ex) 
        {
            Logger.getLogger(GoogleAnalytics.class.getName()).log(Level.SEVERE, null, ex);
            getLogger().error("Failed to get from Google analytics account due to {}; routing to failure", new Object[]{flowFile, ex});
                session.transfer(session.penalize(flowFile), REL_FAILURE);
                return;
        }
        
        
        if ( flowFile == null ) {
        }
        // TODO implement
    }
  

    public static GaData GoogleAnalytics(final ProcessContext context) throws Exception
    {
        String filePath=context.getProperty(File_Path).getValue();
        String profileId=context.getProperty(Pageview_id).getValue();
        String startDate=context.getProperty(Start_date).getValue();
        String endDate=context.getProperty(End_date).getValue();
        String metrics=context.getProperty(Metrics).getValue();
        String dimensions=context.getProperty(Dimensions).getValue();
        String sort=context.getProperty(Sort).getValue();
        String filters=context.getProperty(Filters).getValue();
        String segment=context.getProperty(Segment).getValue();
        String sampling_level=context.getProperty(SamplingLevel).getValue();
        String include_empty_rows=context.getProperty(Include_Empty_Rows).getValue();
        String Start_index=context.getProperty(start_index).getValue();
        String max_results=context.getProperty(Max_Results).getValue();

        if(Start_index==null)
        {
            Start_index=String.valueOf(DYNAMIC_START_INDEX);
        } else {
        }
       
        if(endDate==null)
        {
            DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            Date date = new Date();
            endDate=dateFormat.format(date);
        } 
                    
        if(dimensions==null)
        {
            dimensions="0";
        }
        if(sort==null)
        {
            sort="0";
        }
    
        if(filters==null)
        {
            filters="0";
        }
        if(segment==null)
        {
            segment="0";
        }
        if(Start_index==null)
        {
            Start_index="1";
        }
        if(max_results==null)
        {
            max_results="1000";
        }
       
        if(filePath.contains("p.12")==true)
        {
               
           Analytics analytics=p12credentialprocessing();
           GaData JsonData=retrievingdatafromaccount(analytics,profileId, startDate, endDate, metrics, dimensions, sort, filters, segment, sampling_level, include_empty_rows, Start_index, max_results);
           return JsonData;
                }
        else
        {
            
            Analytics analytics = jsoncredentialprocessing();
            GaData JsonData=retrievingdatafromaccount(analytics,profileId, startDate, endDate, metrics, dimensions, sort, filters, segment, sampling_level, include_empty_rows, Start_index, max_results);
            
            return JsonData;
        }
    }
    //Authentication with json file credential
    public static Analytics jsoncredentialprocessing() throws Exception{
      HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
      JsonFactory jsonFactory = JacksonFactory.getDefaultInstance();
      GoogleCredential Creden;
      Creden = GoogleCredential.fromStream(new FileInputStream(KEY_FILE_LOCATION)).createScoped(AnalyticsScopes.all());
     
      return new Analytics.Builder(httpTransport, jsonFactory, Creden)
        .setApplicationName(APPLICATION_NAME).build();
  }
    //Authentication with P12 file credential
  public static Analytics p12credentialprocessing() throws Exception{
      HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
      JsonFactory jsonFactory = JacksonFactory.getDefaultInstance();
      
   
    GoogleCredential credential = new GoogleCredential.Builder()
        .setTransport(httpTransport)
        .setServiceAccountId(SERVICE_ACCOUNT_EMAIL)
        .setServiceAccountPrivateKeyFromP12File(new File(KEY_FILE_LOCATION))
        .setServiceAccountScopes(AnalyticsScopes.all())
        .build();
    // Construct the Analytics service object.
     return new Analytics.Builder(httpTransport, jsonFactory, credential)
        .setApplicationName(APPLICATION_NAME).build();
     
 

  }
  //Retrieving the data from google analytics account with query parameters.
  public static GaData retrievingdatafromaccount(Analytics analytics,String profileID, String startDate, String endDate, String metrics, String dimensions, String sort, String filters, String segment, String sampling_level, String include_empty_rows, String start_index, String max_results)throws Exception{
   
       
        Analytics.Data.Ga.Get response;
        
        response=analytics.data().ga().get( profileID, startDate, endDate, metrics);
        if(dimensions.startsWith("ga")&&!"0".equals(dimensions))
        {
            response.setDimensions(dimensions);
        }
        if(sort.startsWith("ga")&&!"0".equals(sort))
        {
            response.setSort(sort);
        }
        if(!"0".equals(segment)&&segment.startsWith("ga"))
        {
            response.setSegment(segment);
        }
        if(filters.startsWith("ga")&&!"0".equals(filters))
        {
            response.setFilters(filters);
        }
        response.setSamplingLevel(sampling_level);
        response.setIncludeEmptyRows(Boolean.parseBoolean(include_empty_rows));
        response.setMaxResults(Integer.parseInt(max_results));
        response.setStartIndex(Integer.parseInt(start_index));
        response.setPrettyPrint(Boolean.TRUE);
        
        GaData result=response.execute();
        TOTAL_ROWS=result.getTotalResults();
        if(result.getRows()!=null){
        int count=result.getRows().size();
        DYNAMIC_START_INDEX=DYNAMIC_START_INDEX+count;
        }
        System.out.println(result);
        return result;
  }
    
}
