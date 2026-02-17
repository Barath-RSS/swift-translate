import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian',
  pt: 'Portuguese', ru: 'Russian', zh: 'Chinese', ja: 'Japanese', ko: 'Korean',
  ar: 'Arabic', hi: 'Hindi', tr: 'Turkish', nl: 'Dutch', pl: 'Polish',
  sv: 'Swedish', da: 'Danish', fi: 'Finnish', no: 'Norwegian', cs: 'Czech',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, sourceLang, targetLang } = await req.json();

    if (!text || !sourceLang || !targetLang) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: text, sourceLang, targetLang' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (text.length > 5000) {
      return new Response(
        JSON.stringify({ error: 'Text too long. Maximum 5000 characters.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sourceName = LANGUAGE_NAMES[sourceLang] || sourceLang;
    const targetName = LANGUAGE_NAMES[targetLang] || targetLang;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the given text from ${sourceName} to ${targetName}. Output ONLY the translated text, nothing else. No explanations, no quotes, no prefixes. Preserve formatting, line breaks, and punctuation style.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI Gateway error:', errText);
      return new Response(
        JSON.stringify({ error: 'Translation service error. Please try again.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim();

    if (!translatedText) {
      return new Response(
        JSON.stringify({ error: 'No translation returned.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ translatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
