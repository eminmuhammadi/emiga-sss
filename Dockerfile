FROM node:slim

# Creating a directory inside the base image and defining as the base directory
WORKDIR /app

# Copying the files of the root directory into the base directory
ADD . /app

# Installing the project dependencies
RUN npm install
RUN npm install pm2 -g
RUN npm audit fix

# Envrionment variables
ENV NODE_ENV production

# Starting the pm2 process and keeping the docker container alive
CMD NODE_ENV=production pm2 start process.yml -i max && tail -f /dev/null

# Exposing the RestAPI port
EXPOSE 3000