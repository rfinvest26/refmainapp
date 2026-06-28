import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { haptic, hapticNotify } from '@/lib/telegram';

export function CopyButton({ value, label = 'Скопировать' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      hapticNotify('success');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      haptic('light');
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg bg-tg-button px-3 py-1.5 text-sm font-medium text-tg-button-text active:scale-95 transition-transform"
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? 'Скопировано' : label}
    </button>
  );
}
