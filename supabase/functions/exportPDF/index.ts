import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });  
  }

  try {
    const url = new URL(req.url);
    const sessionId = url.pathname.split('/').pop()?.replace('.pdf', '');
    
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get share token from query params
    const shareToken = url.searchParams.get('token');
    
    // Verify access to the profile
    const { data: profileData, error: profileError } = await supabase
      .rpc('get_profile_by_session', {
        p_session_id: sessionId,
        p_share_token: shareToken || ''
      });

    if (profileError || !profileData) {
      return new Response(JSON.stringify({ error: 'Profile not found or access denied' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // For now, return a simple PDF placeholder
    // In production, this would use Puppeteer or similar to generate actual PDF
    const pdfContent = generateSimplePDF(profileData);
    
    return new Response(pdfContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="PRISM_Profile_${profileData.type_code || 'Unknown'}.pdf"`
      }
    });

  } catch (error) {
    console.error('Error in exportPDF function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generateSimplePDF(profile: any): Uint8Array {
  // This is a minimal PDF implementation
  // In production, you'd use a proper PDF library or headless browser  
  const pdfHeader = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 24 Tf
100 700 Td
(PRISM Profile Report) Tj
0 -50 Td
/F1 16 Tf
(Type: ${profile.type_code || 'Unknown'}) Tj
0 -30 Td
(Confidence: ${profile.confidence || 'Unknown'}) Tj
0 -30 Td
(Generated: ${new Date().toLocaleDateString()}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000136 00000 n 
0000000271 00000 n 
0000000524 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
593
%%EOF`;

  return new TextEncoder().encode(pdfHeader);
}