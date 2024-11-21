# Tracking Microservicees

This express app contains all the APIs of Tracking microservices of an e-comming appliaction.

## Setup/Run App

1. Clone the repo
2. Install NodeJS
3. Create `.env` in the root directory of the project which contains mongoDB username & password required to connect to the DB. (Contents shared seperately)
4. Open terminal, go to the project directory and run below commands
   
```shell
npm i
npm start
```
        

## Build Docker Image & Run

Build the docker images  by running following:

1. Make sure dockerd is up & running
2. Navigate to the home directory say 
```shell
cd <..>/tracking-microservice
```

3. Build docker image
```shell
docker build -t tracking-microservice .
```
4. Run generated image
```shell
docker run -d -p 4002:4002 tracking-microservice
```
