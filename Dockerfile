# Pull base image.
FROM node:6.10.2-slim

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Bundle app source
COPY . /app

RUN apt-get update && \
    apt-get -f install -y --no-install-recommends apt-utils bzip2 git fontconfig libfontconfig1 libfreetype6 libpng12-0 libjpeg62-turbo libx11-6 libxext6 libxrender1 xfonts-base xfonts-75dpi libxcb1 libexpat1 fontconfig-config libx11-data xfonts-utils ucf fonts-dejavu-core ttf-bitstream-vera fonts-liberation libxau6 libxdmcp6 libfontenc1 libxfont1 x11-common xfonts-encodings wget && \
    wget -q  http://download.gna.org/wkhtmltopdf/0.12/0.12.2.1/wkhtmltox-0.12.2.1_linux-jessie-amd64.deb -O /tmp/wkhtmltox-0.12.2.1_linux-jessie-amd64.deb && \ 
    dpkg -i /tmp/wkhtmltox-0.12.2.1_linux-jessie-amd64.deb && \
    rm /tmp/wkhtmltox-0.12.2.1_linux-jessie-amd64.deb && \
    apt-get purge -y --auto-remove wget && \
    apt-get clean


# Install app dependencies
RUN yarn global add bower gulp && \
    yarn

# Bundle Build
RUN yarn run build && \
    yarn install --production && \
    yarn cache clean


ENV PORT 9000

# Expose ports.
EXPOSE 9000

# Set the default command to run when a container starts
CMD ["yarn", "start"]