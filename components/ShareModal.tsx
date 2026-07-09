import React, { useEffect, useRef, useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { CurrencyRate } from '../types';
import { EMOJI_STYLE } from './emojiStyles';

const SHARE_DEFAULTS = ['USD', 'GBP', 'EUR', 'AED', 'CAD', 'AUD'];

function buildCanvas(rates: CurrencyRate[], codes: string[]): HTMLCanvasElement {
  const displayRates = codes
    .map((code) => rates.find((r) => r.code === code))
    .filter(Boolean) as CurrencyRate[];

  const W = 800;
  const rowH = 64;
  const headerH = 92;
  const padV = 20;
  const footerH = 48;
  const H = headerH + padV + displayRates.length * rowH + padV + footerH;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, W, H);

  // Header band
  const grad = ctx.createLinearGradient(0, 0, W, headerH);
  grad.addColorStop(0, '#065f46');
  grad.addColorStop(1, '#047857');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, headerH);

  // App name
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText('NairaWatch', 32, 46);

  // Tagline
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText('₦ Parallel Market Rates', 32, 70);

  // Date
  const dateStr = new Date().toLocaleString('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(dateStr, W - 32, 58);
  ctx.textAlign = 'left';

  // Rate rows
  const y0 = headerH + padV;

  displayRates.forEach((rate, i) => {
    const y = y0 + i * rowH;
    const midY = y + rowH / 2;

    // Row separator
    if (i > 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(32, y);
      ctx.lineTo(W - 32, y);
      ctx.stroke();
    }

    // Flag emoji
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '22px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(rate.flag, 32, midY);

    // Code
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText(rate.code, 76, midY - 7);

    // Name (truncated)
    const shortName = rate.name.length > 22 ? rate.name.slice(0, 22) + '…' : rate.name;
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.38)';
    ctx.fillText(shortName, 76, midY + 9);

    // Buy label + value
    ctx.textAlign = 'right';
    ctx.font = '9px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.32)';
    ctx.fillText('BUY', W / 2 - 16, midY - 9);

    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Courier New", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.58)';
    ctx.fillText(`₦${rate.buy.toLocaleString()}`, W / 2 - 16, midY + 7);

    // Sell label + value
    ctx.font = '9px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = 'rgba(52,211,153,0.55)';
    ctx.fillText('SELL', W - 32, midY - 9);

    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Courier New", monospace';
    ctx.fillStyle = '#34d399';
    ctx.fillText(`₦${rate.sell.toLocaleString()}`, W - 32, midY + 7);

    ctx.textAlign = 'left';
  });

  // Footer band
  const footerY = H - footerH;
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.fillRect(0, footerY, W, footerH);

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText('via NairaWatch  ·  tomiabe.github.io/nairawatch', 32, footerY + footerH / 2);

  return canvas;
}

interface ShareModalProps {
  rates: CurrencyRate[];
  watchlist: string[];
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ rates, watchlist, onClose }) => {
  const [selected, setSelected] = useState<string[]>(() => {
    const base = watchlist.length > 0 ? watchlist : SHARE_DEFAULTS;
    return base.slice(0, 6);
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const generated = buildCanvas(rates, selected);
    el.width = generated.width;
    el.height = generated.height;
    el.getContext('2d')!.drawImage(generated, 0, 0);
  }, [rates, selected]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggleCode = (code: string) => {
    setSelected((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : prev.length < 8
        ? [...prev, code]
        : prev,
    );
  };

  const getCanvas = () => buildCanvas(rates, selected);

  const handleDownload = () => {
    getCanvas().toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nairawatch-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const handleShare = () => {
    getCanvas().toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'nairawatch-rates.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'NairaWatch',
            text: `₦ Parallel Market Rates — ${new Date().toLocaleDateString('en-NG')}`,
          });
        } catch {
          // user cancelled
        }
      } else {
        handleDownload();
      }
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-sm p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Share Rate Card</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Live preview */}
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-950">
            <canvas ref={canvasRef} className="w-full h-auto block" />
          </div>

          {/* Currency picker */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Currencies — {selected.length} selected (max 8)
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {rates.map((r) => {
                const on = selected.includes(r.code);
                return (
                  <button
                    key={r.code}
                    type="button"
                    onClick={() => toggleCode(r.code)}
                    disabled={!on && selected.length >= 8}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors ${
                      on
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed'
                    }`}
                  >
                    <span style={EMOJI_STYLE}>{r.flag}</span>
                    {r.code}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-800 dark:bg-slate-700 text-white text-sm font-semibold hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </button>
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
