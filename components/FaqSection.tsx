'use client';
import { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  title: string;
  items: FaqItem[];
}

export default function FaqSection({ title, items }: FaqSectionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const toggle = (i: number) => setOpenIdx(openIdx === i ? null : i);

  return (
    <div className="faq-section">
      <div className="faq-eyebrow reveal">Pertanyaan Umum</div>
      <div className="faq-title reveal d1">{title}</div>
      {items.map((item, i) => (
        <div key={i} className={`faq-item reveal d${(i % 3) + 1}`}>
          <div className="faq-q" onClick={() => toggle(i)}>
            {item.question}
            <span className={`faq-arrow${openIdx === i ? ' open' : ''}`}>▾</span>
          </div>
          <div className={`faq-a${openIdx === i ? ' open' : ''}`}>
            <div className="faq-a-inner">{item.answer}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
