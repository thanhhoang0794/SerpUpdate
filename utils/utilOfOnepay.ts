import CryptoJS from 'crypto-js';
import https from 'https';
import { IncomingMessage } from 'http';
import axios from 'axios';

export function sortObject<T extends Record<string, any>>(obj: T): T {
    return Object.keys(obj)
      .sort()
      .reduce((result: Partial<T>, key: keyof T) => {
        result[key] = obj[key];
        return result;
      }, {}) as T;
}

export function generateStringToHash(paramSorted: Record<string, string>): string {
  let stringToHash: string = "";
  for (const key in paramSorted) {
    const value: string = paramSorted[key];
    const pref4: string = key.substring(0, 4);
    const pref5: string = key.substring(0, 5);
    if (pref4 === "vpc_" || pref5 === "user_") {
      if (key !== "vpc_SecureHash" && key !== "vpc_SecureHashType") {
        if (value.length > 0) {
          if (stringToHash.length > 0) {
            stringToHash = stringToHash + "&";
          }
          stringToHash = stringToHash + key + "=" + value;
        }
      }
    }
  }
  return stringToHash;
}

export function genSecureHash(stringToHash: string, merHashCode: string): string {
  const merHashHex: CryptoJS.lib.WordArray = CryptoJS.enc.Hex.parse(merHashCode);
  const keyHash: CryptoJS.lib.WordArray = CryptoJS.HmacSHA256(stringToHash, merHashHex);
  const keyHashHex: string = CryptoJS.enc.Hex.stringify(keyHash).toUpperCase();
  return keyHashHex;
}

function extractValueByKey(key: string, array: string[]): string | null {
  for (let i = 0; i < array.length; i += 2) {
    if (array[i] === key) {
      return array[i + 1];
    }
  }
  return null;
}

export function onePayVerifySecureHash(params: Record<string, string>, merchantHashCode: string): boolean {
  let hashFromMerchant = params.vpc_SecureHash;
  let paramObject = Object.fromEntries(Object.entries(params));
  let paramsSorted = sortObject(paramObject);
  let stringToHash = generateStringToHash(paramsSorted);
  let OnePaySign = genSecureHash(stringToHash, merchantHashCode);
  if (OnePaySign == hashFromMerchant) {
    return true;
  } else {
    return false;
  }
}

export async function sendHttpsGet(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
}