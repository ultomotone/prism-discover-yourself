// Assessment fixtures for QA testing
import { Question } from "@/data/assessmentQuestions";

export interface TestFixture {
  name: string;
  description: string;
  questions: Question[];
  expectedValidation: {
    ok: boolean;
    errorCount: number;
    warningCount: number;
  };
}

// Base question template
const createQuestion = (overrides: Partial<Question>): Question => ({
  id: 1,
  text: "Sample question",
  type: 'likert-1-5',
  options: [],
  required: false,
  section: "Test Section",
  ...overrides
});

// Happy Path - Complete valid library
export const HAPPY_PATH_FIXTURE: TestFixture = {
  name: "complete_valid_library",
  description: "Complete assessment with all required components",
  questions: [
    // Email (Required)
    createQuestion({
      id: 1,
      text: "What is your email address?",
      type: 'email',
      required: true,
      section: "Demographics"
    }),

    // Optional Q2-Q16 samples
    ...Array.from({length: 5}, (_, i) => createQuestion({
      id: 2 + i,
      text: `Optional question ${i + 1}`,
      type: 'text',
      required: false,
      section: "Demographics"
    })),

    // Core PRISM Functions (likert-1-5)
    ...['Ti_S', 'Te_S', 'Fi_S', 'Fe_S', 'Ni_S', 'Ne_S', 'Si_S', 'Se_S'].map((tag, i) => 
      createQuestion({
        id: 20 + i,
        text: `Rate your ${tag} function`,
        type: 'likert-1-5',
        tag,
        section: "Core PRISM Functions",
        scale_type: 'likert_1_5',
        options: ["1=Strongly Disagree", "2=Disagree", "3=Neutral", "4=Agree", "5=Strongly Agree"]
      })
    ),

    // Neuroticism Index (likert-1-7) 
    ...['N', 'N_R'].map((tag, i) => 
      createQuestion({
        id: 30 + i,
        text: `Neuroticism ${tag} item`,
        type: 'likert-1-7',
        tag,
        section: "Neuroticism Index",
        scale_type: 'likert_1_7',
        reverse_scored: tag.endsWith('_R'),
        options: Array.from({length: 7}, (_, j) => `${j+1}=Level ${j+1}`)
      })
    ),

    // Forced Choice (24 minimum)
    ...Array.from({length: 26}, (_, i) => 
      createQuestion({
        id: 100 + i,
        text: `FC Scenario ${i + 1}: Choose the best approach`,
        type: i % 3 === 0 ? 'forced-choice-2' : i % 3 === 1 ? 'forced-choice-4' : 'forced-choice-5',
        tag: `FC_${String(i + 1).padStart(2, '0')}`,
        section: "Situational Work Style",
        scale_type: 'forced_choice',
        fc_map: { group: `FC_${String(i + 1).padStart(2, '0')}` },
        options: i % 3 === 0 
          ? ["Option A", "Option B"]
          : i % 3 === 1 
          ? ["Option A", "Option B", "Option C", "Option D"]
          : ["Option A", "Option B", "Option C", "Option D", "Option E"]
      })
    ),

    // Validity & QC - Inconsistency Pairs
    ...Array.from({length: 6}, (_, i) => [
      createQuestion({
        id: 200 + i * 2,
        text: `Consistency check ${i + 1} - Version A`,
        type: 'likert-1-5',
        tag: `INC_${String(i + 1).padStart(2, '0')}_A`,
        pair_group: `INC_${String(i + 1).padStart(2, '0')}`,
        section: "Validity & Quality Control",
        options: ["1=Never", "2=Rarely", "3=Sometimes", "4=Often", "5=Always"]
      }),
      createQuestion({
        id: 200 + i * 2 + 1,
        text: `Consistency check ${i + 1} - Version B`,
        type: 'likert-1-5',
        tag: `INC_${String(i + 1).padStart(2, '0')}_B`,
        pair_group: `INC_${String(i + 1).padStart(2, '0')}`,
        section: "Validity & Quality Control",
        options: ["1=Never", "2=Rarely", "3=Sometimes", "4=Often", "5=Always"]
      })
    ]).flat(),

    // Social Desirability
    createQuestion({
      id: 250,
      text: "I always tell the complete truth",
      type: 'likert-1-5',
      tag: 'SD',
      section: "Validity & Quality Control",
      social_desirability: true,
      options: ["1=Never", "2=Rarely", "3=Sometimes", "4=Often", "5=Always"]
    }),

    // Attention Checks
    ...Array.from({length: 3}, (_, i) => 
      createQuestion({
        id: 300 + i,
        text: `For this question, please select "Option C" to show you are paying attention`,
        type: 'forced-choice-4',
        tag: `AC_${i + 1}`,
        section: "Validity & Quality Control",
        options: ["Option A", "Option B", "Option C", "Option D"]
      })
    )
  ],
  expectedValidation: {
    ok: true,
    errorCount: 0,
    warningCount: 0
  }
};

// FC Deficit - Only 23 FC blocks (should fail)
export const FC_DEFICIT_FIXTURE: TestFixture = {
  name: "fc_deficit_23_blocks",
  description: "Only 23 FC blocks available, below minimum of 24",
  questions: [
    ...HAPPY_PATH_FIXTURE.questions.filter(q => !q.tag?.startsWith('FC_')),
    // Only 23 FC questions instead of 26
    ...Array.from({length: 23}, (_, i) => 
      createQuestion({
        id: 100 + i,
        text: `FC Scenario ${i + 1}: Choose the best approach`,
        type: 'forced-choice-4',
        tag: `FC_${String(i + 1).padStart(2, '0')}`,
        section: "Situational Work Style",
        scale_type: 'forced_choice',
        options: ["Option A", "Option B", "Option C", "Option D"]
      })
    )
  ],
  expectedValidation: {
    ok: false,
    errorCount: 1,
    warningCount: 0
  }
};

