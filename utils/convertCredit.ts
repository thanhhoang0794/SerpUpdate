import { fromCreditToUsd } from './constant'
export function convertValue(val: number) {
    return val * fromCreditToUsd
}