#!/usr/local/bash

java -cp ../lkpm/modules/DBUtils/lib/jooq-3.8.4.jar:../lkpm/modules/DBUtils/lib/jooq-meta-3.8.4.jar:../lkpm/modules/DBUtils/lib/jooq-codegen-3.8.4.jar:./postgresql-9.2-1004.jdbc4.jar:. org.jooq.util.GenerationTool /wnprc_compliance.xml
