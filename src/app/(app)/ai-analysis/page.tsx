import AnalysisForm from "@/components/ai/analysis-form";

export default function AiAnalysisPage() {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            <header>
                <h1 className="text-4xl font-bold font-headline text-glow">Análisis con IA</h1>
                <p className="text-muted-foreground mt-1">Obtén sugerencias de inversión personalizadas por IA.</p>
            </header>
            <AnalysisForm />
        </div>
    );
}
