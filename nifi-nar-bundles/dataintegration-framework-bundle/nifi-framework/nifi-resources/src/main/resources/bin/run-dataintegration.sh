#!/bin/sh
export user=`whoami`
export sdkpath=/home/$user/Syncfusion/DataIntegration
export dipversion=2.5.0.36
export sdkpath=$sdkpath/$dipversion/SDK/NIFI
java -Xms12m -Xmx24m -Dorg.apache.nifi.bootstrap.config.log.dir=$sdkpath/logs -Dorg.apache.nifi.bootstrap.config.pid.dir=$sdkpath/run -Dorg.apache.nifi.bootstrap.config.file=$sdkpath/conf/bootstrap.conf -cp $sdkpath/conf:$sdkpath/lib/bootstrap/* org.apache.nifi.bootstrap.RunNiFi run
