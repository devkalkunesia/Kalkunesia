export function formatRupiah(n: number): string {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

export function formatNumber(n: number): string {
  if (!n && n !== 0) return '';
  return Math.round(n).toLocaleString('id-ID');
}

export function parseNumber(str: string): number {
  return parseFloat(str.replace(/\./g, '').replace(/[^0-9-]/g, '')) || 0;
}

export interface ValidationRule {
  min?: number;
  max?: number;
  required?: boolean;
  label?: string;
}

export function validateInput(value: number, rules: ValidationRule): string | null {
  const label = rules.label || 'Nilai';
  if (rules.required && (value === 0 || isNaN(value))) return `${label} wajib diisi`;
  if (isNaN(value)) return null;
  if (rules.min !== undefined && value < rules.min)
    return `${label} minimal ${rules.min.toLocaleString('id-ID')}`;
  if (rules.max !== undefined && value > rules.max)
    return `${label} maksimal ${rules.max.toLocaleString('id-ID')}`;
  return null;
}

export function parseRupiah(str: string): number {
  return parseFloat(str.replace(/\./g, '').replace(/[^0-9-]/g, '')) || 0;
}

export function showToast(msg: string) {
  let t = document.querySelector('.toast') as HTMLDivElement | null;
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t!.classList.remove('show'), 2200);
}

export function animateValue(
  el: HTMLElement | null,
  start: number,
  end: number,
  duration: number,
  formatter?: (n: number) => string
) {
  if (!el) return;
  const startTime = performance.now();
  const fmt = formatter || ((n: number) => formatRupiah(n));
  function update(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + ease * (end - start));
    el!.textContent = fmt(current);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

export function getResultSummary(): string {
  const cards = document.querySelectorAll('.result-card');
  const lines = ['📊 Hasil Kalkulasi — Kalkunesia', ''];
  cards.forEach((c) => {
    const label = c.querySelector('.result-label');
    const value = c.querySelector('.result-value');
    if (label && value) lines.push(label.textContent + ': ' + value.textContent);
  });
  lines.push('', '🔗 kalkunesia.com');
  return lines.join('\n');
}

export function copyResult() {
  navigator.clipboard.writeText(getResultSummary()).then(() => showToast('📋 Ringkasan berhasil disalin!'));
}

export function shareResult() {
  if (navigator.share) {
    navigator.share({ title: document.title, text: getResultSummary(), url: location.href }).catch(() => {});
  } else {
    navigator.clipboard.writeText(location.href).then(() => showToast('🔗 Link berhasil disalin!'));
  }
}

export function exportPDF() {
  window.print();
}
