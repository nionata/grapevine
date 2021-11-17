#!/bin/bash

set -e

# Compile the javascript pb files and add them to the react native app
protoc --proto_path=./ --plugin=../app/node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=../app/api *.proto