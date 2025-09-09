import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { ResultsV2 } from "@/components/assessment/ResultsV2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link as LinkIcon, Copy, Download, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { trackResultsViewed } from "@/lib/analytics";

type ResultsPayload = {
  session: { id: string; status: string };
  profile: any;
};

export default function Results() {
  const { sessionId: paramId } = useParams<{ sessionId: string }>();
  const query = new URLSearchParams(useLocation().search);
  const navigate = useNavigate();
  const sessionId = useMemo(
    () => paramId || query.get("sessionId") || "",
    [paramId, query],
  );
  const shareToken = useMemo(() => query.get("t"), [query]);

  const [data, setData] = useState<ResultsPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tries, setTries] = useState(0);

  const resultsUrl = shareToken
    ? `${window.location.origin}/results/${sessionId}?t=${shareToken}`
    : `${window.location.origin}/results/${sessionId}`;

  const copyResultsLink = async () => {
    try {
      await navigator.clipboard.writeText(resultsUrl);
      toast({
        title: "Secure link copied!",
        description: "Your private results link has been copied to your clipboard.",
      });
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = resultsUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "Secure link copied!",
        description: "Your private results link has been copied to your clipboard.",
      });
    }
  };

  const downloadPDF = async () => {
    const node = document.getElementById('results-content');
    if (!node) return;

    const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#ffffff' });
    const img = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210, pageHeight = 297;
    const imgProps = pdf.getImageProperties(img);
    const imgWidth = pageWidth, imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    pdf.addImage(img, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
    let remaining = imgHeight - pageHeight;
    let y = 0;
    while (remaining > 0) {
      pdf.addPage();
      y += pageHeight;
      pdf.addImage(img, 'PNG', 0, -y, imgWidth, imgHeight);
      remaining -= pageHeight;
    }

    pdf.save('PRISM_Profile.pdf');
  };

  useEffect(() => {
    if (!sessionId) return;
    let cancel = false;

    (async () => {
      const { data, error } = await supabase.functions.invoke<ResultsPayload>(
        "get-results-by-session",
        {
          body: { sessionId, shareToken },
        },
      );
      if (error) {
        // If Edge returns 409 while scoring, auto-retry briefly
        if ((error as any)?.status === 409 && tries < 12) {
          setTimeout(() => !cancel && setTries((t) => t + 1), 1000);
          return;
        }
        setErr(error.message || "Failed to load results");
        return;
      }
      if (!data?.profile) {
        setErr("Results not found");
        return;
      }
      setData(data);
    })();

    return () => {
      cancel = true;
    };
  }, [sessionId, shareToken, tries]);

  useEffect(() => {
    if (data?.profile) {
      trackResultsViewed(sessionId, (data.profile as any)?.type_code);
    }
  }, [data?.profile, sessionId]);

  if (err) return <div className="p-8">Error: {err}</div>;
  if (!data) return <div className="p-8">Loading…</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8 px-4 space-y-6">
        <div id="results-content">
          <ResultsV2 profile={data.profile} />
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <LinkIcon className="h-4 w-4" />
                <h3 className="font-semibold">Save Your Results</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Bookmark this link to access your results anytime
              </p>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="text-sm flex-1 truncate">{resultsUrl}</code>
                <Button onClick={copyResultsLink} variant="ghost" size="sm" className="shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={downloadPDF} size="lg" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download PDF Report
              </Button>
              <Button
                onClick={() => navigate('/assessment?start=true')}
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Retake Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
