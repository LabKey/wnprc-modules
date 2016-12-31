#!/bin/bash

#
# Copyright (c) 2010-2012 LabKey Corporation
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

if [ -z "$LABKEY_ROOT" ]; then
    echo "Set LABKEY_ROOT environment variable"
    exit 1
fi

XBEAN_JAR=$LABKEY_ROOT/external/lib/server/xbean.jar
if [ ! -f "$XBEAN_JAR" ]; then
    echo "XMLBeans not found: $XBEAN_JAR"
    exit 1
fi

RHINO_JAR=$LABKEY_ROOT/tools/jsdoc-toolkit/java/classes/js.jar
if [ ! -f "$RHINO_JAR" ]; then
    echo "Rhino not found: $RHINO_JAR"
    exit 1
fi

cygwin=false;
darwin=false;
case "`uname`" in
    CYGWIN*) cygwin=true ;;
    Darwin*) darwin=true
        if [ -z "$JAVA_HOME" ]; then
            JAVA_HOME=/System/Library/Frameworks/JavaVM.framework/Home
        fi
        ;;
esac

if $cygwin ; then
    CP=$(cygpath -w -p $RHINO_JAR:$XBEAN_JAR:lib/*:src:.)
else
    CP=$RHINO_JAR:$XBEAN_JAR:lib/*:src:.
fi

EHR_ROOT=$LABKEY_ROOT/server/customModules/ehr

java -cp $CP org.mozilla.javascript.tools.shell.Main $EHR_ROOT/tools/fixmeta.js $EHR_ROOT
