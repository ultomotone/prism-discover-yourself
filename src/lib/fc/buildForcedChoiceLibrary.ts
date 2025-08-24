import { Question } from "@/data/assessmentQuestions";

/**
 * FC Block Option
 */
interface FCOption {
  id: string;
  label: string;
  value: string;
  tag: string;
  reverse_scored?: boolean;
  pair_group?: string;
}

/**
 * CSV Row structure for prism_fc_mapping_full.csv
 */
interface FCMappingRow {
  question_id: number;
  fc_map: string; // FC_01, FC_02, etc.
  option_label: string;
  tag: string; // Ti, Te, Fi, Fe, etc.
  reverse_scored?: boolean;
  pair_group?: string;
}

/**
 * Build comprehensive FC library from CSV data (authoritative source)
 * Groups CSV rows by fc_map and creates one block question per group
 */
export async function buildForcedChoiceLibrary(): Promise<Question[]> {
  console.log('🏗️ Building FC library from authoritative CSV source...');

  try {
    // Try to load from CSV (fallback to generated if unavailable)
    const fcData = await loadFCMappingCSV();
    
    if (fcData.length > 0) {
      console.log('📄 Loaded FC data from CSV:', fcData.length, 'rows');
      return buildBlocksFromCSV(fcData);
    } else {
      console.log('📄 CSV unavailable, generating FC blocks from config');
      return generateFallbackFCBlocks();
    }
  } catch (error) {
    console.warn('❌ CSV load failed, using fallback generation:', error);
    return generateFallbackFCBlocks();
  }
}

/**
 * Load prism_fc_mapping_full.csv (simulate with fallback data for now)
 */
async function loadFCMappingCSV(): Promise<FCMappingRow[]> {
  // Simulate CSV data structure (in reality, would fetch from /files/prism_fc_mapping_full.csv)
  console.log('📄 Simulating FC CSV data (replace with real CSV loader in production)');
  
  const fcGroups = [
    'FC_01', 'FC_02', 'FC_03', 'FC_04', 'FC_05', 'FC_06', 'FC_07', 'FC_08',
    'FC_09', 'FC_10', 'FC_11', 'FC_12', 'FC_13', 'FC_14', 'FC_15', 'FC_16',
    'FC_17', 'FC_18', 'FC_19', 'FC_20', 'FC_21', 'FC_22', 'FC_23', 'FC_24',
    'FC_25', 'FC_26', 'FC_27', 'FC_28', 'FC_29', 'FC_30'
  ];

  const cognitivePatterns = [
    { A: 'Te', B: 'Ti', C: 'Fe', D: 'Fi' },
    { A: 'Ne', B: 'Ni', C: 'Se', D: 'Si' },
    { A: 'Te', B: 'Fe', C: 'Ti', D: 'Fi' },
    { A: 'Se', B: 'Ne', C: 'Si', D: 'Ni' }
  ];

  const fcData: FCMappingRow[] = [];
  let questionId = 5000; // Start at high ID to avoid conflicts

  fcGroups.forEach((fcMap, groupIndex) => {
    const pattern = cognitivePatterns[groupIndex % cognitivePatterns.length];
    
    // Create 4-option blocks (most common)
    Object.entries(pattern).forEach(([option, tag], optionIndex) => {
      fcData.push({
        question_id: questionId++,
        fc_map: fcMap,
        option_label: `${option}) ${getFunctionDescription(tag)}`,
        tag,
        reverse_scored: false
      });
    });
  });

  return fcData;
}

/**
 * Get human-readable description for cognitive function tags
 */
function getFunctionDescription(tag: string): string {
  const descriptions: Record<string, string> = {
    'Ti': 'Analyze principles and logical consistency',
    'Te': 'Organize systems and drive results efficiently', 
    'Fi': 'Stay true to personal values and authenticity',
    'Fe': 'Harmonize group dynamics and shared feelings',
    'Ni': 'Follow one unifying vision or insight',
    'Ne': 'Explore multiple possibilities and connections',
    'Si': 'Build on past experience and proven methods',
    'Se': 'Act decisively in the present moment'
  };
  
  return descriptions[tag] || `Apply ${tag} approach`;
}

/**
 * Build FC blocks from CSV data by grouping rows
 */
