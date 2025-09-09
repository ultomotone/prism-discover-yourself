diff --git a/supabase/functions/finalizeAssessment/index.ts b/supabase/functions/finalizeAssessment/index.ts
--- a/supabase/functions/finalizeAssessment/index.ts
+++ b/supabase/functions/finalizeAssessment/index.ts
@@ -70,38 +70,36 @@
     // Check if profile already exists for this session
     const { data: existingProfile } = await supabase
       .from('profiles')
       .select('*')
       .eq('session_id', session_id)
       .single()
 
     if (existingProfile) {
       console.log('Profile already exists for session:', session_id)
 
-      const shareToken = existingProfile.share_token || crypto.randomUUID()
-
-      const { data: sessionData } = await supabase
+      const shareToken = existingProfile.share_token || crypto.randomUUID();
+
+      const { data: sessionData } = await supabase
         .from('assessment_sessions')
         .update({
           status: 'completed',
           completed_at: new Date().toISOString(),
           finalized_at: new Date().toISOString(),
           completed_questions: responses?.length || existingProfile.fc_answered_ct || 0,
           share_token: shareToken,
           profile_id: existingProfile.id
         })
         .eq('id', session_id)
         .select('share_token')
         .single()
 
       await supabase
         .from('profiles')
-        .update({ share_token: shareToken })
-        .eq('id', existingProfile.id)
+        .update({ share_token: shareToken })
+        .eq('id', existingProfile.id)
 
       try {
         supabase.functions.invoke('notify_admin', {
           body: {
             type: 'assessment_completed',
             session_id,
             share_token: shareToken
           }
         });
       } catch (e) {
         console.error('notify_admin failed (existingProfile):', e);
       }
 
-      return new Response(
-        JSON.stringify({
-          ok: true,
-          status: 'success',
-          session_id,
-          share_token: sessionData?.share_token,
-          results_url: `${req.headers.get('origin') || 'https://prismassessment.com'}/results/${session_id}?t=${sessionData?.share_token}`
-        }),
-        {
-          status: 200,
-          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
-        }
-      )
+      return json({
+        ok: true,
+        status: 'success',
+        session_id,
+        share_token: shareToken,
+        profile: { ...existingProfile, share_token: shareToken },
+        results_url: `${req.headers.get('origin') || 'https://prismassessment.com'}/results/${session_id}?t=${shareToken}`
+      }, 200);
     }
@@ -230,16 +228,14 @@
 
     console.log('Assessment finalized successfully for session:', session_id)
 
     const resultsUrl = `${req.headers.get('origin') || 'https://prismassessment.com'}/results/${session_id}?t=${shareToken}`
 
     try {
       supabase.functions.invoke('notify_admin', {
         body: {
           type: 'assessment_completed',
           session_id,
           share_token: shareToken
         }
       })
     } catch (e) {
       console.error('notify_admin failed:', e)
     }
 
-    return new Response(
-      JSON.stringify({
-        ok: true,
-        status: 'success',
-        session_id,
-        share_token: shareToken,
-        results_url: resultsUrl
-      }),
-      {
-        status: 200,
-        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
-      }
-    )
+    return json({
+      ok: true,
+      status: 'success',
+      session_id,
+      share_token: shareToken,
+      profile: { ...scoringResult.profile, id: upsertedProfile?.id, share_token: shareToken },
+      results_url: resultsUrl
+    }, 200);
