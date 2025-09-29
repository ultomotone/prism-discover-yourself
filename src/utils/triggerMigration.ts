import { admin as supabase } from '../../supabase/admin';

async function triggerMigration() {
  console.log('🚀 Starting migration of all sessions to current scoring...');
  
  try {
    const { data, error } = await supabase.functions.invoke('migrate-all-scoring', {
      body: {}
    });

    if (error) {
      console.error('❌ Migration failed:', error);
      return { success: false, error };
    }

    console.log('✅ Migration completed successfully!');
    console.log('📊 Results:', data);
    
    return { success: true, data };
  } catch (err) {
    console.error('💥 Migration error:', err);
    return { success: false, error: err };
  }
}

// Execute immediately
triggerMigration()
  .then((result) => {
    if (result.success) {
      console.log('🎉 All sessions migrated to current scoring!');
      console.log('🔄 Dashboard should now show core types for all completed assessments');
    } else {
      console.error('💥 Migration failed:', result.error);
    }
  });

export { triggerMigration };