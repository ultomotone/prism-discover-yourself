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
            <Button onClick={() => navigate("/assessment?start=true")}>
              Take Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [shareToken, setShareToken] = useState<string | null>(query.get("t") ?? null);
  const [hasAuthSession, setHasAuthSession] = useState(false);
  const [authStateResolved, setAuthStateResolved] = useState(false);
  const [rotating, setRotating] = useState(false);
  const linkAttemptedRef = useRef(false);

  const hasShareToken = useMemo(
    () => typeof shareToken === "string" && shareToken.trim().length > 0,
    [shareToken]
  );
  const tokenKey = useMemo(
    () => (hasShareToken ? shareToken!.trim() : "no-token"),
    [hasShareToken, shareToken]
  );

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

  const resultsQuery = useQuery<ResultsFetchPayload | undefined>({
    queryKey: resultsQueryKeys.session(sessionId, tokenKey, undefined),
    queryFn: () => {
      if (!sessionId) throw new Error("sessionId is required");
      if (hasShareToken) return fetchSharedResultBySession(sessionId, shareToken!.trim());
      return fetchOwnerResultBySession(sessionId);
    },
    enabled: Boolean(sessionId && (hasShareToken || authStateResolved)),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: (currentData) => {
      const data = currentData as any;
      if (!data) return 2000;
      if (data.ok === false && data.code === "SCORING_ROWS_MISSING") return 2000;
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
    if (kind === "expired_or_invalid_token" && !hasShareToken && hasAuthSession) {
      kind = "not_authorized";
    }
    if (kind === "expired_or_invalid_token" || kind === "not_authorized") {
      err = null;
      errKind = kind;
      data = null;
    } else {
      err = resultsQuery.error instanceof Error && resultsQuery.error.message
        ? resultsQuery.error.message
        : "Failed to load results";
      errKind = null;
      data = null;
    }
  }

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

  // Auto-trigger scoring if results are missing
  useEffect(() => {
    if (err?.includes("Results updating") || err?.includes("SCORING_ROWS_MISSING") || 
        err?.includes("cache_miss") || err?.includes("scoring_needed") || scoringPending) {
      console.log('🚀 Auto-triggering scoring for missing results...');
      triggerScoring(sessionId);
    }
  }, [err, scoringPending, sessionId]);

  // ----- Render states -----
  if (errKind) {
    const content = errKind === "expired_or_invalid_token"
      ? {
          title: "This results link has expired or was rotated",
          message: "Ask the owner for a fresh link, or sign in (if you're the owner) to view your results.",
        }
      : {
          title: "You're not authorized to view these results",
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
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 space-y-4 text-center">
            <h2 className="text-lg font-semibold">Processing Your Results</h2>
            <p className="text-muted-foreground">
              {err.includes("scoring_needed") || err.includes("SCORING_ROWS_MISSING") || scoringPending
                ? "Your assessment results are being computed. This usually takes 10-30 seconds..."
                : err}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={() => window.location.reload()}>
                Refresh page
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
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 space-y-4 text-center">
            <h2 className="text-lg font-semibold">No Results Available</h2>
            <p className="text-muted-foreground">
              Unable to find results for this session.
            </p>
            <Button onClick={() => triggerScoring(sessionId)}>
              Generate Results
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PaywallGuard profile={profile} sessionId={sessionId}>
      <div className="min-h-screen bg-background">
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
        </div>
      </div>
    </PaywallGuard>
  );
}