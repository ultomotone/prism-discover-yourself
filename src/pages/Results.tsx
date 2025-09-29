import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { ResultsV2 } from "@/components/assessment/ResultsV2";
import { PaywallGuard } from "@/components/PaywallGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link as LinkIcon, Copy, Download, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { trackResultsViewed } from "@/lib/analytics";
import { classifyRpcError, type RpcErrorCategory } from "@/features/results/errorClassifier";
import {
  fetchOwnerResultBySession,
  fetchSharedResultBySession,
  type ResultsFetchPayload,
  type ResultsSuccessPayload,
} from "@/services/resultsApi";
import { IS_PREVIEW } from "@/lib/env";
import { ensureSessionLinked } from "@/services/sessionLinking";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { resultsQueryKeys } from "@/features/results/queryKeys";
import { fixBrokenSession } from "@/utils/fixBrokenSession";

// Function to trigger scoring for missing results
async function triggerScoring(sessionId: string): Promise<void> {
  try {
    console.log(`🚀 Triggering scoring for session: ${sessionId}`);
    
    const { data, error } = await supabase.functions.invoke('force-score-session', {
      body: { session_id: sessionId }
    });

    if (error) {
      console.error('❌ Scoring trigger failed:', error);
      toast({
        title: "Scoring Error", 
        description: "Failed to trigger scoring. Please try refreshing the page.",
        variant: "destructive"
      });
      return;
    }

    console.log('✅ Scoring triggered successfully:', data);
    toast({
      title: "Processing Results",
      description: "Your results are being computed. Please wait a moment...",
    });
    
  } catch (error) {
    console.error('❌ Scoring trigger error:', error);
    toast({
      title: "Scoring Error",
      description: "Unable to trigger scoring process.",
      variant: "destructive"
    });
  }
}

type ResultsProfile = {
  paid: boolean;
  type_code?: string;
  dims_highlights?: {
    coherent?: string[];
    unique?: string[];
  };
  [key: string]: any;
};

type ResultsPayload = {
  session: Record<string, any> | null;
  profile?: ResultsProfile;
  types?: any[];
  functions?: any[];
  state?: any[];
  results_version?: string;
  scoring_version?: string;
  result_id?: string;
};

type ResultsComponents = {
  ResultsView?: ComponentType<{
    profile: ResultsProfile | undefined;
    types?: any[];
    functions?: any[];
    state?: any[];
    resultsVersion?: string;
  }>;
};

type ResultsProps = {
  components?: ResultsComponents;
};

