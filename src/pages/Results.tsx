import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { ResultsV2 } from "@/components/assessment/ResultsV2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link as LinkIcon, Copy, Download, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { trackResultsViewed } from "@/lib/analytics";
import { classifyRpcError, type RpcErrorCategory } from "@/features/results/errorClassifier";

type ResultsPayload = {
  session: { id: string; status: string };
  profile: any;
};

type RotateResponse = { share_token: string };

type ResultsComponents = {
  ResultsView?: ComponentType<{ profile: any }>;
};

type ResultsProps = {
  components?: ResultsComponents;
};

export default function Results({ components }: ResultsProps = {}) {
  const ResultsView = components?.ResultsView ?? ResultsV2;
  const { sessionId: paramId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const query = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const navigate = useNavigate();

  const sessionId = useMemo(
    () => paramId || query.get("sessionId") || "",
    [paramId, query]
  );

  // Debug logging - add this to see what's happening
  console.log('🔍 Results component state:', {
    paramId,
    sessionId,
    pathname: location.pathname,
    search: location.search,
    href: window.location.href
  });

  // Early return if sessionId is missing or invalid
  if (!sessionId || sessionId === ":sessionId") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 space-y-4 text-center">
            <h2 className="text-lg font-semibold">Invalid Session ID</h2>
            <p className="text-muted-foreground">
              The session ID is missing or invalid. Please check your URL.
            </p>
            <div className="text-xs text-muted-foreground">
              Debug: sessionId = "{sessionId}", paramId = "{paramId}"
            </div>
            <Button onClick={() => navigate("/assessment?start=true")}>
              Take Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [shareToken, setShareToken] = useState<string | null>(
    query.get("t") ?? null
  );
  useEffect(() => {
    setShareToken(query.get("t") ?? null);
  }, [query]);

  const [data, setData] = useState<ResultsPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [errKind, setErrKind] = useState<RpcErrorCategory | null>(null);
  const [tries, setTries] = useState(0);
  const [rotating, setRotating] = useState(false);

  const resultsUrl = useMemo(
    () =>
      shareToken
        ? `${window.location.origin}/results/${sessionId}?t=${shareToken}`
        : `${window.location.origin}/results/${sessionId}`,
    [sessionId, shareToken]
  );

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

  const rotateLink = useCallback(async () => {
    if (!sessionId) {
      toast({ title: "Session not found." });
      return;
    }
    setRotating(true);
    try {
      const { data, error } = await supabase.rpc(
        "rotate_results_share_token",
        { p_session_id: sessionId }
      );

      if (error) {
        if (error.code === "403" || (error as any).status === 403) {
          toast({
            title: "You must be signed in as the session owner to rotate the link.",
          });
        } else if (error.code === "404" || (error as any).status === 404) {
          toast({ title: "Session not found." });
        } else {
          toast({ title: "Could not rotate link. Please try again." });
        }
        return;
      }

      const newToken = data?.share_token;
      if (!newToken) {
        toast({ title: "Could not rotate link. Please try again." });
        return;
      }

      setShareToken(newToken);
      window.history.replaceState(
        null,
        "",
        `/results/${sessionId}?t=${newToken}`
      );
      navigate(`/results/${sessionId}?t=${newToken}`, { replace: true });
      toast({ title: "New secure link generated." });
    } catch {
      toast({ title: "Could not rotate link. Please try again." });
    } finally {
      setRotating(false);
    }
  }, [sessionId, navigate]);

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

    console.log('🔍 Results useEffect triggered');
    console.log('SessionID:', sessionId);
    console.log('ShareToken:', shareToken);
    console.log('Current URL:', window.location.href);

    const ensureShareTokenAndReload = async (sessionId: string) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No user found, cannot get share token');
          setErr('Sign in or open the link with a share token to view results.');
          setErrKind('not_authorized');
          return;
        }

        console.log('Attempting to get share token for owned session...');
        const { data, error } = await supabase.functions.invoke("get-or-create-share-token", {
          body: { session_id: sessionId },
        });
        
        if (!error && data?.ok && data?.share_token) {
          console.log('Got share token, redirecting...');
          const url = new URL(window.location.href);
          url.searchParams.set("t", data.share_token);
          window.location.replace(url.toString());
        } else {
          console.error('Failed to get share token:', error || data);
          setErr('Unable to access results. Please check if you own this session or have a valid share link.');
          setErrKind('not_authorized');
        }
      } catch (err) {
        console.error('Error getting share token:', err);
        setErr('Failed to authenticate access to results.');
        setErrKind('not_authorized');
      }
    };

    (async () => {
      try {
        console.log('🔍 Calling get-results-by-session Edge Function...');
        
        // Call Edge Function with share token (or null)
        const { data: result, error } = await supabase.functions.invoke('get-results-by-session', {
          body: { session_id: sessionId, share_token: shareToken }
        });

        if (error) {
          // If no share token and we got 401, try owner auth
          if (!shareToken && (error.message?.includes('401') || error.message?.includes('share token required'))) {
            console.log('No share token provided, attempting owner auth...');
            await ensureShareTokenAndReload(sessionId);
            return;
          }
          throw error;
        }
        
        if (result?.ok === false) throw new Error(result.error);
        if (!result?.profile) throw new Error("Profile not found");

        console.log('✅ Edge Function success:', result);
        if (!cancel) setData(result);
      } catch (e: any) {
        console.error('❌ Results loading failed:', e);
        console.error('Error details:', {
          message: e?.message,
          code: e?.code,
          status: e?.status,
          details: e?.details
        });
        
        const kind = classifyRpcError(e);
        if (kind === "transient" && tries < 2) {
          setTimeout(() => !cancel && setTries((t) => t + 1), 400 * (tries + 1));
          return;
        }
        if (!cancel) {
          if (kind === "expired_or_invalid_token" || kind === "not_authorized") {
            setErrKind(kind);
          } else {
            if (e?.message?.includes('Profile not found') || e?.code === 'PROFILE_NOT_FOUND') {
              setErr("This assessment needs to be scored. Profile data is missing.");
            } else {
              setErr(
                e?.message && typeof e.message === "string"
                  ? e.message
                  : "Failed to load results"
              );
            }
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
          <ResultsView profile={data.profile} />
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
                onClick={rotateLink}
                variant="outline"
                size="lg"
                disabled={rotating}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Rotate Link
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
