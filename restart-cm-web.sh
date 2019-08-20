#!/bin/bash

if [ -f "env-stg" ]; then
    forever restart campaign-cm-web-stg
else
    forever restart campaign-cm-web
fi
