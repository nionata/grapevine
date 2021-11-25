import { fromByteArray, toByteArray } from 'base64-js';
import { TextDecoder, TextEncoder } from 'web-encoding';
import { AD_LOCAL_NAME_PREFIX } from './const';

export const decodeUserId = (value: string): string => {
  return decode(value).substring(AD_LOCAL_NAME_PREFIX.length);
};

export const decode = (encodedValue: string): string => {
  try {
    const textDecoder = new TextDecoder('utf-8');
    const decodedValue = textDecoder.decode(toByteArray(encodedValue));
    return decodedValue;
  } catch (err) {
    console.error(`Failed to decode value ${encodedValue}`, err);
  }
  return '';
};

export const encodeUserId = (value: string): string => {
  return encode(`${AD_LOCAL_NAME_PREFIX}${value}`);
};

export const encode = (value: string): string => {
  try {
    const encoder = new TextEncoder();
    const encodedValue = fromByteArray(encoder.encode(value));
    return encodedValue;
  } catch (err) {
    console.error(`Failed to encode value ${value}`, err);
  }
  return '';
};
