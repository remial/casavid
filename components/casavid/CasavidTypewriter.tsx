'use client';

import { useEffect, useState } from 'react';

const phrases = [
  "Perfect for Real Estate Agents",
  "Great for Airbnb Hosts",
  "Ideal for Property Managers",
  "Stunning Listing Videos",
  "Professional AI Narration",
  "Auto-Generated Subtitles",
  "Ready in Minutes",
];

export default function CasavidTypewriter() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[currentPhraseIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < phrase.length) {
          setCurrentText(phrase.slice(0, currentText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, isDeleting ? 30 : 80);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentPhraseIndex]);

  return (
    <span className="inline-block">
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  );
}