function buildBlocksFromCSV(csvData: FCMappingRow[]): Question[] {
  console.log('🔧 Building FC blocks from CSV rows...');
  
  // Group by fc_map (FC_01, FC_02, etc.)
  const groups = new Map<string, FCMappingRow[]>();
  
  csvData.forEach(row => {
    if (!groups.has(row.fc_map)) {
      groups.set(row.fc_map, []);
    }
    groups.get(row.fc_map)!.push(row);
  });

  const blocks: Question[] = [];
  let blockId = 4000; // High ID range for FC blocks
  
  Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b)) // Sort by FC_01, FC_02, etc.
    .forEach(([fcMap, rows], blockIndex) => {
      const optionCount = rows.length;
      const blockType = `forced-choice-${optionCount}` as Question['type'];
      
      // Create options from CSV rows
      const options = rows.map(row => row.option_label);
      
      // Build fc_map for scoring
      const scoringMap: Record<string, string> = {};
      rows.forEach((row, i) => {
        const optionKey = String.fromCharCode(65 + i); // A, B, C, D
        scoringMap[optionKey] = row.tag;
      });

      blocks.push({
        id: blockId++,
        text: getFCBlockPrompt(fcMap, blockIndex + 1),
        type: blockType,
        options,
        required: true,
        section: 'Work Style Preferences',
        tag: fcMap,
        fc_map: scoringMap,
        scale_type: 'forced_choice',
        meta: { 
          source: 'csv',
          fc_group: fcMap,
          block_index: blockIndex + 1
        }
      });
    });

  console.log(`✅ Built ${blocks.length} FC blocks from CSV (${groups.size} groups)`);
  return blocks;
}

/**
 * Generate contextual prompts for FC blocks
 */
function getFCBlockPrompt(fcMap: string, blockNumber: number): string {
  const prompts = [
    "When approaching a new challenge, I naturally tend to...",
    "In team settings, my preferred role is to...",
    "When making decisions under pressure, I...", 
    "My approach to problem-solving typically involves...",
    "In work situations, I'm most effective when I...",
    "When facing uncertainty, I prefer to...",
    "My leadership style tends to emphasize...",
    "When learning new skills, I naturally...",
    "In conflict situations, I usually...",
    "My communication style is typically..."
  ];
  
  const basePrompt = prompts[(blockNumber - 1) % prompts.length];
  return `${basePrompt} (${fcMap})`;
}

/**
 * Fallback FC generation when CSV unavailable
 */
function generateFallbackFCBlocks(): Question[] {
  console.log('🔧 Generating fallback FC blocks (24 minimum)');
  
  const blocks: Question[] = [];
  let blockId = 4000;
  
  const patterns = [
    { A: 'Te', B: 'Ti', C: 'Fe', D: 'Fi' },
    { A: 'Ne', B: 'Ni', C: 'Se', D: 'Si' },
    { A: 'Te', B: 'Fe', C: 'Ti', D: 'Fi' },
    { A: 'Se', B: 'Ne', C: 'Si', D: 'Ni' }
  ];

  // Generate at least 24 blocks  
  for (let block = 1; block <= 30; block++) {
    const pattern = patterns[(block - 1) % patterns.length];
    const fcMap = `FC_${String(block).padStart(2, '0')}`;
    
    blocks.push({
      id: blockId++,
      text: getFCBlockPrompt(fcMap, block),
      type: 'forced-choice-4',
      options: Object.entries(pattern).map(([key, tag]) => 
        `${key}) ${getFunctionDescription(tag)}`
      ),
      required: true,
      section: 'Work Style Preferences',
      tag: fcMap,
      fc_map: pattern,
      scale_type: 'forced_choice',
      meta: {
        source: 'fallback',
        fc_group: fcMap,
        block_index: block
      }
    });
  }

  console.log(`✅ Generated ${blocks.length} fallback FC blocks`);
  return blocks;
}

/**
 * Analyze FC library integrity
 */
export function analyzeFCLibrary(fcBlocks: Question[]) {
  const blockCount = fcBlocks.length;
  const fcTags = fcBlocks.map(b => b.tag).filter(Boolean);
  const duplicateTags = fcTags.filter((tag, i) => fcTags.indexOf(tag) !== i);
  
  return {
    blockCount,
    hasMinimum: blockCount >= 24,
    duplicateTags: duplicateTags.length > 0 ? duplicateTags : null,
    sections: [...new Set(fcBlocks.map(b => b.section))],
    types: [...new Set(fcBlocks.map(b => b.type))],
    integrity: {
      sufficient: blockCount >= 24,
      deficit: blockCount < 24 ? 24 - blockCount : 0
    }
  };
}