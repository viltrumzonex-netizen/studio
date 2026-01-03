import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from '@/lib/session';
import { VTC_SYMBOL } from '@/lib/constants';
import type { PoolConnection } from 'mysql2/promise';

type SystemStatus = {
    dbConnected: { status: boolean, message: string };
    exchangeRateSet: { status: boolean, message: string };
    systemWalletOk: { status: boolean, message: string };
    adminExists: { status: boolean, message: string };
};

export async function GET(req: NextRequest) {
    const session = await getServerSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ message: 'Acceso no autorizado.' }, { status: 403 });
    }

    const status: SystemStatus = {
        dbConnected: { status: false, message: 'No se pudo conectar a la base de datos.' },
        exchangeRateSet: { status: false, message: 'La tasa de cambio no está configurada.' },
        systemWalletOk: { status: false, message: 'La billetera del sistema no está inicializada para VTC.' },
        adminExists: { status: false, message: 'No existen usuarios administradores.' },
    };

    let connection: PoolConnection | null = null;
    try {
        connection = await pool.getConnection();
        await connection.ping(); // Verify connection is active
        status.dbConnected = { status: true, message: 'Conexión a la base de datos exitosa.' };
        
        // Check exchange rate
        const [settings]: any = await connection.query("SELECT * FROM settings WHERE setting_key = 'exchange_rate'");
        if (settings.length > 0 && settings[0].setting_value) {
             status.exchangeRateSet = { status: true, message: `Tasa configurada a ${settings[0].setting_value} Bs.`};
        }

        // Check system wallet
        const [wallet]: any = await connection.query("SELECT * FROM system_wallet WHERE currency_symbol = ?", [VTC_SYMBOL]);
        if (wallet.length > 0) {
            status.systemWalletOk = { status: true, message: 'Billetera del sistema configurada.' };
        }

        // Check for admin user
        const [admins]: any = await connection.query("SELECT COUNT(*) as adminCount FROM users WHERE role = 'admin'");
        if (admins[0].adminCount > 0) {
            status.adminExists = { status: true, message: `${admins[0].adminCount} administrador(es) encontrado(s).` };
        }

    } catch (error: any) {
        status.dbConnected = { status: false, message: `Fallo en la conexión: ${error.message}` };
        // Return the partial status even if DB connection fails
        return NextResponse.json(status, { status: 200 }); // Return 200 so frontend can display the partial status
    } finally {
        if (connection) {
            connection.release();
        }
    }
    
    return NextResponse.json(status, { status: 200 });
}
