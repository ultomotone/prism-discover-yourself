export interface Question {
  id: number;
  text: string;
  type: 'email' | 'text' | 'multiple-choice' | 'likert-1-5' | 'likert-1-7' | 'yes-no' | 'forced-choice-2' | 'forced-choice-4' | 'forced-choice-5' | 'state-1-7' | 'categorical-5' | 'frequency' | 'matrix' | 'select-all' | 'ranking' | 'country-select';
  options?: string[];
  required: boolean;
  section: string;
  parts?: {
    label: string;
    options: string[];
  }[];
  subQuestions?: {
    id: string;
    text: string;
    type: string;
    options: string[];
  }[];
}

export const assessmentQuestions: Question[] = [
  // Section 1 — Demographics & Contact (optional; research only) - Questions 1-8
  {
    id: 1,
    text: "Email (for delivering results)",
    type: 'email',
    required: false,
    section: 'Demographics & Contact'
  },
  {
    id: 2,
    text: "Age range",
    type: 'multiple-choice',
    options: ['Under 18', '18–24', '25–34', '35–44', '45–54', '55–64', '65+'],
    required: false,
    section: 'Demographics & Contact'
  },
  {
    id: 3,
    text: "Gender identity",
    type: 'multiple-choice',
    options: ['Male', 'Female', 'Non-binary/third gender', 'Prefer not to say'],
    required: false,
    section: 'Demographics & Contact'
  },
  {
    id: 4,
    text: "Country/region of residence",
    type: 'country-select',
    required: false,
    section: 'Demographics & Contact'
  },
  {
    id: 5,
    text: "Primary language(s) spoken",
    type: 'text',
    required: false,
    section: 'Demographics & Contact'
  },
  {
    id: 6,
    text: "Education level",
    type: 'multiple-choice',
    options: ['No formal', 'High school/secondary', 'Associate', 'Bachelor\'s', 'Master\'s', 'Doctorate', 'Other'],
    required: false,
    section: 'Demographics & Contact'
  },
  {
    id: 7,
    text: "Occupational sector",
    type: 'multiple-choice',
    options: ['Education', 'Healthcare', 'Business/Finance', 'Technology', 'Creative/Arts', 'Trades/Skilled labor', 'Government/Public service', 'Other'],
    required: false,
    section: 'Demographics & Contact'
  },
  {
    id: 8,
    text: "Years in current field",
    type: 'multiple-choice',
    options: ['Less than 1', '1–3', '4–7', '8–15', '16+'],
    required: false,
    section: 'Demographics & Contact'
  },

  // Section 2 — Self-Reported Behavioral Outcomes (past month/year) - Questions 9-12
  {
    id: 9,
    text: "Work performance satisfaction (1=Not satisfied … 7=Extremely satisfied)",
    type: 'likert-1-7',
    options: ['1=Not satisfied', '2', '3', '4', '5', '6', '7=Extremely satisfied'],
    required: true,
    section: 'Self-Reported Behavioral Outcomes'
  },
  {
    id: 10,
    text: "Frequency of significant stress (1=Never … 7=Very often)",
    type: 'likert-1-7',
    options: ['1=Never', '2', '3', '4', '5', '6', '7=Very often'],
    required: true,
    section: 'Self-Reported Behavioral Outcomes'
  },
  {
    id: 11,
    text: "Promotion/recognition/award in past year",
    type: 'yes-no',
    options: ['Yes', 'No'],
    required: true,
    section: 'Self-Reported Behavioral Outcomes'
  },
  {
    id: 12,
    text: "Hours/week in social interaction outside of work",
    type: 'multiple-choice',
    options: ['0–2', '3–5', '6–10', '11–15', '16+'],
    required: true,
    section: 'Self-Reported Behavioral Outcomes'
  },

  // Section 3 — Life Events & Mindset (context) - Questions 13-16
  {
    id: 13,
    text: "Major life change in past 12 months",
    type: 'yes-no',
    options: ['Yes', 'No'],
    required: true,
    section: 'Life Events & Mindset'
  },
  {
    id: 14,
    text: "Travel frequency",
    type: 'multiple-choice',
    options: ['Never', '1–2×/year', '3–6×/year', 'Monthly', 'Weekly+'],
    required: true,
    section: 'Life Events & Mindset'
  },
  {
    id: 15,
    text: "Average sleep per night",
    type: 'multiple-choice',
    options: ['Less than 5', '5–6', '7–8', '9+'],
    required: true,
    section: 'Life Events & Mindset'
  },
  {
    id: 16,
    text: "Belief about personality stability",
    type: 'multiple-choice',
    options: ['Completely fixed', 'Mostly fixed', 'Can be developed somewhat', 'Can be developed significantly'],
    required: true,
    section: 'Life Events & Mindset'
  },

  // Section 4 — Core PRISM (A) — Functions (1/2) - Questions 17-64
  {
    id: 17,
    text: "I refine ideas until they're internally consistent.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 18,
    text: "I spot logical gaps quickly.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 19,
    text: "I enjoy building clean conceptual frameworks.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 20,
    text: "I'd rather understand why than just follow steps.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 21,
    text: "Precise definitions matter to me.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 22,
    text: "Elegant logic beats expedient fixes.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 23,
    text: "I structure tasks for efficiency.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 24,
    text: "Clear procedures and deadlines motivate me.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 25,
    text: "I cut unnecessary steps to hit goals.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 26,
    text: "I organize people/resources to deliver results.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 27,
    text: "I decide based on external facts and metrics.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 28,
    text: "I measure success by outcomes.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 29,
    text: "I check choices against my personal values.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 30,
    text: "Decisions need to feel right to me.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 31,
    text: "Authenticity matters more than approval.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 32,
    text: "I'm tuned to subtle shifts in my own feelings.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 33,
    text: "I prefer sincere one-on-one connections.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 34,
    text: "I protect what I care about deeply.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 35,
    text: "I track group mood in real time.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 36,
    text: "I adjust my tone to maintain harmony.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 37,
    text: "I express feelings openly to connect.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 38,
    text: "I notice when someone feels left out.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 39,
    text: "I can lift a room's energy.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 40,
    text: "I seek consensus when possible.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 41,
    text: "Outside my main domain, I can pick one likely long-range direction (months+), list key risks, and stick to it.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 42,
    text: "I anticipate likely outcomes.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 43,
    text: "I look for the deeper meaning behind events.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 44,
    text: "I revisit the past to foresee the future.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 45,
    text: "I follow an inner vision over trends.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 46,
    text: "When info is messy, I quickly identify the single most important line to pursue and drop side details.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 47,
    text: "I brainstorm many possibilities.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 48,
    text: "Novel, unstructured exploration energizes me.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 49,
    text: "I make unexpected connections between ideas.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 50,
    text: "I pivot to new ideas easily.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 51,
    text: "Variety keeps me engaged.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 52,
    text: "I see multiple ways things could unfold.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 53,
    text: "I attend to comfort and routine.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 54,
    text: "I maintain steady habits.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 55,
    text: "I store rich sensory memories.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 56,
    text: "I notice small environmental changes.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 57,
    text: "I prefer familiar methods that work.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 58,
    text: "I keep regular routines (sleep/meals/breaks) that keep my energy steady for several weeks.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 59,
    text: "I act decisively in the moment.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 60,
    text: "I notice concrete details others miss.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 61,
    text: "I enjoy hands-on challenges.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 62,
    text: "I assert myself when needed.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 63,
    text: "I take control in emergencies.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },
  {
    id: 64,
    text: "I like tangible results now.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (1/2)'
  },

  // Section 5 — Core PRISM (B) — Flex & Context (2/2) - Questions 65-104
  {
    id: 65,
    text: "I apply logical structure even in unfamiliar domains.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 66,
    text: "I adapt my analysis to context and audience.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 67,
    text: "I blend personal reasoning with established frameworks.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 68,
    text: "I project how today's logic will play out long-term.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 69,
    text: "In unfamiliar topics, I can build a simple logical model (clear definitions + relations) from scratch and test it with small examples.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 70,
    text: "I can create structure from scratch in new projects.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 71,
    text: "I flex plans as circumstances change.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 72,
    text: "I combine best practices with on-the-ground realities.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 73,
    text: "I forecast resource/effort needs over time.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 74,
    text: "I still deliver when norms or guidance are unclear.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 75,
    text: "I track my values accurately in unfamiliar settings.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 76,
    text: "I adapt how I express values to the situation.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 77,
    text: "When my values conflict with local norms, I can act in a way that fits the context without losing my own bearings.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 78,
    text: "I foresee the emotional impact of choices over time.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 79,
    text: "Even without role models, I can navigate by my values.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 80,
    text: "I read emotional atmospheres in unfamiliar groups.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 81,
    text: "I adjust social approach across different contexts.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 82,
    text: "I balance etiquette with what the moment needs.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 83,
    text: "I anticipate how group tone will evolve.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 84,
    text: "I can connect with diverse audiences without a script.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 85,
    text: "From a few cases, I infer an underlying pattern and forecast likely outcomes in new contexts.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 86,
    text: "I interpret signs differently based on context.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 87,
    text: "I link recurring themes from past cases to current data to predict how this will play out.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 88,
    text: "I model long-range trajectories in my head.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 89,
    text: "I form useful foresight with minimal data.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 90,
    text: "In unfamiliar areas, I can generate 4–6 distinct options without examples and pick 1–2 to test quickly.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 91,
    text: "I pivot ideas based on subtle situational cues.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 92,
    text: "I combine norms from different fields to ideate.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 93,
    text: "I imagine downstream consequences of options.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 94,
    text: "I can narrow multiple options to one clear path when needed.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 95,
    text: "I keep internal steadiness even in new environments.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 96,
    text: "I adjust routines sensitively to changing context.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 97,
    text: "I fold standards/habits into sustainable rhythms.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 98,
    text: "I plan for comfort/health across seasons/years.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 99,
    text: "I can self-regulate without familiar cues.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 100,
    text: "I act effectively in novel, fast-moving situations.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 101,
    text: "I vary my force/pace to fit the moment.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 102,
    text: "I align tactics with rules and constraints on the fly.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 103,
    text: "I time action for maximum real-world impact.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },
  {
    id: 104,
    text: "I improvise competently without prior experience.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Core PRISM Functions (2/2)'
  },

  // Section 6 — Regulation / Neuroticism Index (N) - Questions 105-128
  {
    id: 105,
    text: "I worry about small things more than most.",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },
  {
    id: 106,
    text: "I stay calm when plans fall apart. (R)",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },
  {
    id: 107,
    text: "I often feel on edge for no clear reason.",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },
  {
    id: 108,
    text: "Setbacks hit me hard emotionally.",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },
  {
    id: 109,
    text: "I recover quickly after stress. (R)",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },
  {
    id: 110,
    text: "I frequently second-guess myself.",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },
  {
    id: 111,
    text: "I keep an even keel under pressure. (R)",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },
  {
    id: 112,
    text: "I ruminate on mistakes.",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },
  {
    id: 113,
    text: "I'm resilient when criticized. (R)",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },
  {
    id: 114,
    text: "Sudden changes spike my anxiety.",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },
  {
    id: 115,
    text: "I can relax even when uncertain. (R)",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },
  {
    id: 116,
    text: "I have frequent mood swings.",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },
  {
    id: 117,
    text: "I sleep well despite stress. (R)",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },
  {
    id: 118,
    text: "I fear worst-case scenarios.",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },
  {
    id: 119,
    text: "I regain perspective within a day. (R)",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },
  {
    id: 120,
    text: "I feel overwhelmed easily.",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },
  {
    id: 121,
    text: "I can compartmentalize emotions when needed. (R)",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },
  {
    id: 122,
    text: "I'm tense in social ambiguity.",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },
  {
    id: 123,
    text: "I soothe myself effectively. (R)",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },
  {
    id: 124,
    text: "My mind races at night.",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },
  {
    id: 125,
    text: "I handle criticism without spiraling. (R)",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },
  {
    id: 126,
    text: "I'm easily startled or alarmed.",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },
  {
    id: 127,
    text: "I maintain optimism in hard times. (R)",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },
  {
    id: 128,
    text: "I feel \"emotionally fragile.\"",
    type: 'likert-1-7',
    options: ['1=Strongly Disagree', '2', '3', '4', '5', '6', '7=Strongly Agree'],
    required: true,
    section: 'Regulation / Neuroticism Index'
  },

  // Section 7 — Situational Choices (forced-choice) - Questions 129-140
  {
    id: 129,
    text: "Deadline meltdown: first impulse?",
    type: 'forced-choice-4',
    options: [
      'A) Re-plan ruthlessly; drive execution.',
      'B) Self-blame; cling to rules.',
      'C) Improvise on gut; just act.',
      'D) Ask for input; try a fresh angle.'
    ],
    required: true,
    section: 'Situational Choices'
  },
  {
    id: 130,
    text: "Heated conflict: you tend to…",
    type: 'forced-choice-4',
    options: [
      'A) Assert a clear course.',
      'B) Apologize/placate to be correct.',
      'C) Go direct, forceful, physical presence.',
      'D) Seek a creative workaround.'
    ],
    required: true,
    section: 'Situational Choices'
  },
  {
    id: 131,
    text: "Total novelty, 48-hour deadline. Pick your first move.",
    type: 'forced-choice-5',
    options: [
      'A) Draft one coherent plan, list top risks, commit.',
      'B) Generate several options, test 1–2 fast, then choose.',
      'C) Wait for more examples/data.',
      'D) Poll the room for tone first.',
      'E) Define a formal taxonomy before acting.'
    ],
    required: true,
    section: 'Situational Choices'
  },
  {
    id: 132,
    text: "Public mistake:",
    type: 'forced-choice-4',
    options: [
      'A) Own it; set a corrective plan.',
      'B) Spiral internally; avoid exposure.',
      'C) Distract/redirect with action.',
      'D) Turn it into a learning quest.'
    ],
    required: true,
    section: 'Situational Choices'
  },
  {
    id: 133,
    text: "When I've been overloaded for 2+ weeks, I can still do this reliably:",
    type: 'select-all',
    options: [
      'Retune tone in unfamiliar groups',
      'Make live calls with incomplete data',
      'Hold one strategic line (Ni)'
    ],
    required: true,
    section: 'Situational Choices'
  },
  {
    id: 134,
    text: "In recent flow states at work, which felt most effortless? (rank top 3)",
    type: 'ranking',
    options: [
      'Translating goals into metrics/sequence',
      'Choosing a single promising line',
      'Generating many options',
      'On-the-spot decisions',
      'Refining a clean model',
      'Reading/retuning the room'
    ],
    required: true,
    section: 'Situational Choices'
  },
  {
    id: 135,
    text: "Social strain:",
    type: 'forced-choice-4',
    options: [
      'A) Lead tone; reset group dynamics.',
      'B) Over-monitor what\'s "appropriate."',
      'C) Withdraw or push abruptly.',
      'D) Invite play/novelty to reconnect.'
    ],
    required: true,
    section: 'Situational Choices'
  },
  {
    id: 136,
    text: "Sudden crisis:",
    type: 'forced-choice-4',
    options: [
      'A) Command; make a plan now.',
      'B) Freeze; look for rules.',
      'C) Act physically, decisively.',
      'D) Try unconventional fixes.'
    ],
    required: true,
    section: 'Situational Choices'
  },
  {
    id: 137,
    text: "Ambiguous authority:",
    type: 'forced-choice-4',
    options: [
      'A) Clarify goals; take charge.',
      'B) Over-comply; avoid risk.',
      'C) Test boundaries in action.',
      'D) Build alliances; co-create.'
    ],
    required: true,
    section: 'Situational Choices'
  },
  {
    id: 138,
    text: "Creative brief is vague:",
    type: 'forced-choice-4',
    options: [
      'A) Define scope; iterate structure.',
      'B) Ask for exact criteria first.',
      'C) Prototype immediately.',
      'D) Brainstorm widely with others.'
    ],
    required: true,
    section: 'Situational Choices'
  },
  {
    id: 139,
    text: "Personal loss stress:",
    type: 'forced-choice-4',
    options: [
      'A) Focus on what can be done.',
      'B) Collapse into self-critique.',
      'C) Distract with intense activity.',
      'D) Seek support to grow through it.'
    ],
    required: true,
    section: 'Situational Choices'
  },
  {
    id: 140,
    text: "Everything going great:",
    type: 'forced-choice-4',
    options: [
      'A) Double down on strengths.',
      'B) Keep it proper/perfect.',
      'C) Ride momentum; feel unstoppable.',
      'D) Try developing new sides of me.'
    ],
    required: true,
    section: 'Situational Choices'
  },

  // Section 8 — Strengths Ownership - Questions 141-152
  {
    id: 141,
    text: "I trust my top skills to carry me.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Strengths Ownership'
  },
  {
    id: 142,
    text: "I feel most \"myself\" when leading with strengths.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Strengths Ownership'
  },
  {
    id: 143,
    text: "I take initiative without waiting for permission.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Strengths Ownership'
  },
  {
    id: 144,
    text: "I rely on my own judgment over trends.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Strengths Ownership'
  },
  {
    id: 145,
    text: "I naturally set direction for others.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Strengths Ownership'
  },
  {
    id: 146,
    text: "I recover confidence after setbacks.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Strengths Ownership'
  },
  {
    id: 147,
    text: "I shape environments to fit my vision.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Strengths Ownership'
  },
  {
    id: 148,
    text: "I communicate with clear intent.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Strengths Ownership'
  },
  {
    id: 149,
    text: "I prefer decisions to dithering.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Strengths Ownership'
  },
  {
    id: 150,
    text: "I'm comfortable being accountable.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Strengths Ownership'
  },
  {
    id: 151,
    text: "I teach others my best methods.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Strengths Ownership'
  },
  {
    id: 152,
    text: "I rarely feel shame when using my strengths.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Strengths Ownership'
  },

  // Section 9 — Properness / Rigid Standards - Questions 153-164
  {
    id: 153,
    text: "I often judge myself against \"how it should be.\"",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Properness / Rigid Standards'
  },
  {
    id: 154,
    text: "I fear exposing weak areas.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Properness / Rigid Standards'
  },
  {
    id: 155,
    text: "I over-prepare to avoid mistakes.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Properness / Rigid Standards'
  },
  {
    id: 156,
    text: "I default to \"proper\" behavior under scrutiny.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Properness / Rigid Standards'
  },
  {
    id: 157,
    text: "Criticism lingers with me.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Properness / Rigid Standards'
  },
  {
    id: 158,
    text: "I feel rigid when rules are unclear.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Properness / Rigid Standards'
  },
  {
    id: 159,
    text: "I monitor how I appear to others.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Properness / Rigid Standards'
  },
  {
    id: 160,
    text: "I avoid tasks that hit my blind spots.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Properness / Rigid Standards'
  },
  {
    id: 161,
    text: "I sometimes pose as \"the proper version\" of me.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Properness / Rigid Standards'
  },
  {
    id: 162,
    text: "I worry about doing it the \"right way.\"",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Properness / Rigid Standards'
  },
  {
    id: 163,
    text: "External standards override my instincts.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Properness / Rigid Standards'
  },
  {
    id: 164,
    text: "I feel exposed when I can't meet expectations.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Properness / Rigid Standards'
  },

  // Section 10 — Developmental Openness - Questions 165-176
  {
    id: 165,
    text: "Encouragement unlocks new abilities in me.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Developmental Openness'
  },
  {
    id: 166,
    text: "I enjoy guidance in areas I'm unsure of.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Developmental Openness'
  },
  {
    id: 167,
    text: "I'm curious to develop unfamiliar skills.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Developmental Openness'
  },
  {
    id: 168,
    text: "Supportive partners bring out my best.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Developmental Openness'
  },
  {
    id: 169,
    text: "I notice fresh talents emerging lately.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Developmental Openness'
  },
  {
    id: 170,
    text: "I seek mentors who complement me.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Developmental Openness'
  },
  {
    id: 171,
    text: "I'm willing to try what once felt \"not me.\"",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Developmental Openness'
  },
  {
    id: 172,
    text: "I track growth in non-natural functions.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Developmental Openness'
  },
  {
    id: 173,
    text: "I enjoy experimenting outside my comfort zone.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Developmental Openness'
  },
  {
    id: 174,
    text: "I ask for feedback to grow.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Developmental Openness'
  },
  {
    id: 175,
    text: "I see \"latent\" strengths becoming usable.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Developmental Openness'
  },
  {
    id: 176,
    text: "I welcome co-creation to develop.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Developmental Openness'
  },

  // Section 11 — Instinctive Action / Somatic Readiness - Questions 177-188
  {
    id: 177,
    text: "Under pressure I act on reliable gut.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Instinctive Action / Somatic Readiness'
  },
  {
    id: 178,
    text: "In emergencies my body knows what to do.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Instinctive Action / Somatic Readiness'
  },
  {
    id: 179,
    text: "I have skills I use well but rarely talk about.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Instinctive Action / Somatic Readiness'
  },
  {
    id: 180,
    text: "I sometimes \"auto-pilot\" through chaos.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Instinctive Action / Somatic Readiness'
  },
  {
    id: 181,
    text: "I sense when not to act, without explaining why.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Instinctive Action / Somatic Readiness'
  },
  {
    id: 182,
    text: "I can be surprisingly forceful when needed.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Instinctive Action / Somatic Readiness'
  },
  {
    id: 183,
    text: "I react quickly to physical cues.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Instinctive Action / Somatic Readiness'
  },
  {
    id: 184,
    text: "I trust my instincts more than usual in crisis.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Instinctive Action / Somatic Readiness'
  },
  {
    id: 185,
    text: "I downplay some talents others notice.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Instinctive Action / Somatic Readiness'
  },
  {
    id: 186,
    text: "I make snap judgments that hold up later.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Instinctive Action / Somatic Readiness'
  },
  {
    id: 187,
    text: "Stress can flip me into bold action.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Instinctive Action / Somatic Readiness'
  },
  {
    id: 188,
    text: "I recognize when instinct is driving.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Instinctive Action / Somatic Readiness'
  },

  // Section 12 — Growth Over Time (mindset) - Questions 189-196
  {
    id: 189,
    text: "My personality has changed meaningfully since adolescence.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Growth Over Time'
  },
  {
    id: 190,
    text: "I intentionally develop traits that don't come naturally.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Growth Over Time'
  },
  {
    id: 191,
    text: "With effort, I can grow most skills.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Growth Over Time'
  },
  {
    id: 192,
    text: "Feedback accelerates my growth.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Growth Over Time'
  },
  {
    id: 193,
    text: "I seek environments that stretch me.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Growth Over Time'
  },
  {
    id: 194,
    text: "I maintain consistent practice toward growth goals.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Growth Over Time'
  },
  {
    id: 195,
    text: "I notice long-term upgrades in how I think/feel.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Growth Over Time'
  },
  {
    id: 196,
    text: "I track growth goals and practice.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Growth Over Time'
  },

  // Section 13 — Self-Regulation & Boundaries - Questions 197-204
  {
    id: 197,
    text: "I accept limits and work around them constructively.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Self-Regulation & Boundaries'
  },
  {
    id: 198,
    text: "I catch myself before old habits derail me.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Self-Regulation & Boundaries'
  },
  {
    id: 199,
    text: "I can calm down without numbing or avoidance.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Self-Regulation & Boundaries'
  },
  {
    id: 200,
    text: "I set boundaries to protect my energy.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Self-Regulation & Boundaries'
  },
  {
    id: 201,
    text: "I repair conflicts directly and kindly.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Self-Regulation & Boundaries'
  },
  {
    id: 202,
    text: "I choose long-term gains over short-term relief.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Self-Regulation & Boundaries'
  },
  {
    id: 203,
    text: "I apologize and change course when wrong.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Self-Regulation & Boundaries'
  },
  {
    id: 204,
    text: "When a problem is complex and unclear, I can sit with ambiguity and map what's missing before choosing a direction.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Self-Regulation & Boundaries'
  },

  // Section 14 — Trauma / Healing Context (optional) - Questions 205-210
  {
    id: 205,
    text: "Past hardship still affects my reactions.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: false,
    section: 'Trauma / Healing Context'
  },
  {
    id: 206,
    text: "Under trigger, I act \"not like myself.\"",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: false,
    section: 'Trauma / Healing Context'
  },
  {
    id: 207,
    text: "I've done healing work (therapy, coaching, etc.).",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: false,
    section: 'Trauma / Healing Context'
  },
  {
    id: 208,
    text: "I have healthy strategies to ground myself.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: false,
    section: 'Trauma / Healing Context'
  },
  {
    id: 209,
    text: "I can name triggers and patterns now.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: false,
    section: 'Trauma / Healing Context'
  },
  {
    id: 210,
    text: "I can return to baseline after being triggered.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: false,
    section: 'Trauma / Healing Context'
  },

  // Section 15 — Work Context & Style - Questions 211-216
  {
    id: 211,
    text: "Current focus",
    type: 'forced-choice-4',
    options: ['Growth/Exploration', 'Performance/Delivery', 'Coping/Recovery', 'Transition/Reflection'],
    required: true,
    section: 'Work Context & Style'
  },
  {
    id: 212,
    text: "Primary work role",
    type: 'forced-choice-4',
    options: ['Lead/Direct', 'Build/Execute', 'Support/Enable', 'Create/Innovate'],
    required: true,
    section: 'Work Context & Style'
  },
  {
    id: 213,
    text: "Social energy",
    type: 'forced-choice-4',
    options: ['Large groups', 'Small groups', 'One-to-one', 'Mostly solo'],
    required: true,
    section: 'Work Context & Style'
  },
  {
    id: 214,
    text: "Preferred pace",
    type: 'forced-choice-4',
    options: ['Fast/Iterative', 'Steady/Planned', 'Seasonal bursts', 'Depends on context'],
    required: true,
    section: 'Work Context & Style'
  },
  {
    id: 215,
    text: "Learning style",
    type: 'forced-choice-4',
    options: ['Do then reflect', 'Study then do', 'Observe then try', 'Co-create with others'],
    required: true,
    section: 'Work Context & Style'
  },
  {
    id: 216,
    text: "Big picture vs detail",
    type: 'forced-choice-4',
    options: ['Mostly big picture', 'Mostly detail', 'Both switch by need', 'Neither prefer stability'],
    required: true,
    section: 'Work Context & Style'
  },

  // Section 16 — State Check (right now) - Questions 217-221
  {
    id: 217,
    text: "Right now, my stress level is…",
    type: 'state-1-7',
    options: ['1=Very Low', '2', '3', '4', '5', '6', '7=Very High'],
    required: true,
    section: 'State Check'
  },
  {
    id: 218,
    text: "Right now, my mood is…",
    type: 'state-1-7',
    options: ['1=Very Low', '2', '3', '4', '5', '6', '7=Very High'],
    required: true,
    section: 'State Check'
  },
  {
    id: 219,
    text: "In the last 24 hours, my sleep quality was…",
    type: 'state-1-7',
    options: ['1=Very Low', '2', '3', '4', '5', '6', '7=Very High'],
    required: true,
    section: 'State Check'
  },
  {
    id: 220,
    text: "At this moment, I feel time pressure is…",
    type: 'state-1-7',
    options: ['1=Very Low', '2', '3', '4', '5', '6', '7=Very High'],
    required: true,
    section: 'State Check'
  },
  {
    id: 221,
    text: "Right now, my ability to focus is…",
    type: 'state-1-7',
    options: ['1=Very Low', '2', '3', '4', '5', '6', '7=Very High'],
    required: true,
    section: 'State Check'
  },

  // Section 17 — Polarity A/B (compass preferences) - Questions 222-229
  {
    id: 222,
    text: "Which feels more natural?",
    type: 'forced-choice-2',
    options: ['A) Understand why systems work', 'B) Deliver results efficiently'],
    required: true,
    section: 'Polarity Preferences'
  },
  {
    id: 223,
    text: "Which feels more natural?",
    type: 'forced-choice-2',
    options: ['A) Stay true to inner values', 'B) Adjust to keep harmony'],
    required: true,
    section: 'Polarity Preferences'
  },
  {
    id: 224,
    text: "Which feels more natural?",
    type: 'forced-choice-2',
    options: ['A) Follow one guiding vision', 'B) Explore many possibilities'],
    required: true,
    section: 'Polarity Preferences'
  },
  {
    id: 225,
    text: "Which feels more natural?",
    type: 'forced-choice-2',
    options: ['A) Maintain comfort & routine', 'B) Act decisively in the moment'],
    required: true,
    section: 'Polarity Preferences'
  },
  {
    id: 226,
    text: "When making a tough call, I prioritize…",
    type: 'forced-choice-2',
    options: ['A) Logical consistency', 'B) Personal authenticity'],
    required: true,
    section: 'Polarity Preferences'
  },
  {
    id: 227,
    text: "When leading others, I lean more on…",
    type: 'forced-choice-2',
    options: ['A) Clear metrics & plans', 'B) Group morale & tone'],
    required: true,
    section: 'Polarity Preferences'
  },
  {
    id: 228,
    text: "My default compass is…",
    type: 'forced-choice-2',
    options: ['A) Long-term patterns', 'B) Present stability/comfort'],
    required: true,
    section: 'Polarity Preferences'
  },
  {
    id: 229,
    text: "To move forward, I tend to…",
    type: 'forced-choice-2',
    options: ['A) Brainstorm options', 'B) Engage hands-on action'],
    required: true,
    section: 'Polarity Preferences'
  },

  // Section 18 — Validity, Poles & Quality-Control - Questions 230-246
  {
    id: 230,
    text: "I enjoy refining logical structure.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Validity & Quality Control'
  },
  {
    id: 231,
    text: "I dislike spending time clarifying concepts. (R)",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Validity & Quality Control'
  },
  {
    id: 232,
    text: "I naturally read the room's emotions.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Validity & Quality Control'
  },
  {
    id: 233,
    text: "I usually miss shifts in group mood. (R)",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Validity & Quality Control'
  },
  {
    id: 234,
    text: "I act effectively under time pressure.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Validity & Quality Control'
  },
  {
    id: 235,
    text: "I freeze when rapid action is needed. (R)",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Validity & Quality Control'
  },
  {
    id: 236,
    text: "I prefer familiar routines that keep me steady.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Validity & Quality Control'
  },
  {
    id: 237,
    text: "I feel comfortable abandoning routines often. (R)",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Validity & Quality Control'
  },
  {
    id: 238,
    text: "I have never told a lie. (SD)",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Validity & Quality Control'
  },
  {
    id: 239,
    text: "I always keep every promise I make. (SD)",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Validity & Quality Control'
  },
  {
    id: 240,
    text: "I never feel angry with anyone. (SD)",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Validity & Quality Control'
  },
  {
    id: 241,
    text: "I am always courteous, even to disagreeable people. (SD)",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Validity & Quality Control'
  },
  {
    id: 242,
    text: "I never make mistakes. (SD)",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Validity & Quality Control'
  },
  {
    id: 243,
    text: "I am completely unbiased in my judgments. (SD)",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Validity & Quality Control'
  },
  {
    id: 244,
    text: "I prefer to understand mechanisms before acting.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Validity & Quality Control'
  },
  {
    id: 245,
    text: "I prefer to explore many ideas before choosing.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Validity & Quality Control'
  },
  {
    id: 246,
    text: "I rely on concrete data to decide in the moment.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Validity & Quality Control'
  },

  // Section 19 — Advanced Capability & Scenario Matrix (compact) - Questions 247-257
  {
    id: 247,
    text: "Capability Matrix: Generating novel options",
    type: 'matrix',
    required: true,
    section: 'Advanced Capability',
    parts: [
      {
        label: 'Ability level',
        options: ['Novice', 'Emerging', 'Competent', 'Strong', 'Expert']
      },
      {
        label: 'Frequency',
        options: ['Never', 'Rarely', 'Sometimes', 'About half the time', 'Often', 'Usually', 'Always']
      },
      {
        label: 'Energy / Effort',
        options: ['Very Low', 'Low', 'Slightly Low', 'Neutral', 'Slightly High', 'High', 'Very High']
      }
    ]
  },
  {
    id: 248,
    text: "Capability Matrix: Reading & retuning the room (unfamiliar groups)",
    type: 'matrix',
    required: true,
    section: 'Advanced Capability',
    subQuestions: [
      {
        id: 'A',
        text: 'Part A (ability):',
        type: 'likert-1-5',
        options: ['1', '2', '3', '4', '5']
      },
      {
        id: 'B',
        text: 'Part B (frequency, last 12 months):',
        type: 'multiple-choice',
        options: ['0', '1', '2–3', '4–6', '7+']
      },
      {
        id: 'C',
        text: 'Part C (energy cost):',
        type: 'multiple-choice',
        options: ['None', 'Low', 'Moderate', 'High', 'Very high']
      }
    ]
  },
  {
    id: 249,
    text: "High-stakes, no precedents, 48h deadline. Best first move?",
    type: 'forced-choice-5',
    options: [
      'A) Draft one coherent path, list 5 risks/assumptions, commit.',
      'B) Generate 6 options, test 2 fast, decide from feedback.',
      'C) Poll the room to align tone before content.',
      'D) Wait for examples/data to avoid rework.',
      'E) Build a formal taxonomy before picking a path.'
    ],
    required: true,
    section: 'Advanced Capability'
  },
  {
    id: 250,
    text: "New audience goes cold mid-pitch; you're behind schedule.",
    type: 'forced-choice-5',
    options: [
      'A) Mirror concerns, retune pacing/tone, continue.',
      'B) Keep tone consistent; address later offline.',
      'C) Push to data; tone is noise.',
      'D) Pause the talk and run a quick vote.',
      'E) Abandon talk; send a detailed memo.'
    ],
    required: true,
    section: 'Advanced Capability'
  },
  {
    id: 251,
    text: "Unfamiliar topic; you must create structure.",
    type: 'forced-choice-5',
    options: [
      'A) Translate goals into measurable constraints; sequence work.',
      'B) Define objects & relations precisely; test with toy cases first.',
      'C) Collect examples from similar domains before structuring.',
      'D) Crowdsource possible frames; decide later.',
      'E) Pick one likely frame; prune edge-cases.'
    ],
    required: true,
    section: 'Advanced Capability'
  },
  {
    id: 252,
    text: "A brand-new, important problem with no examples. You need to move.",
    type: 'forced-choice-2',
    options: [
      'A) Come up with several different ways first, try a couple quickly, then choose.',
      'B) Pick one promising path fast, list key risks/assumptions, and commit.'
    ],
    required: true,
    section: 'Advanced Capability'
  },
  {
    id: 253,
    text: "Given multiple promising options under time pressure, your first instinct is to…",
    type: 'forced-choice-2',
    options: [
      'A) Pick one and commit.',
      'B) Keep two alive and test both.'
    ],
    required: true,
    section: 'Advanced Capability'
  },
  {
    id: 254,
    text: "You have to make a call now with limited information.",
    type: 'forced-choice-2',
    options: [
      'A) Decide now and adjust as you learn more.',
      'B) Wait until the pattern is clearer, even if it delays the decision.'
    ],
    required: true,
    section: 'Advanced Capability'
  },
  {
    id: 255,
    text: "I need examples before I can generate useful options.",
    type: 'forced-choice-2',
    options: ['Agree', 'Disagree'],
    required: true,
    section: 'Advanced Capability'
  },
  {
    id: 256,
    text: "You must organize a topic you don't know well.",
    type: 'forced-choice-2',
    options: [
      'A) Start by defining the pieces and how they fit; make a simple model and test it with small examples.',
      'B) Start by turning the goal into clear metrics and steps; set milestones and order the work.'
    ],
    required: true,
    section: 'Advanced Capability'
  },
  {
    id: 257,
    text: "With few examples, I can generate several plausible models/approaches to try.",
    type: 'likert-1-5',
    options: ['Strongly Disagree', '2', '3', '4', 'Strongly Agree'],
    required: true,
    section: 'Advanced Capability'
  }
];