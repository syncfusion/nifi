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
import com.microsoft.azure.sdk.iot.device.DeviceClient;
import com.microsoft.azure.sdk.iot.device.IotHubClientProtocol;
import com.microsoft.azure.sdk.iot.device.IotHubEventCallback;
import com.microsoft.azure.sdk.iot.device.IotHubStatusCode;
import com.microsoft.azure.sdk.iot.device.Message;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.logging.Logger;
import org.apache.nifi.annotation.lifecycle.OnStopped;
import org.apache.nifi.processor.io.InputStreamCallback;
import org.apache.nifi.stream.io.StreamUtils;

@Tags({
 "microsoft",
 "azure",
 "cloud",
 "IOThub",
 "streams",
 "streaming"
})
@CapabilityDescription("Sends the contents of a FlowFile to a Windows Azure IOT Hub. Note: the content of the FlowFile will be buffered into memory before being sent, " + "so care should be taken to avoid sending FlowFiles to this Processor that exceed the amount of Java Heap Space available.")
@SeeAlso({})
@ReadsAttributes({
 @ReadsAttribute(attribute = "", description = "")
})
@WritesAttributes({
 @WritesAttribute(attribute = "", description = "")
})
public class PutAzureIOTHub extends AbstractProcessor {

 public static final PropertyDescriptor IOT_Hub_Name = new PropertyDescriptor
  .Builder().name("IOT Hub Name")
  .displayName("IOT Hub Name")
  .description("Event Hub-compatible name")
  .required(true)
  .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
  .build();
 public static final PropertyDescriptor Access_PrimaryKey = new PropertyDescriptor
  .Builder().name("Device Primary Key")
  .displayName("Device Primary Key")
  .description("Primary key from Azure IOT Hub device details")
  .required(true)
  .expressionLanguageSupported(false)
  .sensitive(true)
  .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
  .build();
 public static final PropertyDescriptor Device_Id = new PropertyDescriptor
  .Builder().name("Device Id")
  .displayName("Device Id")
  .description("Device Id of the Azure IOT Hub device")
  .required(true)
  .expressionLanguageSupported(false)
  .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
  .build();
 public static final Relationship MY_RELATIONSHIP = new Relationship.Builder()
  .name("MY_RELATIONSHIP")
  .description("Example relationship")
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
 ExecutorService executor;
 private String connectionString;
 private static final IotHubClientProtocol protocol = IotHubClientProtocol.MQTT;
 private String message;
 private static DeviceClient client;
 private Set < Relationship > relationships;

 @Override
 protected void init(final ProcessorInitializationContext context) {
  final List < PropertyDescriptor > descriptors = new ArrayList < PropertyDescriptor > ();
  descriptors.add(IOT_Hub_Name);
  descriptors.add(Device_Id);
  descriptors.add(Access_PrimaryKey);
  final Set < Relationship > relationships = new HashSet < Relationship > ();
  this.descriptors = Collections.unmodifiableList(descriptors);
  relationships.add(REL_SUCCESS);
  relationships.add(REL_FAILURE);
  this.relationships = Collections.unmodifiableSet(relationships);
 }

 @Override
 public Set < Relationship > getRelationships() {
  return this.relationships;
 }

 @Override
 public final List < PropertyDescriptor > getSupportedPropertyDescriptors() {
  return descriptors;
 }
 @OnStopped
 public void tearDown() throws ProcessException, IOException {
  client.closeNow();
 }
 @OnScheduled
 public final void setupClient(final ProcessContext context) throws URISyntaxException, IOException {
  final String deviceId = context.getProperty(Device_Id).getValue();
  final String IOTHubName = context.getProperty(IOT_Hub_Name).getValue();
  final String policyKey = context.getProperty(Access_PrimaryKey).getValue();
  connectionString = "HostName=" + IOTHubName + ".azure-devices.net;DeviceId=" + deviceId + ";SharedAccessKey=" + policyKey;
  client = new DeviceClient(connectionString, protocol);
  client.open();
 }

 @Override
 public void onTrigger(final ProcessContext context, final ProcessSession session) throws ProcessException {
  FlowFile flowFile = session.get();
  if (flowFile == null) {
   return;
  }
  final ByteArrayOutputStream baos = new ByteArrayOutputStream((int) flowFile.getSize() + 1);
  session.read(flowFile, new InputStreamCallback() {
   @Override
   public void process(final InputStream in ) throws IOException {
    StreamUtils.copy( in , baos);
   }
  });
  message = baos.toString();
  try {
   MessageSender sender = new MessageSender();
   executor = Executors.newFixedThreadPool(1);
   executor.execute(sender);
   executor.shutdownNow();
  } catch (final ProcessException processException) {
   getLogger().error("Failed to send {} to IOTHub due to {}; routing to failure", new Object[] {
    flowFile,
    processException
   }, processException);
   session.transfer(session.penalize(flowFile), REL_FAILURE);
   return;
  }
  session.transfer(flowFile, REL_SUCCESS);
 }
 public class EventCallback implements IotHubEventCallback {
  @Override
  public void execute(IotHubStatusCode status, Object context) {
   System.out.println("IoT Hub responded to message with status: " + status.name());
   if (context != null) {
    synchronized(context) {
     context.notify();
    }
   }
  }
 }
 public class MessageSender implements Runnable {
  @Override
  public void run() {
   try {
    while (true) {
     Message msg = new Message(message);
     System.out.println("Sending: " + message);
     Object lockobj = new Object();
     EventCallback callback = new EventCallback();
     client.sendEventAsync(msg, callback, lockobj);
     synchronized(lockobj) {
      lockobj.wait();
     }
     Thread.sleep(1000);
    }
   } catch (InterruptedException e) {
    Logger.getLogger("Exception while sending message", e.getMessage());
   }
  }
 }
}