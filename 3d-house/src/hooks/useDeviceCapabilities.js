/**
 * זיהוי מכשיר: מגע, ביצועים משוערים ואיכות מומלצת.
 */
import { useMemo } from 'react';
import { useTourStore } from '../stores/tourStore.js';

export function detectTouch() {
  if (typeof window === 'undefined') return false;
  const coarse = window.matchMedia?.('(pointer: coarse)')?.matches;
  return coarse || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function useDeviceCapabilities() {
  const quality = useTourStore((s) => s.quality);
  return useMemo(() => {
    const isTouch = detectTouch();
    const cores = navigator.hardwareConcurrency || 4;
    const mem = navigator.deviceMemory || 4;
    const weak = isTouch && (cores <= 4 || mem <= 3);
    const effective = quality === 'auto' ? (weak ? 'low' : isTouch ? 'medium' : 'high') : quality;
    const dpr = effective === 'low' ? [0.75, 1] : effective === 'medium' ? [1, 1.5] : [1, 2];
    return { isTouch, quality: effective, dpr, shadows: effective !== 'low' };
  }, [quality]);
}
