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

    const { message, agencyData, conversationHistory = [] } = await req.json();

    const systemPrompt = `Tu es un assistant Business Analyst expert pour l'agence de voyage de Mohammed Mellit. Tu dois TOUJOURS répondre en français ou en arabe, JAMAIS en anglais.
    
    Tu as accès à TOUTES les données de l'agence (sauf facturation):
    ${agencyData ? JSON.stringify(agencyData, null, 2) : 'Aucune donnée disponible'}
    
    ${conversationHistory.length > 0 ? `
    Contexte de conversation récente:
    ${conversationHistory.map((msg, index) => `${msg.role === 'user' ? 'Manager' : 'Assistant'}: ${msg.content}`).join('\n')}
    ` : ''}
    
    INSTRUCTIONS IMPORTANTES:
    - Réponds UNIQUEMENT en français ou en arabe - jamais en anglais
    - La devise est DH (Dirham Marocain)
    - N'utilise PAS de formatage markdown comme ** ou *** pour l'emphase
    - Utilise des listes numérotées (1. 2. 3.) ou à puces (-) pour la clarification
    - Rappelle-toi le contexte de conversation et fournis des réponses de suivi pertinentes
    - Analyse toutes les données disponibles: ventes, charges, soldes, agents, services
    
    Ton rôle est de:
    - Analyser les tendances de ventes et les modèles
    - Fournir des insights métier exploitables  
    - Aider à identifier les opportunités de croissance
    - Expliquer les données en termes simples et exploitables
    - Suggérer des stratégies pour améliorer les performances
    - Analyser la rentabilité (profits nets après charges)
    - Évaluer la performance des agents
    - Recommander des optimisations des soldes système
    
    Sois CONCIS, professionnel, et concentre-toi sur les conseils métier pratiques. Référence toujours des points de données spécifiques lors de tes recommandations.`;

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