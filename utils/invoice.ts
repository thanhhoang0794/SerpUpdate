import { sortObject, generateStringToHash, genSecureHash, sendHttpsGet } from "./utilOfOnepay";

type MerchantParam = Record<string, string> & {
    vpc_Version: string;
    vpc_Currency: string;
    vpc_Command: string;
    vpc_AccessCode: string;
    vpc_Merchant: string;
    vpc_Locale: string;
    vpc_ReturnURL: string;
    vpc_MerchTxnRef: string;
    vpc_OrderInfo: string;
    vpc_Amount: string;
    vpc_TicketNo: string;
    AgainLink: string;
    Title: string;
    vpc_Customer_Phone: string;
    vpc_Customer_Email: string;
    vpc_Customer_Id: string;
    vpc_SecureHash?: string;
};
export async function makeInvoice(vpc_OrderInfo: string, vpc_Amount: string, vpc_MerTxnRef: string, userIp: string): Promise<string> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/paymentConfig`)
    const data = await response.json()
    const merchantAccessCode = data?.merchantAccessCode;
    const merchantHashCode = data?.merchantHashCode;
    const merchantId = data?.merchantId;
    if (!merchantId || !merchantAccessCode || !merchantHashCode) {
        throw new Error('Missing required environment variables');
    }

    return createInvoice(merchantId, merchantAccessCode, merchantHashCode, vpc_OrderInfo, vpc_Amount, vpc_MerTxnRef, userIp);
}

async function createInvoice(
    merchantId: string,
    merchantAccessCode: string,
    merchantHashCode: string,
    vpc_OrderInfo: string,
    vpc_Amount: string,
    vpc_MerTxnRef: string,
    userIp: string
): Promise<string> {
    const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL;

    const merchantParam: MerchantParam = {
        vpc_Version: "2",
        vpc_Currency: "VND",
        vpc_Command: "pay",
        vpc_AccessCode: merchantAccessCode,
        vpc_Merchant: merchantId,
        vpc_Locale: "vn",
        vpc_ReturnURL: `${NEXT_PUBLIC_APP_URL}/api/checkPayment`,
        vpc_MerchTxnRef: vpc_MerTxnRef,
        vpc_OrderInfo: vpc_OrderInfo,
        vpc_Amount: vpc_Amount,
        vpc_TicketNo: userIp,
        AgainLink: "https://mtf.onepay.vn/client/qt/",
        Title: "Serp Update",
        vpc_Customer_Phone: "84898616934",
        vpc_Customer_Email: "test@onepay.vn",
        vpc_Customer_Id: "test",
    };

    const sortedParam = sortObject(merchantParam);
    const stringToHash = generateStringToHash(sortedParam);
    const secureHash = genSecureHash(stringToHash, merchantHashCode);
    merchantParam.vpc_SecureHash = secureHash;
    const baseUrl = process.env.NEXT_PUBLIC_ONEPAY_BASE_URL;
    const urlPrefix = process.env.NEXT_PUBLIC_ONEPAY_URL_PREFIX;
    if (!baseUrl || !urlPrefix) {
        throw new Error('Missing BASE_URL or URL_PREFIX environment variables');
    }
    const urlRequest = `${baseUrl}${urlPrefix}${new URLSearchParams(merchantParam)}`;
    return urlRequest;
}