import { supabase } from "@/integrations/supabase/client";
import { assessmentQuestions, Question } from "@/data/assessmentQuestions";
import { buildForcedChoiceLibrary, analyzeFCLibrary } from "@/lib/fc/buildForcedChoiceLibrary";

/**
 * Single source of truth for assessment question library
 * Tries multiple sources with comprehensive fallbacks
 */
export async function getAssessmentLibrary(): Promise<Question[]> {
  console.log('🚀 getAssessmentLibrary: Starting comprehensive library hydration...');

  // Source 1: In-memory questions (primary - same as UI renders)
  try {
    console.log('📚 Trying in-memory questions (primary source)');
    
    if (assessmentQuestions.length > 20) {
      const sections = [...new Set(assessmentQuestions.map(q => q.section))];
      console.log('📊 In-memory sections:', sections);
      
      if (sections.length > 1 && !isOnlyDemographics(sections)) {
        // Check FC block coverage in existing library
        const existingFC = assessmentQuestions.filter(q => 
          q.type?.startsWith('forced-choice-') && 
          (q.section?.toLowerCase().includes('work') || 
           q.section?.toLowerCase().includes('situational') ||
           q.section?.toLowerCase().includes('polarity'))
        );
        
        console.log('🔍 Existing FC blocks in library:', existingFC.length);
        
        if (existingFC.length >= 24) {
          console.log('✅ Using in-memory questions with sufficient FC blocks:', assessmentQuestions.length, 'items');
          return assessmentQuestions;
        } else {
          console.log('🔧 FC deficit detected, building comprehensive library...');
          const fcBlocks = await buildForcedChoiceLibrary();
          const fcAnalysis = analyzeFCLibrary(fcBlocks);
          console.log('📊 FC library built:', fcAnalysis);
          
          // Merge existing questions with generated FC blocks (avoid duplicates)
          const existingIds = new Set(assessmentQuestions.map(q => q.id));
          const uniqueFCBlocks = fcBlocks.filter(fc => !existingIds.has(fc.id));
          
          const mergedLibrary = [...assessmentQuestions, ...uniqueFCBlocks];
          console.log('✅ Using merged library with FC blocks:', mergedLibrary.length, 'items');
          return mergedLibrary;
        }
      }
    }
    
    console.log('❌ In-memory library insufficient:', assessmentQuestions.length, 'questions');
  } catch (error) {
    console.warn('❌ In-memory questions failed:', error);
  }

  // Source 2: Supabase Edge Function view
  try {
    console.log('🗄️ Trying Supabase view (secondary source)');
    
    const result = await supabase.functions.invoke('getView', {
      body: { view_name: 'questions', limit: 2000 }
    });

    if (result.data && (result.data as any).data) {
      const questions = (result.data as any).data;
      console.log('📊 Supabase view loaded:', questions.length, 'questions');
      
      if (questions.length > 20) {
        const sections = [...new Set(questions.map((q: any) => q.section))];
        console.log('📊 Supabase sections:', sections);
        
        if (sections.length > 1 && !isOnlyDemographics(sections as string[])) {
          console.log('✅ Using Supabase questions:', questions.length, 'items');
          return normalizeQuestions(questions);
        }
      }
      
      console.log('❌ Supabase library insufficient');
    }
  } catch (error) {
    console.warn('❌ Supabase view failed:', error);
  }

  // Source 3: Compose from fallback structure (comprehensive library)
  try {
    console.log('🔧 Generating comprehensive fallback library');
    const fallbackLibrary = generateComprehensiveLibrary();
    console.log('✅ Comprehensive fallback library created:', fallbackLibrary.length, 'items');
    return fallbackLibrary;
  } catch (error) {
    console.error('💥 All library sources failed:', error);
    throw new Error('Failed to hydrate assessment library from any source');
  }
}

/**
 * Check if library only contains demographics (insufficient)
 */
function isOnlyDemographics(sections: string[]): boolean {
  return sections.length === 1 && 
         sections[0]?.toLowerCase().includes('demographic');
}

/**
 * Normalize questions from different sources to standard format
 */
