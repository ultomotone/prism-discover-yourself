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
import { visibleIf, getVisibleQuestions, getVisibleQuestionCount, getVisibleQuestionIndex } from "@/lib/visibility";
import { getPrismConfig, PrismConfig } from "@/services/prismConfig";
import { saveResponseIdempotent, loadSessionResponses, calculateNextQuestionIndex } from "@/services/assessmentSaves";
import { ErrorSummary } from "./ErrorSummary";
import { EmailSavePrompt } from "./EmailSavePrompt";
import { SessionConflictModal } from "./SessionConflictModal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save } from "lucide-react";

export interface AssessmentResponse {
  questionId: number;
  answer: string | number | string[] | number[];
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
  const [sessionConflict, setSessionConflict] = useState<{
    type: 'resume' | 'recent_completion' | null;
    email: string;
    daysSinceCompletion?: number;
  }>({ type: null, email: '' });
  const [validationResult, setValidationResult] = useState<ValidationPayload | null>(null);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [prismConfig, setPrismConfig] = useState<PrismConfig | null>(null);
  const { toast } = useToast();

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
      console.log('Loading existing session:', sessionId);
      setIsResumingSession(true);
      
      // Load session data and responses
      const [sessionResult, responsesData] = await Promise.all([
        supabase
          .from('assessment_sessions')
          .select('*')
          .eq('id', sessionId)
          .maybeSingle(),
        loadSessionResponses(sessionId)
      ]);

      const { data: session, error: sessionError } = sessionResult;

      if (sessionError || !session) {
        console.error('Session load issue, falling back to local cache:', sessionError);
        try {
          const cached = JSON.parse(localStorage.getItem('prism_last_session') || '{}');
          const idx = Math.min(Number(cached?.completed_questions) || 0, visibleQuestions.length - 1);
          setSessionId(sessionId);
          setResponses([]); // responses will be re-captured going forward
          setCurrentQuestionIndex(idx);
          setQuestionStartTime(Date.now());
          toast({
            title: "Resumed Locally",
            description: `Continuing from question ${idx + 1}. Your progress is saved locally and will sync as you continue.`,
          });
        } catch (e) {
          console.warn('No valid local cache available; returning to intro');
          localStorage.removeItem('prism_last_session');
          toast({
            title: "Session Expired",
            description: "Your saved assessment could not be found. Please start a new assessment.",
            variant: "destructive",
          });
          if (onBack) onBack();
        }
        setIsResumingSession(false);
        return;
      }

      console.log('Loaded session data:', session);
      console.log('Loaded responses:', responsesData.length);

      // Use actual responses to calculate next question, not just completed_questions count
      const nextIndex = calculateNextQuestionIndex(visibleQuestions.length, responsesData);
      console.log('Calculated next question index:', nextIndex);

      // Set state with loaded data
      setSessionId(sessionId);
      setResponses(responsesData);
      setCurrentQuestionIndex(nextIndex);
      setQuestionStartTime(Date.now());
      const { data: responses, error: responsesError } = await supabase
        .from('assessment_responses')
        .select('question_id, answer_value, answer_numeric, answer_array, answer_object')
        .eq('session_id', sessionId)
        .order('question_id');

      if (responsesError) {
        console.error('Error loading responses:', responsesError);
      }

      console.log('Loaded responses:', responses);
      console.log('Session completed_questions:', session.completed_questions);

      // Convert responses to the expected format
      const loadedResponses: AssessmentResponse[] = responses?.map(r => {
        let answer: string | number | string[] | number[] = '';
        
        if (r.answer_array) {
          answer = r.answer_array;
        } else if (r.answer_numeric !== null) {
          answer = r.answer_numeric;
        } else if (r.answer_object && typeof r.answer_object === 'object' && r.answer_object !== null) {
          const answerObj = r.answer_object as { matrix_answers?: any };
          answer = answerObj.matrix_answers || [];
        } else {
          answer = r.answer_value || '';
        }
        
        return {
          questionId: r.question_id,
          answer: answer
        };
      }) || [];

      setSessionId(sessionId);
      setResponses(loadedResponses);
      
      // Set current question index to the next unanswered question
      const nextQuestionIndex = Math.min(
        session.completed_questions || 0,
        assessmentQuestions.length - 1
      );
      
      console.log('Calculated nextQuestionIndex:', nextQuestionIndex);
      console.log('Total loaded responses:', loadedResponses.length);
      console.log('About to call setCurrentQuestionIndex with:', nextQuestionIndex);
      
      // Important: Set the question index BEFORE setting isResumingSession to false
      setCurrentQuestionIndex(nextQuestionIndex);
      setQuestionStartTime(Date.now());

      console.log('Current question index set, showing toast...');
      toast({
        title: "Assessment Resumed",
        description: `Continuing from question ${nextQuestionIndex + 1}`,
      });
      
      setIsResumingSession(false);
    } catch (error) {
      console.error('Error loading existing session:', error);
      toast({
        title: "Failed to Load",
        description: "Could not load saved assessment. Starting a new one.",
        variant: "destructive",
      });
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
      }
    };

    initializeSession();
  }, [toast, resumeSessionId]);
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
  }, [currentQuestionIndex, responses, currentQuestion?.id, isResumingSession]);

  const saveResponseToSupabase = async (response: AssessmentResponse, responseTime: number) => {
    if (!sessionId) return;

    try {
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
        }
      } else {
        console.log('🔥 REGULAR PROGRESS UPDATE');
        console.log('🔥 Current question index:', currentQuestionIndex);
        console.log('🔥 Current answer:', currentAnswer);
        
        // Update session progress normally
        const progressResult = await updateSessionProgress();
        console.log('🔥 PROGRESS UPDATE RESULT:', progressResult);
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
      // Check for session conflicts first
      const { data, error } = await supabase.functions.invoke('start_assessment', {
        body: { email, force_new: false }
      });

      if (error) {
        console.error('❌ Error checking session conflicts:', error);
        toast({
          title: "Error",
          description: "Failed to check existing sessions. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Handle different response scenarios
      if (data.status === 'resumed') {
        // User has an active session
        setSessionConflict({
          type: 'resume',
          email: email
        });
        return;
      }

      if (data.has_recent_completion) {
        // User has recent completion
        setSessionConflict({
          type: 'recent_completion',
          email: email,
          daysSinceCompletion: data.days_since_completion
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

          {/* Question Card */}
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

          {/* Navigation */}
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
    </div>
  );
}