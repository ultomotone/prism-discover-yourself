import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { feedbackReminder1, feedbackReminder2 } from "../_shared/email-templates.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface ReminderSession {
  id: string;
  email: string;
  share_token: string;
  completed_at: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[send-feedback-reminders] Starting daily reminder job');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const day3Cutoff = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const day7Cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let day3Sent = 0;
    let day7Sent = 0;
    const errors: string[] = [];

    // === DAY 3 REMINDERS ===
    console.log('[send-feedback-reminders] Processing Day 3 reminders...');

    const { data: day3Sessions, error: day3Error } = await supabase
      .from('assessment_sessions')
      .select('id, email, share_token, completed_at')
      .eq('status', 'completed')
      .not('email', 'is', null)
      .gte('completed_at', day3Cutoff.toISOString())
      .lt('completed_at', new Date(day3Cutoff.getTime() + 24 * 60 * 60 * 1000).toISOString())
      .limit(100);

    if (day3Error) {
      console.error('[send-feedback-reminders] Error fetching Day 3 sessions:', day3Error);
    } else if (day3Sessions) {
      for (const session of day3Sessions as ReminderSession[]) {
        try {
          // Check if survey already completed
          const { data: surveyCompleted } = await supabase
            .from('post_survey_scores')
            .select('id')
            .eq('session_id', session.id)
            .maybeSingle();

          if (surveyCompleted) {
            console.log(`[send-feedback-reminders] Survey already completed for session ${session.id}, skipping`);
            continue;
          }

          // Check if completion email was sent
          const { data: completionEmailLog } = await supabase
            .from('fn_logs')
            .select('id')
            .eq('evt', 'completion_email_sent')
            .eq('payload->session_id', session.id)
            .maybeSingle();

          if (!completionEmailLog) {
            console.log(`[send-feedback-reminders] No completion email sent for session ${session.id}, skipping`);
            continue;
          }

          // Check if Day 3 reminder already sent
          const { data: day3Log } = await supabase
            .from('fn_logs')
            .select('id')
            .eq('evt', 'feedback_reminder_day3_sent')
            .eq('payload->session_id', session.id)
            .maybeSingle();

          if (day3Log) {
            console.log(`[send-feedback-reminders] Day 3 reminder already sent for session ${session.id}`);
            continue;
          }

          // Send Day 3 reminder
          const baseUrl = Deno.env.get('RESULTS_BASE_URL') || 'https://prismassessment.com';
          const feedbackUrl = `${baseUrl}/results/${session.id}?survey=true&t=${session.share_token}`;
          const emailContent = feedbackReminder1(feedbackUrl);

          const emailResponse = await resend.emails.send({
            from: 'PRISM Assessment <noreply@prismassessment.com>',
            to: [session.email],
            subject: emailContent.subject,
            html: emailContent.html,
          });

          // Log success
          await supabase.from('fn_logs').insert({
            evt: 'feedback_reminder_day3_sent',
            payload: { session_id: session.id, email: session.email, resend_id: emailResponse.id },
            level: 'info',
          });

          day3Sent++;
          console.log(`[send-feedback-reminders] Day 3 reminder sent to ${session.email}`);

        } catch (error) {
          console.error(`[send-feedback-reminders] Error sending Day 3 reminder to ${session.email}:`, error);
          errors.push(`Day 3 - ${session.id}: ${error.message}`);
        }
      }
    }

    // === DAY 7 REMINDERS ===
    console.log('[send-feedback-reminders] Processing Day 7 reminders...');

    const { data: day7Sessions, error: day7Error } = await supabase
      .from('assessment_sessions')
      .select('id, email, share_token, completed_at')
      .eq('status', 'completed')
      .not('email', 'is', null)
      .gte('completed_at', day7Cutoff.toISOString())
      .lt('completed_at', new Date(day7Cutoff.getTime() + 24 * 60 * 60 * 1000).toISOString())
      .limit(100);

    if (day7Error) {
      console.error('[send-feedback-reminders] Error fetching Day 7 sessions:', day7Error);
    } else if (day7Sessions) {
      for (const session of day7Sessions as ReminderSession[]) {
        try {
          // Check if survey already completed
          const { data: surveyCompleted } = await supabase
            .from('post_survey_scores')
            .select('id')
            .eq('session_id', session.id)
            .maybeSingle();

          if (surveyCompleted) {
            console.log(`[send-feedback-reminders] Survey already completed for session ${session.id}, skipping`);
            continue;
          }

          // Check if Day 3 reminder was sent
          const { data: day3Log } = await supabase
            .from('fn_logs')
            .select('id')
            .eq('evt', 'feedback_reminder_day3_sent')
            .eq('payload->session_id', session.id)
            .maybeSingle();

          if (!day3Log) {
            console.log(`[send-feedback-reminders] Day 3 reminder not sent for session ${session.id}, skipping Day 7`);
            continue;
          }

          // Check if Day 7 reminder already sent
          const { data: day7Log } = await supabase
            .from('fn_logs')
            .select('id')
            .eq('evt', 'feedback_reminder_day7_sent')
            .eq('payload->session_id', session.id)
            .maybeSingle();

          if (day7Log) {
            console.log(`[send-feedback-reminders] Day 7 reminder already sent for session ${session.id}`);
            continue;
          }

          // Send Day 7 reminder
          const baseUrl = Deno.env.get('RESULTS_BASE_URL') || 'https://prismassessment.com';
          const feedbackUrl = `${baseUrl}/results/${session.id}?survey=true&t=${session.share_token}`;
          const emailContent = feedbackReminder2(feedbackUrl);

          const emailResponse = await resend.emails.send({
            from: 'PRISM Assessment <noreply@prismassessment.com>',
            to: [session.email],
            subject: emailContent.subject,
            html: emailContent.html,
          });

          // Log success
          await supabase.from('fn_logs').insert({
            evt: 'feedback_reminder_day7_sent',
            payload: { session_id: session.id, email: session.email, resend_id: emailResponse.id },
            level: 'info',
          });

          day7Sent++;
          console.log(`[send-feedback-reminders] Day 7 reminder sent to ${session.email}`);

        } catch (error) {
          console.error(`[send-feedback-reminders] Error sending Day 7 reminder to ${session.email}:`, error);
          errors.push(`Day 7 - ${session.id}: ${error.message}`);
        }
      }
    }

    console.log(`[send-feedback-reminders] Job complete: Day 3=${day3Sent}, Day 7=${day7Sent}, Errors=${errors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        day3_sent: day3Sent,
        day7_sent: day7Sent,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[send-feedback-reminders] Fatal error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
