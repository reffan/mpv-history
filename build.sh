#!/bin/bash
clear

printf "Creating /dist/ for Github repo!\n\n"

printf "1. Removing old output.\n"
rm -rf ./dist

printf "2. Generating new output.\n"
npx tsc

printf "3. Copying /web/ folder.\n"
cp -r ./src/mpv-history/web ./dist/mpv-history/web

printf "4. Copying config template.\n\n"
cp -r ./src/mpv-history/config.template.json ./dist/mpv-history/config.template.json

printf "All done!\n"

exit 0