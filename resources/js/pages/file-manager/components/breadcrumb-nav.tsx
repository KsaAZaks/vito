import { ChevronRightIcon, HomeIcon } from 'lucide-react';
import { Site } from '@/types/site';

interface BreadcrumbNavProps {
  path: string;
  onNavigate: (path: string) => void;
  site?: Site | null;
}

export default function BreadcrumbNav({ path, onNavigate, site }: BreadcrumbNavProps) {
  const parts = path.split('/').filter(Boolean);
  const crumbs: { label: string; path: string }[] = [];

  let accumulated = '';
  for (const part of parts) {
    accumulated += '/' + part;
    crumbs.push({ label: part, path: accumulated });
  }

  const minPath = site ? site.path : '/';

  return (
    <div className="bg-muted/50 border-border flex items-center gap-1 overflow-x-auto rounded-md border px-3 py-2 text-sm">
      <button
        onClick={() => onNavigate(minPath)}
        className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1 transition-colors"
      >
        <HomeIcon className="size-3.5" />
      </button>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        const isNavigable = crumb.path.length >= minPath.length;

        return (
          <span key={crumb.path} className="flex items-center gap-1">
            <ChevronRightIcon className="text-muted-foreground size-3.5 shrink-0" />
            {isLast ? (
              <span className="font-medium">{crumb.label}</span>
            ) : isNavigable ? (
              <button onClick={() => onNavigate(crumb.path)} className="text-muted-foreground hover:text-foreground transition-colors">
                {crumb.label}
              </button>
            ) : (
              <span className="text-muted-foreground">{crumb.label}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
