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
package org.apache.nifi.processors.dashboard;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import org.apache.nifi.processor.*;
import org.apache.nifi.annotation.behavior.ReadsAttribute;
import org.apache.nifi.annotation.behavior.ReadsAttributes;
import org.apache.nifi.annotation.behavior.WritesAttribute;
import org.apache.nifi.annotation.behavior.WritesAttributes;
import org.apache.nifi.annotation.lifecycle.OnScheduled;
import org.apache.nifi.annotation.documentation.CapabilityDescription;
import org.apache.nifi.annotation.documentation.SeeAlso;
import org.apache.nifi.annotation.documentation.Tags;
import org.apache.nifi.components.PropertyDescriptor;
import org.apache.nifi.flowfile.FlowFile;
import org.apache.nifi.processor.AbstractProcessor;
import org.apache.nifi.processor.ProcessContext;
import org.apache.nifi.processor.ProcessSession;
import org.apache.nifi.processor.Relationship;
import org.apache.nifi.processor.exception.ProcessException;
import org.apache.nifi.processor.util.StandardValidators;

import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import org.apache.commons.lang3.StringUtils;
import org.apache.nifi.annotation.lifecycle.OnUnscheduled;
import org.apache.nifi.components.Validator;
import org.apache.nifi.logging.ComponentLog;
import org.apache.nifi.processor.io.OutputStreamCallback;

@Tags({"Syncfusion, Dashboard, syds"})
@CapabilityDescription("Syncfusion Dashboard file will be generated.")
@SeeAlso({})
@ReadsAttributes({@ReadsAttribute(attribute="", description="")})
@WritesAttributes({@WritesAttribute(attribute="", description="")})
public class DashboardFileGenerator extends AbstractProcessor {
    
    //Connection Name
    public static final PropertyDescriptor Connection_Name = new PropertyDescriptor.Builder()
    .name("Connection Name")
    .description("Data Source Name")
    .required(true)
    .expressionLanguageSupported(false)
    .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
    .build();
    
    //Connection Type
    public static final PropertyDescriptor Connection_Type = new PropertyDescriptor.Builder()
    .name("Connection Type")
    .description("Connection Type")
    .required(true)
    .allowableValues("SqlServer", "Oracle", "MySql")
    .defaultValue("SqlServer")
    .expressionLanguageSupported(false)
    .build();
    
    //ServerName
    public static final PropertyDescriptor Server_Name = new PropertyDescriptor.Builder()
    .name("Server Name")
    .description("Server Name")
    .required(true)
    .expressionLanguageSupported(false)
    .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
    .build();
    
    //AuthenticationType
    public static final PropertyDescriptor Authentication_Type = new PropertyDescriptor.Builder()
    .name("Authentication Type")
    .description("This option is applicable for SqlServer Connection Type alone.")
    .required(true)
    .allowableValues("Windows Authentication", "Server Authentication")
    .defaultValue("Server Authentication")
    .expressionLanguageSupported(false)
    .build();
    
    //User Name
    public static final PropertyDescriptor User_Name = new PropertyDescriptor.Builder()
    .name("User Name")
    .description("User Name")
    .required(true)
    .expressionLanguageSupported(false)
    .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
    .build();
    
    //Password
    public static final PropertyDescriptor Password = new PropertyDescriptor.Builder()
    .name("Password")
    .description("Password is Case-Sensitive")
    .required(true)
    .expressionLanguageSupported(false)
    .sensitive(true)
    .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
    .build();
    
    //Database
    public static final PropertyDescriptor Database_Name = new PropertyDescriptor.Builder()
    .name("Database")
    .description("Database Name")
    .required(true)
    .expressionLanguageSupported(false)
    .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
    .build();
    
    //FilePath
    public static final PropertyDescriptor File_Path = new PropertyDescriptor.Builder()
    .name("File Path")
    .description("Where you want to store your generated .syds file. Need to give along with filepath, filename and extension. e.g. Drive:\\TestFolder\\Test.syds")
    .required(true)
    .expressionLanguageSupported(false)
    .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
    .build();
    
