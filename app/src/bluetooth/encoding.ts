import { fromByteArray, toByteArray } from 'base64-js';
import { TextDecoder, TextEncoder } from 'web-encoding';

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
