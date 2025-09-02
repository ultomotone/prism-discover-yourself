// Script to seed test fixtures into Supabase
import { supabase } from '@/lib/supabase/client';
import { ALL_FIXTURES } from '../fixtures/assessmentFixtures';

export interface FixtureSeedResult {
  fixture: string;
  success: boolean;
  questionsSeeded: number;
  error?: string;
}

/**
 * Seeds a fixture into the assessment_questions table
 */
export async function seedFixture(fixtureName: string): Promise<FixtureSeedResult> {
  const fixture = ALL_FIXTURES.find(f => f.name === fixtureName);
  
  if (!fixture) {
    return {
      fixture: fixtureName,
      success: false,
      questionsSeeded: 0,
      error: `Fixture ${fixtureName} not found`
    };
  }

  try {
    console.log(`Seeding fixture: ${fixture.name}`);
    
    // Clear existing questions for this fixture
    await supabase
      .from('assessment_questions')
      .delete()
      .like('meta->fixture', `%${fixtureName}%`);

    // Transform questions to match DB schema
    const dbQuestions = fixture.questions.map(q => ({
      id: q.id,
      order_index: q.id, // Use ID as order for simplicity
      type: q.type,
      tag: q.tag || null,
      scale_type: q.scale_type || null,
      pair_group: q.pair_group || null,
      fc_map: q.fc_map ? JSON.stringify(q.fc_map) : null,
      reverse_scored: q.reverse_scored || false,
      section: q.section,
      required: q.required,
      meta: {
        fixture: fixtureName,
        text: q.text,
        options: q.options || [],
        social_desirability: q.social_desirability || false
      }
    }));

    // Insert questions
    const { error } = await supabase
      .from('assessment_questions')
      .upsert(dbQuestions, { onConflict: 'id' });

    if (error) throw error;

    return {
      fixture: fixtureName,
      success: true,
      questionsSeeded: dbQuestions.length
    };

  } catch (error) {
    console.error(`Error seeding fixture ${fixtureName}:`, error);
    return {
      fixture: fixtureName,
      success: false,
      questionsSeeded: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Seeds all fixtures
 */
export async function seedAllFixtures(): Promise<FixtureSeedResult[]> {
  console.log('Starting fixture seeding...');
  
  const results: FixtureSeedResult[] = [];
  
  for (const fixture of ALL_FIXTURES) {
    const result = await seedFixture(fixture.name);
    results.push(result);
  }

  return results;
}

/**
 * Cleans up all fixture data
 */
export async function cleanupFixtures(): Promise<void> {
  console.log('Cleaning up fixtures...');
  
  try {
    await supabase
      .from('assessment_questions')
      .delete()
      .not('meta->fixture', 'is', null);
      
    console.log('Fixture cleanup completed');
  } catch (error) {
    console.error('Error cleaning up fixtures:', error);
    throw error;
  }
}

/**
 * Gets the current active fixture
 */
export async function getActiveFixture(): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('assessment_questions')
      .select('meta')
      .not('meta->fixture', 'is', null)
      .limit(1)
      .single();

    if (error || !data) return null;
    
    return data.meta && typeof data.meta === 'object' && 'fixture' in data.meta 
      ? (data.meta as any).fixture 
      : null;
  } catch {
    return null;
  }
}

/**
 * Command line interface for fixture management
 */
export async function runFixtureCommand(command: string, fixtureName?: string) {
  switch (command) {
    case 'seed-all':
      const results = await seedAllFixtures();
      console.log('Seed Results:', results);
      break;
      
    case 'seed':
      if (!fixtureName) {
        console.error('Fixture name required for seed command');
        return;
      }
      const result = await seedFixture(fixtureName);
      console.log('Seed Result:', result);
      break;
      
    case 'cleanup':
      await cleanupFixtures();
      break;
      
    case 'status':
      const active = await getActiveFixture();
      console.log('Active Fixture:', active || 'None');
      break;
      
    default:
      console.log('Available commands: seed-all, seed <fixture>, cleanup, status');
  }
}

// CLI runner if called directly
if (require.main === module) {
  const [command, fixtureName] = process.argv.slice(2);
  runFixtureCommand(command, fixtureName).catch(console.error);
}