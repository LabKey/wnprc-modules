#!/bin/bash
set -e

host="$1"
shift
cmd="$@"

>&2 echo "Waiting for postgres..."
until psql -h "$host" -U "postgres" -c '\l' &>/dev/null; do
  sleep 1
done

>&2 echo "Starting LabKey (postgres ready)"
exec $cmd
