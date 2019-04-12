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
package org.apache.nifi.processors.azure.IOTHub;

import org.apache.nifi.components.PropertyDescriptor;
import org.apache.nifi.flowfile.FlowFile;
import org.apache.nifi.annotation.behavior.ReadsAttribute;
import org.apache.nifi.annotation.behavior.ReadsAttributes;
import org.apache.nifi.annotation.behavior.WritesAttribute;
import org.apache.nifi.annotation.behavior.WritesAttributes;
import org.apache.nifi.annotation.lifecycle.OnScheduled;
import org.apache.nifi.annotation.documentation.CapabilityDescription;
import org.apache.nifi.annotation.documentation.SeeAlso;
import org.apache.nifi.annotation.documentation.Tags;
import org.apache.nifi.processor.exception.ProcessException;
import org.apache.nifi.processor.AbstractProcessor;
import org.apache.nifi.processor.ProcessContext;
import org.apache.nifi.processor.ProcessSession;
import org.apache.nifi.processor.ProcessorInitializationContext;
import org.apache.nifi.processor.Relationship;
import org.apache.nifi.processor.util.StandardValidators;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import com.microsoft.azure.eventhubs.*;
import com.microsoft.azure.servicebus.ServiceBusException;

import java.io.IOException;
import java.net.URISyntaxException;
import java.time.*;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import org.apache.nifi.annotation.lifecycle.OnStopped;
import org.apache.nifi.util.StopWatch;
@Tags({
 "microsoft",
 "azure",
 "cloud",
 "IOThub",
 "streams",
 "streaming"
})
@CapabilityDescription("Receives messages from a Microsoft Azure IOT Hub, writing the contents of the Azure message to the content of the FlowFile")
@SeeAlso({})
@ReadsAttributes({
 @ReadsAttribute(attribute = "", description = "")
})
@WritesAttributes({
 @WritesAttribute(attribute = "", description = "")
})
public class GetAzureIOTHub extends AbstractProcessor {
 public static final PropertyDescriptor IOT_Hub_EndPoint = new PropertyDescriptor
  .Builder().name("IOT_Hub_EndPoint")
  .displayName("IOT Hub EndPoint")
  .description("Event Hub-compatible endpoint")
  .required(true)
  .defaultValue("sb://${servicenamespace}.servicebus.windows.net")
  .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
  .build();
 public static final PropertyDescriptor IOT_Hub_Name = new PropertyDescriptor
  .Builder().name("IOT Hub Name")
  .displayName("IOT Hub Name")
  .description("Event Hub-compatible name")
  .required(true)
  .expressionLanguageSupported(false)
  .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
  .build();
 public static final PropertyDescriptor Shared_Access_PrimaryKey = new PropertyDescriptor
  .Builder().name("Shared Access Primary Key")
  .displayName("Shared Access Primary Key")
  .description("Primary key from the shared access policies")
  .required(true)
  .sensitive(true)
  .expressionLanguageSupported(false)
  .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
  .build();
 public static final PropertyDescriptor NUM_PARTITIONS = new PropertyDescriptor
  .Builder().name("Number of IOT Hub Partitions")
  .displayName("Partitions")
  .description("Number of partitions")
  .required(true)
  .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
  .build();
 static final PropertyDescriptor ENQUEUE_Date = new PropertyDescriptor.Builder()
  .name("Enqueue Date")
  .description("A timestamp (ISO-8061 Instant) formatted as YYYY-MM-DD(2016-01-01) from which messages " + "should have been enqueued in the IOT Hub to start reading from")
  .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
  .expressionLanguageSupported(true)
  .required(false)
  .defaultValue("YYYY-MM-DD")
  .build();
 public static final Relationship REL_SUCCESS = new Relationship.Builder()
  .name("success")
  .description("All created FlowFiles are routed to this relationship")
  .build();

 public static final Relationship REL_FAILURE = new Relationship.Builder()
  .name("failure")
  .description("All created FlowFiles are routed to this relationship")
  .build();

 private List < PropertyDescriptor > descriptors;

 private Set < Relationship > relationships;

 @Override
 protected void init(final ProcessorInitializationContext context) {
  final List < PropertyDescriptor > descriptors = new ArrayList < PropertyDescriptor > ();
  descriptors.add(IOT_Hub_EndPoint);
  descriptors.add(IOT_Hub_Name);
  descriptors.add(Shared_Access_PrimaryKey);
  descriptors.add(NUM_PARTITIONS);
  descriptors.add(ENQUEUE_Date);
  this.descriptors = Collections.unmodifiableList(descriptors);

  final Set < Relationship > relationships = new HashSet < Relationship > ();
  relationships.add(REL_SUCCESS);
  relationships.add(REL_FAILURE);
  this.relationships = Collections.unmodifiableSet(relationships);
 }
 private final ConcurrentMap < String, PartitionReceiver > partitionToReceiverMap = new ConcurrentHashMap < > ();
 private volatile BlockingQueue < String > partitionNames = new LinkedBlockingQueue < > ();
 private volatile Instant configuredEnqueueTime;
 private volatile int receiverFetchSize;
 private volatile Duration receiverFetchTimeout;
 private EventHubClient eventHubClient;
 @Override
 public Set < Relationship > getRelationships() {
  return this.relationships;
 }

