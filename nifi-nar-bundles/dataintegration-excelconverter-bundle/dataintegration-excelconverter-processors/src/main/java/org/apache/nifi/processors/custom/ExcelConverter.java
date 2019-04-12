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
package org.apache.nifi.processors.custom;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
import java.util.regex.Pattern;
import org.apache.commons.lang3.StringUtils;
import org.apache.nifi.annotation.behavior.ReadsAttribute;
import org.apache.nifi.annotation.behavior.ReadsAttributes;
import org.apache.nifi.annotation.behavior.WritesAttribute;
import org.apache.nifi.annotation.behavior.WritesAttributes;
import org.apache.nifi.annotation.documentation.CapabilityDescription;
import org.apache.nifi.annotation.documentation.SeeAlso;
import org.apache.nifi.annotation.documentation.Tags;
import org.apache.nifi.annotation.lifecycle.OnScheduled;
import org.apache.nifi.annotation.lifecycle.OnUnscheduled;
import org.apache.nifi.components.AllowableValue;
import org.apache.nifi.components.PropertyDescriptor;
import org.apache.nifi.components.Validator;
import org.apache.nifi.flowfile.FlowFile;
import org.apache.nifi.logging.ComponentLog;
import org.apache.nifi.processor.AbstractProcessor;
import org.apache.nifi.processor.ProcessContext;
import org.apache.nifi.processor.ProcessSession;

import org.apache.nifi.processor.ProcessorInitializationContext;
import org.apache.nifi.processor.Relationship;
import org.apache.nifi.processor.exception.ProcessException;
import org.apache.nifi.processor.io.OutputStreamCallback;
import org.apache.nifi.processor.util.StandardValidators;

@Tags({"Syncfusion,Excel,Csv,Pdf,Tsv,xls,xlsx"})
@CapabilityDescription("Converts the .xls,.xlsx type file into CSV, PDF, XLS, XLSX, XLTX, XLT, XLA, XLW and TSV file")
@SeeAlso({})
@ReadsAttributes({@ReadsAttribute(attribute="", description="")})
@WritesAttributes({@WritesAttribute(attribute="", description="")})
public class ExcelConverter extends AbstractProcessor {

    private static final String csv = "Csv";
    private static final String pdf = "Pdf";
    private static final String tsv = "Tsv";
    private static final String xls = "Xls";
    private static final String xlsx = "Xlsx";
    private static final String xltx = "Xltx";
    private static final String xlt = "Xlt";
    private static final String xla = "Xla";
    private static final String xlw = "Xlw";
    public static final AllowableValue CSV = new AllowableValue( csv,"Convert to CSV",
            "Converts the .xls,.xlsx type file to CSV file");
    public static final AllowableValue PDF = new AllowableValue( pdf,"Convert to PDF",
            "Converts the .xls,.xlsx type file to PDF file");
    public static final AllowableValue TSV = new AllowableValue( tsv,"Convert to TSV",
            "Converts the .xls,.xlsx type file to TSV file");
    public static final AllowableValue XLS = new AllowableValue( xls,"Convert to XLS",
            "Converts the .xls,.xlsx type file to XLS file");
    public static final AllowableValue XLSX = new AllowableValue( xlsx,"Convert to XLSX",
            "Converts the .xls,.xlsx type file to XLSX file");
    public static final AllowableValue XLTX = new AllowableValue( xltx,"Convert to XLTX",
            "Converts the .xls,.xlsx type file to XLTX file");
    public static final AllowableValue XLT = new AllowableValue( xlt,"Convert to XLT",
            "Converts the .xls,.xlsx type file to XLT file");
    public static final AllowableValue XLA = new AllowableValue( xla,"Convert to XLA",
            "Converts the .xls,.xlsx type file to XLA file");
    public static final AllowableValue XLW = new AllowableValue( xlw,"Convert to XLW",
            "Converts the .xls,.xlsx type file to XLW file");
     
     public static final PropertyDescriptor DIRECTORY = new PropertyDescriptor.Builder()
            .name("Input File Location")
            .description("The input file should be in .xls or .xlsx extension")
            .required(true)
            .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
            .expressionLanguageSupported(true)
            .build();
    
      public static final PropertyDescriptor CONVERT_TYPE = new PropertyDescriptor.Builder()
            .name("Convert Type")
            .description("Converts the given file into required format")
            .required(true)
            .allowableValues(CSV, PDF, TSV, XLS, XLSX, XLTX, XLT, XLA, XLW)
            .defaultValue(CSV.getValue())
            .addValidator(StandardValidators.REGULAR_EXPRESSION_VALIDATOR)
            .build();
         
     public static final PropertyDescriptor Output_Path = new PropertyDescriptor.Builder()
             .name("OutPut Directory")
             .description("Directory to which file should be written")
             .required(true)
             .expressionLanguageSupported(true)
             .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
             .build();

