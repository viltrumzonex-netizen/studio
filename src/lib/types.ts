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
    userId: number;
    type: 'top-up' | 'expense';
    amount_vtc: number;
    description: string | null;
    createdAt: string; // Comes as string from DB
}

export type RechargeRequest = {
    id: string;
    userId: string; // From the DB
    userEmail?: string; // Joined from users table
    amountBs: number;
    method: 'Pago Móvil' | 'Zinli' | 'Binance';
    reference: string;
    date: Date; // createdAt from DB
    status: 'pending' | 'approved' | 'denied';
}

export type StoreItem = {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
}
