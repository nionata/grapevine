#!/bin/bash

set -e

# Compile the javascript pb files and add them to the react native app
protoc --proto_path=./ --js_out=import_style=commonjs,binary:../app/api *.proto