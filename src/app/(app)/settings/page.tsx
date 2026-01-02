'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThemeToggle } from "@/components/settings/theme-toggle";

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
                    <CardDescription>
                        Elige entre un tema claro o uno oscuro para personalizar tu experiencia.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center pt-2">
                   <ThemeToggle />
                </CardContent>
            </Card>
        </div>
    )
}
