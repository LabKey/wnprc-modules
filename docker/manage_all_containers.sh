#!/bin/bash
##Regex value to identified all folders that start with dev*
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

dev_regex="^dev(.*)"

args=()
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    -s|--start)
      start=true
      shift
      ;;
    -d|--down)
     start=false
     shift
     ;;
   *) ## positional arguments
       args+=("$1")
       shift
         ;;
   esac
 done
 set -- "${args[@]}"

##Getting list of folders with dev in front
listOfDevFolders=()
shopt -s nullglob
for f in *; do
  if [[ $f =~ $dev_regex ]]; then
    echo $f
    listOfDevFolders+=("$f")
  fi
done

if $start; then
    echo -n 'Starting main docker compose file'
    docker compose -f compose.yaml up -d

    for folder in "${listOfDevFolders[@]}"
    do
      echo -n 'Staring containers in ' $folder
      docker compose -f $folder/compose.yaml up -d
    done
else
  for folder in "${listOfDevFolders[@]}"
  do
    echo 'Stopping containers in ' $folder
    docker compose -f $folder/compose.yaml down
  done

  echo -n 'Stopping main docker compose file'
  docker compose -f compose.yaml down
fi