 @Override
 public final List < PropertyDescriptor > getSupportedPropertyDescriptors() {
  return this.descriptors;
 }
 protected void setupReceiver(final String connectionString) throws ProcessException {
  try {
   eventHubClient = EventHubClient.createFromConnectionString(connectionString).get();
  } catch (InterruptedException | ExecutionException | IOException | ServiceBusException e) {
   throw new ProcessException(e);
  }
 }

 PartitionReceiver getReceiver(final ProcessContext context, final String partitionId) throws IOException, ServiceBusException, ExecutionException, InterruptedException {
  PartitionReceiver existingReceiver = partitionToReceiverMap.get(partitionId);
  if (existingReceiver != null) {
   return existingReceiver;
  }
  synchronized(this) {
   existingReceiver = partitionToReceiverMap.get(partitionId);
   if (existingReceiver != null) {
    return existingReceiver;
   }
   final PartitionReceiver receiver = eventHubClient.createReceiver(
    EventHubClient.DEFAULT_CONSUMER_GROUP_NAME,
    partitionId,
    configuredEnqueueTime == null ? Instant.now() : configuredEnqueueTime).get();

   receiver.setReceiveTimeout(receiverFetchTimeout == null ? Duration.ofMillis(60000) : receiverFetchTimeout);
   partitionToReceiverMap.put(partitionId, receiver);
   return receiver;

  }
 }
 protected Iterable < EventData > receiveEvents(final ProcessContext context, final String partitionId) throws ProcessException {
  final PartitionReceiver receiver;
  try {
   receiver = getReceiver(context, partitionId);
   return receiver.receive(receiverFetchSize).get();
  } catch (final IOException | ServiceBusException | ExecutionException | InterruptedException e) {
   throw new ProcessException(e);
  }
 }

 @OnStopped
 public void tearDown() throws ProcessException {
  for (final PartitionReceiver receiver: partitionToReceiverMap.values()) {
   if (null != receiver) {
    receiver.close();
   }
  }

  partitionToReceiverMap.clear();
  try {
   if (null != eventHubClient) {
    eventHubClient.closeSync();
   }
  } catch (final ServiceBusException e) {
   throw new ProcessException(e);
  }
 }
 @OnScheduled
 public void onScheduled(final ProcessContext context) throws ProcessException, URISyntaxException {
  final BlockingQueue < String > partitionNames = new LinkedBlockingQueue < > ();
  final String EndPoint = context.getProperty(IOT_Hub_EndPoint).getValue();
  final String Name = context.getProperty(IOT_Hub_Name).getValue();
  final String AccessKey = context.getProperty(Shared_Access_PrimaryKey).getValue();
  for (int i = 0; i < context.getProperty(NUM_PARTITIONS).asInteger(); i++) {
   partitionNames.add(String.valueOf(i));
  }
  this.partitionNames = partitionNames;
  if (context.getProperty(ENQUEUE_Date).isSet()) {
   final String Date = context.getProperty(ENQUEUE_Date).getValue() + "T00:00:00.000Z";
   configuredEnqueueTime = Instant.parse(Date);
  } else {
   configuredEnqueueTime = null;
  }
  receiverFetchSize = 100;
  receiverFetchTimeout = null;
  final String connectionString = "Endpoint=" + EndPoint + "/;EntityPath=" + Name + ";SharedAccessKeyName=iothubowner;SharedAccessKey=" + AccessKey;
  setupReceiver(connectionString);
 }
 EventHubClient client = null;
 @Override
 public void onTrigger(final ProcessContext context, final ProcessSession session) throws ProcessException {
  final BlockingQueue < String > partitionIds = this.partitionNames;
  final String partitionId = partitionIds.poll();
  if (partitionId == null) {
   getLogger().debug("No partitions available");
   return;
  }
  final StopWatch stopWatch = new StopWatch(true);
  try {
   final Iterable < EventData > receivedEvents = receiveEvents(context, partitionId);
   if (receivedEvents == null) {
    return;
   }
   for (EventData eventData: receivedEvents) {
    final Map < String, String > attributes = new HashMap < > ();
    FlowFile flowFile = session.create();
    EventData.SystemProperties systemProperties = eventData.getSystemProperties();

    if (null != systemProperties) {
     attributes.put("eventhub.enqueued.timestamp", String.valueOf(eventData.getSystemProperties().getEnqueuedTime()));
     attributes.put("eventhub.offset", eventData.getSystemProperties().getOffset());
     attributes.put("eventhub.sequence", String.valueOf(eventData.getSystemProperties().getSequenceNumber()));
    }
    attributes.put("eventhub.partition", partitionId);
    flowFile = session.putAllAttributes(flowFile, attributes);
    flowFile = session.write(flowFile, out -> {
     out.write(eventData.getBody());
    });


    session.transfer(flowFile, REL_SUCCESS);

    final String EndPoint = context.getProperty(IOT_Hub_EndPoint).getValue();
    final String Name = context.getProperty(IOT_Hub_Name).getValue();
    final String AccessKey = context.getProperty(Shared_Access_PrimaryKey).getValue();
    final String connectionString = "Endpoint=" + EndPoint + "/;EntityPath=" + Name + ";SharedAccessKeyName=iothubowner;SharedAccessKey=" + AccessKey;
    session.getProvenanceReporter().receive(flowFile, connectionString, stopWatch.getElapsed(TimeUnit.MILLISECONDS));

   }
   // TODO implement
  } finally {
   partitionIds.offer(partitionId);
  }
 }
}