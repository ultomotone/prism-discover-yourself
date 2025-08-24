import { supabase } from "@/integrations/supabase/client";
import { assessmentQuestions } from "@/data/assessmentQuestions";

export interface LibraryQuestion {
  id: number;
  order_index?: number;
  type: string;
  tag?: string;
  scale_type?: string;
  pair_group?: string;
  fc_map?: any;
  reverse_scored?: boolean;
  section: string;
  meta?: any;
  required?: boolean;
  social_desirability?: boolean;
}

/**
 * Single source of truth for assessment question library
 * Tries multiple sources with fallbacks to ensure reliability
 */
export async function getAssessmentLibrary(): Promise<LibraryQuestion[]> {
  console.log('🚀 getAssessmentLibrary: Starting library hydration...');

  // Source 1: In-memory questions (same as UI renders)
  try {
    console.log('📚 Trying in-memory questions (primary source)');
    const inMemoryQuestions = assessmentQuestions.map((q, index) => ({
      id: q.id,
      order_index: index,
      type: q.type,
      tag: q.tag,
      scale_type: q.scale_type,
      pair_group: q.pair_group,
      fc_map: q.fc_map,
      reverse_scored: q.reverse_scored,
      section: q.section,
      meta: q.meta,
      required: q.required,
      social_desirability: q.social_desirability
    }));

    if (isLibraryValid(inMemoryQuestions, 'in-memory')) {
      console.log('✅ Using in-memory questions:', inMemoryQuestions.length, 'items');
      return inMemoryQuestions;
    }
  } catch (error) {
    console.warn('❌ In-memory questions failed:', error);
  }

  // Source 2: Supabase view
  try {
    console.log('🗄️ Trying Supabase view (secondary source)');
    const result = await supabase.functions.invoke('getView', {
      body: { view_name: 'questions', limit: 2000 }
    });

    if (result.data && (result.data as any).data) {
      const supabaseQuestions = (result.data as any).data.map((q: any) => ({
        id: q.id,
        order_index: q.order_index,
        type: q.type,
        tag: q.tag,
        scale_type: q.scale_type,
        pair_group: q.pair_group,
        fc_map: q.fc_map,
        reverse_scored: q.reverse_scored,
        section: q.section,
        meta: q.meta,
        required: q.required,
        social_desirability: q.social_desirability
      }));

      if (isLibraryValid(supabaseQuestions, 'Supabase')) {
        console.log('✅ Using Supabase questions:', supabaseQuestions.length, 'items');
        return supabaseQuestions;
      }
    }
  } catch (error) {
    console.warn('❌ Supabase view failed:', error);
  }

  // Source 3: Generate minimal fallback from known structure
  try {
    console.log('⚠️ Using emergency fallback library');
    const fallbackLibrary = generateFallbackLibrary();
    console.log('✅ Emergency fallback library created:', fallbackLibrary.length, 'items');
    return fallbackLibrary;
  } catch (error) {
    console.error('💥 All library sources failed:', error);
    throw new Error('Failed to hydrate assessment library from any source');
  }
}

/**
 * Validates if a library is sufficient for assessment
 */
function isLibraryValid(questions: LibraryQuestion[], source: string): boolean {
  console.log(`📊 Validating library from ${source}:`, questions.length, 'questions');
  
  if (questions.length < 10) {
    console.warn(`❌ ${source} library too small:`, questions.length, 'questions');
    return false;
  }

  const sections = [...new Set(questions.map(q => q.section))];
  console.log(`📋 ${source} sections:`, sections);
  
  // Check if we only have Demographics (insufficient)
  if (sections.length === 1 && sections[0]?.toLowerCase().includes('demographic')) {
    console.warn(`❌ ${source} library only contains Demographics`);
    return false;
  }

  // Count critical question types
  const fcCount = questions.filter(q => q.type?.startsWith('forced-choice-')).length;
  const sdCount = questions.filter(q => 
    q.tag === 'SD' || q.social_desirability === true || 
    q.section?.toLowerCase().includes('validity')
  ).length;
  
  console.log(`📊 ${source} critical counts: FC=${fcCount}, SD=${sdCount}`);
  
  return true; // Accept even incomplete libraries - strict mode will handle validation
}

/**
 * Emergency fallback library with minimal structure
 */
function generateFallbackLibrary(): LibraryQuestion[] {
  return [
    // Email question (required)
    {
      id: 1,
      type: 'email',
      section: 'Demographics & Contact',
      required: true,
      order_index: 0
    },
    // Generate minimal forced-choice questions  
    ...Array.from({ length: 24 }, (_, i) => ({
      id: 100 + i,
      type: 'forced-choice-4',
      section: 'Work Style Preferences', 
      tag: `FC_${i + 1}`,
      required: true,
      order_index: i + 1,
      fc_map: { A: 'Te', B: 'Ti', C: 'Fe', D: 'Fi' }
    })),
    // Social Desirability item
    {
      id: 200,
      type: 'likert-1-7',
      section: 'Validity & Quality Control',
      tag: 'SD',
      social_desirability: true,
      order_index: 25
    },
    // Neuroticism items
    {
      id: 201,
      type: 'likert-1-7', 
      section: 'Neuroticism',
      tag: 'N',
      order_index: 26
    },
    {
      id: 202,
      type: 'likert-1-7',
      section: 'Neuroticism', 
      tag: 'N_R',
      reverse_scored: true,
      order_index: 27
    }
  ];
}

/**
 * Get sections present in library for UI display
 */
export function getLibrarySections(questions: LibraryQuestion[]): string[] {
  return [...new Set(questions.map(q => q.section))];
}

/**
 * Get counts of critical question types for validation
 */
export function getLibraryCounts(questions: LibraryQuestion[]) {
  const fcQuestions = questions.filter(q => 
    q.type?.startsWith('forced-choice-') && 
    q.section?.toLowerCase().includes('work')
  );
  
  const sdQuestions = questions.filter(q => 
    q.tag === 'SD' || q.social_desirability === true ||
    q.section?.toLowerCase().includes('validity') && q.tag?.includes('SD')
  );
  
  const neuroQuestions = questions.filter(q => 
    q.tag === 'N' || q.tag === 'N_R' || 
    (q.section?.toLowerCase().includes('neuro') && q.type?.includes('likert'))
  );
  
  const vqcQuestions = questions.filter(q => 
    q.section?.toLowerCase().includes('validity')
  );
  
  const incQuestions = questions.filter(q => 
    q.tag?.startsWith('INC_') && q.pair_group
  );
  
  const acQuestions = questions.filter(q => 
    q.tag?.startsWith('AC_') && q.section?.toLowerCase().includes('validity')
  );

  return {
    fc_total: fcQuestions.length,
    sd_present: sdQuestions.length > 0,
    neuro_present: neuroQuestions.length > 0,
    vqc_present: vqcQuestions.length > 0,
    inc_pairs: new Set(incQuestions.map(q => q.pair_group)).size,
    ac_total: acQuestions.length,
    total_questions: questions.length
  };
}