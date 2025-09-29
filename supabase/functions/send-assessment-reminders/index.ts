import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Send email using Resend API directly
async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'PRISM Personality <noreply@prismpersonality.com>',
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return await response.json();
}

// Email templates as HTML strings
const incompleteReminderTemplate = (sessionId: string, daysRemaining: number, continueUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Complete your PRISM assessment</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #1f2937; font-size: 24px; font-weight: bold; margin: 40px 0 20px 0;">Complete Your PRISM Assessment</h1>
    
    <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 16px 0;">
      You started your PRISM personality assessment but haven't finished it yet. Don't lose your progress!
    </p>
    
    <p style="color: #d97706; font-size: 16px; line-height: 24px; margin: 16px 0; font-weight: bold;">
      ⚠️ Your session will be automatically deleted in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}.
    </p>
    
    <div style="text-align: center; margin: 24px 0;">
      <a href="${continueUrl}" style="background-color: #3b82f6; border-radius: 6px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 12px 24px; display: inline-block;">
        Continue Your Assessment
      </a>
    </div>
    
    <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 16px 0;">
      The PRISM assessment takes about 20-30 minutes to complete and provides valuable insights into your personality type and cognitive functions.
    </p>
    
    <p style="color: #666; font-size: 12px; margin: 16px 0;">
      If you no longer wish to receive these reminders, simply complete or abandon your assessment by visiting the link above.
    </p>
    
    <div style="text-align: center; margin-top: 32px; color: #898989; font-size: 12px;">
      <a href="https://prismpersonality.com" style="color: #898989; text-decoration: underline;">PRISM Personality</a><br>
      Discover your unique cognitive pattern
    </div>
  </div>
