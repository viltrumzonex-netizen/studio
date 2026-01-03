
import { PlusCircle, ShoppingBag, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Coin = {
    id: string;
    name: string;
    symbol: string;
    amount: number;
    usdValue: number;
    iconUrl: string;
};

export type TransactionType = 'top-up' | 'expense' | 'transfer-in' | 'transfer-out';

export type Transaction = {
    id: string;
    userId: number;
    type: TransactionType;
    amount_vtc: number;
    description: string | null;
    createdAt: string; // Comes as string from DB
}

export const transactionTypeConfig: { [key in TransactionType]: { icon: LucideIcon, color: string, sign: string } } = {
    'top-up': {
        icon: PlusCircle,
        color: 'text-primary',
        sign: '+'
    },
    'expense': {
        icon: ShoppingBag,
        color: 'text-accent',
        sign: '-'
    },
    'transfer-out': {
        icon: ArrowUpRight,
        color: 'text-accent',
        sign: '-'
    },
    'transfer-in': {
        icon: ArrowDownLeft,
        color: 'text-primary',
        sign: '+'
    }
};

export type RechargeRequest = {
    id: string;
    userId: string; // From the DB
    userEmail?: string; // Joined from users table
    amountBs: number;
    method: 'Pago Móvil' | 'Zinli' | 'Binance Pay';
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
