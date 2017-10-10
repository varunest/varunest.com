#!/bin/sh
npm install --production
npm prune --production
gulp
pm2 delete varunest
pm2 start index.js --name varunest
