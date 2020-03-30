FROM node:13-alpine

#Set working directory to source code root
WORKDIR /usr/src/app
RUN chown node:node /usr/src/app
USER node

#Install dependencies
COPY package.json .
COPY yarn.lock .
RUN yarn

#Copy source code
COPY . .

#Build application
RUN yarn run build

#Expose ports
EXPOSE 8000
EXPOSE 8080

#Run npm 
CMD [ "npm", "run", "start" ]
