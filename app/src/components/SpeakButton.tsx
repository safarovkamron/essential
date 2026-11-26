import { canSpeak, speak } from '../speech';

export default function SpeakButton({ text, label }: { text: string; label: string }) {
  if (!canSpeak) return null;
  return (
    <button type="button" className="icon-btn" onClick={() => speak(text)} aria-label={label} title={label}>
      🔊
    </button>
  );
}
