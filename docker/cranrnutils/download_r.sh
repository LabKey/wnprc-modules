#!/bin/bash
args=()
while [[ $# -gt 0 ]]; do
    key="$1"

    case $key in 
        --buildarch)
            arch="$2"
            shift
            shift
            ;;
        *)
        args+=("$1")
        shift
        ;;
    esac
done
set -- "${args[@]}"

if [[ "$arch" == "arm64" ]]; then
    curl -Ls https://github.com/r-lib/rig/releases/download/latest/rig-linux-arm64-latest.tar.gz | tar xz -C /usr/local
else
    curl -Ls https://github.com/r-lib/rig/releases/download/latest/rig-linux-latest.tar.gz | tar xz -C /usr/local
fi