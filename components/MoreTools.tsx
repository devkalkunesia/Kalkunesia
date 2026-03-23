import Link from 'next/link';
import { tools } from '@/lib/tools-data';

interface MoreToolsProps {
  exclude?: string;
}

export default function MoreTools({ exclude }: MoreToolsProps) {
  const filtered = tools.filter(t => t.slug !== exclude).slice(0, 4);
  return (
    <div className="more-tools">
      <div className="more-eyebrow reveal">Eksplorasi Lebih</div>
      <div className="more-title reveal d1">Tools Keuangan Lainnya</div>
      <div className="more-grid">
        {filtered.map((t, i) => (
          <Link key={t.slug} className={`more-card reveal d${(i % 3) + 1}`} href={t.href}>
            <div className="more-card-icon">{t.icon}</div>
            <div className="more-card-name">{t.name}</div>
            <div className="more-card-desc">{t.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
