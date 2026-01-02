export type Coin = {
    id: string;
    name: string;
    symbol: string;
    amount: number;
    usdValue: number;
    iconUrl: string;
};

export type Transaction = {
    id: string;
    type: 'sent' | 'received' | 'top-up' | 'expense';
    coin: Coin;
    amount: number;
    usdValue: number;
    date: Date;
    address?: string;
    from?: string;
    details?: string; // For store purchases, etc.
}

export type RechargeRequest = {
    id: string;
    user: string;
    amountBs: number;
    method: 'Pago Móvil' | 'Zinli' | 'Binance';
    reference: string;
    date: Date;
    status: 'pending' | 'approved' | 'denied';
}
