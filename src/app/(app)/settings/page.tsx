'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/use-settings";

export default function SettingsPage() {
    const { iconSize, setIconSize } = useSettings();

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            <header>
                <h1 className="text-4xl font-bold font-headline text-glow">Configuración</h1>
                <p className="text-muted-foreground mt-1">Ajusta las preferencias de tu aplicación.</p>
            </header>

            <Card className="glass-card max-w-md">
                <CardHeader>
                    <CardTitle className="text-lg">Apariencia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="icon-size">Tamaño de Iconos (Billetera)</Label>
                            <span className="text-sm font-medium w-12 text-center">{iconSize}px</span>
                        </div>
                        <Slider
                            id="icon-size"
                            min={24}
                            max={128}
                            step={2}
                            value={[iconSize]}
                            onValueChange={(value) => setIconSize(value[0])}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground text-center pt-2">
                        El tamaño seleccionado se guardará en tu navegador.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
