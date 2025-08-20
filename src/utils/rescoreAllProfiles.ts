import { supabase } from "@/integrations/supabase/client";

export async function rescoreAllProfiles() {
  console.log('Starting comprehensive profile rescore with v1.1 calculations...');
  
  try {
    // Get all profiles with session IDs in batches
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('session_id, created_at, type_code')
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

    // Process sequentially in smaller batches to avoid overwhelming the system
    const batchSize = 5;
    for (let i = 0; i < profiles.length; i += batchSize) {
      const batch = profiles.slice(i, i + batchSize);
      
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(profiles.length / batchSize)} (${i + 1}-${Math.min(i + batchSize, profiles.length)})`);
      
      // Process batch sequentially to be gentle on the system
      for (const profile of batch) {
        try {
          console.log(`Rescoring session ${profile.session_id} (${profile.type_code || 'unknown type'})`);
          
          const { data, error } = await supabase.functions.invoke('score_prism', {
            body: { session_id: profile.session_id }
          });

          if (error) {
            console.error(`Error rescoring ${profile.session_id}:`, error);
            errors.push({ session_id: profile.session_id, error });
            errorCount++;
          } else {
            successCount++;
            if (successCount % 10 === 0) {
              console.log(`✅ Successfully rescored ${successCount}/${profiles.length} profiles...`);
            }
          }
          
          // Small delay between each request
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (err) {
          console.error(`Exception rescoring ${profile.session_id}:`, err);
          errors.push({ session_id: profile.session_id, error: err });
          errorCount++;
        }
      }
      
      // Longer delay between batches
      if (i + batchSize < profiles.length) {
        console.log('Pausing between batches...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const result = {
      total: profiles.length,
      successful: successCount,
      failed: errorCount,
      errors: errors.slice(0, 5) // Only return first 5 errors
    };

    console.log('🎉 Rescore complete:', result);
    
    // Trigger dashboard statistics update
    await supabase.rpc('update_dashboard_statistics');
    console.log('📊 Dashboard statistics updated');
    
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