import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const legendItems = [
  {
    title: "Proposed Type",
    description:
      "Highest-likelihood Socionics type at publish time. Overlay ± marks reactivity notes when present.",
  },
  {
    title: "Confidence Band",
    description:
      "Low, Medium, or High based on evidence quality, diversity, and internal agreement of signals.",
  },
  {
    title: "Top-2 Gap",
    description: "0–100 score describing how decisively the lead type beats the runner-up.",
  },
  {
    title: "Function Matrix",
    description: "Mini-map of all eight information elements with dimensionality and strength encoded separately.",
  },
  {
    title: "Evidence Weight",
    description: "Each claim in the ledger is tagged Light, Moderate, or Strong based on source quality and clarity.",
  },
  {
    title: "Context Balance",
    description: "Ratio of Flow, Performative, and Stress evidence represented in the sources.",
  },
  {
    title: "Data Coverage",
    description: "0–5 view of source breadth across formats, time periods, and perspectives.",
  },
];

const confidenceBands = [
  { label: "High", description: "Diverse, consistent evidence with a large Top-2 gap." },
  { label: "Medium", description: "Good coverage with some ambiguity or active counter-claims." },
  { label: "Low", description: "Limited or conflicting evidence; expect revisions." },
];

export const TypingLabLegend = () => {
  return (
    <section id="legend" className="prism-container py-16">
      <div className="rounded-3xl bg-card/50 p-10 shadow-lg">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="outline" className="mb-4 bg-primary/10 text-primary">
            Score legend
          </Badge>
          <h2 className="text-3xl font-semibold text-foreground">
            Know the badges before you dive in
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Confidence, overlays, and micro-charts mean something specific in PRISM. This quick reference keeps everyone on the
            same page.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {legendItems.map((item) => (
            <Card key={item.title} className="h-full border-border/60 bg-background/80">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-primary">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-primary/20 bg-background/80 p-6">
          <h3 className="text-lg font-semibold text-foreground">Confidence bands at a glance</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {confidenceBands.map((band) => (
              <div
                key={band.label}
                className="rounded-xl border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground"
              >
                <span className="mb-2 block text-base font-semibold text-foreground">{band.label}</span>
                {band.description}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
