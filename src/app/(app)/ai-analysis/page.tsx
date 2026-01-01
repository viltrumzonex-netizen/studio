import AnalysisForm from "@/components/ai/analysis-form";

export default function AiAnalysisPage() {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            <header>
                <h1 className="text-4xl font-bold font-headline text-glow">AI Asset Analysis</h1>
                <p className="text-muted-foreground mt-1">Get AI-powered investment suggestions tailored to you.</p>
            </header>
            <AnalysisForm />
        </div>
    );
}
