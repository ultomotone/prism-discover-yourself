import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { validateAssessmentStructure, validateQuestionResponse, ValidationResult } from '@/utils/assessmentValidation';
import { validatePrismAssessment, logValidationEvent, ValidationPayload } from '@/utils/prismValidation';
import { assessmentQuestions, Question } from "@/data/assessmentQuestions";
import { getAssessmentLibrary } from "@/lib/questions/getAssessmentLibrary";
import { QuestionComponent } from "./QuestionComponent";
import { ProgressCard } from "./ProgressCard";
import { FCBlockManager } from "./FCBlockManager";
import { visibleIf, getVisibleQuestions, getVisibleQuestionCount, getVisibleQuestionIndex } from "@/lib/visibility";
import { getPrismConfig, PrismConfig } from "@/services/prismConfig";
import { saveResponseIdempotent } from "@/services/assessmentSaves";
import { isRealFCBlock } from "@/services/fcBlockService";
import { ErrorSummary } from "./ErrorSummary";
import { EmailSavePrompt } from "./EmailSavePrompt";
import { SessionConflictModal } from "./SessionConflictModal";
import { AccountLinkPrompt } from "./AccountLinkPrompt";
import { useToast } from "@/hooks/use-toast";
import { useEmailSessionManager } from "@/hooks/useEmailSessionManager";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { Save } from "lucide-react";
import { trackAssessmentStart, trackAssessmentProgress } from "@/lib/analytics";

export interface AssessmentResponse {
  questionId: number | string;
  answer: string | number | string[] | number[];
}

async function loadResponsesForSession(sessionId: string) {
  try {
    const { data: fnData, error: fnErr } = await supabase.functions.invoke(
      "load-session-responses",
      { body: { session_id: sessionId } }
    );
    if (!fnErr && Array.isArray(fnData) && fnData.length > 0) return fnData;
  } catch (e) {
    console.warn("Edge function failed; falling back to direct query.", e);
  }

  const { data, error } = await supabase
    .from("assessment_responses")
    .select("*")
    .eq("session_id", sessionId)
    .order("question_order", { ascending: true });

  if (error) {
    console.error("Direct responses query failed:", error);
    return [];
  }
  return data ?? [];
}

interface AssessmentFormProps {
  onComplete: (responses: AssessmentResponse[], sessionId: string) => void;
  onBack?: () => void;
  onSaveAndExit?: () => void;
  resumeSessionId?: string;
}

