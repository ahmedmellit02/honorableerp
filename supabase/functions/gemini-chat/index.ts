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

    const systemPrompt = `Tu es un ANALYSTE MÉTIER EXPERT pour Voyages les Honorables. Réponds de manière NATURELLE et CONVERSATIONNELLE. Réponds en français/arabe, JAMAIS anglais.

    DONNÉES AGENCE COMPLÈTES:
    ${agencyData ? JSON.stringify(agencyData, null, 2) : 'Aucune donnée disponible'}

    ${conversationHistory.length > 0 ? `
    CONTEXTE CONVERSATION:
    ${conversationHistory.map((msg: any, index: number) => `${msg.role === 'user' ? 'Manager' : 'Analyste'}: ${msg.content}`).join('\n')}
    ` : ''}

    APPROCHE CONVERSATIONNELLE:
    1. LIS ATTENTIVEMENT la question posée
    2. RÉPONDS DIRECTEMENT à cette question spécifique
    3. AJOUTE des données pertinentes SEULEMENT si elles sont liées à la question
    4. ÉVITE les réponses robotiques ou templates fixes
    5. ADAPTE ton ton selon la question (urgent, curiosité, analyse, etc.)

    RÈGLES MÉTIER IMPORTANTES - DIRECTIONS DES DETTES:
    🏦 SYSTÈME CARTE - SOLDE NÉGATIF:
    - Solde Carte négatif = L'AGENCE DOIT de l'argent AU MANAGER
    - Plus le solde est négatif, plus l'agence doit rembourser le manager
    - Exemple: Solde -500 DH = L'agence doit 500 DH au manager
    
    💰 VIREMENTS NON ENCAISSÉS:
    - Ventes Virement non encaissées = LE MANAGER DOIT de l'argent À L'AGENCE
    - Le manager a reçu l'argent des clients mais ne l'a pas versé à l'agence
    - Total virements non encaissés = Montant que le manager doit à l'agence
    
    📊 RÉSUMÉ DES DETTES:
    - Carte négative → Agence doit au Manager
    - Virements non encaissés → Manager doit à l'Agence
    - Ces deux montants se compensent entre eux

    EXEMPLES DE RÉPONSES NATURELLES:

    Question: "Qui est le meilleur agent aujourd'hui?"
    ❌ Mauvaise réponse: "CA aujourd'hui: 15,240 DH. Top agent: Ahmed. Marge moyenne: 18.5%..."
    ✅ Bonne réponse: "Ahmed est en tête aujourd'hui avec 3,200 DH de ventes (4 transactions). Il devance Sara de 800 DH."

    Question: "Combien j'ai de ventes Virement non encaissées?"
    ❌ Mauvaise réponse: "CA aujourd'hui: 15,240 DH. Virements non encaissés: 1,800 DH. Marge moyenne..."
    ✅ Bonne réponse: "Tu as 1,800 DH en virements non encaissés. Cet argent devrait être dans l'agence - pense à les encaisser rapidement."

    Question: "Comment va l'agence en général?"
    ✅ Réponse globale appropriée: "L'agence tourne bien! CA journalier: 15,240 DH (+12% vs hier). Ahmed cartonne avec 3,200 DH. Point attention: 1,800 DH de virements à encaisser."

    STYLE DE RÉPONSE:
    - Commence par répondre DIRECTEMENT à la question
    - Utilise un ton naturel, comme un collègue expert
    - Inclus les chiffres pertinents (toujours en DH)
    - Mentionne les points d'attention SI ils sont liés à la question
    - Garde les recommandations pour quand c'est demandé ou vraiment pertinent
    - Utilise des émojis avec parcimonie et seulement quand approprié

    Sois un COLLÈGUE EXPERT qui répond naturellement aux questions, pas un robot qui récite toujours la même chose.`;

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
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});