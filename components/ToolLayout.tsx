import { ReactNode } from 'react';

interface ToolLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export default function ToolLayout({ children, sidebar }: ToolLayoutProps) {
  return (
    <div className="tool-layout">
      <div>{children}</div>
      <div className="sidebar">{sidebar}</div>
    </div>
  );
}
