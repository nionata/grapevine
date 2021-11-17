#!/bin/bash

set -e

# Compile the javascript pb files and add them to the react native app
protoc --proto_path=./ --plugin=../app/node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=../app/api *.proto

# Bable throws errors when trying to resolve the generated .ts files so we must change the extension
for f in ../app/api/*.ts; do mv -- "$f" "${f%.ts}.tsx"; done