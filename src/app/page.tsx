'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff } from "lucide-react";

export default function Home() {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Array<{type: 'user' | 'ai', text: string}>>([]);

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
      setConversation(prev => [...prev, { type: 'user', text: inputText }]);
      
      let accumulatedText = '';
      let currentResponse = '';
      const synth = window.speechSynthesis;

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();
      const words = data.response.split(' ');
      
      // Ajouter une réponse vide initiale
      setConversation(prev => [...prev, { type: 'ai', text: '' }]);

      for (let i = 0; i < words.length; i++) {
        currentResponse += words[i] + ' ';
        accumulatedText += words[i] + ' ';
        
        // Mettre à jour le message dans la conversation
        setConversation(prev => {
          const newConv = [...prev];
          newConv[newConv.length - 1].text = currentResponse;
          return newConv;
        });

        // Parler tous les 10 mots
        if (accumulatedText.split(' ').length >= 10 || i === words.length - 1) {
          const utterance = new SpeechSynthesisUtterance(accumulatedText);
          utterance.lang = 'fr-FR';
          synth.speak(utterance);
          accumulatedText = ''; // Réinitialiser pour le prochain groupe de mots
        }
      }

    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 bg-gradient-to-b from-slate-900 to-slate-800">
      <Card className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg border-none">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-white">
            Assistant Vocal IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-[400px] overflow-y-auto rounded-lg bg-black/20 p-4 space-y-4">
            {conversation.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isListening && (
              <div className="flex justify-center">
                <div className="animate-pulse text-blue-400">Écoute en cours...</div>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={startListening}
              disabled={isListening || isLoading}
              className="w-40 h-40 rounded-full transition-all hover:scale-105"
              variant={isListening ? "destructive" : "default"}
            >
              {isListening ? (
                <MicOff className="h-12 w-12" />
              ) : (
                <Mic className="h-12 w-12" />
              )}
            </Button>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-blue-500">Traitement en cours...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}