export default function Results({ components }: ResultsProps = {}) {
  const ResultsView = components?.ResultsView ?? ResultsV2;
  const { sessionId: paramId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const sessionId = useMemo(
    () => paramId || query.get("sessionId") || "",
    [paramId, query]
  );

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

  const [shareToken, setShareToken] = useState<string | null>(query.get("t") ?? null);
  const scoringVersionParam = useMemo(() => {
    const raw = query.get("sv");
    return raw && raw.trim().length > 0 ? raw.trim() : undefined;
  }, [query]);

  const hasShareToken = useMemo(
    () => typeof shareToken === "string" && shareToken.trim().length > 0,
    [shareToken]
  );
  const tokenKey = useMemo(
    () => (hasShareToken ? shareToken!.trim() : "no-token"),
    [hasShareToken, shareToken]
  );

  const [hasAuthSession, setHasAuthSession] = useState(false);
  const [authStateResolved, setAuthStateResolved] = useState(false);

  useEffect(() => {
    setShareToken(query.get("t") ?? null);
  }, [query]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!active) return;
        setHasAuthSession(Boolean(sessionData?.session?.access_token));
      } finally {
        if (active) setAuthStateResolved(true);
      }
    })();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasAuthSession(Boolean(session?.access_token));
      setAuthStateResolved(true);
    });
    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const [rotating, setRotating] = useState(false);
  const linkAttemptedRef = useRef(false);

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

  const resultsQuery = useQuery<ResultsFetchPayload | undefined>({
    queryKey: resultsQueryKeys.session(sessionId, tokenKey, scoringVersionParam),
    queryFn: () => {
      if (!sessionId) throw new Error("sessionId is required");
      if (hasShareToken) return fetchSharedResultBySession(sessionId, shareToken!.trim());
      return fetchOwnerResultBySession(sessionId);
    },
    // enable when we either have a token OR we have resolved auth (so owner fetch can succeed/fail)
    enabled: Boolean(sessionId && (hasShareToken || authStateResolved)),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: (currentData) => {
      const data = currentData as any;
      if (!data) return 2000;
      if (data.ok === false && data.code === "SCORING_ROWS_MISSING") return 2000;
      if (
        scoringVersionParam &&
        data.ok === true &&
        data.scoring_version &&
        data.scoring_version !== scoringVersionParam
      ) {
        return 2000;
      }
      if (scoringVersionParam && data.ok === true && !data.scoring_version) return 2000;
      return false;
    },
    retry: (failureCount, error) => {
      const kind = classifyRpcError(error);
      if (kind === "expired_or_invalid_token" || kind === "not_authorized") return false;
      if (kind === "transient") return failureCount < 4;
      return false;
    },
    gcTime: 1000 * 60 * 10,
    staleTime: 0,
    placeholderData: undefined,
  });

  const successResult =
    resultsQuery.data && (resultsQuery.data as any).ok === true
      ? (resultsQuery.data as ResultsSuccessPayload)
      : null;
  const scoringPending =
    (resultsQuery.data as any)?.ok === false && (resultsQuery.data as any).code === "SCORING_ROWS_MISSING";

  const derivedState = useMemo(() => {
    if (successResult) return { data: successResult as ResultsPayload, err: null as string | null };
    if (scoringPending) return { data: null as ResultsPayload | null, err: "Results updating—recompute required." };
    return { data: null as ResultsPayload | null, err: null as string | null };
  }, [successResult, scoringPending]);

  let err: string | null = derivedState.err;
  let errKind: RpcErrorCategory | null = null;
  let data: ResultsPayload | null = derivedState.data;

  if (resultsQuery.error) {
    let kind = classifyRpcError(resultsQuery.error);
    // If share token missing but user is logged in, call it not_authorized (owner path)
    if (kind === "expired_or_invalid_token" && !hasShareToken && hasAuthSession) {
      kind = "not_authorized";
    }
    if (kind === "expired_or_invalid_token" || kind === "not_authorized") {
      err = null;
      errKind = kind;
      data = null;
    } else {
      err =
        resultsQuery.error instanceof Error && resultsQuery.error.message
          ? resultsQuery.error.message
          : "Failed to load results";
      errKind = null;
      data = null;
    }
  }

  // If neither share token nor (resolved) owner auth, show unauthorized
  const fetchPreconditionError: RpcErrorCategory | null = useMemo(() => {
    if (hasShareToken) return null;
    if (!sessionId) return null;
    if (!authStateResolved) return null;
    if (!hasAuthSession) return "not_authorized";
    return null;
  }, [authStateResolved, hasAuthSession, hasShareToken, sessionId]);

  if (!errKind && fetchPreconditionError) errKind = fetchPreconditionError;

  const isAuthResolving = !hasShareToken && !authStateResolved;
  const loading = (resultsQuery.isPending || isAuthResolving) && !data && !err && !errKind;

  if (data?.profile) {
    data = {
      ...data,
      profile: {
        ...data.profile,
        paid: Boolean(data.profile.paid),
      },
    };
  }

  const profile = data?.profile ?? undefined;

  const sessionShareToken = useMemo(() => {
    const raw = (data?.session as { share_token?: string } | undefined)?.share_token;
    if (typeof raw !== "string") return null;
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, [data?.session]);

  const navigationShareToken = hasShareToken ? shareToken!.trim() : null;
  const displayShareToken = navigationShareToken ?? sessionShareToken ?? null;

  const scoringVersion = useMemo(() => {
    if (successResult?.scoring_version && successResult.scoring_version.trim().length > 0) {
      return successResult.scoring_version.trim();
    }
    if (scoringVersionParam) return scoringVersionParam;
    if (successResult?.results_version && successResult.results_version.trim().length > 0) {
      return successResult.results_version.trim();
    }
    return null;
  }, [successResult?.results_version, successResult?.scoring_version, scoringVersionParam]);

  const buildResultsPath = useCallback(
    (token: string | null, version: string | null) => {
      const params = new URLSearchParams();
      if (token && token.trim().length > 0) params.set("t", token.trim());
      if (version && version.trim().length > 0) params.set("sv", version.trim());
      const queryString = params.toString();
      return queryString ? `/results/${sessionId}?${queryString}` : `/results/${sessionId}`;
    },
    [sessionId]
  );

  const resultsUrl = useMemo(() => {
    const path = buildResultsPath(displayShareToken, scoringVersion);
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
  }, [buildResultsPath, displayShareToken, scoringVersion]);

  const copyResultsLink = async () => {
    try {
      await navigator.clipboard.writeText(resultsUrl);
      toast({
        title: "Secure link copied!",
        description: "Your private results link has been copied to your clipboard.",
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
        description: "Your private results link has been copied to your clipboard.",
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
      const { data, error } = await supabase.rpc("rotate_results_share_token", { p_session_id: sessionId });

      if (error) {
        if (error.code === "403" || (error as any).status === 403) {
          toast({ title: "You must be signed in as the session owner to rotate the link." });
        } else if (error.code === "404" || (error as any).status === 404) {
          toast({ title: "Session not found." });
        } else {
          toast({ title: "Could not rotate link. Please try again." });
        }
        return;
      }

      const newToken = (data as any)?.share_token;
      if (!newToken) {
        toast({ title: "Could not rotate link. Please try again." });
        return;
      }

      queryClient.removeQueries({ queryKey: resultsQueryKeys.sessionScope(sessionId) });
      setShareToken(newToken);
      const nextPath = buildResultsPath(newToken, scoringVersion);
      navigate(nextPath, { replace: true });
      toast({ title: "New secure link generated." });
    } catch {
      toast({ title: "Could not rotate link. Please try again." });
    } finally {
      setRotating(false);
    }
  }, [buildResultsPath, navigate, queryClient, scoringVersion, sessionId]);

  // Keep URL in sync once version is known
  useEffect(() => {
    if (!sessionId) return;
    if (!scoringVersion) return;
    const desiredPath = buildResultsPath(navigationShareToken, scoringVersion);
    const currentPath = `${location.pathname}${location.search}`;
    if (currentPath === desiredPath) return;
    navigate(desiredPath, { replace: true });
  }, [buildResultsPath, location.pathname, location.search, navigationShareToken, navigate, scoringVersion, sessionId]);

  // Live updates: invalidate queries on relevant table changes
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`results-session-${sessionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assessment_sessions", filter: `id=eq.${sessionId}` },
        () => queryClient.invalidateQueries({ queryKey: resultsQueryKeys.sessionScope(sessionId), exact: false })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: `session_id=eq.${sessionId}` },
        () => queryClient.invalidateQueries({ queryKey: resultsQueryKeys.sessionScope(sessionId), exact: false })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scoring_results_types", filter: `session_id=eq.${sessionId}` },
        () => queryClient.invalidateQueries({ queryKey: resultsQueryKeys.sessionScope(sessionId), exact: false })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scoring_results_functions", filter: `session_id=eq.${sessionId}` },
        () => queryClient.invalidateQueries({ queryKey: resultsQueryKeys.sessionScope(sessionId), exact: false })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scoring_results_state", filter: `session_id=eq.${sessionId}` },
        () => queryClient.invalidateQueries({ queryKey: resultsQueryKeys.sessionScope(sessionId), exact: false })
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, sessionId]);

  // Analytics
  useEffect(() => {
    if (profile) trackResultsViewed(sessionId, (profile as any)?.type_code);
  }, [profile, sessionId]);

  // Ensure owner session is linked (non-preview, owner mode)
  useEffect(() => {
    if (IS_PREVIEW) return;
    if (hasShareToken) return;
    if (!data) return;
    if (linkAttemptedRef.current) return;

    let cancelled = false;
    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user || cancelled) return;

      linkAttemptedRef.current = true;
      await ensureSessionLinked({
        sessionId,
        userId: user.id,
        email: user.email ?? undefined,
      });
    })();

    return () => { cancelled = true; };
  }, [data, sessionId, hasShareToken]);

  // ----- Render states -----
  if (errKind) {
    const content =
      errKind === "expired_or_invalid_token"
        ? {
            title: "This results link has expired or was rotated",
            message: "Ask the owner for a fresh link, or sign in (if you’re the owner) to view your results.",
          }
        : {
            title: "You’re not authorized to view these results",
            message: "Sign in with the account that owns this assessment, or request a share link from the owner.",
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
              <Button variant="outline" onClick={() => navigate("/assessment?start=true")}>
                Retake assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (err) {
    // Check if this is a scoring-related error and trigger scoring
    if (err.includes("Results updating") || err.includes("SCORING_ROWS_MISSING") || 
        err.includes("cache_miss") || err.includes("scoring_needed")) {
      triggerScoring(sessionId);
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 space-y-4 text-center">
            <h2 className="text-lg font-semibold">Unable to load results</h2>
            <p className="text-muted-foreground">{err}</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={() => window.location.reload()}>
                Refresh page
              </Button>
              <Button variant="outline" onClick={() => navigate("/assessment?start=true")}>
                Retake assessment
              </Button>
              <Button 
                variant="outline" 
                onClick={() => triggerScoring(sessionId)}
                disabled={!sessionId}
              >
                Trigger Scoring
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  if (loading && !data) return <div className="p-8">Loading…</div>;
  if (!data) return <div className="p-8">No results available.</div>;

  const fullResults = (
    <div className="min-h-screen bg-background">
      {query.get("debug") === "1" && profile && (
        <div className="fixed top-2 right-2 bg-black/70 text-white text-xs p-2 rounded">
          <div>version: {profile?.version}</div>
          <div>fc_source: {profile?.fc_source || "none"}</div>
          <div>
            {profile?.top_types
              ?.slice(0, 3)
              .map((t: any) => `${t.code}:${Number(t.share).toFixed(3)}`)
              .join(" ")}
          </div>
        </div>
      )}

      <div className="py-8 px-4 space-y-6">
        <div id="results-content">
          <ResultsView
            profile={profile as any}
            types={data.types}
            functions={data.functions}
            state={data.state}
            resultsVersion={data.results_version}
          />
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

  return (
    <PaywallGuard profile={profile} sessionId={sessionId}>
      {fullResults}
    </PaywallGuard>
  );
}
