export async function fetchCreateTransaction(amount: string, vpc_MerTxnRef: string, credit_amount: number): Promise<any> {
    const origin = window?.location?.origin;
    try {
        return await fetch(`${origin}/api/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount,
                onepay_transaction_id: vpc_MerTxnRef,
                credit_amount,
            }),
        });
    } catch (error) {
        throw error;
    }
}

export async function handlePayment(url: string) {
    try {
        const encodedUrl = encodeURIComponent(url);
        const response = await fetch(`/api/payment?url=${encodedUrl}`);
        
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
        const data = await response.json();
        if (data.redirectUrl) {
            window.open(data.redirectUrl, '_blank');
            return;
        }
        if (data.error) {
            throw new Error(data.error);
        }
    } else {
        const htmlContent = await response.text();
        return htmlContent;
    }
    } catch (error) {
        throw error;
    }
}