export function AssessmentForm({ onComplete, onBack, onSaveAndExit, resumeSessionId }: AssessmentFormProps) {
  console.log('AssessmentForm component mounting with resumeSessionId:', resumeSessionId);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string | number | string[] | number[]>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResumingSession, setIsResumingSession] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);
  const [capturedEmail, setCapturedEmail] = useState<string>('');
  const [sessionConflict, setSessionConflict] = useState<{
    type: 'resume' | 'recent_completion' | null;
    email: string;
    daysSinceCompletion?: number;
  }>({ type: null, email: '' });
  const [validationResult, setValidationResult] = useState<ValidationPayload | null>(null);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [prismConfig, setPrismConfig] = useState<PrismConfig | null>(null);
  const [showFCBlocks, setShowFCBlocks] = useState(false);
  const [fcCompleted, setFCCompleted] = useState(false);
  const [fcData, setFCData] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { startAssessmentSession, linkSessionToAccount } = useEmailSessionManager();
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filter to visible questions with comprehensive library
  const [assessmentLibrary, setAssessmentLibrary] = useState<Question[]>([]);
  const [libraryLoaded, setLibraryLoaded] = useState(false);
  
  // Load comprehensive library on mount
  useEffect(() => {
    const loadLibrary = async () => {
      try {
        const library = await getAssessmentLibrary();
        setAssessmentLibrary(library);
        setLibraryLoaded(true);
        console.log('📚 Assessment library loaded:', library.length, 'questions');
      } catch (error) {
        console.error('💥 Library load failed, using fallback:', error);
        setAssessmentLibrary(assessmentQuestions);
        setLibraryLoaded(true);
      }
    };
    
    loadLibrary();
  }, []);
  
  const visibleQuestions = libraryLoaded ? getVisibleQuestions(assessmentLibrary) : [];
  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const progress = visibleQuestions.length > 0 ? ((currentQuestionIndex + 1) / visibleQuestions.length) * 100 : 0;
  const isLastQuestion = currentQuestionIndex === visibleQuestions.length - 1;
  
  // Get current section questions for progress within section
  const currentSection = currentQuestion?.section;
  const sectionQuestions = assessmentLibrary.filter(q => q.section === currentSection);
  const sectionProgress = sectionQuestions.findIndex(q => q.id === currentQuestion?.id) + 1;

  
  const loadExistingSession = async (sessionId: string) => {
    try {
      setIsResumingSession(true);
      const data = await loadResponsesForSession(sessionId);

      if (!data || data.length === 0) {
        setIsResumingSession(false);
        setSessionId(sessionId);
        setResponses([]);
        setCurrentQuestionIndex(0);
        return;
      }

      const mapped = data.map((r: any) => ({
        questionId: r.question_id,
        answer: r.answer_array || r.answer_numeric || r.answer_value || ''
      }));
      const last = Math.max(0, data.reduce((m: number, r: any) => Math.max(m, r.question_order ?? 0), 0));
      setSessionId(sessionId);
      setResponses(mapped);
      setCurrentQuestionIndex(last);
      setQuestionStartTime(Date.now());
      setIsResumingSession(false);
    } catch (error) {
      console.error('Error loading existing session:', error);
      setIsResumingSession(false);
    }
  };

  // Initialize assessment session on component mount
  useEffect(() => {
    console.log('AssessmentForm useEffect triggered with resumeSessionId:', resumeSessionId);
    
    const initializeSession = async () => {
      try {
        console.log('Initializing assessment session...');
        
        // If resuming a session, load existing session data
        if (resumeSessionId) {
          console.log('Attempting to resume session:', resumeSessionId);
          await loadExistingSession(resumeSessionId);
          return;
        }
        
        console.log('Creating new session...');
        
        // Get current user (null if anonymous)
        const { data: { user } } = await supabase.auth.getUser();
        
        // Check if user needs to authenticate for scoring
        if (!user) {
          console.warn('⚠️ User not authenticated - assessment will be limited');
          toast({
            title: "Sign Up for Full Results",
            description: "Create an account to save your assessment and get detailed scoring results.",
          });
        }
        
        // Generate UUIDs with fallback for browser compatibility
        const generateUUID = () => {
          if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
          }
          // Fallback for browsers without crypto.randomUUID
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        };
        
        const newId = generateUUID();
        const shareToken = generateUUID();
        
        console.log('Generated session ID:', newId);
        console.log('Generated share token:', shareToken);
        
        const { error } = await supabase
          .from('assessment_sessions')
          .insert({
            id: newId,
            user_id: user?.id || null,
            session_type: 'prism',
            total_questions: visibleQuestions.length,
            share_token: shareToken,
            metadata: {
              browser: navigator.userAgent,
              timestamp: new Date().toISOString(),
              anonymous: !user?.id
            }
          });

        if (error) {
          console.error('Error creating session:', error);
          console.error('Error details:', error.message, error.code, error.details);
          toast({
            title: "Failed to Initialize",
            description: "Could not start assessment session. Please refresh the page and try again.",
            variant: "destructive",
          });
          return;
        }

console.log('Session initialized successfully:', newId);
setSessionId(newId);
setQuestionStartTime(Date.now());

// Track assessment start
trackAssessmentStart(newId);

// Local fallback: remember latest session
try {
  localStorage.setItem('prism_last_session', JSON.stringify({
    id: newId,
    completed_questions: 0,
    email: null,
    updated_at: new Date().toISOString()
  }));
  console.log('🗄️ Stored local fallback for session:', newId);
} catch (e) {
  console.warn('Failed to write local session cache', e);
}
      } catch (error) {
        console.error('Error initializing session:', error);
        toast({
          title: "Failed to Initialize",
          description: "An unexpected error occurred. Please refresh the page and try again.",
          variant: "destructive",
        });
        setLoadError('Failed to start assessment. Please try again.');
      }
    };

    initializeSession();
  }, [toast, resumeSessionId]);

  useEffect(() => {
    if (loadError || currentQuestion) return;
    const t = setTimeout(
      () => setLoadError('Failed to load assessment. Please try again.'),
      30000,
    );
    return () => clearTimeout(t);
  }, [currentQuestion, loadError]);
  useEffect(() => {
    const loadConfig = async () => {
      const config = await getPrismConfig();
      setPrismConfig(config);
      console.log('Loaded PRISM config:', config);
    };
    
    loadConfig();
  }, []);
  
  useEffect(() => {
    console.log('Question change useEffect triggered. Current question index:', currentQuestionIndex);
    console.log('Current question ID:', currentQuestion?.id);
    console.log('Current responses:', responses);
    console.log('IsResumingSession:', isResumingSession);
    
    // Don't reset answers if we're in the middle of resuming a session
    if (isResumingSession) {
      console.log('Skipping question change logic because we are resuming session');
      return;
    }

    // Check if we've reached the FC section
    if (currentQuestion && isRealFCBlock(currentQuestion) && !showFCBlocks && !fcCompleted) {
      console.log('Detected real FC block, switching to FC block manager');
      setShowFCBlocks(true);
      return;
    }
    
    // Reset question start time when moving to a new question
    setQuestionStartTime(Date.now());
    
    // Load existing response if it exists - use CONTROLLED state always
    const existingResponse = responses.find(r => r.questionId === currentQuestion?.id);
    console.log('Found existing response for question', currentQuestion?.id, ':', existingResponse);
    
    if (existingResponse) {
      console.log('Setting current answer to existing response:', existingResponse.answer);
      setCurrentAnswer(existingResponse.answer);
    } else {
      // Initialize based on question type - ALWAYS controlled (never undefined)
      if (currentQuestion?.type === 'matrix' || currentQuestion?.type === 'select-all' || currentQuestion?.type === 'ranking') {
        console.log('Initializing controlled array answer for question type:', currentQuestion?.type);
        setCurrentAnswer([]); // Controlled array
      } else {
        console.log('Initializing controlled string answer');
        setCurrentAnswer(''); // Controlled string (never null or undefined)
      }
    }
  }, [currentQuestionIndex, responses, currentQuestion?.id, isResumingSession, showFCBlocks, fcCompleted]);

  const saveResponseToSupabase = async (response: AssessmentResponse, responseTime: number) => {
    if (!sessionId) return;

    try {
      // Handle real FC blocks differently - save to fc_responses
      if (currentQuestion.type?.startsWith('forced-choice-') && 
          currentQuestion.section?.toLowerCase().includes('work style')) {
        console.log('Saving FC response to fc_responses table');
        
        // For real FC blocks, we need to find the matching block and option
        const { data: fcBlocks } = await supabase
          .from('fc_blocks')
          .select('id, code')
          .eq('version', 'v1.1')
          .eq('is_active', true);

        const { data: fcOptions } = await supabase
          .from('fc_options')
          .select('id, block_id, option_code, prompt');

        // Try to match the response to a real FC block/option
        // This is a transitional approach while we migrate to RealFCBlock component
        if (fcBlocks && fcOptions) {
          const matchingBlock = fcBlocks.find(b => 
            currentQuestion.tag?.includes(b.code) || 
            currentQuestion.text?.includes(b.code)
          );
          
          if (matchingBlock) {
            const blockOptions = fcOptions.filter(o => o.block_id === matchingBlock.id);
            const selectedOption = blockOptions.find(o => 
              response.answer.toString().includes(o.option_code) ||
              response.answer.toString().includes(o.prompt.substring(0, 20))
            );

            if (selectedOption) {
              const { error: fcError } = await supabase
                .from('fc_responses')
                .upsert({
                  session_id: sessionId,
                  block_id: matchingBlock.id,
                  option_id: selectedOption.id,
                  answered_at: new Date().toISOString()
                });

              if (fcError) {
                console.error('Error saving FC response:', fcError);
              } else {
                console.log('FC response saved successfully');
                // Also save to regular responses for compatibility
              }
            }
          }
        }
      }

      // Regular response saving (for all questions including FC for compatibility)
      const responseData: any = {
        session_id: sessionId,
        question_id: response.questionId,
        question_text: currentQuestion.text,
        question_type: currentQuestion.type,
        question_section: currentQuestion.section,
        response_time_ms: responseTime
      };

      // Handle different answer types
      if (Array.isArray(response.answer)) {
        if (currentQuestion.type === 'matrix') {
          responseData.answer_object = { matrix_answers: response.answer };
        } else {
          responseData.answer_array = response.answer;
        }
      } else if (typeof response.answer === 'number') {
        responseData.answer_numeric = response.answer;
        responseData.answer_value = response.answer.toString();
      } else {
        responseData.answer_value = response.answer.toString();
      }

      const { error } = await supabase
        .from('assessment_responses')
        .insert(responseData);

      if (error) {
        console.error('Error saving response:', error);
        // Don't show error to user for individual responses to avoid interrupting flow
      }
    } catch (error) {
      console.error('Error saving response to Supabase:', error);
    }
  };

  const updateSessionProgress = async () => {
    if (!sessionId) return;
    
    try {
      console.log('🟡 Updating session progress for:', sessionId);
      console.log('🟡 Current question index + 1:', currentQuestionIndex + 1);
      
      const { error } = await supabase
        .from('assessment_sessions')
        .update({
          completed_questions: currentQuestionIndex + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
        
      if (error) {
        console.error('🟡 SESSION PROGRESS UPDATE ERROR:', error);
      } else {
        console.log('🟡 SESSION PROGRESS UPDATED SUCCESSFULLY');
        try {
          const cached = JSON.parse(localStorage.getItem('prism_last_session') || '{}');
          console.log('🗄️ BEFORE: Current cached session:', cached);
          const updatedCache = {
            ...cached,
            id: sessionId,
            completed_questions: currentQuestionIndex + 1,
            updated_at: new Date().toISOString()
          };
          localStorage.setItem('prism_last_session', JSON.stringify(updatedCache));
          console.log('🗄️ AFTER: Updated cache to:', updatedCache);
        } catch (e) {
          console.warn('Failed to update local session cache', e);
        }
      }
      
      return { error };
    } catch (error) {
      console.error('🟡 Error updating session progress:', error);
      return { error };
    }
  };

  const handleAnswerChange = (answer: string | number | string[] | number[]) => {
    setCurrentAnswer(answer);
  };

  const handleAccountCreated = async (email: string, password: string) => {
    setShowAccountPrompt(false);
    
    // Link current session to the new account
    if (sessionId && user) {
      await linkSessionToAccount(sessionId, user.id, email);
    }
    
    toast({
      title: "Account Created",
      description: "Your progress has been linked to your new account. Check your email to verify.",
    });
  };

  const handleSkipAccount = () => {
    setShowAccountPrompt(false);
    toast({
      title: "Continuing Without Account",
      description: "Your progress is saved locally. You can create an account later.",
    });
  };

  const handleFCCompletion = (fcCompletionData: any) => {
    console.log('FC blocks completed:', fcCompletionData);
    setFCData(fcCompletionData);
    setFCCompleted(true);
    setShowFCBlocks(false);

    // Move past all FC questions in the regular flow
    let nextIndex = currentQuestionIndex;
    while (nextIndex < visibleQuestions.length && isRealFCBlock(visibleQuestions[nextIndex])) {
      nextIndex++;
    }
    
    if (nextIndex < visibleQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
    } else {
      // We've completed all questions including FC blocks
      handleAssessmentCompletion();
    }

    toast({
      title: "Forced Choice Complete",
      description: `Coverage: ${fcCompletionData.coverageBucket} (${fcCompletionData.completedBlocks}/${fcCompletionData.totalBlocks} blocks)`,
    });
  };

  const handleAssessmentCompletion = async () => {
    console.log('Assessment completion triggered');
    
    // Prepare final responses
    const finalResponses = [...responses];
    
    // Skip processing if library not loaded yet
    if (!libraryLoaded) return;
    
    // Run final validation with comprehensive library
    console.log('🚀 Calling validatePrismAssessment...');
    const prismValidation = await validatePrismAssessment(finalResponses, assessmentLibrary);
    console.log('🚀 Validation completed. Result:', prismValidation);
    
    if (!prismValidation.ok) {
      console.log('❌ Final validation BLOCKED submission:', prismValidation.errors);
      setValidationResult(prismValidation);
      setShowValidationErrors(true);
      
      await logValidationEvent(sessionId!, prismValidation, 'block_submit');
      
      toast({
        title: "Assessment Incomplete",
        description: `${prismValidation.errors.length} issue(s) must be resolved before submission.`,
        variant: "destructive",
      });
      return;
    }
    
    console.log('✅ Final validation passed');
    
    // Handle deferred scoring case
    if (prismValidation.defer_scoring) {
      console.log('🟨 Deferred scoring mode - completing without immediate scoring');
      
      // Mark session with special status
      await supabase
        .from('assessment_sessions')
        .update({
          completed_at: new Date().toISOString(),
          completed_questions: visibleQuestions.length,
          metadata: {
            validation_status: prismValidation.validation_status,
            defer_scoring: true,
            browser: navigator.userAgent,
            completed_at: new Date().toISOString(),
            fc_data: fcData
          }
        })
        .eq('id', sessionId!);

      await logValidationEvent(sessionId!, prismValidation, 'allow_submit');
      
      // Show deferred success instead of normal completion
      setValidationResult(prismValidation);
      onComplete(finalResponses, sessionId!);
      return;
    }
    
    // Log warnings but allow completion
    if (prismValidation.warnings.length > 0) {
      console.warn('⚠️ PRISM VALIDATION WARNINGS:', prismValidation.warnings);
      setValidationResult(prismValidation);
    }
    
    await logValidationEvent(sessionId!, prismValidation, 'allow_submit');

    // Mark session as complete with FC data
    await supabase
      .from('assessment_sessions')
      .update({
        completed_at: new Date().toISOString(),
        completed_questions: visibleQuestions.length,
        metadata: {
          browser: navigator.userAgent,
          completed_at: new Date().toISOString(),
          fc_data: fcData
        }
      })
      .eq('id', sessionId!);

    // Complete assessment
    console.log('🎯 ASSESSMENT COMPLETE - CALLING onComplete');
    onComplete(finalResponses, sessionId!);
  };

  const handleNext = async () => {
    // Validate current question response
    const hasAnswer = Array.isArray(currentAnswer) ? 
      currentAnswer.length > 0 : 
      currentAnswer !== '' && currentAnswer !== null && currentAnswer !== undefined;
      
    if (!hasAnswer && currentQuestion.required) {
      toast({
        title: "Answer Required",
        description: "Please provide an answer before continuing.",
        variant: "destructive",
      });
      return;
    }

    // Validate individual question response integrity
    if (hasAnswer) {
      const questionValidation = validateQuestionResponse(currentQuestion, {
        questionId: currentQuestion.id,
        answer: currentAnswer
      });
      
      if (!questionValidation.isValid) {
        toast({
          title: "Invalid Response",
          description: questionValidation.errors[0] || "Please check your response.",
          variant: "destructive",
        });
        return;
      }
    }

    if (!sessionId) {
      toast({
        title: "Session Error", 
        description: "Assessment session not initialized. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🚀 STARTING handleNext');
      console.log('🚀 Current question:', currentQuestion?.id);
      console.log('🚀 Current answer:', currentAnswer);
      console.log('🚀 Session ID:', sessionId);
      
      const responseTime = Date.now() - questionStartTime;

      // Save current response
      const newResponse: AssessmentResponse = {
        questionId: currentQuestion.id,
        answer: currentAnswer
      };

      console.log('🚀 Saving response to Supabase:', newResponse);

      // Save to Supabase using idempotent save
      await saveResponseIdempotent({
        sessionId: sessionId,
        questionId: currentQuestion.id,
        answer: currentAnswer,
        questionText: currentQuestion.text,
        questionType: currentQuestion.type,
        questionSection: currentQuestion.section,
        responseTime
      });

      // Update local state
      setResponses(prev => {
        const filtered = prev.filter(r => r.questionId !== currentQuestion.id);
        return [...filtered, newResponse];
      });

      // Auto-save email if this is the first question and contains an email
      if (currentQuestionIndex === 0 && typeof currentAnswer === 'string' && currentAnswer.includes('@')) {
        console.log('🔥 DETECTED EMAIL ON FIRST QUESTION:', currentAnswer);
        console.log('🔥 SESSION ID:', sessionId);
        
        setCapturedEmail(currentAnswer);
        
        const updateResult = await supabase
          .from('assessment_sessions')
          .update({ 
            email: currentAnswer,
            completed_questions: currentQuestionIndex + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId);
        
        console.log('🔥 EMAIL SAVE RESULT:', updateResult);
        
        if (updateResult.error) {
          console.error('🔥 EMAIL SAVE ERROR:', updateResult.error);
        } else {
          console.log('✅ EMAIL SAVED SUCCESSFULLY');
          try {
            const cached = JSON.parse(localStorage.getItem('prism_last_session') || '{}');
            console.log('🗄️ EMAIL SAVE - BEFORE: Current cached session:', cached);
            const updatedCache = {
              ...cached,
              id: sessionId,
              email: currentAnswer,
              completed_questions: currentQuestionIndex + 1,
              updated_at: new Date().toISOString()
            };
            localStorage.setItem('prism_last_session', JSON.stringify(updatedCache));
            console.log('🗄️ EMAIL SAVE - AFTER: Updated cache to:', updatedCache);
          } catch (e) {
            console.warn('Failed to update local session cache with email', e);
          }
          toast({
            title: "Progress Saved",
            description: "Your email has been saved. Your progress will be automatically saved as you continue.",
          });

          // Show account creation prompt after a few questions if not authenticated
          if (!user && currentQuestionIndex >= 2 && Math.random() < 0.7) {
            setTimeout(() => setShowAccountPrompt(true), 2000);
          }
        }
      } else {
        console.log('🔥 REGULAR PROGRESS UPDATE');
        console.log('🔥 Current question index:', currentQuestionIndex);
        console.log('🔥 Current answer:', currentAnswer);
        
        // Update session progress normally
        const progressResult = await updateSessionProgress();
        console.log('🔥 PROGRESS UPDATE RESULT:', progressResult);
        
        // Track assessment progress
        if (sessionId) {
          trackAssessmentProgress(currentQuestionIndex, visibleQuestions.length, sessionId);
        }
      }

      if (isLastQuestion) {
        // Prepare final responses for validation
        const finalResponses = responses.filter(r => r.questionId !== currentQuestion.id);
        finalResponses.push(newResponse);
        
        console.log('🚀 LAST QUESTION - Starting final validation');
        console.log('🚀 Final responses count:', finalResponses.length);
        console.log('🚀 Session ID for validation:', sessionId);
        
        // Skip processing if library not loaded yet
        if (!libraryLoaded) return;
        
        // Run final validation with comprehensive library
        console.log('🚀 Calling validatePrismAssessment...');
        const prismValidation = await validatePrismAssessment(finalResponses, assessmentLibrary);
        console.log('🚀 Validation completed. Result:', prismValidation);
        
        if (!prismValidation.ok) {
          console.log('❌ Final validation BLOCKED submission:', prismValidation.errors);
          setValidationResult(prismValidation);
          setShowValidationErrors(true);
          
          await logValidationEvent(sessionId, prismValidation, 'block_submit');
          
          toast({
            title: "Assessment Incomplete",
            description: `${prismValidation.errors.length} issue(s) must be resolved before submission.`,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        console.log('✅ Final validation passed');
        
        // Handle deferred scoring case
        if (prismValidation.defer_scoring) {
          console.log('🟨 Deferred scoring mode - completing without immediate scoring');
          
          // Mark session with special status
          await supabase
            .from('assessment_sessions')
            .update({
              completed_at: new Date().toISOString(),
              completed_questions: visibleQuestions.length,
              metadata: {
                validation_status: prismValidation.validation_status,
                defer_scoring: true,
                browser: navigator.userAgent,
                completed_at: new Date().toISOString()
              }
            })
            .eq('id', sessionId);

          await logValidationEvent(sessionId, prismValidation, 'allow_submit');
          
          // Show deferred success instead of normal completion
          setValidationResult(prismValidation);
          onComplete(finalResponses, sessionId);
          return;
        }
        
        // Log warnings but allow completion
        if (prismValidation.warnings.length > 0) {
          console.warn('⚠️ PRISM VALIDATION WARNINGS:', prismValidation.warnings);
          setValidationResult(prismValidation);
          // Show warnings but don't block submission
        }
        
        await logValidationEvent(sessionId, prismValidation, 'allow_submit');

        // Mark session as complete
        await supabase
          .from('assessment_sessions')
          .update({
            completed_at: new Date().toISOString(),
            completed_questions: visibleQuestions.length
          })
          .eq('id', sessionId);

        // Complete assessment
        console.log('🎯 LAST QUESTION COMPLETE - CALLING onComplete');
        console.log('🎯 Final responses being passed:', finalResponses.length, 'responses');
        console.log('🎯 Session ID being passed:', sessionId);
        console.log('🎯 Is onComplete function defined?', typeof onComplete === 'function');
        
        onComplete(finalResponses, sessionId);
        console.log('🎯 onComplete called successfully');
      } else {
        // Move to next question
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error saving response:', error);
      toast({
        title: "Error",
        description: "Failed to save response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const handleSaveAndExit = () => {
    // Always show email prompt for saving
    setShowEmailPrompt(true);
  };

  const performSaveWithEmail = async (email: string) => {
    console.log('performSaveWithEmail called with:', email);
    console.log('Current sessionId:', sessionId);
    console.log('Current question index:', currentQuestionIndex);
    
    try {
      // Check for session conflicts via edge function, but do not block on failure
      let conflictData: any | null = null;
      try {
        const { data, error } = await supabase.functions.invoke('start_assessment', {
          body: { email, force_new: false }
        });
        if (error) throw error;
        conflictData = data as any;
      } catch (err) {
        console.warn('⚠️ start_assessment check failed, proceeding without conflict gate:', err);
      }

      // Handle different response scenarios when edge function is available
      if (conflictData?.status === 'resumed') {
        // User has an active session
        setSessionConflict({
          type: 'resume',
          email: email
        });
        return;
      }

      if (conflictData?.has_recent_completion) {
        // User has recent completion
        setSessionConflict({
          type: 'recent_completion',
          email: email,
          daysSinceCompletion: conflictData.days_since_completion
        });
        return;
      }

      // No conflicts, proceed with normal save
      if (!sessionId) {
        console.log('No sessionId, cannot save');
        toast({
          title: "Save Failed",
          description: "No active session to save. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setIsSaving(true);
      
      // Save current answer if there is one
      const hasAnswer = Array.isArray(currentAnswer) ? 
        currentAnswer.length > 0 : 
        currentAnswer !== '' && currentAnswer !== null && currentAnswer !== undefined;
        
      console.log('Has answer to save:', hasAnswer);
        
      if (hasAnswer) {
        const responseTime = Date.now() - questionStartTime;
        const newResponse: AssessmentResponse = {
          questionId: currentQuestion.id,
          answer: currentAnswer
        };
        
        console.log('Saving response:', newResponse);
        await saveResponseIdempotent({
          sessionId: sessionId,
          questionId: currentQuestion.id,
          answer: currentAnswer,
          questionText: currentQuestion.text,
          questionType: currentQuestion.type,
          questionSection: currentQuestion.section,
          responseTime
        });
      }

      // Update session with email and progress
      const updateData = {
        completed_questions: currentQuestionIndex + (hasAnswer ? 1 : 0),
        email: email
      };
      
      console.log('Updating session with:', updateData);
      const { error: updateError } = await supabase
        .from('assessment_sessions')
        .update(updateData)
        .eq('id', sessionId);
        
      if (updateError) {
        console.error('Error updating session:', updateError);
        throw updateError;
      }

      console.log('Save completed successfully');

      // Fire-and-forget Resend ingestion
      try {
        supabase.functions.invoke('add_to_resend', {
          headers: import.meta.env.VITE_RESEND_INGEST_TOKEN
            ? { authorization: `Bearer ${import.meta.env.VITE_RESEND_INGEST_TOKEN}` }
            : undefined,
          body: { email, source: 'assessment' }
        });
      } catch (err) {
        console.error('add_to_resend failed:', err);
      }

      // Update localStorage cache
      try {
        const finalCompletedQuestions = currentQuestionIndex + (hasAnswer ? 1 : 0);
        const cacheData = {
          id: sessionId,
          email: email,
          completed_questions: finalCompletedQuestions,
          updated_at: new Date().toISOString()
        };
        localStorage.setItem('prism_last_session', JSON.stringify(cacheData));
        console.log('🗄️ SAVE & EXIT - Updated cache to:', cacheData);
      } catch (e) {
        console.warn('Failed to update local cache during save & exit', e);
      }
      
      toast({
        title: "Assessment Saved",
        description: `Your progress has been saved to ${email}. You can continue later by entering this email.`,
      });

      setShowEmailPrompt(false);
      if (onSaveAndExit) {
        onSaveAndExit();
      }

    } catch (error) {
      console.error('Error in performSaveWithEmail:', error);
      toast({
        title: "Error",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state while library is being loaded
  if (!libraryLoaded || visibleQuestions.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-muted-foreground mt-4">Loading assessment library...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground mb-4">{loadError}</p>
          <Button onClick={() => window.location.reload()}>Try again</Button>
          {onSaveAndExit && (
            <Button variant="outline" className="ml-2" onClick={onSaveAndExit}>
              Resume later
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8">
          <p className="text-center text-muted-foreground">Loading assessment...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-8">
      <div className="prism-container">
        <div className="max-w-3xl mx-auto">
          {/* Header with Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-primary">PRISM Assessment</h1>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {visibleQuestions.length}
              </span>
            </div>
            
            <Progress value={progress} className="mb-2" />
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{currentSection}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            
            {sectionQuestions.length > 1 && (
              <div className="mt-2">
                <span className="text-xs text-muted-foreground">
                  Section Progress: {sectionProgress} of {sectionQuestions.length}
                </span>
              </div>
            )}
          </div>

          {/* Error Summary */}
          {validationResult && showValidationErrors && (
            <ErrorSummary 
              validation={validationResult}
              show={showValidationErrors}
              onDismiss={() => setShowValidationErrors(false)}
            />
          )}

          {/* Show FC Block Manager when in FC section */}
          {showFCBlocks && sessionId && (
            <FCBlockManager
              sessionId={sessionId}
              onComplete={handleFCCompletion}
              onSkip={() => {
                setShowFCBlocks(false);
                setFCCompleted(true);
                // Skip to next non-FC question
                let nextIndex = currentQuestionIndex;
                while (nextIndex < visibleQuestions.length && isRealFCBlock(visibleQuestions[nextIndex])) {
                  nextIndex++;
                }
                if (nextIndex < visibleQuestions.length) {
                  setCurrentQuestionIndex(nextIndex);
                } else {
                  handleAssessmentCompletion();
                }
              }}
            />
          )}

          {/* Regular Question Card - only show when not in FC mode */}
          {!showFCBlocks && (
            <Card className="mb-8 prism-shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">
                  {currentQuestion.text}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Progress Card with Config/Validation Info */}
                <ProgressCard 
                  validation={validationResult} 
                  config={prismConfig} 
                  isLoading={!libraryLoaded || isLoading}
                />
                
                <QuestionComponent
                  question={currentQuestion}
                  value={currentAnswer}
                  onChange={handleAnswerChange}
                />
              </CardContent>
            </Card>
          )}

          {/* Navigation - hide when showing FC blocks */}
          {!showFCBlocks && (
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {currentQuestionIndex === 0 ? 'Back to Intro' : 'Previous'}
              </Button>

              <div className="flex items-center gap-3">
                {onSaveAndExit && (
                  <Button
                    variant="outline"
                    onClick={handleSaveAndExit}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save & Exit
                  </Button>
                )}
                
                <Button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                  variant={isLastQuestion ? 'hero' : 'default'}
                >
                  {isLoading ? 'Saving...' : isLastQuestion ? 'Complete Assessment' : 'Next'}
                  {!isLastQuestion && !isLoading && <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <EmailSavePrompt 
        isOpen={showEmailPrompt}
        onSave={performSaveWithEmail}
        onSkip={() => {
          setShowEmailPrompt(false);
          if (onSaveAndExit) {
            onSaveAndExit();
          }
        }}
        onCancel={() => setShowEmailPrompt(false)}
      />

      <SessionConflictModal
        isOpen={sessionConflict.type !== null}
        onClose={() => setSessionConflict({ type: null, email: '' })}
        conflictType={sessionConflict.type}
        email={sessionConflict.email}
        daysSinceCompletion={sessionConflict.daysSinceCompletion}
        onResumeSession={() => {
          setSessionConflict({ type: null, email: '' });
          setShowEmailPrompt(false);
        }}
        onStartNew={() => {
          setSessionConflict({ type: null, email: '' });
          setShowEmailPrompt(false);
        }}
        onRetakeLater={() => {
          setSessionConflict({ type: null, email: '' });
          setShowEmailPrompt(false);
          if (onSaveAndExit) {
            onSaveAndExit();
          }
        }}
      />

      {/* Account Link Prompt */}
      <AccountLinkPrompt
        isOpen={showAccountPrompt}
        onClose={() => setShowAccountPrompt(false)}
        onAccountCreated={handleAccountCreated}
        onSkip={handleSkipAccount}
        currentEmail={capturedEmail}
      />
    </div>
  );
}