export const canSpeak = 'speechSynthesis' in window;

/** Произносит английское слово встроенным голосом браузера. */
export function speak(text: string) {
  if (!canSpeak) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  const voice = synth.getVoices().find((v) => v.lang.startsWith('en'));
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
}
