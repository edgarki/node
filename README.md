# Dev Challenge

This is an app to store brazilian CPF numbers for a development challenge.

  - URL endpoint in JSON format, i.e. http://localhost:3000/consulta?cpf=12312312312
  - Form browser checking with FREE or BLOCK status return for CPF number
  - Simple /status page with server uptime, number of done queries since last restart and amount of CPF numbers on blacklist
  - Validation mask for check, insert and remove
  - Docker containering compatible (Dockerfile and compose YAML)
  - Redis noSQL database

### Features!

  - Node.JS v10.15.1 with npm modules: 
    - Express 4.16.4
    - Redis 2.8.0
    - node-input-validator 3.1.0
    - body-parser 1.18.3)
  - Docker containering 18.9.2
  - Redis server 10.15.1

> The source code is 'consulta.js' with all methods and launcher for Node. It has
a Dockerfile and package.json to define app container. For a quick setup see and
run using 'docker-compose.yml' version 3 to start app container and redis
container.

All of this project are focused on easy and quick way to create put app online.

### Installation

Auto-install using Docker 2.0.0.3 with compose:

```sh
$ docker-compose up --build
```

If you prefer to run standalone app and database containering, you shoud use
these commands:

```sh
$ docker run -p 3000:3000 -d edgar/node-web-app
$ docker run --name redis-container -d redis
```

Note that database server isn't in the same app container. For both options it will download all dependencies in the first time, create machines automatically and put the service available on localhost on 3000 port. The redis server is on 6379 port.

Now, open your browser on http://localhost:3000 and cheers!




### Todos

 - Write MORE Tests
 - Increase better HTML and styles on interface

License
----

open!


**Free Software, Hell Yeah!**
