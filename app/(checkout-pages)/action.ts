'use server'

import { makeInvoice } from "@/utils/invoice";
import { onePayVerifySecureHash } from "@/utils/utilOfOnepay";
import { headers } from "next/headers";

export async function handleMakeInvoice(vpc_OrderInfo: string, vpc_Amount: string, vpc_MerTxnRef: string) {
    const rawIp = (await headers()).get('x-forwarded-for')?.split(',')[0] || 
                 (await headers()).get('x-real-ip') ||
                 (await headers()).get('cf-connecting-ip') ||
                 (await headers()).get('x-client-ip') ||
                 '0.0.0.0'
    const ip = rawIp.includes('::ffff:') ? rawIp.split('::ffff:')[1] : rawIp
    const result = await makeInvoice(vpc_OrderInfo, vpc_Amount, vpc_MerTxnRef, ip)
    return result
}

export async function getOnePayConfig() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/paymentConfig`)
    const dataConfig = await response.json()
    return dataConfig
}

export async function checkOnePayVerifySecureHash(params: Record<string, string>): Promise<boolean> {
    try{
        const dataConfig = await getOnePayConfig()
        const merchantHashCode = dataConfig?.merchantHashCode
        return onePayVerifySecureHash(params, merchantHashCode)
    } catch (error) {
        return false
    }
}