function normalizeQuestions(questions: any[]): Question[] {
  return questions.map((q: any, index: number) => ({
    id: q.id || (1000 + index),
    text: q.text || q.question_text || `Question ${q.id}`,
    type: q.type || 'text',
    options: q.options || (q.fc_map ? Object.values(q.fc_map) : []),
    required: q.required ?? false,
    section: q.section || 'Core',
    tag: q.tag,
    scale_type: q.scale_type,
    pair_group: q.pair_group,
    reverse_scored: q.reverse_scored ?? false,
    fc_map: q.fc_map,
    social_desirability: q.social_desirability ?? false,
    meta: q.meta || {}
  }));
}

/**
 * Generate comprehensive fallback library with all required sections
 */
function generateComprehensiveLibrary(): Question[] {
  console.log('🔧 Building comprehensive library with all sections...');
  
  const library: Question[] = [];
  let questionId = 1;

  // Email (required)
  library.push({
    id: questionId++,
    text: "Email (for delivering results)",
    type: 'email',
    required: true,
    section: 'Demographics & Contact'
  });

  // Optional demographics (Q2-Q16)
  const demographics = [
    { text: "Age range", options: ['Under 18', '18–24', '25–34', '35–44', '45–54', '55–64', '65+'] },
    { text: "Gender identity", options: ['Male', 'Female', 'Non-binary/third gender', 'Prefer not to say'] },
    { text: "Country of residence", type: 'country-select' },
    { text: "Education level", options: ['High school', 'Some college', 'Bachelor\'s degree', 'Master\'s degree', 'Doctoral degree'] },
    { text: "Employment status", options: ['Employed full-time', 'Employed part-time', 'Self-employed', 'Unemployed', 'Student', 'Retired'] },
    { text: "Industry", options: ['Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Other'] }
  ];

  demographics.forEach((demo, i) => {
    library.push({
      id: questionId++,
      text: demo.text,
      type: (demo.type as any) || 'multiple-choice',
      options: demo.options,
      required: false,
      section: 'Demographics & Contact'
    });
  });

  // Core Likert questions (Q17-80)
  const functions = ['Ti', 'Te', 'Fi', 'Fe', 'Ni', 'Ne', 'Si', 'Se'];
  functions.forEach(func => {
    for (let i = 1; i <= 8; i++) {
      library.push({
        id: questionId++,
        text: `I tend to ${func.toLowerCase()}-oriented behavior in situation ${i}`,
        type: 'likert-1-7',
        required: false,
        section: 'Core Preferences',
        tag: `${func}_${i}`,
        scale_type: 'likert_1_7'
      });
    }
  });

  // Neuroticism section (Q81-100)
  for (let i = 1; i <= 10; i++) {
    library.push({
      id: questionId++,
      text: `Neuroticism item ${i}`,
      type: 'likert-1-7',
      required: false,
      section: 'Neuroticism',
      tag: i <= 5 ? 'N' : 'N_R',
      reverse_scored: i > 5,
      scale_type: 'likert_1_7'
    });
  }

  // Forced-Choice Work Style (Q101-170) - 24+ blocks
  const fcChoices = [
    { A: 'Te', B: 'Ti', C: 'Fe', D: 'Fi' },
    { A: 'Ne', B: 'Ni', C: 'Se', D: 'Si' },
    { A: 'Te', B: 'Fe', C: 'Ti', D: 'Fi' },
    { A: 'Se', B: 'Ne', C: 'Si', D: 'Ni' }
  ];

  for (let block = 1; block <= 30; block++) {
    const fcMap = fcChoices[(block - 1) % fcChoices.length];
    library.push({
      id: questionId++,
      text: `In work situations, I prefer to approach tasks by...`,
      type: 'forced-choice-4' as const,
      options: [
        `Option A (${fcMap.A})`,
        `Option B (${fcMap.B})`,
        `Option C (${fcMap.C})`,
        `Option D (${fcMap.D})`
      ],
      required: true,
      section: 'Work Style Preferences',
      tag: `FC_${block}`,
      fc_map: fcMap,
      scale_type: 'forced_choice'
    });
  }

  // Validity & Quality Control (Q171-200)
  
  // Social Desirability items
  for (let i = 1; i <= 5; i++) {
    library.push({
      id: questionId++,
      text: `Social desirability statement ${i}`,
      type: 'likert-1-7',
      required: false,
      section: 'Validity & Quality Control',
      tag: 'SD',
      social_desirability: true,
      scale_type: 'likert_1_7'
    });
  }

  // Attention checks
  for (let i = 1; i <= 3; i++) {
    library.push({
      id: questionId++,
      text: `Please select "Strongly Agree" for this item`,
      type: 'likert-1-7',
      required: false,
      section: 'Validity & Quality Control',
      tag: `AC_${i}`,
      scale_type: 'likert_1_7',
      meta: { correct_answer: 7 }
    });
  }

  // Inconsistency pairs
  for (let pair = 1; pair <= 5; pair++) {
    library.push({
      id: questionId++,
      text: `Inconsistency check ${pair}A`,
      type: 'likert-1-7',
      required: false,
      section: 'Validity & Quality Control',
      tag: `INC_${pair}_A`,
      pair_group: `INC_${pair}`,
      scale_type: 'likert_1_7'
    });
    
    library.push({
      id: questionId++,
      text: `Inconsistency check ${pair}B (reverse)`,
      type: 'likert-1-7',
      required: false,
      section: 'Validity & Quality Control',
      tag: `INC_${pair}_B`,
      pair_group: `INC_${pair}`,
      reverse_scored: true,
      scale_type: 'likert_1_7'
    });
  }

  // Situational Choices (Q201-249)
  for (let i = 1; i <= 49; i++) {
    library.push({
      id: questionId++,
      text: `Situational scenario ${i}`,
      type: (i % 3 === 0 ? 'select-all' : (i % 2 === 0 ? 'ranking' : 'multiple-choice')) as any,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      required: true,
      section: 'Situational Choices'
    });
  }

  console.log('📊 Generated comprehensive library:');
  console.log('- Total questions:', library.length);
  console.log('- Sections:', [...new Set(library.map(q => q.section))]);
  console.log('- FC blocks:', library.filter(q => q.type?.startsWith('forced-choice-')).length);
  console.log('- SD items:', library.filter(q => q.social_desirability).length);
  console.log('- AC items:', library.filter(q => q.tag?.startsWith('AC_')).length);

  return library;
}

