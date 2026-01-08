
'use server';

import { createClient } from '@/lib/supabase/server';

export default async function DbTestPage() {
    const supabase = createClient();
    let connectionStatus: 'success' | 'error';
    let errorMessage = '';
    let exchangeRate = null;

    if (!supabase) {
        connectionStatus = 'error';
        errorMessage = 'Las variables de entorno de Supabase (NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY) no están configuradas en el archivo .env. La aplicación no puede crear el cliente de Supabase.';
    } else {
        try {
            const { data, error } = await supabase
                .from('config')
                .select('value')
                .eq('key', 'exchange_rate')
                .single();

            if (error) {
                throw error;
            }

            if (data) {
                connectionStatus = 'success';
                exchangeRate = data.value;
            } else {
                throw new Error('La consulta a la tabla `config` no devolvió resultados. Asegúrate de que la tasa de cambio inicial esté insertada.');
            }

        } catch (error: any) {
            connectionStatus = 'error';
            if (error.code === '42501' || error.message.includes('security policies')) {
                errorMessage = `Error de permisos (Row Level Security): La política de seguridad a nivel de fila impidió la lectura de la tabla 'config'. Asegúrate de que existe una política que permita la lectura pública: \n\nCREATE POLICY "Allow public read access to config." ON public.config FOR SELECT USING (true);`;
            } else if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
                errorMessage = `Error de red: No se pudo conectar a la URL de Supabase. Verifica que la NEXT_PUBLIC_SUPABASE_URL en tu archivo .env sea correcta y que tu conexión a internet esté funcionando.`;
            } else if (error.message.includes('JWT') || error.message.includes('Unauthorized') || error.message.includes('Invalid API key')) {
                 errorMessage = `Error de autenticación: La API Key (anon) parece ser inválida. Verifica que la NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env sea la correcta.`;
            } else {
                errorMessage = error.message;
            }
            console.error("Supabase Connection Error:", error);
        }
    }


    return (
        <div style={{ padding: '2rem', fontFamily: 'monospace', lineHeight: '1.6', color: '#eee', background: '#111', minHeight: '100vh' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#fff' }}>Prueba de Conexión a Supabase</h1>
            {connectionStatus === 'success' ? (
                <div>
                    <p style={{ color: 'lightgreen', fontSize: '1.2rem' }}>
                        ✅ Conexión a la base de datos Supabase exitosa.
                    </p>
                    <p>Se leyó correctamente la configuración de la tabla `config`.</p>
                    <pre style={{ 
                        backgroundColor: '#333', 
                        padding: '1rem', 
                        borderRadius: '8px', 
                        color: 'white', 
                        whiteSpace: 'pre-wrap',
                        marginTop: '1rem'
                    }}>
                        {JSON.stringify({ exchange_rate: exchangeRate }, null, 2)}
                    </pre>
                </div>
            ) : (
                <div>
                    <p style={{ color: 'salmon', fontSize: '1.2rem' }}>
                        ❌ Error al conectar o leer desde Supabase.
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
                    <div style={{ marginTop: '2rem' }}>
                        <h3 style={{ marginBottom: '0.5rem', color: '#fff' }}>Posibles Soluciones:</h3>
                        <ul style={{ paddingLeft: '20px' }}>
                            <li>Abre tu archivo <code>.env</code> y verifica que las variables <code>NEXT_PUBLIC_SUPABASE_URL</code> y <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> sean correctas. Las puedes encontrar en "Project Settings" {'>'} "API" en tu dashboard de Supabase.</li>
                            <li>Asegúrate de haber ejecutado el script SQL para crear la tabla `config` e insertar la tasa de cambio inicial.</li>
                            <li>Ve al "SQL Editor" en Supabase y verifica que las Políticas de Seguridad (RLS) para la tabla `config` estén activadas y permitan la lectura pública (`SELECT` con `USING (true)`).</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
