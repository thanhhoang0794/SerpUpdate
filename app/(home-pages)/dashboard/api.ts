
export async function fetchUserInfo() {
    const origin = window?.location?.origin;
    try {
        const response = await fetch(`${origin}/api/users`);
        const { auth, profile } = await response.json();
        return { auth, profile };
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

export async function fetchCredit() {
    const origin = window?.location?.origin;
    try {
        const response = await fetch(`${origin}/api/credits`);
        const dataCredit = await response.json();

        if (!dataCredit?.[0]) {
            return { total_credits: 0, bonus_credits: 0, creditHistories: [] };
        }

        return {
            total_credits: dataCredit[0].total_credits ?? 0,
            bonus_credits: dataCredit[0].bonus_credits ?? 0,
            creditHistories: dataCredit[0].creditHistories ?? []
        };
    } catch (error) {
        console.error('Error fetching credits:', error);
        return { total_credits: 0, bonus_credits: 0, creditHistories: [] };
    }
}

export async function updateUserPlan(planType: string) {
    const origin = window?.location?.origin;
    const response = await fetch(`${origin}/api/users`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            plan_type: planType,
            plan_changed_at: new Date().toISOString()
        })
    });

    if (!response.ok) {
        throw new Error('Failed to update plan');
    }

    return response.json();
}

export async function addBonusCredits(amount: number) {
    const origin = window?.location?.origin;
    const response = await fetch(`${origin}/api/credits`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            bonus_amount: amount
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add bonus credits');
    }

    return response.json();
}

export async function fetchUserCampaigns() {
    const origin = window?.location?.origin;
    const response = await fetch(`${origin}/api/total-top-keyword-ranking`);
    const data = await response.json();
    return data;
}
