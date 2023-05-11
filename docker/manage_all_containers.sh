#!/bin/bash
##Regex value to identified all folders that start with dev*
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
    echo -n 'Starting main docker-compose file'
    docker-compose -f docker-compose.yml up -d

    for folder in "${listOfDevFolders[@]}"
    do
      echo -n 'Staring containers in ' $folder
      docker-compose -f $folder/docker-compose.yml up -d
    done
else
  for folder in "${listOfDevFolders[@]}"
  do
    echo 'Stopping containers in ' $folder
    docker-compose -f $folder/docker-compose.yml down
  done

  echo -n 'Stopping main docker-compose file'
  docker-compose -f docker-compose.yml down
fi
