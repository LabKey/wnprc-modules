FROM alpine:latest

COPY postgres_long_running_query.sh /etc/monit/checks

RUN apk --no-cache add monit bash tzdata \
 && mkdir -p /etc/monit/events

CMD ["sh", "-c", "ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && monit -I -c /etc/monit/monitrc"]