FROM alpine:latest

WORKDIR /usr/local/pgbadger

RUN apk --no-cache add coreutils openssl perl make tzdata \
 && wget -qO- `wget -qO- https://api.github.com/repos/dalibo/pgbadger/releases/latest | grep 'tarball' | sed -E 's/^.*: +"([^"]+)".*$/\1/'` \
  | tar xz --strip 1 \
 && perl Makefile.PL \
 && make && make install \
 && echo '0 4 * * * pgbadger -I -p "%m [%p]:[%c]:[%l] h=%h " /var/log/postgresql/postgresql-$(date --date yesterday +"%Y-%m-%d").log -O /var/www/pg_reports/' >> /var/spool/cron/crontabs/root

CMD ["sh", "-c", "ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && crond -l 2 -f"]
