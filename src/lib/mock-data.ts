import type { Coin, Transaction } from './types';

// --- New Economy Constants ---
export const TOTAL_SUPPLY = 500;
// --- End New ---

export const walletCoins: Coin[] = [
    {
        id: 'viltrum-coin',
        name: 'Viltrum Coin',
        symbol: 'VTC',
        amount: 250,
        usdValue: 250,
        iconUrl: '/viltrum-coin.png',
    },
];

export const transactions: Transaction[] = [
    {
        id: '1',
        type: 'top-up',
        coin: walletCoins[0], // Viltrum Coin
        amount: 100,
        usdValue: 100,
        date: new Date('2024-05-21T11:00:00Z'),
        from: 'Admin'
    },
    {
        id: '2',
        type: 'received',
        coin: walletCoins[0], // Viltrum Coin
        amount: 100,
        usdValue: 100,
        date: new Date('2024-05-20T10:00:00Z'),
        address: '0x123...abc'
    },
    {
        id: '3',
        type: 'sent',
        coin: walletCoins[0], // Viltrum Coin
        amount: 50,
        usdValue: 50,
        date: new Date('2024-05-19T15:30:00Z'),
        address: 'vtc1q...xyz'
    },
    {
        id: '4',
        type: 'top-up',
        coin: walletCoins[0], 
        amount: 50,
        usdValue: 50,
        date: new Date('2024-05-18T09:00:00Z'),
        from: 'Admin'
    },
];
