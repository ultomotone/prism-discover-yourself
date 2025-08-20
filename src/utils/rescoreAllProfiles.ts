import { supabase } from "@/integrations/supabase/client";

export async function rescoreAllProfiles() {
  console.log('Starting full profile rescore with v1.1 calculations...');
  
  try {
    // Get all profiles with session IDs
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('session_id, created_at')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching profiles:', fetchError);
      return { error: fetchError };
    }

    if (!profiles || profiles.length === 0) {
      console.log('No profiles found to rescore');
      return { message: 'No profiles found' };
    }

    console.log(`Found ${profiles.length} profiles to rescore`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ session_id: string; error: any }> = [];

    // Process in batches to avoid overwhelming the system
    const batchSize = 10;
    for (let i = 0; i < profiles.length; i += batchSize) {
      const batch = profiles.slice(i, i + batchSize);
      
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(profiles.length / batchSize)}`);
      
      // Process batch in parallel
      const batchPromises = batch.map(async (profile) => {
        try {
          const { data, error } = await supabase.functions.invoke('score_prism', {
            body: { session_id: profile.session_id }
          });

          if (error) {
            console.error(`Error rescoring ${profile.session_id}:`, error);
            errors.push({ session_id: profile.session_id, error });
            errorCount++;
          } else {
            successCount++;
            if (successCount % 50 === 0) {
              console.log(`Successfully rescored ${successCount} profiles...`);
            }
          }
        } catch (err) {
          console.error(`Exception rescoring ${profile.session_id}:`, err);
          errors.push({ session_id: profile.session_id, error: err });
          errorCount++;
        }
      });

      await Promise.all(batchPromises);
      
      // Small delay between batches to be nice to the system
      if (i + batchSize < profiles.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const result = {
      total: profiles.length,
      successful: successCount,
      failed: errorCount,
      errors: errors.slice(0, 10) // Only return first 10 errors
    };

    console.log('Rescore complete:', result);
    return result;

  } catch (error) {
    console.error('Fatal error during rescore:', error);
    return { error };
  }
}

// Auto-run rescore when this module is imported
console.log('Starting automatic rescore of all profiles...');
rescoreAllProfiles().then(result => {
  if ('error' in result && result.error) {
    console.error('Rescore failed:', result.error);
  } else {
    console.log('✅ All profiles rescored successfully:', result);
  }
});