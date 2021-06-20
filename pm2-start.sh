#!/usr/bin/bash

./node_modules/.bin/cross-env NODE_ENV=production pm2 start process.yml && tail -f /dev/null