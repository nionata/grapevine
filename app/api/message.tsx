/* eslint-disable */
import { util, configure, Writer, Reader } from "protobufjs/minimal";
import * as Long from "long";

export const protobufPackage = "";

/** A grapevine message received from a peripheral */
export interface Message {
  /** Plain text content */
  content: string;
}

/** A list of grapevine messages */
export interface Messages {
  messages: Message[];
}

const baseMessage: object = { content: "" };

export const Message = {
  encode(message: Message, writer: Writer = Writer.create()): Writer {
    if (message.content !== "") {
      writer.uint32(10).string(message.content);
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): Message {
    const reader = input instanceof Reader ? input : new Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMessage } as Message;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.content = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Message {
    const message = { ...baseMessage } as Message;
    message.content =
      object.content !== undefined && object.content !== null
        ? String(object.content)
        : "";
    return message;
  },

  toJSON(message: Message): unknown {
    const obj: any = {};
    message.content !== undefined && (obj.content = message.content);
    return obj;
  },

  fromPartial(object: DeepPartial<Message>): Message {
    const message = { ...baseMessage } as Message;
    message.content = object.content ?? "";
    return message;
  },
};

const baseMessages: object = {};

export const Messages = {
  encode(message: Messages, writer: Writer = Writer.create()): Writer {
    for (const v of message.messages) {
      Message.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): Messages {
    const reader = input instanceof Reader ? input : new Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMessages } as Messages;
    message.messages = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.messages.push(Message.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Messages {
    const message = { ...baseMessages } as Messages;
    message.messages = (object.messages ?? []).map((e: any) =>
      Message.fromJSON(e)
    );
    return message;
  },

  toJSON(message: Messages): unknown {
    const obj: any = {};
    if (message.messages) {
      obj.messages = message.messages.map((e) =>
        e ? Message.toJSON(e) : undefined
      );
    } else {
      obj.messages = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<Messages>): Messages {
    const message = { ...baseMessages } as Messages;
    message.messages = (object.messages ?? []).map((e) =>
      Message.fromPartial(e)
    );
    return message;
  },
};

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

// If you get a compile-error about 'Constructor<Long> and ... have no overlap',
// add '--ts_proto_opt=esModuleInterop=true' as a flag when calling 'protoc'.
if (util.Long !== Long) {
  util.Long = Long as any;
  configure();
}
