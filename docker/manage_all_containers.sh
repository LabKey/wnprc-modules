#!/bin/bash
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

function isTrue() {
   if [[ "${@^^}" =~ ^(TRUE|OUI|Y|O$|ON$|[1-9]) ]]; then return 0;fi
   return 1
}

listOfDevFolders=()
shopt -s nullglob
for f in *; do
  ##echo -n 'list of folders '
  #echo "${#listOfDevFolders[@]}"
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
    echo 'Stoping containers in ' $folder
    docker-compose -f $folder/docker-compose.yml down
  done

  echo -n 'Stoping main docker-compose file'
  docker-compose -f docker-compose.yml down
fi
