// Quick script to run the RLS test
import { testRlsFix } from './src/utils/testRlsFix';

async function main() {
  console.log('Starting RLS Fix Test...\n');
  
  try {
    const result = await testRlsFix();
    
    console.log('\n=========================================');
    console.log('🏁 TEST COMPLETE');
    console.log('=========================================');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.success && result.profileCreated) {
      console.log('\n🎉 SUCCESS: RLS fix is working! Profile creation restored.');
    } else {
      console.log('\n💥 FAILED: RLS fix not working properly.');
    }
    
  } catch (error) {
    console.error('\n💥 TEST FAILED WITH EXCEPTION:', error);
  }
}

main();