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
    🏦 SYSTÈME CARTE: Solde NÉGATIF = Manager doit de l'argent au Cashier
    - Solde Carte négatif: Dette manager → cashier
    - Solde Carte positif: Crédit manager/disponible
    - Analyse des flux de trésorerie en conséquence

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
    - Cash-flow et encours clients (attention Carte négatif = dette manager)
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
    - Optimisation flux de trésorerie (Carte négatif = priorité remboursement)
    - Gestion des découverts système
    - Recommandations d'approvisionnement
    - IMPORTANT: Carte négatif = Manager doit rembourser le Cashier

    TOUJOURS:
    ✅ Commence par LA MÉTRIQUE CLÉ
    ✅ 2-3 insights statistiques précis
    ✅ 1 recommandation actionnable chiffrée
    ✅ Compare avec historique quand possible
    ✅ Mentionne les dettes manager si Carte négatif

    Exemple réponse: "CA aujourd'hui: 15,240 DH (+12% vs hier). Top agent: Ahmed (3,200 DH, 4 ventes). Marge moyenne: 18.5%. ⚠️ Carte: -2,400 DH (Manager doit rembourser Cashier). ACTION: Focusez sur vols internationaux (marge 25% vs 12% domestique) = +2,100 DH/jour potentiel."

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