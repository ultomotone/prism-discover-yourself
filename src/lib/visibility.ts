import { Question } from "@/data/assessmentQuestions";

/**
 * Determines if a question should be visible in the assessment
 * Hidden questions are excluded from rendering, counts, and validation
 */
export function visibleIf(question: Question): boolean {
  // Hide question id 133 (contains Ni reference)
  if (question.id === 133) {
    return false;
  }
  
  // Hide questions tagged with 'Ni'
  if (question.tag === 'Ni') {
    return false;
  }
  
  // Hide questions with meta.hidden = true
  if (question.meta?.hidden === true) {
    return false;
  }
  
  return true;
}

/**
 * Filters questions array to only include visible items
 */
export function getVisibleQuestions(questions: Question[]): Question[] {
  return questions.filter(visibleIf);
}

/**
 * Gets the display index for a question (excluding hidden questions)
 */
export function getVisibleQuestionIndex(questions: Question[], targetQuestionId: number): number {
  const visibleQuestions = getVisibleQuestions(questions);
  return visibleQuestions.findIndex(q => q.id === targetQuestionId);
}

/**
 * Gets the total count of visible questions  
 */
export function getVisibleQuestionCount(questions: Question[]): number {
  return getVisibleQuestions(questions).length;
}