import { Bitcoin, Ethereum, UsdCoin } from '@/components/icons';

export type Coin = {
    id: string;
    name: string;
    symbol: string;
    amount: number;
    usdValue: number;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export const walletCoins: Coin[] = [
    {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
        amount: 0.5,
        usdValue: 35000,
        icon: Bitcoin,
    },
    {
        id: 'ethereum',
        name: 'Ethereum',
        symbol: 'ETH',
        amount: 10,
        usdValue: 30000,
        icon: Ethereum,
    },
    {
        id: 'usd-coin',
        name: 'USD Coin',
        symbol: 'USDC',
        amount: 15000,
        usdValue: 15000,
        icon: UsdCoin,
    }
];

export type Transaction = {
    id: string;
    type: 'sent' | 'received';
    coin: Coin;
    amount: number;
    usdValue: number;
    date: Date;
    address: string;
}

export const transactions: Transaction[] = [
    {
        id: '1',
        type: 'received',
        coin: walletCoins[1], // Ethereum
        amount: 2,
        usdValue: 6000,
        date: new Date('2024-05-20T10:00:00Z'),
        address: '0x123...abc'
    },
    {
        id: '2',
        type: 'sent',
        coin: walletCoins[0], // Bitcoin
        amount: 0.1,
        usdValue: 7000,
        date: new Date('2024-05-19T15:30:00Z'),
        address: 'bc1q...xyz'
    },
    {
        id: '3',
        type: 'received',
        coin: walletCoins[2], // USDC
        amount: 500,
        usdValue: 500,
        date: new Date('2024-05-18T09:00:00Z'),
        address: '0x456...def'
    },
];

export const totalBalance = walletCoins.reduce((acc, coin) => acc + coin.usdValue, 0);
