'use server';

import { query } from '@/lib/db';

export default async function DbTestPage() {
    let connectionStatus;
    let errorMessage = '';
    let dbVersion = '';

    try {
        const result: any = await query("SELECT VERSION() as version", []);
        if (result && result.length > 0) {
            dbVersion = result[0].version;
            connectionStatus = 'success';
        } else {
             throw new Error('La consulta no devolvió resultados.');
        }

    } catch (error: any) {
        connectionStatus = 'error';
        errorMessage = error.message;
        console.error("DB Connection Error:", error);
    }

    return (
        <div style={{ padding: '2rem', fontFamily: 'monospace', lineHeight: '1.6' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Prueba de Conexión a la Base de Datos</h1>
            {connectionStatus === 'success' ? (
                <div>
                    <p style={{ color: 'lightgreen', fontSize: '1.2rem' }}>
                        ✅ Conexión a la base de datos exitosa.
                    </p>
                    <p>Versión de MySQL: {dbVersion}</p>
                </div>
            ) : (
                <div>
                    <p style={{ color: 'salmon', fontSize: '1.2rem' }}>
                        ❌ Error al conectar con la base de datos.
                    </p>
                    <p style={{ color: 'salmon' }}>
                        <strong>Mensaje de Error:</strong>
                    </p>
                    <pre style={{ 
                        backgroundColor: '#333', 
                        padding: '1rem', 
                        borderRadius: '8px', 
                        color: 'white', 
                        whiteSpace: 'pre-wrap' 
                    }}>
                        {errorMessage}
                    </pre>
                    <div style={{ marginTop: '1rem' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>Posibles Soluciones:</h3>
                        <ul>
                            <li>Verifica que las credenciales en tu archivo <code>.env</code> (DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE) sean correctas.</li>
                            <li>Asegúrate de que el `DB_HOST` sea el correcto (usualmente `localhost` en Hostinger).</li>
                            <li>Comprueba que el usuario de la base de datos tenga permisos para conectarse desde la aplicación.</li>
                            <li>Revisa si Hostinger requiere añadir tu dirección IP a una "lista blanca" para permitir conexiones remotas (aunque con `localhost` no debería ser necesario).</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
