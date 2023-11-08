#!/bin/bash
args=()
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