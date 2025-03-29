import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

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
          className="group flex space-y-1 items-center justify-between rounded-md px-3 py-5 transition-colors hover:bg-accent"
        >
          <div className="font-medium transition-colors group-hover:text-accent-foreground">
            {link.title}
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          {/* {link.description && (
            <div className="line-clamp-1 text-sm text-muted-foreground">
              {link.description}
            </div>
          )} */}
        </Link>
      ))}
    </nav>
  );
}