    public static final PropertyDescriptor BATCH_DURATION = new PropertyDescriptor.Builder()
    .name("Batch Duration")
    .description("If the process is expected to be long-running and produce textual output, a batch duration can be specified so "
            + "that the output will be captured for this amount of time and a FlowFile will then be sent out with the results "
            + "and a new FlowFile will be started, rather than waiting for the process to finish before sending out the results")
    .required(false)
    .expressionLanguageSupported(false)
    .addValidator(StandardValidators.TIME_PERIOD_VALIDATOR)
    .build();    
    
    public static final PropertyDescriptor REDIRECT_ERROR_STREAM = new PropertyDescriptor.Builder()
    .name("Redirect Error Stream")
    .description("If true will redirect any error stream output of the process to the output stream. "
            + "This is particularly helpful for processes which write extensively to the error stream or for troubleshooting.")
    .required(false)
    .allowableValues("true", "false")
    .defaultValue("false")
    .expressionLanguageSupported(false)
    .addValidator(StandardValidators.BOOLEAN_VALIDATOR)
    .build();
    
    private static final Validator characterValidator = new StandardValidators.StringLengthValidator(1, 1);

    private volatile ExecutorService executor;
    private Future<?> longRunningProcess;
    private AtomicBoolean failure = new AtomicBoolean(false);
    private volatile ProxyOutputStream proxyOut;

