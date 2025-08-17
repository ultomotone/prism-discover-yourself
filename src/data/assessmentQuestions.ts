export interface Question {
  id: number;
  text: string;
  type: 'likert' | 'multiple-choice' | 'attention-check' | 'demographic' | 'scale';
  options?: string[];
  required: boolean;
  section: string;
}

export const assessmentQuestions: Question[] = [
  // State & Context Questions (1-5)
  {
    id: 1,
    text: "Right now, my stress level is...",
    type: 'scale',
    options: ['Very Low', 'Low', 'Moderate', 'High', 'Very High'],
    required: true,
    section: 'Current State'
  },
  {
    id: 2,
    text: "Right now, my mood is...",
    type: 'scale',
    options: ['Very Negative', 'Negative', 'Neutral', 'Positive', 'Very Positive'],
    required: true,
    section: 'Current State'
  },
  {
    id: 3,
    text: "In the last 24 hours, my sleep quality was...",
    type: 'scale',
    options: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'],
    required: true,
    section: 'Current State'
  },
  {
    id: 4,
    text: "At this moment, I feel time pressure is...",
    type: 'scale',
    options: ['None', 'Minimal', 'Moderate', 'High', 'Overwhelming'],
    required: true,
    section: 'Current State'
  },
  {
    id: 5,
    text: "Right now, my ability to focus is...",
    type: 'scale',
    options: ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'],
    required: true,
    section: 'Current State'
  },
  
  // Preference Questions (6-13)
  {
    id: 6,
    text: "Which feels more natural?",
    type: 'multiple-choice',
    options: ['Internal logical analysis', 'External practical effectiveness'],
    required: true,
    section: 'Core Preferences'
  },
  {
    id: 7,
    text: "Which feels more natural?",
    type: 'multiple-choice',
    options: ['Personal values and authenticity', 'Group harmony and connection'],
    required: true,
    section: 'Core Preferences'
  },
  {
    id: 8,
    text: "Which feels more natural?",
    type: 'multiple-choice',
    options: ['Following inner vision and patterns', 'Exploring multiple possibilities'],
    required: true,
    section: 'Core Preferences'
  },
  {
    id: 9,
    text: "Which feels more natural?",
    type: 'multiple-choice',
    options: ['Maintaining steady routines', 'Taking decisive action in the moment'],
    required: true,
    section: 'Core Preferences'
  },
  {
    id: 10,
    text: "When making a tough call, I prioritize…",
    type: 'multiple-choice',
    options: ['Logical analysis', 'Values alignment', 'Practical outcomes', 'Group consensus'],
    required: true,
    section: 'Core Preferences'
  },
  {
    id: 11,
    text: "When leading others, I lean more on…",
    type: 'multiple-choice',
    options: ['Clear structure and goals', 'Inspiring vision', 'Team harmony', 'Adaptable tactics'],
    required: true,
    section: 'Core Preferences'
  },
  {
    id: 12,
    text: "My default compass is…",
    type: 'multiple-choice',
    options: ['Internal logic', 'Personal values', 'External results', 'Group dynamics'],
    required: true,
    section: 'Core Preferences'
  },
  {
    id: 13,
    text: "To move forward, I tend to…",
    type: 'multiple-choice',
    options: ['Analyze thoroughly first', 'Trust my gut feeling', 'Check external data', 'Sense the group mood'],
    required: true,
    section: 'Core Preferences'
  },
  
  // Attention Check Questions (14-16)
  {
    id: 14,
    text: "Attention check: Please select \"Agree\".",
    type: 'attention-check',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Attention Checks'
  },
  {
    id: 15,
    text: "Attention check: To show attention, choose \"4\".",
    type: 'attention-check',
    options: ['1', '2', '3', '4', '5'],
    required: true,
    section: 'Attention Checks'
  },
  {
    id: 16,
    text: "Attention check: Please select \"Strongly Disagree\".",
    type: 'attention-check',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Attention Checks'
  },
  
  // Information Element Strength Questions (17-48)
  {
    id: 17,
    text: "I enjoy refining logical structure.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Cognitive Functions'
  },
  {
    id: 18,
    text: "I dislike spending time clarifying concepts.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Cognitive Functions'
  },
  {
    id: 19,
    text: "I naturally read the room's emotions.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Cognitive Functions'
  },
  {
    id: 20,
    text: "I usually miss shifts in group mood.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Cognitive Functions'
  },
  {
    id: 21,
    text: "I act effectively under time pressure.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Cognitive Functions'
  },
  {
    id: 22,
    text: "I freeze when rapid action is needed.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Cognitive Functions'
  },
  {
    id: 23,
    text: "I prefer familiar routines that keep me steady.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Cognitive Functions'
  },
  {
    id: 24,
    text: "I feel comfortable abandoning routines often.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Cognitive Functions'
  },
  
  // Social Desirability Check (25-30)
  {
    id: 25,
    text: "I have never told a lie.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Validity Checks'
  },
  {
    id: 26,
    text: "I always keep every promise I make.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Validity Checks'
  },
  {
    id: 27,
    text: "I never feel angry with anyone.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Validity Checks'
  },
  {
    id: 28,
    text: "I am always courteous, even to disagreeable people.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Validity Checks'
  },
  {
    id: 29,
    text: "I never make mistakes.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Validity Checks'
  },
  {
    id: 30,
    text: "I am completely unbiased in my judgments.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Validity Checks'
  },
  
  // Core Structural Logic (Ti) Questions (31-36)
  {
    id: 31,
    text: "I refine ideas until they're internally consistent.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Structural Logic'
  },
  {
    id: 32,
    text: "I spot logical gaps quickly.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Structural Logic'
  },
  {
    id: 33,
    text: "I enjoy building clean conceptual frameworks.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Structural Logic'
  },
  {
    id: 34,
    text: "I'd rather understand why than just follow steps.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Structural Logic'
  },
  {
    id: 35,
    text: "Precise definitions matter to me.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Structural Logic'
  },
  {
    id: 36,
    text: "Elegant logic beats expedient fixes.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Structural Logic'
  },
  
  // Pragmatic Logic (Te) Questions (37-42)
  {
    id: 37,
    text: "I structure tasks for efficiency.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Pragmatic Logic'
  },
  {
    id: 38,
    text: "Clear procedures and deadlines motivate me.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Pragmatic Logic'
  },
  {
    id: 39,
    text: "I cut unnecessary steps to hit goals.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Pragmatic Logic'
  },
  {
    id: 40,
    text: "I organize people/resources to deliver results.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Pragmatic Logic'
  },
  {
    id: 41,
    text: "I decide based on external facts and metrics.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Pragmatic Logic'
  },
  {
    id: 42,
    text: "I measure success by outcomes.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Pragmatic Logic'
  }
];

// Note: This is a partial implementation - the full 247 questions would be quite extensive.
// I'll continue with the structure but focus on the core assessment framework first.