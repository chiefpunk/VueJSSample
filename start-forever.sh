#!/bin/bash

export NODE_ENV=production
if [ -f "env-stg" ]; then
    forever start -a --minUptime 1000 --spinSleepTime 2000 --uid campaign-cm-web-stg server/index.js
else
    forever start -a --minUptime 1000 --spinSleepTime 2000 --uid campaign-cm-web server/index.js
fi
