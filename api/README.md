# Grapevine API

## Getting Started

The Grapevine API is defined with [Protobuf](https://developers.google.com/protocol-buffers). Download the compiler [here](https://grpc.io/docs/protoc-installation/).

## Usage

### Writing protos

Use the latest `proto3` [syntax](https://developers.google.com/protocol-buffers/docs/proto3).

### Using the generated stubs

[TypeScript stubs](https://github.com/stephenh/ts-proto#overview) are copied to the `app/api` directory. They can be imported with the `@api` alias.

``` typescript
import { Messages, Message } from '@api/message';
```

The imports double as interfaces and factory methods. Full [usage](https://github.com/stephenh/ts-proto#example-types).

``` typescript
// api/message.ts

interface Message {
  content: string
}

const Message = {
  encode(person): Writer { ... }
  decode(reader): Message { ... }
  toJSON(person): unknown { ... }
  fromJSON(data): Message { ... }
}
```



## Compilation

The Protobufs must be recompiled after any changes are made to the `*.proto` files so the consumers have the latest version. 

``` bash
./compile.sh
```