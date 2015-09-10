# walk-to
Convert shapefiles to postgres queries. Try to make some useful inferences about path accesibility.

## Run walk-to with docker:

``` bash
docker build —-tag="iojs-postgis"

docker run -v "$PWD":/usr/src/app -w /usr/src/app -it -p 3000:3000 --rm iojs-postgis npm run-script instart

docker-machine ls
```
