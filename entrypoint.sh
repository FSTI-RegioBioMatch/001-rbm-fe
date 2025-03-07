#!/bin/bash -e

if [[ $ENVIRONMENT = "Dev" ]]; then
   cp /usr/share/nginx/html/config/app-config.dev.json /usr/share/nginx/html/app-config.json
fi

if [[ $ENVIRONMENT = "Production" ]]; then
   cp /usr/share/nginx/html/config/app-config.prod.json /usr/share/nginx/html/app-config.json
fi

nginx -g 'daemon off;'
