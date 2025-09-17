import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { typingLabEntries } from "@/features/typing-lab/data";
import { TypingLabDetailHeader } from "@/features/typing-lab/components/TypingLabDetailHeader";
import { FunctionExpressionTable } from "@/features/typing-lab/components/FunctionExpressionTable";
import { EvidenceLedger } from "@/features/typing-lab/components/EvidenceLedger";
import { DifferentialDiagnosis } from "@/features/typing-lab/components/DifferentialDiagnosis";
import { ContextNotes } from "@/features/typing-lab/components/ContextNotes";
import { CoachingSnapshot } from "@/features/typing-lab/components/CoachingSnapshot";
import { Appendix } from "@/features/typing-lab/components/Appendix";

const TypingLabEntryPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const entry = useMemo(
    () => typingLabEntries.find((candidate) => candidate.slug === slug),
    [slug]
  );

  if (!entry) {
    return (
      <div className="bg-background text-foreground">
        <div className="prism-container flex min-h-screen flex-col items-center justify-center space-y-6 pb-24 pt-32 text-center">
          <h1 className="text-3xl font-semibold text-primary">Typing not found</h1>
          <p className="max-w-xl text-base text-muted-foreground">
            We haven’t published that dossier yet. Browse the Typing Lab to explore available profiles or submit a source if you
            think we should add it.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/typing-lab"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80"
            >
              Back to Typing Lab
            </Link>
            <a
              href="mailto:typinglab@prism.gg"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2 text-sm font-medium text-secondary hover:text-secondary/80"
            >
              Submit a source
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground">
      <div className="prism-container space-y-10 pb-24 pt-32">
        <TypingLabDetailHeader entry={entry} />
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            <FunctionExpressionTable entry={entry} />
            <EvidenceLedger entry={entry} />
            <DifferentialDiagnosis entry={entry} />
            <CoachingSnapshot entry={entry} />
          </div>
          <div className="space-y-8 lg:sticky lg:top-28">
            <ContextNotes entry={entry} />
          </div>
        </div>
        <Appendix entry={entry} />
      </div>
    </div>
  );
};

export default TypingLabEntryPage;
