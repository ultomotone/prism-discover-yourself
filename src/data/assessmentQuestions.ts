export interface Question {
  id: number;
  text: string;
  type: 'likert' | 'multiple-choice' | 'attention-check' | 'demographic' | 'scale' | 'forced-choice' | 'likert-7' | 'state' | 'mixed' | 'input';
  options?: string[];
  required: boolean;
  section: string;
}

export const assessmentQuestions: Question[] = [
  // Section 1: Intro & Demographics (optional) - Questions 1-8
  {
    id: 1,
    text: "Email (for delivering results)",
    type: 'input',
    required: false,
    section: 'Section 1: Intro & Demographics (optional)'
  },
  {
    id: 2,
    text: "Age range",
    type: 'demographic',
    options: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
    required: false,
    section: 'Section 1: Intro & Demographics (optional)'
  },
  {
    id: 3,
    text: "Gender identity",
    type: 'demographic',
    options: ['Woman', 'Man', 'Non-binary', 'Other', 'Prefer not to answer'],
    required: false,
    section: 'Section 1: Intro & Demographics (optional)'
  },
  {
    id: 4,
    text: "Country/region of residence",
    type: 'input',
    required: false,
    section: 'Section 1: Intro & Demographics (optional)'
  },
  {
    id: 5,
    text: "Primary language(s) spoken",
    type: 'input',
    required: false,
    section: 'Section 1: Intro & Demographics (optional)'
  },
  {
    id: 6,
    text: "Education level",
    type: 'demographic',
    options: ['High school or less', 'Some college', "Bachelor's degree", "Master's degree", 'Doctoral degree', 'Other'],
    required: false,
    section: 'Section 1: Intro & Demographics (optional)'
  },
  {
    id: 7,
    text: "Occupational sector",
    type: 'input',
    required: false,
    section: 'Section 1: Intro & Demographics (optional)'
  },
  {
    id: 8,
    text: "Years in current field",
    type: 'demographic',
    options: ['Less than 1 year', '1-2 years', '3-5 years', '6-10 years', '11-20 years', '20+ years'],
    required: false,
    section: 'Section 1: Intro & Demographics (optional)'
  },

  // Section 2: Self-Reported Behavioral Outcomes - Questions 9-12
  {
    id: 9,
    text: "In the past month, how satisfied have you been with your work performance?",
    type: 'scale',
    options: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'],
    required: true,
    section: 'Section 2: Self-Reported Behavioral Outcomes'
  },
  {
    id: 10,
    text: "In the past month, how often did you experience significant stress?",
    type: 'scale',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'],
    required: true,
    section: 'Section 2: Self-Reported Behavioral Outcomes'
  },
  {
    id: 11,
    text: "In the past year, have you received a promotion, recognition, or award at work?",
    type: 'multiple-choice',
    options: ['Yes', 'No', 'Not applicable'],
    required: true,
    section: 'Section 2: Self-Reported Behavioral Outcomes'
  },
  {
    id: 12,
    text: "How many hours a week do you spend in social interaction outside of work?",
    type: 'scale',
    options: ['0-2 hours', '3-7 hours', '8-15 hours', '16-25 hours', '25+ hours'],
    required: true,
    section: 'Section 2: Self-Reported Behavioral Outcomes'
  },

  // Section 3: Life Events / Context - Questions 13-16
  {
    id: 13,
    text: "Have you experienced a major life change in the past 12 months?",
    type: 'multiple-choice',
    options: ['Yes', 'No'],
    required: true,
    section: 'Section 3: Life Events / Context'
  },
  {
    id: 14,
    text: "How often do you travel for work or leisure?",
    type: 'scale',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'],
    required: true,
    section: 'Section 3: Life Events / Context'
  },
  {
    id: 15,
    text: "On average, how many hours of sleep do you get per night?",
    type: 'scale',
    options: ['Less than 5', '5-6', '6-7', '7-8', '8-9', '9+'],
    required: true,
    section: 'Section 3: Life Events / Context'
  },
  {
    id: 16,
    text: "Do you believe personality is fixed or can be developed over time?",
    type: 'multiple-choice',
    options: ['Mostly fixed', 'Somewhat fixed', 'Can be developed', 'Highly changeable'],
    required: true,
    section: 'Section 3: Life Events / Context'
  },

  // Section 4: Q1—48 (Agreement 1—5) - Questions 17-64
  {
    id: 17,
    text: "I refine ideas until they're internally consistent.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 18,
    text: "I spot logical gaps quickly.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 19,
    text: "I enjoy building clean conceptual frameworks.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 20,
    text: "I'd rather understand why than just follow steps.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 21,
    text: "Precise definitions matter to me.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 22,
    text: "Elegant logic beats expedient fixes.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 23,
    text: "I structure tasks for efficiency.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 24,
    text: "Clear procedures and deadlines motivate me.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 25,
    text: "I cut unnecessary steps to hit goals.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 26,
    text: "I organize people/resources to deliver results.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 27,
    text: "I decide based on external facts and metrics.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 28,
    text: "I measure success by outcomes.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 29,
    text: "I check choices against my personal values.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 30,
    text: "Decisions need to feel right to me.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 31,
    text: "Authenticity matters more than approval.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 32,
    text: "I'm tuned to subtle shifts in my own feelings.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 33,
    text: "I prefer sincere one-on-one connections.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 34,
    text: "I protect what I care about deeply.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 35,
    text: "I track group mood in real time.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 36,
    text: "I adjust my tone to maintain harmony.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 37,
    text: "I express feelings openly to connect.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 38,
    text: "I notice when someone feels left out.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 39,
    text: "I can lift a room's energy.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 40,
    text: "I seek consensus when possible.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 41,
    text: "Outside my main domain, I can pick one likely long-range direction (months+), list key risks, and stick to it.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 42,
    text: "I anticipate likely outcomes.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 43,
    text: "I look for the deeper meaning behind events.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 44,
    text: "I revisit the past to foresee the future.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 45,
    text: "I follow an inner vision over trends.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 46,
    text: "When info is messy, I quickly identify the single most important line to pursue and drop side details.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 47,
    text: "I brainstorm many possibilities.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 48,
    text: "Novel, unstructured exploration energizes me.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 49,
    text: "I make unexpected connections between ideas.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 50,
    text: "I pivot to new ideas easily.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 51,
    text: "Variety keeps me engaged.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 52,
    text: "I see multiple ways things could unfold.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 53,
    text: "I attend to comfort and routine.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 54,
    text: "I maintain steady habits.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 55,
    text: "I store rich sensory memories.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 56,
    text: "I notice small environmental changes.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 57,
    text: "I prefer familiar methods that work.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 58,
    text: "I keep regular routines (sleep/meals/breaks) that keep my energy steady for several weeks.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 59,
    text: "I act decisively in the moment.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 60,
    text: "I notice concrete details others miss.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 61,
    text: "I enjoy hands-on challenges.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 62,
    text: "I assert myself when needed.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 63,
    text: "I take control in emergencies.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },
  {
    id: 64,
    text: "I like tangible results now.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 4: Q1—48 (Agreement 1—5)'
  },

  // Section 5: Q49—88 (Agreement 1—5) - Questions 65-104
  {
    id: 65,
    text: "I apply logical structure even in unfamiliar domains.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 66,
    text: "I adapt my analysis to context and audience.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 67,
    text: "I blend personal reasoning with established frameworks.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 68,
    text: "I project how today's logic will play out long-term.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 69,
    text: "In unfamiliar topics, I can build a simple logical model (clear definitions + relations) from scratch and test it with small examples.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 70,
    text: "I can create structure from scratch in new projects.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 71,
    text: "I flex plans as circumstances change.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 72,
    text: "I combine best practices with on-the-ground realities.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 73,
    text: "I forecast resource/effort needs over time.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 74,
    text: "I still deliver when norms or guidance are unclear.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 75,
    text: "I track my values accurately in unfamiliar settings.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 76,
    text: "I adapt how I express values to the situation.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 77,
    text: "When my values conflict with local norms, I can act in a way that fits the context without losing my own bearings.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 78,
    text: "I foresee the emotional impact of choices over time.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 79,
    text: "Even without role models, I can navigate by my values.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 80,
    text: "I read emotional atmospheres in unfamiliar groups.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 81,
    text: "I adjust social approach across different contexts.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 82,
    text: "I balance etiquette with what the moment needs.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 83,
    text: "I anticipate how group tone will evolve.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 84,
    text: "I can connect with diverse audiences without a script.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 85,
    text: "From a few cases, I infer an underlying pattern and forecast likely outcomes in new contexts.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 86,
    text: "I interpret signs differently based on context.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 87,
    text: "I link recurring themes from past cases to current data to predict how this will play out.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 88,
    text: "I model long-range trajectories in my head.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 89,
    text: "I form useful foresight with minimal data.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 90,
    text: "In unfamiliar areas, I can generate 4—6 distinct options without examples and pick 1—2 to test quickly.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 91,
    text: "I pivot ideas based on subtle situational cues.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 92,
    text: "I combine norms from different fields to ideate.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 93,
    text: "I imagine downstream consequences of options.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 94,
    text: "I keep internal steadiness even in new environments.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 95,
    text: "I adjust routines sensitively to changing context.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 96,
    text: "I fold standards/habits into sustainable rhythms.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 97,
    text: "I plan for comfort/health across seasons/years.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 98,
    text: "I can self-regulate without familiar cues.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 99,
    text: "I act effectively in novel, fast-moving situations.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 100,
    text: "I vary my force/pace to fit the moment.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 101,
    text: "I align tactics with rules and constraints on the fly.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 102,
    text: "I time action for maximum real-world impact.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },
  {
    id: 103,
    text: "I improvise competently without prior experience.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 5: Q49—88 (Agreement 1—5)'
  },

  // Section 6: Q89—112 Neuroticism (Agreement 1—7) - Questions 104-127
  {
    id: 104,
    text: "I worry about small things more than most.",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },
  {
    id: 105,
    text: "I stay calm when plans fall apart.",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },
  {
    id: 106,
    text: "I often feel on edge for no clear reason.",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },
  {
    id: 107,
    text: "Setbacks hit me hard emotionally.",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },
  {
    id: 108,
    text: "I recover quickly after stress.",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },
  {
    id: 109,
    text: "I frequently second-guess myself.",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },
  {
    id: 110,
    text: "I keep an even keel under pressure.",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },
  {
    id: 111,
    text: "I ruminate on mistakes.",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },
  {
    id: 112,
    text: "I'm resilient when criticized.",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },
  {
    id: 113,
    text: "Sudden changes spike my anxiety.",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },
  {
    id: 114,
    text: "I can relax even when uncertain.",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },
  {
    id: 115,
    text: "I have frequent mood swings.",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },
  {
    id: 116,
    text: "I sleep well despite stress.",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },
  {
    id: 117,
    text: "I fear worst-case scenarios.",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },
  {
    id: 118,
    text: "I regain perspective within a day.",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },
  {
    id: 119,
    text: "I feel overwhelmed easily.",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },
  {
    id: 120,
    text: "I can compartmentalize emotions when needed.",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },
  {
    id: 121,
    text: "I'm tense in social ambiguity.",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },
  {
    id: 122,
    text: "I soothe myself effectively.",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },
  {
    id: 123,
    text: "My mind races at night.",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },
  {
    id: 124,
    text: "I handle criticism without spiraling.",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },
  {
    id: 125,
    text: "I'm easily startled or alarmed.",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },
  {
    id: 126,
    text: "I maintain optimism in hard times.",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },
  {
    id: 127,
    text: "I feel \"emotionally fragile.\".",
    type: 'likert-7',
    options: ['1', '2', '3', '4', '5', '6', '7'],
    required: true,
    section: 'Section 6: Q89—112 Neuroticism (Agreement 1—7)'
  },

  // Section 7: Q113—124 Forced-Choice (A—D) - Questions 128-139
  {
    id: 128,
    text: "Deadline meltdown: First impulse?",
    type: 'forced-choice',
    options: ['A) Break it into logical steps', 'B) Focus on essential deliverables', 'C) Check in with your values', 'D) Rally the team'],
    required: true,
    section: 'Section 7: Q113—124 Forced-Choice (A—D)'
  },
  {
    id: 129,
    text: "Heated conflict: You tend to…",
    type: 'forced-choice',
    options: ['A) Find the logical core issue', 'B) Focus on practical resolution', 'C) Stay true to your principles', 'D) Ease group tension'],
    required: true,
    section: 'Section 7: Q113—124 Forced-Choice (A—D)'
  },
  {
    id: 130,
    text: "Total novelty, 48-hour deadline. Pick your first move.",
    type: 'forced-choice',
    options: ['A) Model the problem structure', 'B) Set up efficient workflows', 'C) Clarify your authentic approach', 'D) Build team energy'],
    required: true,
    section: 'Section 7: Q113—124 Forced-Choice (A—D)'
  },
  {
    id: 131,
    text: "Public mistake:",
    type: 'forced-choice',
    options: ['A) Analyze what went wrong', 'B) Fix it efficiently', 'C) Own it authentically', 'D) Reassure others'],
    required: true,
    section: 'Section 7: Q113—124 Forced-Choice (A—D)'
  },
  {
    id: 132,
    text: "When I've been overloaded for 2+ weeks, which remains easiest?",
    type: 'forced-choice',
    options: ['A) Thinking through problems', 'B) Getting things done', 'C) Staying true to values', 'D) Supporting others'],
    required: true,
    section: 'Section 7: Q113—124 Forced-Choice (A—D)'
  },
  {
    id: 133,
    text: "In recent flow states at work, which felt MOST effortless?",
    type: 'forced-choice',
    options: ['A) Building understanding', 'B) Driving results', 'C) Being authentic', 'D) Creating harmony'],
    required: true,
    section: 'Section 7: Q113—124 Forced-Choice (A—D)'
  },
  {
    id: 134,
    text: "Social strain:",
    type: 'forced-choice',
    options: ['A) Step back to think', 'B) Take practical action', 'C) Honor your boundaries', 'D) Repair relationships'],
    required: true,
    section: 'Section 7: Q113—124 Forced-Choice (A—D)'
  },
  {
    id: 135,
    text: "Sudden crisis:",
    type: 'forced-choice',
    options: ['A) Understand the situation', 'B) Take immediate action', 'C) Stay centered', 'D) Keep everyone calm'],
    required: true,
    section: 'Section 7: Q113—124 Forced-Choice (A—D)'
  },
  {
    id: 136,
    text: "Ambiguous authority:",
    type: 'forced-choice',
    options: ['A) Clarify the logic', 'B) Focus on deliverables', 'C) Follow your compass', 'D) Build consensus'],
    required: true,
    section: 'Section 7: Q113—124 Forced-Choice (A—D)'
  },
  {
    id: 137,
    text: "Creative brief is vague:",
    type: 'forced-choice',
    options: ['A) Define the framework', 'B) Start with what works', 'C) Express your vision', 'D) Collaborate with others'],
    required: true,
    section: 'Section 7: Q113—124 Forced-Choice (A—D)'
  },
  {
    id: 138,
    text: "Personal loss stress:",
    type: 'forced-choice',
    options: ['A) Process through understanding', 'B) Channel energy into action', 'C) Honor your feelings', 'D) Seek connection with others'],
    required: true,
    section: 'Section 7: Q113—124 Forced-Choice (A—D)'
  },
  {
    id: 139,
    text: "Everything going great:",
    type: 'forced-choice',
    options: ['A) Understand why it\'s working', 'B) Maximize the momentum', 'C) Savor the authenticity', 'D) Share the good energy'],
    required: true,
    section: 'Section 7: Q113—124 Forced-Choice (A—D)'
  },

  // Section 8: Q125—136 (Agreement 1—5) - Questions 140-151
  {
    id: 140,
    text: "I trust my top skills to carry me.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 8: Q125—136 (Agreement 1—5)'
  },
  {
    id: 141,
    text: "I feel most \"myself\" when leading with strengths.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 8: Q125—136 (Agreement 1—5)'
  },
  {
    id: 142,
    text: "I take initiative without waiting for permission.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 8: Q125—136 (Agreement 1—5)'
  },
  {
    id: 143,
    text: "I rely on my own judgment over trends.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 8: Q125—136 (Agreement 1—5)'
  },
  {
    id: 144,
    text: "I naturally set direction for others.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 8: Q125—136 (Agreement 1—5)'
  },
  {
    id: 145,
    text: "I recover confidence after setbacks.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 8: Q125—136 (Agreement 1—5)'
  },
  {
    id: 146,
    text: "I shape environments to fit my vision.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 8: Q125—136 (Agreement 1—5)'
  },
  {
    id: 147,
    text: "I communicate with clear intent.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 8: Q125—136 (Agreement 1—5)'
  },
  {
    id: 148,
    text: "I prefer decisions to dithering.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 8: Q125—136 (Agreement 1—5)'
  },
  {
    id: 149,
    text: "I'm comfortable being accountable.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 8: Q125—136 (Agreement 1—5)'
  },
  {
    id: 150,
    text: "I teach others my best methods.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 8: Q125—136 (Agreement 1—5)'
  },
  {
    id: 151,
    text: "I rarely feel shame when using my strengths.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 8: Q125—136 (Agreement 1—5)'
  },

  // Section 9: Q137—148 (Agreement 1—5) - Questions 152-163
  {
    id: 152,
    text: "I often judge myself against \"how it should be.\"",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 9: Q137—148 (Agreement 1—5)'
  },
  {
    id: 153,
    text: "I fear exposing weak areas.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 9: Q137—148 (Agreement 1—5)'
  },
  {
    id: 154,
    text: "I over-prepare to avoid mistakes.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 9: Q137—148 (Agreement 1—5)'
  },
  {
    id: 155,
    text: "I default to \"proper\" behavior under scrutiny.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 9: Q137—148 (Agreement 1—5)'
  },
  {
    id: 156,
    text: "Criticism lingers with me.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 9: Q137—148 (Agreement 1—5)'
  },
  {
    id: 157,
    text: "I feel rigid when rules are unclear.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 9: Q137—148 (Agreement 1—5)'
  },
  {
    id: 158,
    text: "I monitor how I appear to others.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 9: Q137—148 (Agreement 1—5)'
  },
  {
    id: 159,
    text: "I avoid tasks that hit my blind spots.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 9: Q137—148 (Agreement 1—5)'
  },
  {
    id: 160,
    text: "I sometimes pose as \"the proper version\" of me.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 9: Q137—148 (Agreement 1—5)'
  },
  {
    id: 161,
    text: "I worry about doing it the \"right way.\"",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 9: Q137—148 (Agreement 1—5)'
  },
  {
    id: 162,
    text: "External standards override my instincts.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 9: Q137—148 (Agreement 1—5)'
  },
  {
    id: 163,
    text: "I feel exposed when I can't meet expectations.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 9: Q137—148 (Agreement 1—5)'
  },

  // Section 10: Q149—160 (Agreement 1—5) - Questions 164-175
  {
    id: 164,
    text: "Encouragement unlocks new abilities in me.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 10: Q149—160 (Agreement 1—5)'
  },
  {
    id: 165,
    text: "I enjoy guidance in areas I'm unsure of.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 10: Q149—160 (Agreement 1—5)'
  },
  {
    id: 166,
    text: "I'm curious to develop unfamiliar skills.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 10: Q149—160 (Agreement 1—5)'
  },
  {
    id: 167,
    text: "Supportive partners bring out my best.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 10: Q149—160 (Agreement 1—5)'
  },
  {
    id: 168,
    text: "I notice fresh talents emerging lately.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 10: Q149—160 (Agreement 1—5)'
  },
  {
    id: 169,
    text: "I seek mentors who complement me.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 10: Q149—160 (Agreement 1—5)'
  },
  {
    id: 170,
    text: "I'm willing to try what once felt \"not me.\"",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 10: Q149—160 (Agreement 1—5)'
  },
  {
    id: 171,
    text: "I track growth in non-natural functions.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 10: Q149—160 (Agreement 1—5)'
  },
  {
    id: 172,
    text: "I enjoy experimenting outside my comfort zone.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 10: Q149—160 (Agreement 1—5)'
  },
  {
    id: 173,
    text: "I ask for feedback to grow.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 10: Q149—160 (Agreement 1—5)'
  },
  {
    id: 174,
    text: "I see \"latent\" strengths becoming usable.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 10: Q149—160 (Agreement 1—5)'
  },
  {
    id: 175,
    text: "I welcome co-creation to develop.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 10: Q149—160 (Agreement 1—5)'
  },

  // Section 11: Q161—172 (Agreement 1—5) - Questions 176-187
  {
    id: 176,
    text: "Under pressure I act on reliable gut.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 11: Q161—172 (Agreement 1—5)'
  },
  {
    id: 177,
    text: "In emergencies my body knows what to do.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 11: Q161—172 (Agreement 1—5)'
  },
  {
    id: 178,
    text: "I have skills I use well but rarely talk about.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 11: Q161—172 (Agreement 1—5)'
  },
  {
    id: 179,
    text: "I sometimes \"auto-pilot\" through chaos.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 11: Q161—172 (Agreement 1—5)'
  },
  {
    id: 180,
    text: "I sense when not to act, without explaining why.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 11: Q161—172 (Agreement 1—5)'
  },
  {
    id: 181,
    text: "I can be surprisingly forceful when needed.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 11: Q161—172 (Agreement 1—5)'
  },
  {
    id: 182,
    text: "I react quickly to physical cues.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 11: Q161—172 (Agreement 1—5)'
  },
  {
    id: 183,
    text: "I trust my instincts more than usual in crisis.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 11: Q161—172 (Agreement 1—5)'
  },
  {
    id: 184,
    text: "I downplay some talents others notice.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 11: Q161—172 (Agreement 1—5)'
  },
  {
    id: 185,
    text: "I make snap judgments that hold up later.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 11: Q161—172 (Agreement 1—5)'
  },
  {
    id: 186,
    text: "Stress can flip me into bold action.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 11: Q161—172 (Agreement 1—5)'
  },
  {
    id: 187,
    text: "I recognize when instinct is driving.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 11: Q161—172 (Agreement 1—5)'
  },

  // Section 12: Q173—180 (Agreement 1—5) - Questions 188-195
  {
    id: 188,
    text: "My personality has changed meaningfully since adolescence.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 12: Q173—180 (Agreement 1—5)'
  },
  {
    id: 189,
    text: "I intentionally develop traits that don't come naturally.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 12: Q173—180 (Agreement 1—5)'
  },
  {
    id: 190,
    text: "With effort, I can grow most skills.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 12: Q173—180 (Agreement 1—5)'
  },
  {
    id: 191,
    text: "Feedback accelerates my growth.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 12: Q173—180 (Agreement 1—5)'
  },
  {
    id: 192,
    text: "I seek environments that stretch me.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 12: Q173—180 (Agreement 1—5)'
  },
  {
    id: 193,
    text: "I notice long-term upgrades in how I think/feel.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 12: Q173—180 (Agreement 1—5)'
  },
  {
    id: 194,
    text: "I track growth goals and practice.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 12: Q173—180 (Agreement 1—5)'
  },

  // Section 13: Q181—188 (Agreement 1—5) - Questions 195-202
  {
    id: 195,
    text: "I accept limits and work around them constructively.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 13: Q181—188 (Agreement 1—5)'
  },
  {
    id: 196,
    text: "I catch myself before old habits derail me.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 13: Q181—188 (Agreement 1—5)'
  },
  {
    id: 197,
    text: "I can calm down without numbing or avoidance.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 13: Q181—188 (Agreement 1—5)'
  },
  {
    id: 198,
    text: "I set boundaries to protect my energy.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 13: Q181—188 (Agreement 1—5)'
  },
  {
    id: 199,
    text: "I repair conflicts directly and kindly.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 13: Q181—188 (Agreement 1—5)'
  },
  {
    id: 200,
    text: "I choose long-term gains over short-term relief.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 13: Q181—188 (Agreement 1—5)'
  },
  {
    id: 201,
    text: "I apologize and change course when wrong.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 13: Q181—188 (Agreement 1—5)'
  },
  {
    id: 202,
    text: "When a problem is complex and unclear, I can sit with ambiguity and map what's missing before choosing a direction.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 13: Q181—188 (Agreement 1—5)'
  },

  // Section 14: Q189—194 (Agreement 1—5) - Questions 203-208
  {
    id: 203,
    text: "Past hardship still affects my reactions.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 14: Q189—194 (Agreement 1—5)'
  },
  {
    id: 204,
    text: "Under trigger, I act \"not like myself.\"",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 14: Q189—194 (Agreement 1—5)'
  },
  {
    id: 205,
    text: "I've done healing work (therapy, coaching, etc.).",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 14: Q189—194 (Agreement 1—5)'
  },
  {
    id: 206,
    text: "I have healthy strategies to ground myself.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 14: Q189—194 (Agreement 1—5)'
  },
  {
    id: 207,
    text: "I can name triggers and patterns now.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 14: Q189—194 (Agreement 1—5)'
  },
  {
    id: 208,
    text: "I can return to baseline after being triggered.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 14: Q189—194 (Agreement 1—5)'
  },

  // Section 15: Q195—200 Forced-Choice (A—D) - Questions 209-214
  {
    id: 209,
    text: "Current focus:",
    type: 'forced-choice',
    options: ['A) Internal understanding', 'B) External achievement', 'C) Personal authenticity', 'D) Social connection'],
    required: true,
    section: 'Section 15: Q195—200 Forced-Choice (A—D)'
  },
  {
    id: 210,
    text: "Primary work role:",
    type: 'forced-choice',
    options: ['A) Analyst/Thinker', 'B) Organizer/Driver', 'C) Individual contributor', 'D) Team facilitator'],
    required: true,
    section: 'Section 15: Q195—200 Forced-Choice (A—D)'
  },
  {
    id: 211,
    text: "Social energy:",
    type: 'forced-choice',
    options: ['A) Prefer solitude', 'B) Task-focused groups', 'C) One-on-one depth', 'D) Group engagement'],
    required: true,
    section: 'Section 15: Q195—200 Forced-Choice (A—D)'
  },
  {
    id: 212,
    text: "Preferred pace:",
    type: 'forced-choice',
    options: ['A) Thoughtful and deliberate', 'B) Efficient and goal-driven', 'C) Authentic and sustainable', 'D) Responsive to others'],
    required: true,
    section: 'Section 15: Q195—200 Forced-Choice (A—D)'
  },
  {
    id: 213,
    text: "Learning style:",
    type: 'forced-choice',
    options: ['A) Conceptual frameworks', 'B) Practical application', 'C) Personal meaning', 'D) Collaborative exploration'],
    required: true,
    section: 'Section 15: Q195—200 Forced-Choice (A—D)'
  },
  {
    id: 214,
    text: "Big picture vs. detail:",
    type: 'forced-choice',
    options: ['A) Abstract patterns', 'B) Concrete systems', 'C) Personal vision', 'D) Contextual awareness'],
    required: true,
    section: 'Section 15: Q195—200 Forced-Choice (A—D)'
  },

  // Section 16: Q201—205 State (Right Now) 1—7 - Questions 215-219
  {
    id: 215,
    text: "Right now, my stress level is…",
    type: 'state',
    options: ['1 - Very Low', '2', '3', '4', '5', '6', '7 - Very High'],
    required: true,
    section: 'Section 16: Q201—205 State (Right Now) 1—7'
  },
  {
    id: 216,
    text: "Right now, my mood is…",
    type: 'state',
    options: ['1 - Very Negative', '2', '3', '4', '5', '6', '7 - Very Positive'],
    required: true,
    section: 'Section 16: Q201—205 State (Right Now) 1—7'
  },
  {
    id: 217,
    text: "In the last 24 hours, my sleep quality was…",
    type: 'state',
    options: ['1 - Very Poor', '2', '3', '4', '5', '6', '7 - Excellent'],
    required: true,
    section: 'Section 16: Q201—205 State (Right Now) 1—7'
  },
  {
    id: 218,
    text: "At this moment, I feel time pressure is…",
    type: 'state',
    options: ['1 - None', '2', '3', '4', '5', '6', '7 - Overwhelming'],
    required: true,
    section: 'Section 16: Q201—205 State (Right Now) 1—7'
  },
  {
    id: 219,
    text: "Right now, my ability to focus is…",
    type: 'state',
    options: ['1 - Very Poor', '2', '3', '4', '5', '6', '7 - Excellent'],
    required: true,
    section: 'Section 16: Q201—205 State (Right Now) 1—7'
  },

  // Section 17: Q206—213 Forced-Choice (A—B) - Questions 220-227
  {
    id: 220,
    text: "Which feels more natural?",
    type: 'multiple-choice',
    options: ['A) Internal logical analysis', 'B) External practical effectiveness'],
    required: true,
    section: 'Section 17: Q206—213 Forced-Choice (A—B)'
  },
  {
    id: 221,
    text: "Which feels more natural?",
    type: 'multiple-choice',
    options: ['A) Personal values and authenticity', 'B) Group harmony and connection'],
    required: true,
    section: 'Section 17: Q206—213 Forced-Choice (A—B)'
  },
  {
    id: 222,
    text: "Which feels more natural?",
    type: 'multiple-choice',
    options: ['A) Following inner vision and patterns', 'B) Exploring multiple possibilities'],
    required: true,
    section: 'Section 17: Q206—213 Forced-Choice (A—B)'
  },
  {
    id: 223,
    text: "Which feels more natural?",
    type: 'multiple-choice',
    options: ['A) Maintaining steady routines', 'B) Taking decisive action in the moment'],
    required: true,
    section: 'Section 17: Q206—213 Forced-Choice (A—B)'
  },
  {
    id: 224,
    text: "When making a tough call, I prioritize…",
    type: 'multiple-choice',
    options: ['A) What makes logical sense', 'B) What feels right to me'],
    required: true,
    section: 'Section 17: Q206—213 Forced-Choice (A—B)'
  },
  {
    id: 225,
    text: "When leading others, I lean more on…",
    type: 'multiple-choice',
    options: ['A) Clear structure and processes', 'B) Inspiring vision and values'],
    required: true,
    section: 'Section 17: Q206—213 Forced-Choice (A—B)'
  },
  {
    id: 226,
    text: "My default compass is…",
    type: 'multiple-choice',
    options: ['A) Objective analysis', 'B) Subjective judgment'],
    required: true,
    section: 'Section 17: Q206—213 Forced-Choice (A—B)'
  },
  {
    id: 227,
    text: "To move forward, I tend to…",
    type: 'multiple-choice',
    options: ['A) Gather data and analyze', 'B) Trust my instincts and act'],
    required: true,
    section: 'Section 17: Q206—213 Forced-Choice (A—B)'
  },

  // Section 18: Q217—230 Paired & Social Desirability (Agreement 1—5) - Questions 228-241
  {
    id: 228,
    text: "I enjoy refining logical structure.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 18: Q217—230 Paired & Social Desirability (Agreement 1—5)'
  },
  {
    id: 229,
    text: "I dislike spending time clarifying concepts.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 18: Q217—230 Paired & Social Desirability (Agreement 1—5)'
  },
  {
    id: 230,
    text: "I naturally read the room's emotions.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 18: Q217—230 Paired & Social Desirability (Agreement 1—5)'
  },
  {
    id: 231,
    text: "I usually miss shifts in group mood.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 18: Q217—230 Paired & Social Desirability (Agreement 1—5)'
  },
  {
    id: 232,
    text: "I act effectively under time pressure.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 18: Q217—230 Paired & Social Desirability (Agreement 1—5)'
  },
  {
    id: 233,
    text: "I freeze when rapid action is needed.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 18: Q217—230 Paired & Social Desirability (Agreement 1—5)'
  },
  {
    id: 234,
    text: "I prefer familiar routines that keep me steady.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 18: Q217—230 Paired & Social Desirability (Agreement 1—5)'
  },
  {
    id: 235,
    text: "I feel comfortable abandoning routines often.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 18: Q217—230 Paired & Social Desirability (Agreement 1—5)'
  },
  {
    id: 236,
    text: "I have never told a lie.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 18: Q217—230 Paired & Social Desirability (Agreement 1—5)'
  },
  {
    id: 237,
    text: "I always keep every promise I make.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 18: Q217—230 Paired & Social Desirability (Agreement 1—5)'
  },
  {
    id: 238,
    text: "I never feel angry with anyone.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 18: Q217—230 Paired & Social Desirability (Agreement 1—5)'
  },
  {
    id: 239,
    text: "I am always courteous, even to disagreeable people.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 18: Q217—230 Paired & Social Desirability (Agreement 1—5)'
  },
  {
    id: 240,
    text: "I never make mistakes.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 18: Q217—230 Paired & Social Desirability (Agreement 1—5)'
  },
  {
    id: 241,
    text: "I am completely unbiased in my judgments.",
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    section: 'Section 18: Q217—230 Paired & Social Desirability (Agreement 1—5)'
  },

  // Section 19: Q231—247 Mixed - Questions 242-247 (final 6 questions)
  {
    id: 242,
    text: "I need examples before I can generate useful options.",
    type: 'mixed',
    options: ['1 - Strongly Disagree', '2', '3', '4', '5 - Strongly Agree'],
    required: true,
    section: 'Section 19: Q231—247 Mixed'
  },
  {
    id: 243,
    text: "Keeping a consistent tone is better than retuning mid-stream, even with new groups.",
    type: 'mixed',
    options: ['1 - Strongly Disagree', '2', '3', '4', '5 - Strongly Agree'],
    required: true,
    section: 'Section 19: Q231—247 Mixed'
  },
  {
    id: 244,
    text: "When values conflict, I look to external norms because my own tend to drift.",
    type: 'mixed',
    options: ['1 - Strongly Disagree', '2', '3', '4', '5 - Strongly Agree'],
    required: true,
    section: 'Section 19: Q231—247 Mixed'
  },
  {
    id: 245,
    text: "You must organize a topic you don't know well.",
    type: 'forced-choice',
    options: ['A) Research established frameworks first', 'B) Jump in and build structure as you go', 'C) Find your personal angle first', 'D) Collaborate with others who know it'],
    required: true,
    section: 'Section 19: Q231—247 Mixed'
  },
  {
    id: 246,
    text: "With few examples, I can generate several plausible models/approaches to try.",
    type: 'mixed',
    options: ['1 - Strongly Disagree', '2', '3', '4', '5 - Strongly Agree'],
    required: true,
    section: 'Section 19: Q231—247 Mixed'
  },
  {
    id: 247,
    text: "How easily can you generate novel options without examples?",
    type: 'scale',
    options: ['Very Difficult', 'Difficult', 'Moderate', 'Easy', 'Very Easy'],
    required: true,
    section: 'Section 19: Q231—247 Mixed'
  }
];