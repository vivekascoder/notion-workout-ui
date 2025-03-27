import Link from "next/link";
import { cn } from "@/lib/utils";

interface LinkItem {
  title: string;
  href: string;
  description?: string;
}

interface LinkListProps {
  links: LinkItem[];
  className?: string;
}

export function LinkList({ links, className }: LinkListProps) {
  return (
    <nav className={cn("flex flex-col space-y-1", className)}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group flex flex-col space-y-1 rounded-md px-3 py-2 transition-colors hover:bg-accent"
        >
          <div className="font-medium transition-colors group-hover:text-accent-foreground">
            {link.title}
          </div>
          {link.description && (
            <div className="line-clamp-1 text-sm text-muted-foreground">
              {link.description}
            </div>
          )}
        </Link>
      ))}
    </nav>
  );
}
