import { ReactNode, ElementType } from "react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/Breadcrumbs";

interface PageHeaderProps {
  icon: ElementType;
  title: string;
  description?: string;
  breadcrumbs: BreadcrumbItem[];
  actions?: ReactNode;
}

export function PageHeader({
  icon: Icon,
  title,
  description,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <div className="space-y-4">
      <Breadcrumbs items={breadcrumbs} homeHref="/finance" />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/30 p-3">
            <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex gap-3">{actions}</div>}
      </div>
    </div>
  );
}