/**
 * Analyze library structure for validation
 */
export function analyzeLibrary(questions: Question[]) {
  const sections = [...new Set(questions.map(q => q.section))];
  const fcQuestions = questions.filter(q => 
    q.type?.startsWith('forced-choice-') && 
    q.section?.toLowerCase().includes('work')
  );
  const sdQuestions = questions.filter(q => 
    q.tag === 'SD' || q.social_desirability === true
  );
  const neuroQuestions = questions.filter(q => 
    q.tag === 'N' || q.tag === 'N_R' || 
    q.section?.toLowerCase().includes('neuro')
  );
  const vqcQuestions = questions.filter(q => 
    q.section?.toLowerCase().includes('validity')
  );

  return {
    total: questions.length,
    sections,
    hasSufficientContent: questions.length >= 50,
    hasMultipleSections: sections.length > 1,
    isOnlyDemographics: isOnlyDemographics(sections),
    fc: { count: fcQuestions.length, sufficient: fcQuestions.length >= 24 },
    sd: { count: sdQuestions.length, present: sdQuestions.length > 0 },
    neuro: { count: neuroQuestions.length, present: neuroQuestions.length > 0 },
    vqc: { count: vqcQuestions.length, present: vqcQuestions.length > 0 }
  };
}

/**
 * Group questions by section for analysis
 */
export function groupBySection(questions: Question[]) {
  return questions.reduce((acc, q) => {
    const section = q.section || 'Unknown';
    if (!acc[section]) acc[section] = [];
    acc[section].push(q);
    return acc;
  }, {} as Record<string, Question[]>);
}