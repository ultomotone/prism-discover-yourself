import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { completionEmail, postSurveyInvite } from "../_shared/email-templates.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface CompletionEmailRequest {
  session_id: string;
  email: string;
  share_token: string;
  type_code: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, email, share_token, type_code }: CompletionEmailRequest = await req.json();

    console.log(`[send-completion-email] Processing for session: ${session_id}, email: ${email}`);

    if (!session_id || !email || !share_token || !type_code) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if completion email already sent (idempotency)
    const { data: existingCompletionLog } = await supabase
      .from('fn_logs')
      .select('id')
      .eq('evt', 'completion_email_sent')
      .eq('payload->>session_id', session_id)
      .maybeSingle();

    if (existingCompletionLog) {
      console.log(`[send-completion-email] Completion email already sent for session ${session_id}`);
      return new Response(
        JSON.stringify({ success: true, message: 'Email already sent' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Check if post-survey invitation already sent
    const { data: existingSurveyLog } = await supabase
      .from('fn_logs')
      .select('id')
      .eq('evt', 'post_survey_invite_sent')
      .eq('payload->>session_id', session_id)
      .maybeSingle();

    // Build URLs
    const baseUrl = Deno.env.get('RESULTS_BASE_URL') || 'https://prismassessment.com';
    const resultsUrl = `${baseUrl}/results/${session_id}?t=${share_token}`;
    const feedbackUrl = `${baseUrl}/results/${session_id}?survey=true&t=${share_token}`;
    const surveyUrl = `${baseUrl}/survey/${session_id}?t=${share_token}`;

    // Generate completion email content
    const emailContent = completionEmail(resultsUrl, feedbackUrl, type_code);

    // Send completion email via Resend
    const emailResponse = await resend.emails.send({
      from: 'PRISM Assessment <noreply@prismassessment.com>',
      to: [email],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log(`[send-completion-email] Completion email sent successfully:`, emailResponse);

    // Log completion email success
    await supabase.from('fn_logs').insert({
      evt: 'completion_email_sent',
      payload: { session_id, email, resend_id: emailResponse.id },
      level: 'info',
    });

    // Send post-survey invitation email (Day 1) if not already sent
    if (!existingSurveyLog) {
      const surveyEmailContent = postSurveyInvite(surveyUrl, session_id);

      const { data: surveyEmailData, error: surveyEmailError } = await resend.emails.send({
        from: 'PRISM Assessment <noreply@prismassessment.com>',
        to: [email],
        subject: surveyEmailContent.subject,
        html: surveyEmailContent.html,
      });

      if (surveyEmailError) {
        console.error('[send-completion-email] Survey email error:', surveyEmailError);
        // Don't throw - completion email was sent successfully
      } else {
        console.log('[send-completion-email] Post-survey invitation sent:', surveyEmailData?.id);

        // Log survey invitation success
        await supabase.from('fn_logs').insert({
          evt: 'post_survey_invite_sent',
          payload: { session_id, email, resend_id: surveyEmailData?.id },
          level: 'info',
        });
      }
    } else {
      console.log('[send-completion-email] Post-survey invitation already sent, skipping');
    }

    // Update session metadata
    const { error: updateError } = await supabase
      .from('assessment_sessions')
      .update({
        metadata: {
          completion_email_sent_at: new Date().toISOString(),
          post_survey_invite_sent_at: !existingSurveyLog ? new Date().toISOString() : undefined,
          completion_email_id: emailResponse.id,
        },
      })
      .eq('id', session_id);

    if (updateError) {
      console.error('[send-completion-email] Failed to update session metadata:', updateError);
    }

    return new Response(
      JSON.stringify({ success: true, email_id: emailResponse.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[send-completion-email] Error:', error);
    
    // Log error (non-blocking)
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase.from('fn_logs').insert({
        evt: 'completion_email_error',
        payload: { error: error.message },
        level: 'error',
      });
    } catch (_) {
      // Ignore logging errors
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