    @Override
    protected List<PropertyDescriptor> getSupportedPropertyDescriptors() {
        final List<PropertyDescriptor> properties = new ArrayList<>();        
        properties.add(Connection_Name);
        properties.add(Connection_Type);
        properties.add(Server_Name);
        properties.add(Authentication_Type);
        properties.add(User_Name);
        properties.add(Password);
        properties.add(Database_Name);
        properties.add(File_Path);
        properties.add(BATCH_DURATION);
        properties.add(REDIRECT_ERROR_STREAM);
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



    @OnScheduled
    public void setupExecutor(final ProcessContext context) {
        executor = Executors.newFixedThreadPool(context.getMaxConcurrentTasks() * 2, new ThreadFactory() {
            private final ThreadFactory defaultFactory = Executors.defaultThreadFactory();

            @Override
            public Thread newThread(final Runnable r) {
                final Thread t = defaultFactory.newThread(r);
                t.setName("ExecuteProcess " + getIdentifier() + " Task");
                return t;
            }
        });
    }

    @OnUnscheduled
    public void shutdownExecutor() {
        executor.shutdown();
    }

    @Override
    public void onTrigger(final ProcessContext context, final ProcessSession session) throws ProcessException {
        if (proxyOut==null) {
            proxyOut = new ProxyOutputStream(getLogger());
        }

        final Long batchNanos = context.getProperty(BATCH_DURATION).asTimePeriod(TimeUnit.NANOSECONDS);

        final List<String> commandStrings = createCommandStrings(context);
        final String commandString = StringUtils.join(commandStrings, " ");

        if (longRunningProcess == null || longRunningProcess.isDone()) {
            try {
                longRunningProcess = launchProcess(context, commandStrings, batchNanos, proxyOut);
            } catch (final IOException ioe) {
                getLogger().error("Failed to create process due to {}", new Object[] { ioe });
                context.yield();
                return;
            }
        } else {
            getLogger().info("Read from long running process");
        }

        if (!isScheduled()) {
            getLogger().info("User stopped processor; will terminate process immediately");
            longRunningProcess.cancel(true);
            return;
        }

        // Create a FlowFile that we can write to and set the OutputStream for the FlowFile
        // as the delegate for the ProxyOuptutStream, then wait until the process finishes
        // or until the specified amount of time
        FlowFile flowFile = session.create();
        flowFile = session.write(flowFile, new OutputStreamCallback() {
            @Override
            public void process(final OutputStream flowFileOut) throws IOException {
                try (final OutputStream out = new BufferedOutputStream(flowFileOut)) {
                    proxyOut.setDelegate(out);

                    if (batchNanos == null) {
                        // we are not creating batches; wait until process terminates.
                        // NB!!! Maybe get(long timeout, TimeUnit unit) should
                        // be used to avoid waiting forever.
                        try {
                            longRunningProcess.get();
                        } catch (final InterruptedException ie) {
                        } catch (final ExecutionException ee) {
                            getLogger().error("Process execution failed due to {}", new Object[] { ee.getCause() });
                        }
                    } else {
                        // wait the allotted amount of time.
                        try {
                            TimeUnit.NANOSECONDS.sleep(batchNanos);
                        } catch (final InterruptedException ie) {
                        }
                    }

                    proxyOut.setDelegate(null); // prevent from writing to this
                    // stream
                }
            }
        });

        if (flowFile.getSize() == 0L) {
            // If no data was written to the file, remove it
            session.remove(flowFile);
        } else if (failure.get()) {
            // If there was a failure processing the output of the Process, remove the FlowFile
            session.remove(flowFile);
            getLogger().error("Failed to read data from Process, so will not generate FlowFile");
        } else {
            // All was good. Generate event and transfer FlowFile.
            session.getProvenanceReporter().create(flowFile, "Created from command: " + commandString);
            getLogger().info("Created {} and routed to success", new Object[] { flowFile });
        }

        // Commit the session so that the FlowFile is transferred to the next processor
        session.commit();
    }
    
    protected List<String> createCommandStrings(final ProcessContext context) {
        final String command = "lib/Syncfusion/DashbaordFileGenerator/DatasourceGeneration.exe";
        final String connectionname = context.getProperty(Connection_Name).getValue();
        final String connectiontype = context.getProperty(Connection_Type).getValue();
        final String servername = context.getProperty(Server_Name).getValue();
        final String authenticationtype = context.getProperty(Authentication_Type).getValue();
        final String username = context.getProperty(User_Name).getValue();
        final String password = context.getProperty(Password).getValue();
        final String databasename = context.getProperty(Database_Name).getValue();
        final String filepath = context.getProperty(File_Path).getValue();
        final List<String> args = new ArrayList<>();
        
        args.add(connectionname);
        if(connectiontype.equals("Oracle") || connectiontype.equals("MySql"))
        {
            args.add("Odbc");
        }
        args.add(connectiontype);
        args.add(servername);
        if(connectiontype.equals("SqlServer"))
        {
            if(authenticationtype.equals("Windows Authentication"))
            {
                args.add("0");
            }
            else
            {
                args.add("1");
            }            
        }
        else
        {
            args.add("1");
        }
        args.add(username);
        args.add(password);
        args.add(databasename);
        args.add(filepath);

        final List<String> commandStrings = new ArrayList<>(args.size() + 1);
        commandStrings.add(command);
        commandStrings.addAll(args);
        return commandStrings;
    }

    protected Future<?> launchProcess(final ProcessContext context, final List<String> commandStrings, final Long batchNanos,
            final ProxyOutputStream proxyOut) throws IOException {

        final Boolean redirectErrorStream = context.getProperty(REDIRECT_ERROR_STREAM).asBoolean();

        final ProcessBuilder builder = new ProcessBuilder(commandStrings);
        
        final Map<String, String> environment = new HashMap<>();
        for (final Map.Entry<PropertyDescriptor, String> entry : context.getProperties().entrySet()) {
            if (entry.getKey().isDynamic()) {
                environment.put(entry.getKey().getName(), entry.getValue());
            }
        }

        if (!environment.isEmpty()) {
            builder.environment().putAll(environment);
        }

        getLogger().info("Start creating new Process > {} ", new Object[] { commandStrings });
        final Process newProcess = builder.redirectErrorStream(redirectErrorStream).start();

        // Submit task to read error stream from process
        if (!redirectErrorStream) {
            executor.submit(new Runnable() {
                @Override
                public void run() {
                    try (final BufferedReader reader = new BufferedReader(new InputStreamReader(newProcess.getErrorStream()))) {
                        while (reader.read() >= 0) {
                        }
                    } catch (final IOException ioe) {
                    }
                }
            });
        }

        // Submit task to read output of Process and write to FlowFile.
        failure = new AtomicBoolean(false);
        final Future<?> future = executor.submit(new Callable<Object>() {
            @Override
            public Object call() throws IOException {
                try {
                    if (batchNanos == null) {
                        // if we aren't batching, just copy the stream from the
                        // process to the flowfile.
                        try (final BufferedInputStream bufferedIn = new BufferedInputStream(newProcess.getInputStream())) {
                            final byte[] buffer = new byte[4096];
                            int len;
                            while ((len = bufferedIn.read(buffer)) > 0) {

                                // NB!!!! Maybe all data should be read from
                                // input stream in case of !isScheduled() to
                                // avoid subprocess deadlock?
                                // (we just don't write data to proxyOut)
                                // Or because we don't use this subprocess
                                // anymore anyway, we don't care?
                                if (!isScheduled()) {
                                    return null;
                                }

                                proxyOut.write(buffer, 0, len);
                            }
                        }
                    } else {
                        // we are batching, which means that the output of the
                        // process is text. It doesn't make sense to grab
                        // arbitrary batches of bytes from some process and send
                        // it along as a piece of data, so we assume that
                        // setting a batch during means text.
                        // Also, we don't want that text to get split up in the
                        // middle of a line, so we use BufferedReader
                        // to read lines of text and write them as lines of text.
                        try (final BufferedReader reader = new BufferedReader(new InputStreamReader(newProcess.getInputStream()))) {
                            String line;

                            while ((line = reader.readLine()) != null) {
                                if (!isScheduled()) {
                                    return null;
                                }

                                proxyOut.write((line + "\n").getBytes(StandardCharsets.UTF_8));
                            }
                        }
                    }
                } catch (final IOException ioe) {
                    failure.set(true);
                    throw ioe;
                } finally {
                    int exitCode;
                    try {
                        exitCode = newProcess.exitValue();
                    } catch (final Exception e) {
                        exitCode = -99999;
                    }
                    getLogger().info("Process finished with exit code {} ", new Object[] { exitCode });
                }

                return null;
            }
        });

        return future;
    }


    /**
     * Output stream that is used to wrap another output stream in a way that the underlying output stream can be swapped out for a different one when needed
     */
    private static class ProxyOutputStream extends OutputStream {

        private final ComponentLog logger;

        private final Lock lock = new ReentrantLock();
        private OutputStream delegate;

        public ProxyOutputStream(final ComponentLog logger) {
            this.logger = logger;
        }

        public void setDelegate(final OutputStream delegate) {
            lock.lock();
            try {
                logger.trace("Switching delegate from {} to {}", new Object[]{this.delegate, delegate});
                this.delegate = delegate;
            } finally {
                lock.unlock();
            }
        }

        private void sleep(final long millis) {
            try {
                Thread.sleep(millis);
            } catch (final InterruptedException ie) {
            }
        }

        @Override
        public void write(final int b) throws IOException {
            lock.lock();
            try {
                while (true) {
                    if (delegate != null) {
                        logger.trace("Writing to {}", new Object[]{delegate});

                        delegate.write(b);
                        return;
                    } else {
                        lock.unlock();
                        sleep(1L);
                        lock.lock();
                    }
                }
            } finally {
                lock.unlock();
            }
        }

        @Override
        public void write(final byte[] b, final int off, final int len) throws IOException {
            lock.lock();
            try {
                while (true) {
                    if (delegate != null) {
                        logger.trace("Writing to {}", new Object[]{delegate});
                        delegate.write(b, off, len);
                        return;
                    } else {
                        lock.unlock();
                        sleep(1L);
                        lock.lock();
                    }
                }
            } finally {
                lock.unlock();
            }
        }

        @Override
        public void write(final byte[] b) throws IOException {
            write(b, 0, b.length);
        }

        @Override
        public void close() throws IOException {
        }

        @Override
        public void flush() throws IOException {
            lock.lock();
            try {
                while (true) {
                    if (delegate != null) {
                        delegate.flush();
                        return;
                    } else {
                        lock.unlock();
                        sleep(1L);
                        lock.lock();
                    }
                }
            } finally {
                lock.unlock();
            }
        }
    }
}
