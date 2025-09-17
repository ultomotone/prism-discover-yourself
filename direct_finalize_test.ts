// Direct finalizeAssessment test via HTTP
const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';

const response = await fetch('https://gnkuikentdtnatazeriu.supabase.co/functions/v1/finalizeAssessment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U'
  },
  body: JSON.stringify({ session_id: sessionId })
});

const data = await response.json();
console.log('finalizeAssessment result:', data);