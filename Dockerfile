FROM iojs

RUN apt-get update
RUN apt-get install -y postgis

EXPOSE 3000
