export interface NoticeSection {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: string[];
}

export interface PageNoticeConfig {
  pageId: string;
  title: string;
  purpose: string;
  sections: NoticeSection[];
  icon?: React.ComponentType<{ className?: string }>;
  moduleColor?: 'orange' | 'indigo' | 'emerald' | 'violet' | 'pink' | 'gray';
}

export const MODULE_COLOR_CONFIGS = {
  orange: {
    gradient: 'from-orange-500/20 to-amber-600/20',
    iconBg: 'bg-orange-500/20',
    iconText: 'text-orange-300',
    textPrimary: 'text-orange-100',
    bullet: 'text-orange-300',
  },
  indigo: {
    gradient: 'from-indigo-500/20 to-purple-600/20',
    iconBg: 'bg-indigo-500/20',
    iconText: 'text-indigo-300',
    textPrimary: 'text-indigo-100',
    bullet: 'text-indigo-300',
  },
  emerald: {
    gradient: 'from-emerald-500/20 to-green-600/20',
    iconBg: 'bg-emerald-500/20',
    iconText: 'text-emerald-300',
    textPrimary: 'text-emerald-100',
    bullet: 'text-emerald-300',
  },
  violet: {
    gradient: 'from-violet-500/20 to-purple-600/20',
    iconBg: 'bg-violet-500/20',
    iconText: 'text-violet-300',
    textPrimary: 'text-violet-100',
    bullet: 'text-violet-300',
  },
  pink: {
    gradient: 'from-pink-500/20 to-rose-600/20',
    iconBg: 'bg-pink-500/20',
    iconText: 'text-pink-300',
    textPrimary: 'text-pink-100',
    bullet: 'text-pink-300',
  },
  gray: {
    gradient: 'from-gray-500/20 to-slate-600/20',
    iconBg: 'bg-gray-500/20',
    iconText: 'text-gray-300',
    textPrimary: 'text-gray-100',
    bullet: 'text-gray-300',
  },
} as const;
