import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'codellama',
        prompt: text,
        stream: false,
        // Ajout des paramètres d'optimisation
        num_predict: 100,        // Limite la longueur de la réponse
        temperature: 0.7,        // Réduit la créativité pour des réponses plus rapides
        top_k: 40,              // Limite les choix de tokens
        top_p: 0.9,             // Réduit la diversité des réponses
        repeat_penalty: 1.1      // Évite les répétitions
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error('Erreur de communication avec Ollama');
    }

    const data = await ollamaResponse.json();
    return NextResponse.json({ response: data.response });
    
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur lors de la conversion' }, { status: 500 });
  }
}