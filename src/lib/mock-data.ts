import { ViltrumCoin, Ethereum, UsdCoin } from '@/components/icons';

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
        id: 'viltrum-coin',
        name: 'Viltrum Coin',
        symbol: 'VTC',
        amount: 25000,
        usdValue: 25000,
        icon: ViltrumCoin,
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
    type: 'sent' | 'received' | 'top-up';
    coin: Coin;
    amount: number;
    usdValue: number;
    date: Date;
    address?: string;
    from?: string;
}

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
        coin: walletCoins[1], // Ethereum
        amount: 2,
        usdValue: 6000,
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
        type: 'received',
        coin: walletCoins[2], // USDC
        amount: 500,
        usdValue: 500,
        date: new Date('2024-05-18T09:00:00Z'),
        address: '0x456...def'
    },
];

export const totalBalance = walletCoins.reduce((acc, coin) => acc + coin.usdValue, 0);