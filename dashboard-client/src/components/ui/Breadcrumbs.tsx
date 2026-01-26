import { Link } from "react-router-dom";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  homeHref?: string;
}

export function Breadcrumbs({ items, homeHref = "/" }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <Link
        to={homeHref}
        className="flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <HomeIcon className="h-4 w-4" />
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRightIcon className="h-4 w-4" />
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
