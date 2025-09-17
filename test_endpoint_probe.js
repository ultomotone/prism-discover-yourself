// Production Endpoint Probe Script
const endpoint1 = 'https://gnkuikentdtnatazeriu.functions.supabase.co/finalizeAssessment';
const endpoint2 = 'https://gnkuikentdtnatazeriu.supabase.co/functions/v1/finalizeAssessment';

async function probeEndpoint(url, method) {
  try {
    console.log(`\n=== ${method} ${url} ===`);
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Headers:');
    for (const [key, value] of response.headers.entries()) {
      if (key.toLowerCase().includes('cors') || key.toLowerCase().includes('allow')) {
        console.log(`  ${key}: ${value}`);
      }
    }
    
    if (response.status >= 400) {
      const text = await response.text();
      console.log(`Body: ${text.substring(0, 200)}...`);
    }
    
    return {
      url,
      method,
      status: response.status,
      statusText: response.statusText,
      corsHeaders: Array.from(response.headers.entries())
        .filter(([k]) => k.toLowerCase().includes('cors') || k.toLowerCase().includes('allow'))
    };
  } catch (error) {
    console.log(`Error: ${error.message}`);
    return {
      url,
      method,
      error: error.message
    };
  }
}

async function runProbe() {
  console.log('🔍 Production Endpoint Probe');
  console.log('============================');
  
  const results = [];
  
  // Probe both endpoints with OPTIONS and HEAD
  for (const endpoint of [endpoint1, endpoint2]) {
    results.push(await probeEndpoint(endpoint, 'OPTIONS'));
    results.push(await probeEndpoint(endpoint, 'HEAD'));
  }
  
  console.log('\n📋 SUMMARY');
  console.log('===========');
  results.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.method} ${result.url}: ERROR - ${result.error}`);
    } else {
      console.log(`${result.status < 400 ? '✅' : '❌'} ${result.method} ${result.url}: ${result.status} ${result.statusText}`);
    }
  });
  
  return results;
}

// Run if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  runProbe().then(results => {
    console.log('\n📄 Full Results:', JSON.stringify(results, null, 2));
  });
} else {
  // Browser environment - expose to window
  window.runEndpointProbe = runProbe;
}

export { runProbe };