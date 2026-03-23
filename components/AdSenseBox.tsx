interface AdSenseBoxProps {
  size: 'leaderboard' | 'rectangle' | 'small';
}

export default function AdSenseBox({ size }: AdSenseBoxProps) {
  const dims = size === 'leaderboard' ? '728×90 — Leaderboard' : size === 'rectangle' ? '300×250 — Medium Rectangle' : '300×180';
  const isLeaderboard = size === 'leaderboard';

  return (
    <div className={isLeaderboard ? 'adsense-banner' : 'adsense-box'} style={size === 'small' ? { minHeight: 180 } : undefined}>
      <div>
        <div className="adsense-label">Advertisement</div>
        <div className="adsense-size">{dims}</div>
      </div>
    </div>
  );
}
