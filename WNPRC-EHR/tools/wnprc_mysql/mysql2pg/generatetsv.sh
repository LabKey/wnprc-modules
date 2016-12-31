#!/bin/bash
#
# Copyright (c) 2009-2012 LabKey Corporation
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

# Generate a valid tsv file from one of the queries in this directory
# ./generatetsv.sh scripts/datasets/arrival.sql ../ehr-study/datasets/arrival.tsv
#
MYSQLPWD=password
MYSQLDB=colony
MYSQLUSER=root
MYSQLHOST=saimiri.primate.wisc.edu
#MYSQLHOST=localhost

SCRIPT=$1
OUTFILE=$2
#ROWCOUNT=${3:-10}
#ROWCOUNT=10
FILENAME=${SCRIPT##*/}
BASENAME=${FILENAME%%.*}

if [ -z "${SCRIPT}" ]; then
    echo "Missing script argument"
    echo "Usage: $0 script.sql out-file.tsv [row-count]"
    exit 1
fi

if [ -z "${OUTFILE}" ]; then
    echo "Missing output file argument"
    echo "Usage: $0 script.sql out-file.tsv [row-count]"
    exit 1
fi

. setup.sh

echo "USE ${MYSQLDB};" > tempscript
echo "SELECT * FROM (" >> tempscript
cat $1 >> tempscript
echo ") X" >> tempscript

case $1 in

    scripts/dataset/demographics.sql )
        #replace all of demographics
        ;;

    scripts/dataset/*.sql )
        #echo " WHERE date > '${DATE_CUTOFF}'" >> tempscript
        #echo " WHERE ts > '${DATE_CUTOFF}'" >> tempscript
        #echo " ORDER BY DATE DESC" >> tempscript
        ;;

    scripts/lists/*.sql )
        #continue to update all lists
        #echo " WHERE ts > '${DATE_CUTOFF}'" >> tempscript
        ;;

esac

if [ ! -z "$ROWCOUNT" ]; then
    echo " LIMIT $ROWCOUNT" >> tempscript
fi

echo " ;" >> tempscript

# sed script truncates nulls and backslash-escapes the double-quote character
mysql -u${MYSQLUSER} -p${MYSQLPWD} -D ${MYSQLDB} -B -h $MYSQLHOST < tempscript | sed -e 's/NULL//g;s@"@\\"@g' > $OUTFILE
if [ $PIPESTATUS -ne 0 ]; then
    echo "ERROR trying to dump table using script $1"
    exit 1
fi
echo "=> ${OUTFILE}"
