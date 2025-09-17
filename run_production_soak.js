#!/usr/bin/env node

/**
 * Production Soak Runner - Executes 2-hour monitoring
 */

const { runProdSoak } = require('./execute_prod_soak.js');
const fs = require('fs');

// Ensure artifacts directory exists
if (!fs.existsSync('artifacts')) {
  fs.mkdirSync('artifacts', { recursive: true });
}

// Execute production soak monitoring
console.log('🚀 Starting PHASE A - PROD SOAK (Read-only monitoring)');
console.log('📋 Parameters: window_hours=2, engine_version=v1.2.1, fc_version=v1.2\n');

runProdSoak()
  .then(() => {
    console.log('\n✅ Production soak completed successfully');
    console.log('📁 Artifacts generated:');
    console.log('   - artifacts/prod_observability.md');
    console.log('   - artifacts/prod_soak_gate.md');
  })
  .catch((error) => {
    console.error('\n❌ Production soak failed:', error.message);
    process.exit(1);
  });