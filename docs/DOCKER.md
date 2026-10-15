1. Image vs container
2. Dockerfile vs Docker image
3. Registry, ports and container
4. Why Docker is used

download docker
https://www.docker.com/products/docker-desktop/

docker --version
docker run hello-world

## (NOTE: angular22-app is docker image name)

## (Run this in the terminal, from the project root)

docker build -t angular22-app .

# (Start container in same path)

docker run -d --name angular22-container -p 8080:80 angular22-app

```
-d — run in the background.
--name angular22-container — name your container.
-p 8080:80 — map your Mac's port 8080 to Nginx port 80.
angular22-app — use the image you just built.
```

## App running now

http://localhost:8080/login

## run to verify

docker ps
docker images
docker logs angular22-container

##

Angular source code

docker build
Creates the image

docker run
Creates and starts the container

Browser → localhost:8080

## for local setup

docker build -f Dockerfile.local -t angular22-local .
docker run --rm -p 4200:4200 angular22-local

## for Prod

docker build -f Dockerfile.prod -t angular22-prod .
docker run -d --name angular22-prod-container -p 8080:80 angular22-prod

Angular-22-machine-coding/
├── Dockerfile.local
├── Dockerfile.prod
├── nginx.conf
├── .dockerignore
├── package.json
└── angular.json

## image tagging 

docker tag angular22-prod mkvmkverma/angular22-app:v1

## Log in to Docker Hub
docker login
docker push mkvmkverma/angular22-app:v1

check 
https://hub.docker.com/repositories/mkvmkverma


remove locale container 
docker rm -f angular22-deployed

pull from docker hub 
docker pull mkvmkverma/angular22-app:v1

run the image 
docker run -d --name angular22-deployed -p 8081:80 mkvmkverma/angular22-app:v1


http://localhost:8081/login


Angular source code
docker build → Image

docker push → Docker Hub

docker pull → docker run → Running app

container, image and image taging ?? docker hub repo

Docker terms — simple meanings

Container
The running instance of your application. Think of it as the application running inside an isolated environment.

Image
The packaged template used to create containers. Your Angular production image contains Nginx and your built Angular files.












Docker Hub repository
An online place to store and share your Docker images.