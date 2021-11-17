# Grapevine API

## Getting Started

The Grapevine API is defined with [Protobuf](https://developers.google.com/protocol-buffers). Download the compiler [here](https://grpc.io/docs/protoc-installation/).

## Compilation

The Protobufs must be recompiled after any changes are made to the `*.proto` files so the consumers have the latest version. 

``` bash
./compile.sh
```