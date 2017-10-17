#!/bin/bash
set -e

host="$1"
shift
cmd="$@"

>&2 echo "Waiting for postgres..."

limit=120
count=0

while [ $count -lt $limit ]; do
  if PGPASSWORD="$PG_PASS" psql -h "$host" -U "$PG_USER" -d "$PG_NAME" -c "\l" &>/dev/null; then
    break;
  fi
  sleep 1
  let count=count+1
done

if [ $count -lt $limit ]; then
  >&2 echo "Starting LabKey (postgres ready)"
else
  >&2 echo "Starting LabKey (postgres still down after $limit attempts, starting anyway)"
fi
exec $cmd
