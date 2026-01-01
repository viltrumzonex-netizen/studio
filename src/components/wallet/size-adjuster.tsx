'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SizeAdjusterProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    size: number;
    setSize: (size: number) => void;
}

export default function SizeAdjuster({ isOpen, setIsOpen, size, setSize }: SizeAdjusterProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className={cn(
            "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm",
            "transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
            <Card className="glass-card shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Ajustar Tamaño</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="icon-size">Tamaño del Icono</Label>
                             <span className="text-sm font-medium w-12 text-center">{size}px</span>
                        </div>
                        <Slider
                            id="icon-size"
                            min={24}
                            max={128}
                            step={2}
                            value={[size]}
                            onValueChange={(value) => setSize(value[0])}
                        />
                    </div>
                     <p className="text-xs text-muted-foreground text-center pt-2">
                        Una vez que encuentres el tamaño deseado, comunícalo para establecerlo de forma permanente.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
