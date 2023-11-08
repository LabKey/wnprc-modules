#!/bin/bash
JAVA_OPTS="$JAVA_OPTS -Xms${LK_MS_VALUE} -Xmx${LK_MX_VALUE} -XX:-HeapDumpOnOutOfMemoryError"