    public static final PropertyDescriptor WORKING_DIR = new PropertyDescriptor.Builder()
            .name("Working Directory")
            .description("The directory to use as the current working directory when executing the command")
            .expressionLanguageSupported(false)
            .addValidator(StandardValidators.createDirectoryExistsValidator(false, true))
            .required(false)
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
    
    public static final Relationship REL_SUCCESS = new Relationship.Builder()
            .name("success")
            .description("All created FlowFiles are routed to this relationship")
            .build();

    private volatile Process externalProcess;

    private volatile ExecutorService executor;
    private Future<?> longRunningProcess;
    private AtomicBoolean failure = new AtomicBoolean(false);
    private volatile ProxyOutputStream proxyOut;

    @Override
    public Set<Relationship> getRelationships() {
        return Collections.singleton(REL_SUCCESS);
    }

    @Override
    protected List<PropertyDescriptor> getSupportedPropertyDescriptors() {
        final List<PropertyDescriptor> properties = new ArrayList<>();
        properties.add(DIRECTORY);
        properties.add(CONVERT_TYPE);
        properties.add(Output_Path);
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
        try {
            executor.shutdown();
        } finally {
            if (this.externalProcess.isAlive()) {
                this.getLogger().info("Process hasn't terminated, forcing the interrupt");
                this.externalProcess.destroyForcibly();
            }
        }
    }

    @Override
    public void onTrigger(final ProcessContext context, final ProcessSession session) throws ProcessException {
        FlowFile flowFile = session.get();
        
        final List<String> commandStrings = createCommandStrings(context, flowFile);
        final String commandString = StringUtils.join(commandStrings, " ");
        
        if(flowFile==null)
        {
            flowFile = session.create();
        }
        
        if (proxyOut==null) {
            proxyOut = new ProxyOutputStream(getLogger());
        }

        final Long batchNanos = context.getProperty(BATCH_DURATION).asTimePeriod(TimeUnit.NANOSECONDS);

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
            session.transfer(flowFile, REL_SUCCESS);
        }

        // Commit the session so that the FlowFile is transferred to the next processor
        session.commit();
    }

    protected List<String> createCommandStrings(final ProcessContext context, final FlowFile flowFile) {
        final String command = "lib\\Syncfusion\\ExcelConverter\\ExcelConverter.exe";
        final String indir = context.getProperty(DIRECTORY).evaluateAttributeExpressions(flowFile).getValue();
        final String converttype = context.getProperty(CONVERT_TYPE).getValue();
        final String outputpath = context.getProperty(Output_Path).evaluateAttributeExpressions(flowFile).getValue();
        final List<String> args = new ArrayList<>();
        args.add(indir);
        args.add(converttype);
        args.add(outputpath);
        final List<String> commandStrings = new ArrayList<>(args.size() + 1);
        commandStrings.add(command);
        commandStrings.addAll(args);
        return commandStrings;
    }

    protected Future<?> launchProcess(final ProcessContext context, final List<String> commandStrings, final Long batchNanos,
            final ProxyOutputStream proxyOut) throws IOException {

        final Boolean redirectErrorStream = context.getProperty(REDIRECT_ERROR_STREAM).asBoolean();

        final ProcessBuilder builder = new ProcessBuilder(commandStrings);
        final String workingDirName = context.getProperty(WORKING_DIR).getValue();
        if (workingDirName != null) {
            builder.directory(new File(workingDirName));
        }

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
        this.externalProcess = builder.redirectErrorStream(redirectErrorStream).start();

        // Submit task to read error stream from process
        if (!redirectErrorStream) {
            executor.submit(new Runnable() {
                @Override
                public void run() {
                    try (final BufferedReader reader = new BufferedReader(new InputStreamReader(externalProcess.getErrorStream()))) {
                        reader.lines().filter(line -> line != null && line.length() > 0).forEach(getLogger()::warn);
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
                        try (final BufferedInputStream bufferedIn = new BufferedInputStream(externalProcess.getInputStream())) {
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
                        try (final BufferedReader reader = new BufferedReader(new InputStreamReader(externalProcess.getInputStream()))) {
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
                    try {
                        // Since we are going to exit anyway, one sec gives it an extra chance to exit gracefully.
                        // In the future consider exposing it via configuration.
                        boolean terminated = externalProcess.waitFor(1000, TimeUnit.MILLISECONDS);
                        int exitCode = terminated ? externalProcess.exitValue() : -9999;
                        getLogger().info("Process finished with exit code {} ", new Object[] { exitCode });
                    } catch (InterruptedException e1) {
                        Thread.currentThread().interrupt();
                    }
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
                Thread.currentThread().interrupt();
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
