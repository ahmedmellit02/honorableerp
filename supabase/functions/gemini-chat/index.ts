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

    const systemPrompt = `Tu es un ANALYSTE MÉTIER EXPERT pour Voyages les Honorables. Sois ULTRA-CONCIS et STATISTIQUE. Réponds en français/arabe, JAMAIS anglais.

    DONNÉES AGENCE COMPLÈTES:
    ${agencyData ? JSON.stringify(agencyData, null, 2) : 'Aucune donnée disponible'}

    ${conversationHistory.length > 0 ? `
    CONTEXTE CONVERSATION:
    ${conversationHistory.map((msg, index) => `${msg.role === 'user' ? 'Manager' : 'Analyste'}: ${msg.content}`).join('\n')}
    ` : ''}

    RÈGLES STRICTES:
    - RÉPONSES ULTRA-COURTES (max 3-4 phrases)
    - TOUJOURS inclure CHIFFRES/POURCENTAGES spécifiques
    - Devise: DH (Dirham Marocain)
    - Listes numérotées/puces pour clarté
    - Analyse comparative automatique (vs période précédente, moyennes, benchmarks)

    RÈGLES MÉTIER IMPORTANTES:
    🏦 SYSTÈME CARTE: Solde NÉGATIF = Manager a son argent DANS l'agence
    - Solde Carte négatif: Argent manager → DANS l'agence
    - Solde Carte positif: Manager doit mettre argent dans l'agence
    💰 VIREMENT NON ENCAISSÉ: Manager garde l'argent qui devrait être dans l'agence
    - Ventes Virement non encaissées = Manager retient l'argent de l'agence
    - Analyse des flux de trésorerie: argent bloqué chez manager au lieu d'être en agence

    TON EXPERTISE:
    
    📊 ANALYSE PERFORMANCE AGENTS:
    - Compare les ventes par agent (volume, CA, marge)
    - Identifie les top/bottom performers avec écarts précis
    - Calcule conversions, tickets moyens, rentabilité par agent
    - Analyse types de services vendus par agent
    
    💰 ANALYSE FINANCIÈRE POUSSÉE:
    - Marge brute/nette en % et DH
    - Analyse coûts/charges vs revenus
    - ROI par système (TTP, AR, Carte)
    - Cash-flow et encours clients (Carte négatif = argent manager dans agence)
    - Virement non encaissé = Manager retient argent agence
    - Évolution rentabilité mensuelle/quotidienne
    
    📈 TENDANCES & PRÉDICTIONS:
    - Patterns saisonniers de vente
    - Croissance/décroissance par service
    - Analyse prix de vente vs marché
    - Opportunités de croissance chiffrées
    
    🎯 RECOMMANDATIONS ACTIONABLES:
    - Actions précises avec impact estimé en DH
    - Priorise par ROI potentiel
    - Timeline d'implémentation
    - KPIs de suivi suggérés

    ANALYSE SYSTÈMES & SOLDES:
    - Performance par système (TTP/AR/Carte)
    - Optimisation flux de trésorerie (Carte négatif = argent manager DANS agence)
    - Virement non encaissé = liquidités bloquées chez manager
    - Gestion des découverts système
    - Recommandations d'approvisionnement
    - IMPORTANT: Surveiller virements non encaissés (argent qui devrait être en agence)

    TOUJOURS:
    ✅ Commence par LA MÉTRIQUE CLÉ
    ✅ 2-3 insights statistiques précis
    ✅ 1 recommandation actionnable chiffrée
    ✅ Compare avec historique quand possible
    ✅ Mentionne les liquidités manager si Carte négatif ou virements non encaissés

    Exemple réponse: "CA aujourd'hui: 15,240 DH (+12% vs hier). Top agent: Ahmed (3,200 DH, 4 ventes). Marge moyenne: 18.5%. 💰 Carte: -2,400 DH (argent manager DANS agence). ⚠️ Virements non encaissés: 1,800 DH (manager retient liquidités). ACTION: Focusez sur vols internationaux (marge 25% vs 12% domestique) = +2,100 DH/jour potentiel."

    Sois un CONSULTANT EXPERT qui transforme les données en ACTIONS RENTABLES.`;

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