</body>
</html>
`;

const retakeEligibleTemplate = (completedDate: string, assessmentUrl: string, previousType?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ready for a fresh PRISM assessment?</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #1f2937; font-size: 24px; font-weight: bold; margin: 40px 0 20px 0;">Ready for a Fresh Assessment?</h1>
    
    <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 16px 0;">
      It's been 30 days since you completed your PRISM personality assessment on ${completedDate}.${previousType ? ` Your previous result was ${previousType}.` : ''}
    </p>
    
    <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 16px 0;">
      🎉 <strong>You're now eligible to retake the assessment!</strong>
    </p>
    
    <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 16px 0;">
      People can change and grow over time. Retaking the assessment can help you:
    </p>
    
    <ul style="color: #374151; font-size: 16px; line-height: 24px; margin: 16px 0; padding-left: 20px;">
      <li>See how your personality patterns have evolved</li>
      <li>Gain new insights into your current cognitive preferences</li>
      <li>Track your personal development journey</li>
      <li>Get updated results that reflect who you are today</li>
    </ul>
    
    <div style="text-align: center; margin: 24px 0;">
      <a href="${assessmentUrl}" style="background-color: #10b981; border-radius: 6px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 12px 24px; display: inline-block;">
        Retake Your PRISM Assessment
      </a>
    </div>
    
    <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 16px 0;">
      The assessment takes about 20-30 minutes and will provide you with fresh insights into your personality type and cognitive functions.
    </p>
    
    <p style="color: #666; font-size: 12px; margin: 16px 0;">
      This is a one-time notification. You won't receive another retake reminder unless you complete another assessment.
    </p>
    
    <div style="text-align: center; margin-top: 32px; color: #898989; font-size: 12px;">
      <a href="https://prismpersonality.com" style="color: #898989; text-decoration: underline;">PRISM Personality</a><br>
      Discover your unique cognitive pattern
    </div>
  </div>
</body>
</html>
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { reminder_type } = await req.json().catch(() => ({ reminder_type: 'both' }));
    
    console.log('Starting assessment reminders:', { reminder_type });

    let incompleteCount = 0;
    let retakeCount = 0;

    // Send incomplete assessment reminders
    if (reminder_type === 'incomplete' || reminder_type === 'both') {
      console.log('Processing incomplete assessment reminders...');
      
      // Find sessions that are in_progress and have emails
      const { data: incompleteSessions, error: incompleteError } = await supabase
        .from('assessment_sessions')
        .select(`
          id, 
          created_at,
          share_token
        `)
        .eq('status', 'in_progress')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Within last 7 days
        .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // But older than 1 day

      if (incompleteError) {
        console.error('Error fetching incomplete sessions:', incompleteError);
      } else if (incompleteSessions) {
        console.log(`Found ${incompleteSessions.length} incomplete sessions`);

        for (const session of incompleteSessions) {
          // Get email from assessment responses
          const { data: emailResponse, error: emailError } = await supabase
            .from('assessment_responses')
            .select('answer_value')
            .eq('session_id', session.id)
            .ilike('question_text', '%email%')
            .like('answer_value', '%@%')
            .limit(1)
            .maybeSingle();

          if (emailError || !emailResponse?.answer_value) {
            console.log(`No email found for session ${session.id}`);
            continue;
          }

          const email = emailResponse.answer_value;
          const createdAt = new Date(session.created_at);
          const daysSinceCreated = Math.floor((Date.now() - createdAt.getTime()) / (24 * 60 * 60 * 1000));
          const daysRemaining = 7 - daysSinceCreated;

          if (daysRemaining <= 0) {
            console.log(`Session ${session.id} expired, skipping reminder`);
            continue;
          }

          // Check if we've already sent a reminder today
          const { data: existingReminder } = await supabase
            .from('fn_logs')
            .select('id')
            .eq('evt', 'incomplete_reminder_sent')
            .eq('payload->session_id', session.id)
            .gte('at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .limit(1)
            .maybeSingle();

          if (existingReminder) {
            console.log(`Already sent reminder today for session ${session.id}`);
            continue;
          }

          try {
            const continueUrl = `https://prismpersonality.com/continue/${session.id}`;
            
            const html = incompleteReminderTemplate(session.id, daysRemaining, continueUrl);

            await sendEmail(
              email,
              `Complete your PRISM assessment - ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`,
              html
            );

            console.log(`Sent incomplete reminder to ${email} for session ${session.id}`);
            incompleteCount++;

            // Log the reminder
            await supabase.from('fn_logs').insert({
              evt: 'incomplete_reminder_sent',
              payload: {
                session_id: session.id,
                email: email.replace(/(.{1}).+(@.+)/, '$1***$2'), // Redact email
                days_remaining: daysRemaining,
              },
            });

          } catch (error) {
            console.error(`Error sending incomplete reminder for session ${session.id}:`, error);
          }
        }
      }
    }

    // Send retake eligibility reminders
    if (reminder_type === 'retake' || reminder_type === 'both') {
      console.log('Processing retake eligibility reminders...');
      
      // Find sessions completed exactly 30 days ago
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(thirtyDaysAgo.getFullYear(), thirtyDaysAgo.getMonth(), thirtyDaysAgo.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const { data: completedSessions, error: completedError } = await supabase
        .from('assessment_sessions')
        .select(`
          id,
          completed_at,
          profiles!inner(type_code)
        `)
        .eq('status', 'completed')
        .gte('completed_at', startOfDay.toISOString())
        .lt('completed_at', endOfDay.toISOString());

      if (completedError) {
        console.error('Error fetching completed sessions:', completedError);
      } else if (completedSessions) {
        console.log(`Found ${completedSessions.length} sessions completed 30 days ago`);

        for (const session of completedSessions) {
          // Get email from assessment responses
          const { data: emailResponse, error: emailError } = await supabase
            .from('assessment_responses')
            .select('answer_value')
            .eq('session_id', session.id)
            .ilike('question_text', '%email%')
            .like('answer_value', '%@%')
            .limit(1)
            .maybeSingle();

          if (emailError || !emailResponse?.answer_value) {
            console.log(`No email found for completed session ${session.id}`);
            continue;
          }

          const email = emailResponse.answer_value;

          // Check if we've already sent a retake reminder for this session
          const { data: existingRetakeReminder } = await supabase
            .from('fn_logs')
            .select('id')
            .eq('evt', 'retake_reminder_sent')
            .eq('payload->session_id', session.id)
            .limit(1)
            .maybeSingle();

          if (existingRetakeReminder) {
            console.log(`Already sent retake reminder for session ${session.id}`);
            continue;
          }

          try {
            const completedDate = new Date(session.completed_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            const assessmentUrl = `https://prismpersonality.com/assessment`;
            
            const html = retakeEligibleTemplate(completedDate, assessmentUrl, (session.profiles as any)?.[0]?.type_code);

            await sendEmail(
              email,
              "You're eligible to retake your PRISM assessment!",
              html
            );

            console.log(`Sent retake reminder to ${email} for session ${session.id}`);
            retakeCount++;

            // Log the reminder
            await supabase.from('fn_logs').insert({
              evt: 'retake_reminder_sent',
              payload: {
                session_id: session.id,
                email: email.replace(/(.{1}).+(@.+)/, '$1***$2'), // Redact email
                completed_date: session.completed_at,
                previous_type: (session.profiles as any)?.[0]?.type_code,
              },
            });

          } catch (error) {
            console.error(`Error sending retake reminder for session ${session.id}:`, error);
          }
        }
      }
    }

    console.log(`Reminder job complete: ${incompleteCount} incomplete reminders, ${retakeCount} retake reminders sent`);

    return new Response(JSON.stringify({
      success: true,
      incomplete_reminders_sent: incompleteCount,
      retake_reminders_sent: retakeCount,
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error in send-assessment-reminders:', error);
    return new Response(JSON.stringify({
      success: false,
      error: message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});