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
package org.apache.nifi.processors.emailattachment;


import com.sun.mail.imap.IMAPMessage;
import com.sun.mail.util.MailSSLSocketFactory;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.*;

import java.util.logging.Level;
import java.util.logging.Logger;
import javax.mail.*;
import javax.mail.Flags.Flag;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMultipart;
import javax.mail.search.FlagTerm;
import org.apache.commons.io.IOUtils;
import org.apache.nifi.annotation.documentation.CapabilityDescription;

import org.apache.nifi.annotation.documentation.Tags;
import org.apache.nifi.annotation.lifecycle.OnScheduled;

import org.apache.nifi.components.PropertyDescriptor;

import org.apache.nifi.flowfile.FlowFile;

import org.apache.nifi.processor.*;
import org.apache.nifi.processor.exception.ProcessException;
import org.apache.nifi.processor.io.StreamCallback;
import org.apache.nifi.processor.util.StandardValidators;
@Tags({
 "download","email","attachment","imap","message"
})
@CapabilityDescription("Consumes messages from email server using IMAP protocol. "+"A copy of each received email message is written into the local drive.")

public class ExtractEmail extends AbstractProcessor {

 public static final String DESTINATION_ATTRIBUTE = "flowfile-attribute";
 public static final String DESTINATION_CONTENT = "flowfile-content";
 public static final String CONTENT_TYPE_PLAIN = "text";
 public static final String CONTENT_TYPE_HTML = "html";
 public static final String EMAIL_MESSAGE_ID = "email.message.id";
 public static final String EMAIL_SUBJECT = "email.subject";
 public static final String EMAIL_DATETIME = "email.date.time";
 public static final String EMAIL_SIZE = "email.size";
 public static final String EMAIL_ATTACHMENT_COUNT = "email.attachment.count";
 public static final String EMAIL_BODY_CONTENT = "email.body.content";
 public static final String EMAIL_FROM_ADDRESS = "email.from.address";
 public static final String EMAIL_TO_ADDRESS = "email.to.address";
 public static final String EMAIL_CC_ADDRESS = "email.cc.address";
 public static final String EMAIL_BCC_ADDRESS = "email.bcc.address";
 public static final String EMAIL_ATTACHED_FILENAMES = "email.attached.filenames";
 public static final String ISHTMLOUTPUT = "email.ishtmloutput";
 public static boolean isContentTypePlain = true;
 
 public static final PropertyDescriptor HOST = new PropertyDescriptor.Builder()
  .name("host")
  .displayName("Host Name")
  .description("Network address of email server (e.g., imap.gmail.com...)")
  .required(true)
  .expressionLanguageSupported(true)
  .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
  .build();

 public static final PropertyDescriptor USER = new PropertyDescriptor.Builder()
  .name("user")
  .displayName("User Name")
  .description("User Name used for authentication and authorization with email server (e.g., username@outlook.com).")
  .required(true)
  .expressionLanguageSupported(true)
  .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
  .build();
 public static final PropertyDescriptor PASSWORD = new PropertyDescriptor.Builder()
  .name("password")
  .displayName("Password")
  .description("Password used for authentication and authorization with email server.")
  .required(true)
  .expressionLanguageSupported(true)
  .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
  .sensitive(true)
  .build();
 public static final PropertyDescriptor PORT = new PropertyDescriptor.Builder()
  .name("port")
  .displayName("Port")
  .defaultValue("993")
  .description("IMAP Port used for authentication and authorization with email server.")
  .required(true)
  .expressionLanguageSupported(true)
  .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
  .build();
 public static final PropertyDescriptor FOLDER = new PropertyDescriptor.Builder()
  .name("folder")
  .displayName("Folder")
  .description("Email folder to retrieve messages from (e.g., inbox).")
  .required(true)
  .expressionLanguageSupported(true)
  .defaultValue("INBOX")
  .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
  .build();
 public static final PropertyDescriptor DELIMITER = new PropertyDescriptor.Builder()
  .name("delimiter")
  .displayName("Delimiter")
  .description("If the delimiter is specified, the message content before the delimiter is extracted. Otherwise, all message content is extracted.")
  .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
  .required(false)
  .build();
 public static final PropertyDescriptor FETCH_SIZE = new PropertyDescriptor.Builder()
  .name("Fetch Size")
  .displayName("Fetch Size")
  .description("Specify the maximum number of messages to fetch per call to email server. Default value is 5 and maximum value is 10.")
  .required(true)
  .defaultValue("5")
  .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
  .build();
 public static final PropertyDescriptor DESTINATION = new PropertyDescriptor.Builder()
  .name("Destination")
  .description("Indicates whether the results of the JsonPath evaluation are written to the FlowFile content or a FlowFile attribute. If set to flowfile-content, the email body content is written on FlowFile content.")
  .required(true)
  .allowableValues(DESTINATION_CONTENT, DESTINATION_ATTRIBUTE)
  .defaultValue(DESTINATION_ATTRIBUTE)
  .build();
 public static final PropertyDescriptor OUTPUT_TYPE = new PropertyDescriptor.Builder()
  .name("Output Type")
  .description("Indicates the content type of the email message content. If set to HTML, the message content is converted into HTML format. Otherwise, the message is printed in plain text format.")
  .required(true)
  .allowableValues(CONTENT_TYPE_HTML, CONTENT_TYPE_PLAIN)
  .defaultValue(CONTENT_TYPE_PLAIN)
  .build();
 static final Relationship REL_SUCCESS = new Relationship.Builder()
  .name("success")
  .description("All messages that are successfully received from Email server are routed to this relationship.")
  .build();
 public static final Relationship REL_FAILURE = new Relationship.Builder()
  .name("failure")
  .description("Failed to get messages from Email server for some reason has been transferred to this relationship.")
  .build();

