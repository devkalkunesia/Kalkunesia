interface ToolHeroProps {
  icon: string;
  badge: string;
  title: string;
  subtitle: string;
  tags: string[];
}

export default function ToolHero({ icon, badge, title, subtitle, tags }: ToolHeroProps) {
  return (
    <div className="tool-hero reveal">
      <div className="tool-hero-inner">
        <div className="tool-hero-icon">{icon}</div>
        <h1>{title}</h1>
      </div>
      <p className="tool-hero-sub">{subtitle}</p>
      <div className="tool-hero-tags">
        <span className="tool-hero-badge">{badge}</span>
        {tags.map((t, i) => <span key={i} className={`tool-tag${i === 0 ? ' tag-cat' : ''}`}>{t}</span>)}
      </div>
    </div>
  );
}
