import { atom } from 'jotai'

interface CreditHistory {
    id: number;
    type: string;
    amount: number;
    credit_id: number;
    created_at: string;
    updated_at: string;
}

interface TotalCredits {
    total_credits: number;
    bonus_credits: number;
    creditHistories: CreditHistory[];
}

interface UserPlanType {
    plan: string;
}

interface UserInfo {
    email: string;
    username: string;
    avatar: string;
}

interface CampaignDashboard {
    id: number;
    total_keywords: number;
    top3: number;
    top5: number;
    top10: number;
}

interface totalTopKeywordsDashboard {
    data: Array<{}>;
}

export const creditAtom = atom<number>(0)

export const campaignNameAtom = atom<string>('')


export const totalMoneyAtom = atom<number>(0)

export const isEdittingAmountCredit = atom<boolean>(false)

export const userPlanTypeAtom = atom<UserPlanType>({
    plan: 'no-plan',
});

export const isBonusCreditDashboardAtom = atom<number>(0)

export const infoCreditsAtom = atom<TotalCredits>({
    total_credits: 0,
    bonus_credits: 0,
    creditHistories: []
})

export const userInfoAtom = atom<UserInfo>({
    email: '',
    username: '',
    avatar: ''
})

export const campaignAtomDashboard = atom<CampaignDashboard>({
    id: 0,
    total_keywords: 0,
    top3: 0,
    top5: 0,
    top10: 0,
})

export const totalTopKeywordsDashboardAtom = atom<totalTopKeywordsDashboard>({
    data: []
})