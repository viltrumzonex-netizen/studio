'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            <header>
                <h1 className="text-4xl font-bold font-headline text-glow">Configuración</h1>
                <p className="text-muted-foreground mt-1">Ajusta las preferencias de tu aplicación.</p>
            </header>

            <Card className="glass-card max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-lg">Apariencia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                   <p className="text-sm text-muted-foreground text-center pt-2">
                        Más opciones de configuración estarán disponibles próximamente.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
