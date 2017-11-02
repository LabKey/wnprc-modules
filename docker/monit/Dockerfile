FROM alpine:latest

COPY postgres_long_running_query.sh /etc/monit/checks/postgres_long_running_query.sh

RUN apk --no-cache add monit bash tzdata \
 && mkdir -p /etc/monit/events

CMD ["sh", "-c", "ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && monit -I -v -c /etc/monit/monitrc"]