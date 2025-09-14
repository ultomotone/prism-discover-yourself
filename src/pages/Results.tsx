import { useCallback, useEffect, useMemo, useState } from "react";
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

type RpcErrorKind =
  | "expired_or_invalid_token"
  | "not_authorized"
  | "transient"
  | "unknown";

export function classifyRpcError(e: any): RpcErrorKind {
  const status = Number((e?.code ?? e?.status) || 0);
  const msg = String(e?.message ?? "").toLowerCase();
  if (status === 404 || msg.includes("no_data_found")) {
    return "expired_or_invalid_token";
  }
  if (status === 403) return "not_authorized";
  if (status === 409 || status === 429 || (status >= 500 && status < 600)) {
    return "transient";
  }
  return "unknown";
}

export default function Results() {
  const { sessionId: paramId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const navigate = useNavigate();

  const sessionId = useMemo(
    () => paramId || query.get("sessionId") || "",
    [paramId, query]
  );
  const shareToken = useMemo(() => query.get("t") ?? null, [query]);

  const [data, setData] = useState<ResultsPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [errKind, setErrKind] = useState<
    "expired_or_invalid_token" | "not_authorized" | "unknown" | null
  >(null);
  const [tries, setTries] = useState(0);
  const [rotating, setRotating] = useState(false);

  const resultsUrl = shareToken
    ? `${window.location.origin}/results/${sessionId}?t=${shareToken}`
    : `${window.location.origin}/results/${sessionId}`;

  const copyResultsLink = async () => {
    try {
      await navigator.clipboard.writeText(resultsUrl);
      toast({
        title: "Secure link copied!",
        description:
          "Your private results link has been copied to your clipboard.",
      });
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = resultsUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast({
        title: "Secure link copied!",
        description:
          "Your private results link has been copied to your clipboard.",
      });
    }
  };

  const applyNewToken = useCallback(
    (newToken: string) => {
      navigate(`/results/${sessionId}?t=${newToken}`, { replace: true });
      setData(null);
      setTries((t) => t + 1);
      toast({
        title: "New secure link generated",
        description: "Old links are now invalid. Your URL has been updated.",
      });
    },
    [navigate, sessionId]
  );

  const rotateLink = useCallback(
    async () => {
      if (!sessionId) return;
      setRotating(true);
      try {
        const { data, error } = await supabase.rpc(
          "rotate_results_share_token",
          {
            p_session_id: sessionId,
          }
        );
        if (error) throw error;
        const newToken = (data as any)?.share_token;
        if (!newToken) {
          throw new Error("Rotation succeeded but no token returned");
        }
        applyNewToken(newToken);
      } catch (e: any) {
        const msg = e?.message ?? "Failed to rotate link";
        toast({ title: "Could not rotate link", description: msg });
      } finally {
        setRotating(false);
      }
    },
    [sessionId, applyNewToken]
  );

  const downloadPDF = async () => {
    const node = document.getElementById("results-content");
    if (!node) return;

    const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#ffffff" });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const pageHeight = 297;
    const imgProps = pdf.getImageProperties(img);
    const imgWidth = pageWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    pdf.addImage(img, "PNG", 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
    let remaining = imgHeight - pageHeight;
    let y = 0;
    while (remaining > 0) {
      pdf.addPage();
      y += pageHeight;
      pdf.addImage(img, "PNG", 0, -y, imgWidth, imgHeight);
      remaining -= pageHeight;
    }

    pdf.save("PRISM_Profile.pdf");
  };

  useEffect(() => {
    if (!sessionId) return;
    let cancel = false;
    setErr(null);
    setErrKind(null);

    (async () => {
      try {
        // Single, authoritative RPC. Token path (t set) or owner path (t null).
        const { data: res, error } = await supabase.rpc(
          "get_results_by_session",
          { session_id: sessionId, t: shareToken }
        );

        if (error) throw error;
        if (!res?.profile) throw new Error("Results not found");

        if (!cancel) setData(res);
      } catch (e: any) {
        const kind = classifyRpcError(e);
        if (kind === "transient" && tries < 2) {
          setTimeout(() => !cancel && setTries((t) => t + 1), 400 * (tries + 1));
          return;
        }
        if (!cancel) {
          if (kind === "expired_or_invalid_token" || kind === "not_authorized") {
            setErrKind(kind);
          } else {
            setErr(
              e?.message && typeof e.message === "string"
                ? e.message
                : "Failed to load results"
            );
            setErrKind(null);
          }
        }
      }
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

  if (errKind) {
    const content =
      errKind === "expired_or_invalid_token"
        ? {
            title: "This results link has expired or was rotated",
            message:
              "Ask the owner for a fresh link, or sign in (if you’re the owner) to view your results.",
          }
        : {
            title: "You’re not authorized to view these results",
            message:
              "Sign in with the account that owns this assessment, or request a share link from the owner.",
          };
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 space-y-4 text-center">
            <h2 className="text-lg font-semibold">{content.title}</h2>
            <p className="text-muted-foreground">{content.message}</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={() => navigate(`/login?redirect=/results/${sessionId}`)}>
                Sign in to view
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/assessment?start=true")}
              >
                Retake assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (err) return <div className="p-8">Error: {err}</div>;
  if (!data) return <div className="p-8">Loading…</div>;

  return (
    <div className="min-h-screen bg-background">
      {query.get("debug") === "1" && data.profile && (
        <div className="fixed top-2 right-2 bg-black/70 text-white text-xs p-2 rounded">
          <div>version: {data.profile.version}</div>
          <div>fc_source: {data.profile.fc_source || "none"}</div>
          <div>
            {data.profile.top_types
              ?.slice(0, 3)
              .map((t: any) => `${t.code}:${Number(t.share).toFixed(3)}`)
              .join(" ")}
          </div>
        </div>
      )}

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
                <Button
                  onClick={rotateLink}
                  variant="outline"
                  size="sm"
                  disabled={rotating}
                  className="shrink-0"
                >
                  <RotateCcw className="h-4 w-4" />
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
                onClick={() => navigate("/assessment?start=true")}
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
