#!/bin/bash

# Nasty interim workaround for cleaning up core files dropped by '/usr/src/app/node_modules/electron/dist/electron --type=gpu-process'
while true; do rm -f core.*; sleep 60; done &

# Start the service
xvfb-run node app
