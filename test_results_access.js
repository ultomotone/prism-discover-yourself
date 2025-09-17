// Test Results URL Access
async function testResultsAccess(resultsUrl) {
  if (!resultsUrl) {
    console.log('⚠️ No results URL to test');
    return;
  }
  
  console.log('\n🔍 HTTP ACCESS TESTS');
  console.log('====================');
  
  try {
    // Test with token (should work)
    console.log(`📡 Testing WITH token: ${resultsUrl.substring(0, 60)}...`);
    
    const tokenResponse = await fetch(resultsUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    console.log(`   Status: ${tokenResponse.status} ${tokenResponse.statusText}`);
    
    if (tokenResponse.status === 200) {
      console.log('   ✅ Token access successful');
    } else {
      console.log('   ❌ Token access failed');
    }
    
    // Extract session ID for no-token test
    const sessionMatch = resultsUrl.match(/\/results\/([a-f0-9-]+)/);
    if (sessionMatch) {
      const sessionId = sessionMatch[1];
      const noTokenUrl = resultsUrl.split('?')[0]; // Remove token
      
      console.log(`📡 Testing WITHOUT token: ${noTokenUrl}`);
      
      const noTokenResponse = await fetch(noTokenUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      
      console.log(`   Status: ${noTokenResponse.status} ${noTokenResponse.statusText}`);
      
      if (noTokenResponse.status === 401 || noTokenResponse.status === 403) {
        console.log('   ✅ Unauthorized access properly blocked');
      } else {
        console.log('   ❌ Security issue: unauthorized access allowed');
      }
    }
    
  } catch (error) {
    console.log(`   ❌ HTTP test error: ${error.message}`);
  }
}

// Export for use in other tests
if (typeof module !== 'undefined') {
  module.exports = { testResultsAccess };
}