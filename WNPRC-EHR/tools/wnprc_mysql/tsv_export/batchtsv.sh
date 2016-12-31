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

#generate tsv files

#PIPELINE_ROOT=/home/kevink/labkey/release10.1/server/customModules/ehr
#STUDY_DIR=${PIPELINE_ROOT}/ehr-6mos

PIPELINE_ROOT=/usr/local/labkey/files/WNPRC/EHR/@files/ehr-studylocal
STUDY_DIR=${PIPELINE_ROOT}

STUDY_LOAD_FILE=${PIPELINE_ROOT}/studyload.txt

. setup.sh

if [ ! -f $STUDY_DIR/datasets/EHRStudy.dataset -o \
    ${DATE_CUTOFF_FILE} -nt ${STUDY_DIR}/datasets/EHRStudy.dataset -o \
    ./scripts/setup/EHRStudy.dataset -nt ${STUDY_DIR}/datasets/EHRStudy.dataset ]
then
    echo "Generating new EHRStudy.dataset file"
    eval "echo \"`cat ./scripts/setup/EHRStudy.dataset`\"" > ${STUDY_DIR}/datasets/EHRStudy.dataset
fi

for script in scripts/dataset/*.sql
do
    fname=${script##*/}
    basename=${fname%%.*}
    echo
    echo "** dataset $basename"
    time ./generatetsv.sh $script ${STUDY_DIR}/datasets/${basename}.tsv
    if [ $? -ne 0 ]; then
        echo "Failed running '$script', exiting early"
        exit 1
    fi
done

for script in scripts/lists/*.sql
do
    fname=${script##*/}
    basename=${fname%%.*}
    echo
    echo "** list $basename"
    time ./generatetsv.sh $script ${STUDY_DIR}/lists/${basename}.tsv
    if [ $? -ne 0 ]; then
        echo "Failed running '$script', exiting early"
        exit 1
    fi
done

touch ${STUDY_LOAD_FILE}
echo "Finished dumping all tsv files."