 private List < PropertyDescriptor > descriptors;

 private Set < Relationship > relationships;


 @Override
 protected void init(final ProcessorInitializationContext context) {
  final List < PropertyDescriptor > descriptors = new ArrayList < PropertyDescriptor > ();
  descriptors.add(HOST);
  descriptors.add(PORT);
  descriptors.add(USER);
  descriptors.add(PASSWORD);
  descriptors.add(FOLDER);
  descriptors.add(DELIMITER);
  descriptors.add(FETCH_SIZE);
  descriptors.add(DESTINATION);
  descriptors.add(OUTPUT_TYPE);
  this.descriptors = Collections.unmodifiableList(descriptors);

  final Set < Relationship > relationships = new HashSet < Relationship > ();
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



 @OnScheduled
 public void onScheduled(final ProcessContext context) {

 }

 @Override
 public void onTrigger(final ProcessContext context, final ProcessSession session) throws ProcessException {
  isContentTypePlain = true;
  final String mailServer = context.getProperty(HOST).getValue();
  final String userName = context.getProperty(USER).getValue();
  final String passWord = context.getProperty(PASSWORD).getValue();
  final String folderName = context.getProperty(FOLDER).getValue();
  final int portNumber = Integer.parseInt(context.getProperty(PORT).getValue());
  final String delimiter = context.getProperty(DELIMITER).getValue();
  int maxFetchSize = Integer.parseInt(context.getProperty(FETCH_SIZE).getValue());
  final String messageContentDestination = context.getProperty(DESTINATION).getValue();
  final String messageContentType=context.getProperty(OUTPUT_TYPE).getValue();
  Store store = null;
  Folder folder = null;
  try {
   if(messageContentType.equals("html")){
       isContentTypePlain=false;
   }
   Boolean writeBodyMessageIntoFlowfile = false;
   if ("flowfile-content".equals(messageContentDestination)) {
    writeBodyMessageIntoFlowfile = true;
   }
   if (maxFetchSize > 10) {
    maxFetchSize = 10;
   }
   Properties javaMailProperties = new Properties();
   javaMailProperties.setProperty("mail.store.protocol", "imaps");
   MailSSLSocketFactory socketFactory = new MailSSLSocketFactory();
   socketFactory.setTrustAllHosts(true);
   javaMailProperties.put("mail.imaps.ssl.checkserveridentity", "false");
   javaMailProperties.put("mail.imaps.ssl.trust", "*");
   javaMailProperties.put("mail.imaps.ssl.socketFactory", socketFactory);
   Session FlowSession = Session.getDefaultInstance(javaMailProperties, null);
   store = FlowSession.getStore("imaps");

   store.connect(mailServer, portNumber, userName, passWord);

   folder = store.getFolder(folderName);
   folder.open(Folder.READ_WRITE);
   javax.mail.Message messages[] = folder.search(new FlagTerm(new Flags(Flag.SEEN), false));

   for (int i = 0; i < maxFetchSize && i < messages.length; i++) {

    int attachedFileCount = 0;
    String attachedFileNames = "";
    IMAPMessage message = (IMAPMessage) messages[i];
    String contentType = message.getContentType();
    String messageID = message.getMessageID();
    String emailSubject = message.getSubject();
    Date receivedDate = message.getReceivedDate();
    String outputDate = receivedDate.toLocaleString();
    int mailSize = message.getSize();
    String fromAddress = InternetAddress.toString(message.getFrom());
    String toAddress = InternetAddress.toString(messages[i].getRecipients(Message.RecipientType.TO));
    String ccAddress = InternetAddress.toString(messages[i].getRecipients(Message.RecipientType.CC));
    String bccAddress = InternetAddress.toString(messages[i].getRecipients(Message.RecipientType.BCC));
    fromAddress = extractEmailId(fromAddress);
    toAddress = extractEmailId(toAddress);
    ccAddress = extractEmailId(ccAddress);
    bccAddress = extractEmailId(bccAddress);

    if (contentType.contains("multipart")) {

     Multipart multiPart = (Multipart) message.getContent();
     int numberOfParts = multiPart.getCount();
     for (int partCount = 0; partCount < numberOfParts; partCount++) {
      try {
       MimeBodyPart part = (MimeBodyPart) multiPart.getBodyPart(partCount);
       if (Part.ATTACHMENT.equalsIgnoreCase(part.getDisposition())) {

        // this part is attachment
        String fileName = part.getFileName();
        if (fileName != null && attachedFileNames.isEmpty()) {
         attachedFileNames = fileName;
         attachedFileCount++;
        } else if (fileName != null) {
         attachedFileNames = attachedFileNames + ", " + fileName;
         attachedFileCount++;
        }

       }
      } catch (Exception ex) {
       System.out.println(ex);
      }
     }
    }

    //Extracting Body Content//

    String finalContent = getTextFromMessage(message);

    //Filtering the body content with the given delimiter to easily get the recent message from the threads.

    if (delimiter != null && !"".equals(delimiter) && finalContent.contains(delimiter)) {
     String beforeDelimiterContent = finalContent.substring(0, finalContent.indexOf(delimiter));
     finalContent = beforeDelimiterContent;
    }

    // Converting the mailsize from bytes into kb //

    if (mailSize != -1) {
     mailSize = mailSize / 1024;
    }
    String totalMailSize = String.valueOf(mailSize) + " KB";
    //System.out.println(finalContent);
    final String outputContent = finalContent;
    transferResponseToSuccess(session, attachedFileCount, attachedFileNames, messageID, emailSubject, outputDate, totalMailSize,
     fromAddress, toAddress, ccAddress, bccAddress, writeBodyMessageIntoFlowfile, outputContent, message);

   }
   folder.close(true);
   store.close();
  } catch (Exception ex) {

   try {
    folder.close(true);
    store.close();
   } catch (MessagingException ex1) {
    Logger.getLogger(ExtractEmail.class.getName()).log(Level.SEVERE, null, ex1);
   }

   FlowFile flowFile = session.get();
   if (flowFile == null) {
    flowFile = session.create();
   }
   getLogger().error(ex.getMessage());
   transferResponseToFlowFile(session, flowFile, ex.getMessage(), REL_FAILURE);

  }


 }

 // Extracts the email id from the email name . For eg. Extracts the email id xxxx@gmail.com from xxxx <xxxx@gmail.com>

public String extractEmailId(String emailAddr) {
        if(emailAddr == null || emailAddr.equals(""))
            return emailAddr;
        String[] emailAddress = emailAddr.split(",");
        String extractedEmailAddr = "";
        for(String addr : emailAddress) {
            if(addr.contains("<") && addr.contains(">"))
                addr = addr.substring(addr.indexOf("<") + 1, addr.indexOf(">"));
            if(extractedEmailAddr.equals(""))
                extractedEmailAddr = addr;
            else
                extractedEmailAddr += "," + addr;
        }
        return extractedEmailAddr;
    }

 private void transferResponseToSuccess(ProcessSession session, int attachedFileCount, String attachedFileNames, String messageID, String emailSubject,
  String outputDate, String totalMailSize, String fromAddress, String toAddress, String ccAddress, String bccAddress, Boolean writeBodyMessageIntoFlowfile,
  String outputContent, IMAPMessage message) {
  FlowFile flowFile = session.get();
  flowFile = session.get();
  String isHtmlOutput = "false"; 
  if (flowFile == null) {
   flowFile = session.create();
  }
  // Writes the message body into the flowfile if the writeBodyMessageIntoFlowfile property set to true.

  if (writeBodyMessageIntoFlowfile) {
   flowFile = session.write(flowFile, new StreamCallback() {
    @Override

    public void process(InputStream inputStream, OutputStream outputStream) throws IOException {
     //String s = IOUtils.toString(inputStream);
     IOUtils.write(outputContent, outputStream);
    }

    // TODO implement
   });
  } else {
   flowFile = session.append(flowFile, out -> {
    try {
     message.writeTo(out);
    } catch (MessagingException e) {
     throw new IOException(e);
    }
   });
  }
  if(!isContentTypePlain)
   isHtmlOutput="true";  
  
  // Adding attributes
  session.putAttribute(flowFile, EMAIL_MESSAGE_ID, messageID);
  session.putAttribute(flowFile, EMAIL_SUBJECT, emailSubject);
  session.putAttribute(flowFile, EMAIL_DATETIME, outputDate);
  session.putAttribute(flowFile, EMAIL_SIZE, totalMailSize);
  session.putAttribute(flowFile, EMAIL_ATTACHMENT_COUNT, String.valueOf(attachedFileCount));
  session.putAttribute(flowFile, EMAIL_BODY_CONTENT, outputContent);
  session.putAttribute(flowFile, EMAIL_FROM_ADDRESS, fromAddress);
  session.putAttribute(flowFile, EMAIL_TO_ADDRESS, toAddress);
  session.putAttribute(flowFile, EMAIL_CC_ADDRESS, ccAddress);
  session.putAttribute(flowFile, EMAIL_BCC_ADDRESS, bccAddress);
  session.putAttribute(flowFile, EMAIL_ATTACHED_FILENAMES, attachedFileNames);
  session.putAttribute(flowFile, ISHTMLOUTPUT, isHtmlOutput);
  session.transfer(flowFile, REL_SUCCESS);
 }

 private void transferResponseToFlowFile(ProcessSession session, FlowFile flowFile, String responseMessage, Relationship relationship) {
  FlowFile flowFileContent = session.write(flowFile, (OutputStream outputStream) -> {
   outputStream.write(responseMessage.getBytes());
  });
  session.transfer(flowFileContent, relationship);
 }

 //// Extracting the e-mail body content and changed into the string ///////////////////

 private static String getTextFromMessage(Message message) throws MessagingException, IOException {
  String result = "";
  if (message.isMimeType("text/plain")) {
   result = message.getContent().toString();
  } else if (message.isMimeType("text/html")) {
   String html = (String) message.getContent();
   if (isContentTypePlain) {
    result = result + "\n" + org.jsoup.Jsoup.parse(html).text();
   } else {
    result = html;
   }

  } else if (message.isMimeType("multipart/*")) {
   MimeMultipart mimeMultipart = (MimeMultipart) message.getContent();
   result = getTextFromMimeMultipart(mimeMultipart);
  }
  return result;
 }

 private static String getTextFromMimeMultipart(
  MimeMultipart mimeMultipart) throws MessagingException, IOException {
  String result = "";
  int count = mimeMultipart.getCount();
  for (int i = 0; i < count; i++) {
   BodyPart bodyPart = mimeMultipart.getBodyPart(i);
   if (bodyPart.isMimeType("text/plain") && "".equals(result)) {
    String des = bodyPart.getDescription();
    result = result + "\n" + bodyPart.getContent();
    break; // without break same text appears twice in my tests
   } else if (bodyPart.isMimeType("text/html") && result == "") {
    String html = (String) bodyPart.getContent();
    if (isContentTypePlain) {
     result = result + "\n" + org.jsoup.Jsoup.parse(html).text();
    } else {
     result = html;
    }
   } else if (bodyPart.getContent() instanceof MimeMultipart && result == "") {
    result = result + getTextFromMimeMultipart((MimeMultipart) bodyPart.getContent());
   }
  }
  return result;
 }
}