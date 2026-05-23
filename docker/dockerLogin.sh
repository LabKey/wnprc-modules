#!/bin/bash
args=()
#
# Copyright (c) 2023-2026 Board of Regents of the University of Wisconsin System
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

while [[ $# -gt 0 ]]; do
    key="$1"

    case $key in
        --username)
            username="$2"
            shift
            shift
            ;;
        --tokenPath)
            path="$2"
            shift
            shift
            ;;
        *) ## positional arguments
        args+=("$1")
        shift
        ;;
    esac
done
set -- "${args[@]}"

if [[ $path ]]; then
    cat $path.dockertoken.txt | docker login --username $username --password-stdin
else
    echo -n 'Must provide path to token file and username for DockerHub'
fi