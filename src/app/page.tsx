'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const startListening = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      handleConversation(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Erreur de reconnaissance:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleConversation = async (inputText: string) => {
    try {
      setIsLoading(true);
      
      // Envoyer le texte à l'API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();
      
      // Synthèse vocale de la réponse
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(data.response);
      utterance.lang = 'fr-FR';
      synth.speak(utterance);

    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Assistant Vocal IA</h1>
        
        <div className="space-y-4">
          <textarea
            className="w-full p-4 border rounded-lg"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Votre message apparaîtra ici..."
            readOnly
          />
          
          <div className="flex items-center gap-4">
            <button
              onClick={startListening}
              disabled={isListening || isLoading}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              {isListening ? 'Écoute en cours...' : 'Commencer à parler'}
            </button>
            
            {isLoading && (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-blue-500">Traitement en cours...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}