// INC Missing Pair - Missing B responses
export const INC_MISSING_PAIR_FIXTURE: TestFixture = {
  name: "inc_missing_pair",
  description: "Inconsistency pairs missing B items",
  questions: [
    ...HAPPY_PATH_FIXTURE.questions.filter(q => !q.tag?.startsWith('INC_')),
    // Only A items, missing B items
    ...Array.from({length: 3}, (_, i) => 
      createQuestion({
        id: 200 + i,
        text: `Consistency check ${i + 1} - Version A only`,
        type: 'likert-1-5',
        tag: `INC_${String(i + 1).padStart(2, '0')}_A`,
        pair_group: `INC_${String(i + 1).padStart(2, '0')}`,
        section: "Validity & Quality Control",
        options: ["1=Never", "2=Rarely", "3=Sometimes", "4=Often", "5=Always"]
      })
    )
  ],
  expectedValidation: {
    ok: false,
    errorCount: 1,
    warningCount: 0
  }
};

// AC Trap - Wrong answers obvious
export const AC_TRAP_FIXTURE: TestFixture = {
  name: "ac_trap_obvious_wrong",
  description: "Attention checks with obvious wrong answers",
  questions: [
    ...HAPPY_PATH_FIXTURE.questions.filter(q => !q.tag?.startsWith('AC_')),
    createQuestion({
      id: 300,
      text: "Please select 'Strongly Agree' to continue",
      type: 'likert-1-5',
      tag: 'AC_1',
      section: "Validity & Quality Control",
      options: ["1=Strongly Disagree", "2=Disagree", "3=Neutral", "4=Agree", "5=Strongly Agree"]
    }),
    createQuestion({
      id: 301, 
      text: "What color is the sky on a clear day? (Select Blue)",
      type: 'forced-choice-4',
      tag: 'AC_2',
      section: "Validity & Quality Control",
      options: ["Red", "Blue", "Green", "Purple"]
    })
  ],
  expectedValidation: {
    ok: true, // Will depend on responses
    errorCount: 0,
    warningCount: 0
  }
};

// No SD - Missing Social Desirability
export const NO_SD_FIXTURE: TestFixture = {
  name: "no_sd_items",
  description: "Missing all social desirability items",
  questions: HAPPY_PATH_FIXTURE.questions.filter(q => q.tag !== 'SD' && !q.social_desirability),
  expectedValidation: {
    ok: false,
    errorCount: 1,
    warningCount: 0
  }
};

// Neuro Gap - Missing neuroticism items
export const NEURO_GAP_FIXTURE: TestFixture = {
  name: "neuro_gap_missing_items", 
  description: "Missing neuroticism index items",
  questions: HAPPY_PATH_FIXTURE.questions.filter(q => !['N', 'N_R'].includes(q.tag || '')),
  expectedValidation: {
    ok: false,
    errorCount: 1,
    warningCount: 0
  }
};

// Email Only - Q1 required, Q2-Q16 optional
export const EMAIL_ONLY_FIXTURE: TestFixture = {
  name: "email_only_required",
  description: "Only email required, Q2-Q16 optional",
  questions: [
    createQuestion({
      id: 1,
      text: "What is your email address?",
      type: 'email',
      required: true,
      section: "Demographics"
    }),
    // Q2-Q16 all optional
    ...Array.from({length: 15}, (_, i) => createQuestion({
      id: 2 + i,
      text: `Optional question ${i + 1}`,
      type: 'text',
      required: false,
      section: "Demographics"
    })),
    // Rest of assessment 
    ...HAPPY_PATH_FIXTURE.questions.filter(q => q.id > 20)
  ],
  expectedValidation: {
    ok: true,
    errorCount: 0,
    warningCount: 1 // May warn about demographics
  }
};

export const ALL_FIXTURES = [
  HAPPY_PATH_FIXTURE,
  FC_DEFICIT_FIXTURE,
  INC_MISSING_PAIR_FIXTURE,
  AC_TRAP_FIXTURE,
  NO_SD_FIXTURE,
  NEURO_GAP_FIXTURE,
  EMAIL_ONLY_FIXTURE
];

// Sample responses for fixtures
export const SAMPLE_RESPONSES = {
  happy_path: [
    { questionId: 1, answer: "test@example.com" },
    // FC responses (24+)
    ...Array.from({length: 26}, (_, i) => ({
      questionId: 100 + i,
      answer: "Option A"
    })),
    // INC responses (complete pairs)
    ...Array.from({length: 12}, (_, i) => ({
      questionId: 200 + i,
      answer: "3"
    })),
    // SD response
    { questionId: 250, answer: "3" },
    // AC correct responses
    { questionId: 300, answer: "Option C" },
    { questionId: 301, answer: "Option C" },
    { questionId: 302, answer: "Option C" }
  ],
  fc_deficit: [
    { questionId: 1, answer: "test@example.com" },
    // Only 23 FC responses
    ...Array.from({length: 23}, (_, i) => ({
      questionId: 100 + i,
      answer: "Option A"
    }))
  ],
  ac_wrong: [
    { questionId: 1, answer: "test@example.com" },
    // AC wrong responses
    { questionId: 300, answer: "Red" }, // Wrong answer
    { questionId: 301, answer: "Green" } // Wrong answer
  ]
};