import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const { message, salesData } = await req.json();

    const systemPrompt = `You are a business analyst assistant helping a manager understand their travel agency's sales data. 
    
    You have access to the following sales statistics:
    ${salesData ? JSON.stringify(salesData, null, 2) : 'No sales data provided'}
    
    IMPORTANT INSTRUCTIONS:
    - ALWAYS respond ONLY in French or Arabic - never use English
    - The currency is DH (Moroccan Dirham), not dollars or any other currency
    - All monetary amounts should be referenced in DH
    - DO NOT use markdown formatting like ** or *** for emphasis
    - Use numbered lists (1. 2. 3.) or bullet points (-) for better clarification instead of bold/italic text
    
    Your role is to:
    - Analyze sales trends and patterns
    - Provide actionable business insights
    - Help identify opportunities for growth
    - Explain data in simple, actionable terms
    - Suggest strategies to improve performance
    
    Be concise, professional, and focus on practical business advice. Always reference specific data points when making recommendations. Remember to use DH for all monetary values and respond in French or Arabic only.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { text: `User question: ${message}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

    return new Response(JSON.stringify({ response: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in gemini-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});