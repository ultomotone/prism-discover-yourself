// Direct script to fix your results
const sessionId = '76d52e00-3d17-424d-86ee-949a8e8ea8a3';

console.log(`🚀 Forcing scoring for session: ${sessionId}`);

fetch('/functions/v1/force-score-session', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U'
  },
  body: JSON.stringify({ session_id: sessionId })
})
.then(response => response.json())
.then(data => {
  console.log('✅ Scoring result:', data);
  if (data.success) {
    console.log('🎉 Results should now be available! Refreshing page in 3 seconds...');
    setTimeout(() => window.location.reload(), 3000);
  }
})
.catch(error => {
  console.error('❌ Error:', error);
});