'use client';
import { useEffect, useRef, useCallback, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return initialValue;
      const parsed = JSON.parse(stored);
      // Basic shape check: if initialValue is an object, ensure parsed has same keys
      if (typeof initialValue === 'object' && initialValue !== null && !Array.isArray(initialValue)) {
        const keys = Object.keys(initialValue);
        if (!keys.every((k) => k in parsed)) return initialValue;
      }
      return parsed as T;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch { /* private browsing or quota exceeded — ignore */ }
  }, [key, value]);

  return [value, setValue];
}

export function useScrollReveal() {
  useEffect(() => {
    let observer: IntersectionObserver;
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('vis');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );
    document.querySelectorAll('.reveal,.rev-l').forEach((el) => {
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
}

export function useBackToTop() {
  useEffect(() => {
    const b = document.createElement('button');
    b.className = 'btt-btn';
    b.innerHTML = '↑';
    b.title = 'Kembali ke atas';
    document.body.appendChild(b);
    const onScroll = () => b.classList.toggle('show', window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    b.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    return () => {
      window.removeEventListener('scroll', onScroll);
      b.remove();
    };
  }, []);
}

export function useAutoCalc(calcFn: () => void, _deps: unknown[] = []) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stableFn = calcFn;
  useEffect(() => {
    const debounced = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(stableFn, 300);
    };
    document.querySelectorAll('.calc-input,.calc-select,.slider').forEach((el) => {
      el.addEventListener('input', debounced);
      el.addEventListener('change', debounced);
    });
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.querySelectorAll('.calc-input,.calc-select,.slider').forEach((el) => {
        el.removeEventListener('input', debounced);
        el.removeEventListener('change', debounced);
      });
    };
  }, [stableFn]);
}
