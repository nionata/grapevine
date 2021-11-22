/* eslint-disable */
import { util, configure, Writer, Reader } from "protobufjs/minimal";
import * as Long from "long";

export const protobufPackage = "";

/** A grapevine message received from a peripheral. */
export interface Message {
  /** Plain text content. */
  content: string;
  /** UUID of the user that authored the message. */
  userId: string;
  /** Timestamp of when the message was created. */
  createdAt: number;
}

/** A wrapper of grapevine messages */
export interface MessagesWrapper {
  /** Key value pair of messages */
  content: { [key: string]: Message };
}

export interface MessagesWrapper_ContentEntry {
  key: string;
  value: Message | undefined;
}

const baseMessage: object = { content: "", userId: "", createdAt: 0 };

export const Message = {
  encode(message: Message, writer: Writer = Writer.create()): Writer {
    if (message.content !== "") {
      writer.uint32(10).string(message.content);
    }
    if (message.userId !== "") {
      writer.uint32(18).string(message.userId);
    }
    if (message.createdAt !== 0) {
      writer.uint32(24).uint32(message.createdAt);
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
        case 2:
          message.userId = reader.string();
          break;
        case 3:
          message.createdAt = reader.uint32();
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
    message.userId =
      object.userId !== undefined && object.userId !== null
        ? String(object.userId)
        : "";
    message.createdAt =
      object.createdAt !== undefined && object.createdAt !== null
        ? Number(object.createdAt)
        : 0;
    return message;
  },

  toJSON(message: Message): unknown {
    const obj: any = {};
    message.content !== undefined && (obj.content = message.content);
    message.userId !== undefined && (obj.userId = message.userId);
    message.createdAt !== undefined && (obj.createdAt = message.createdAt);
    return obj;
  },

  fromPartial(object: DeepPartial<Message>): Message {
    const message = { ...baseMessage } as Message;
    message.content = object.content ?? "";
    message.userId = object.userId ?? "";
    message.createdAt = object.createdAt ?? 0;
    return message;
  },
};

const baseMessagesWrapper: object = {};

export const MessagesWrapper = {
  encode(message: MessagesWrapper, writer: Writer = Writer.create()): Writer {
    Object.entries(message.content).forEach(([key, value]) => {
      MessagesWrapper_ContentEntry.encode(
        { key: key as any, value },
        writer.uint32(10).fork()
      ).ldelim();
    });
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MessagesWrapper {
    const reader = input instanceof Reader ? input : new Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMessagesWrapper } as MessagesWrapper;
    message.content = {};
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          const entry1 = MessagesWrapper_ContentEntry.decode(
            reader,
            reader.uint32()
          );
          if (entry1.value !== undefined) {
            message.content[entry1.key] = entry1.value;
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MessagesWrapper {
    const message = { ...baseMessagesWrapper } as MessagesWrapper;
    message.content = {};
    if (object.content !== undefined && object.content !== null) {
      Object.entries(object.content).forEach(([key, value]) => {
        message.content[key] = Message.fromJSON(value);
      });
    }
    return message;
  },

  toJSON(message: MessagesWrapper): unknown {
    const obj: any = {};
    obj.content = {};
    if (message.content) {
      Object.entries(message.content).forEach(([k, v]) => {
        obj.content[k] = Message.toJSON(v);
      });
    }
    return obj;
  },

  fromPartial(object: DeepPartial<MessagesWrapper>): MessagesWrapper {
    const message = { ...baseMessagesWrapper } as MessagesWrapper;
    message.content = {};
    if (object.content !== undefined && object.content !== null) {
      Object.entries(object.content).forEach(([key, value]) => {
        if (value !== undefined) {
          message.content[key] = Message.fromPartial(value);
        }
      });
    }
    return message;
  },
};

const baseMessagesWrapper_ContentEntry: object = { key: "" };

export const MessagesWrapper_ContentEntry = {
  encode(
    message: MessagesWrapper_ContentEntry,
    writer: Writer = Writer.create()
  ): Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      Message.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: Reader | Uint8Array,
    length?: number
  ): MessagesWrapper_ContentEntry {
    const reader = input instanceof Reader ? input : new Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseMessagesWrapper_ContentEntry,
    } as MessagesWrapper_ContentEntry;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = Message.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MessagesWrapper_ContentEntry {
    const message = {
      ...baseMessagesWrapper_ContentEntry,
    } as MessagesWrapper_ContentEntry;
    message.key =
      object.key !== undefined && object.key !== null ? String(object.key) : "";
    message.value =
      object.value !== undefined && object.value !== null
        ? Message.fromJSON(object.value)
        : undefined;
    return message;
  },

  toJSON(message: MessagesWrapper_ContentEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined &&
      (obj.value = message.value ? Message.toJSON(message.value) : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<MessagesWrapper_ContentEntry>
  ): MessagesWrapper_ContentEntry {
    const message = {
      ...baseMessagesWrapper_ContentEntry,
    } as MessagesWrapper_ContentEntry;
    message.key = object.key ?? "";
    message.value =
      object.value !== undefined && object.value !== null
        ? Message.fromPartial(object.value)
        : undefined;
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
