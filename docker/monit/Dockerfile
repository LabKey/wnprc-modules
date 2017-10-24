FROM alpine:latest

COPY postgres_long_running_query.sh /etc/monit/checks

RUN apk --no-cache add monit bash \
 && mkdir -p /etc/monit/events

CMD ["monit", "-I", "-c", "/etc/monit/monitrc"]