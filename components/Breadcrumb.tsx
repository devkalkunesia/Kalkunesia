import Link from 'next/link';

interface BreadcrumbProps {
  toolName: string;
}

export default function Breadcrumb({ toolName }: BreadcrumbProps) {
  return (
    <div className="breadcrumb">
      <div className="bc-inner">
        <Link className="bc-link" href="/">Home</Link>
        <span className="bc-sep">›</span>
        <Link className="bc-link" href="/tools">Tools</Link>
        <span className="bc-sep">›</span>
        <span className="bc-current">{toolName}</span>
      </div>
    </div>
  );
}
