#!/bin/bash

filename=/tmp/postgres_long_running.csv
threshold=120000
timeformat=0000000000D999

# executes a query to determine if there have been any long-running queries
psql -h postgres -U postgres -d labkey <<EOF >/dev/null && [ ! -s "$filename" ]
  \copy (select replace(query, chr(10), ' ') query, calls, to_char(total_time, '$timeformat') total_time, to_char(total_time/calls, '$timeformat') mean_time from pg_stat_statements where total_time/calls > $threshold order by mean_time desc) to '$filename' (format csv, delimiter ';', force_quote *);
  select pg_stat_statements_reset();
EOF
