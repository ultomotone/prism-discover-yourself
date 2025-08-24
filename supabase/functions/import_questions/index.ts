import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuestionImport {
  id: number;
  order_index?: number;
  type: string;
  tag?: string;
  scale_type?: string;
  pair_group?: string;
  fc_map?: any;
  reverse_scored?: boolean;
  section: string;
  required?: boolean;
  meta?: any;
}

interface ImportRequest {
  questions?: QuestionImport[];
  csv_data?: string;  // CSV string for bulk import
  run_integrity_check?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { questions, csv_data, run_integrity_check = true }: ImportRequest = await req.json();

    let questionsToImport: QuestionImport[] = [];

    // Process CSV if provided
    if (csv_data && typeof csv_data === 'string') {
      console.log('Parsing CSV data...');
      try {
        const lines = csv_data.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          
          headers.forEach((header, index) => {
            const value = values[index] || '';
            // Parse common fields
            if (header === 'id' || header === 'order_index') {
              row[header] = value ? parseInt(value) : null;
            } else if (header === 'reverse_scored' || header === 'required') {
              row[header] = value.toLowerCase() === 'true' || value === '1';
            } else if (header === 'fc_map' || header === 'meta') {
              try {
                row[header] = value ? JSON.parse(value) : null;
              } catch {
                row[header] = value || null;
              }
            } else {
              row[header] = value || null;
            }
          });
          
          if (row.id && row.type && row.section) {
            questionsToImport.push(row as QuestionImport);
          }
        }
        console.log(`Parsed ${questionsToImport.length} questions from CSV`);
      } catch (error) {
        console.error('CSV parsing error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to parse CSV data' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Process direct questions array
    if (questions && Array.isArray(questions)) {
      questionsToImport = [...questionsToImport, ...questions];
    }

    if (questionsToImport.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No questions provided for import' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Importing ${questionsToImport.length} questions...`);

    // Deduplicate by id (last occurrence wins)
    const byId = new Map<number, QuestionImport>();
    for (const q of questionsToImport) byId.set(q.id, q);
    const uniqueQuestions = Array.from(byId.values());

    // Fetch existing records to preserve fields unless explicitly changed
    const ids = uniqueQuestions.map(q => q.id);
    const { data: existingRows, error: fetchError } = await supabaseClient
      .from('assessment_questions')
      .select('id, order_index, type, tag, scale_type, pair_group, fc_map, reverse_scored, section, required, meta')
      .in('id', ids);

    if (fetchError) {
      console.error('Fetch existing questions error:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch existing questions', details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const existingById = new Map<number, any>((existingRows || []).map(r => [r.id, r]));

    // Merge preserving critical fields when not explicitly provided
    const merged: any[] = [];
    let insertedCount = 0;
    let updatedCount = 0;

    const mergeField = (incoming: any, existing: any, key: string) => {
      const val = incoming?.[key];
      const isBlankString = typeof val === 'string' && val.trim() === '';
      if (val === undefined || val === null || isBlankString) {
        return existing?.[key] ?? null;
      }
      return val;
    };

    for (const q of uniqueQuestions) {
      const ex = existingById.get(q.id);
      const record = {
        id: q.id,
        order_index: mergeField(q, ex, 'order_index'),
        type: mergeField(q, ex, 'type'),
        tag: mergeField(q, ex, 'tag'),
        scale_type: mergeField(q, ex, 'scale_type'),
        pair_group: mergeField(q, ex, 'pair_group'),
        fc_map: mergeField(q, ex, 'fc_map'),
        reverse_scored: mergeField(q, ex, 'reverse_scored'),
        section: mergeField(q, ex, 'section'),
        required: mergeField(q, ex, 'required'),
        meta: mergeField(q, ex, 'meta')
      };

      // Validate required fields
      if (!record.type || !record.section) {
        return new Response(
          JSON.stringify({ error: `Question ${q.id} missing required fields (type/section)` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (ex) updatedCount++; else insertedCount++;
      merged.push(record);
    }

    // Upsert merged questions (preserving existing critical fields)
    const { data: importedQuestions, error: importError } = await supabaseClient
      .from('assessment_questions')
      .upsert(merged, { onConflict: 'id' })
      .select();

    if (importError) {
      console.error('Import error:', importError);
      return new Response(
        JSON.stringify({ error: 'Failed to import questions', details: importError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let integrityResults = null;

    // Run integrity check if requested
    if (run_integrity_check) {
      console.log('Running integrity check...');
      const { data: checkResults, error: checkError } = await supabaseClient
        .rpc('check_question_library_integrity');

      if (checkError) {
        console.error('Integrity check error:', checkError);
      } else {
        integrityResults = checkResults?.[0] || null;
        console.log('Integrity check results:', integrityResults);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        imported_count: importedQuestions?.length || 0,
        inserted_count: insertedCount,
        updated_count: updatedCount,
        questions: importedQuestions,
        integrity_check: integrityResults,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in import_questions function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});