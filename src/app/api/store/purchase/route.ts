import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from '@/lib/session'; // We'll need a session utility

// POST /api/store/purchase - Purchase an item from the store
export async function POST(req: NextRequest) {
  const connection = await (await import('@/lib/db')).default.getConnection();
  
  try {
    // In a real app, user ID should come from a secure session, not the body.
    // For now, we'll need to create a session helper. Let's assume one exists.
    const { userId } = await getServerSession(req);
    if (!userId) {
        return NextResponse.json({ message: 'No autenticado.' }, { status: 401 });
    }

    const { itemId } = await req.json();

    if (!itemId) {
      return NextResponse.json({ message: 'ID del producto es requerido.' }, { status: 400 });
    }
    
    await connection.beginTransaction();

    // 1. Get item and user details, and lock the rows to prevent race conditions
    const [itemResult]: any = await connection.query('SELECT * FROM store_items WHERE id = ? FOR UPDATE', [itemId]);
    const [userResult]: any = await connection.query('SELECT * FROM users WHERE id = ? FOR UPDATE', [userId]);

    if (itemResult.length === 0) {
        await connection.rollback();
        return NextResponse.json({ message: 'Producto no encontrado.' }, { status: 404 });
    }
    if (userResult.length === 0) {
        await connection.rollback();
        return NextResponse.json({ message: 'Usuario no encontrado.' }, { status: 404 });
    }

    const item = itemResult[0];
    const user = userResult[0];

    // 2. Check if user can afford the item and if it's in stock
    if (user.vtc_balance < item.price) {
        await connection.rollback();
        return NextResponse.json({ message: 'Saldo insuficiente.' }, { status: 400 });
    }
    if (item.stock <= 0) {
        await connection.rollback();
        return NextResponse.json({ message: 'Producto agotado.' }, { status: 400 });
    }

    // 3. Deduct balance, decrease stock, and create transaction
    const newBalance = user.vtc_balance - item.price;
    const newStock = item.stock - 1;

    await connection.query('UPDATE users SET vtc_balance = ? WHERE id = ?', [newBalance, userId]);
    await connection.query('UPDATE store_items SET stock = ? WHERE id = ?', [newStock, itemId]);
    await connection.query(
        'INSERT INTO transactions (id, userId, type, amount_vtc, description) VALUES (?, ?, ?, ?, ?)',
        [`TXN-${uuidv4()}`, userId, 'expense', item.price, `Canje: ${item.name}`]
    );

    // 4. Commit transaction
    await connection.commit();

    return NextResponse.json({ message: 'Canje realizado con éxito.', newBalance }, { status: 200 });

  } catch (error) {
    await connection.rollback();
    console.error('[API_STORE_PURCHASE_ERROR]', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  } finally {
      connection.release();
  }
}
