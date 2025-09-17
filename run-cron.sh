#!/bin/bash

# Run the cron function to process sessions that need scoring
curl -X POST \
  https://gnkuikentdtnatazeriu.supabase.co/functions/v1/cron-force-finalize-248 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U" \
  -H "Content-Type: application/json" \
  --data '{}'