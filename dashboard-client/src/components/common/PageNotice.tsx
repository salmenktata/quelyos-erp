"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass";
import { logger } from '@quelyos/logger';
import type { PageNoticeConfig } from "@/lib/notices/types";
import { MODULE_COLOR_CONFIGS } from "@/lib/notices/types";

interface PageNoticeProps {
  config: PageNoticeConfig;
  className?: string;
}

export function PageNotice({ config, className = "" }: PageNoticeProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const Icon = config.icon || Info;
  const colorConfig = MODULE_COLOR_CONFIGS[config.moduleColor || 'gray'];
  const storageKey = `quelyos_page_notice_collapsed_${config.pageId}`;

  // Hydration-safe initialization
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        setIsCollapsed(stored === "true");
      }
    } catch (error) {
      logger.error("Failed to load notice preference:", error);
    }

    setMounted(true);
  }, [storageKey]);

  // Toggle handler with persistence
  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);

    try {
      localStorage.setItem(storageKey, String(newState));
    } catch (error) {
      logger.error("Failed to save notice preference:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className={className}
    >
      <AnimatePresence mode="wait">
        {mounted && isCollapsed ? (
          // Collapsed State
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <GlassPanel className="p-0" gradient={colorConfig.gradient}>
              <button
                onClick={handleToggle}
                aria-label={`Développer les informations - ${config.title}`}
                aria-expanded={false}
                className="w-full px-5 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
              >
                <div className={`rounded-lg ${colorConfig.iconBg} p-2 flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${colorConfig.iconText}`} />
                </div>
                <span className={`flex-1 text-sm font-medium ${colorConfig.textPrimary}`}>
                  À propos - {config.title}
                </span>
                <ChevronDown className={`h-4 w-4 ${colorConfig.iconText} flex-shrink-0`} />
              </button>
            </GlassPanel>
          </motion.div>
        ) : mounted ? (
          // Expanded State
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <GlassPanel className="p-5" gradient={colorConfig.gradient}>
              <div className="flex items-start gap-3">
                <div className={`rounded-lg ${colorConfig.iconBg} p-2 flex-shrink-0`}>
                  <Icon className={`h-5 w-5 ${colorConfig.iconText}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold text-white">
                      {config.title}
                    </h3>
                    <button
                      onClick={handleToggle}
                      aria-label={`Masquer les informations - ${config.title}`}
                      aria-expanded={true}
                      className="rounded-full p-1.5 hover:bg-white/10 transition-colors"
                    >
                      <ChevronUp className={`h-4 w-4 ${colorConfig.iconText}`} />
                    </button>
                  </div>

                  {/* Purpose */}
                  <div className="mb-3">
                    <p className={`text-sm ${colorConfig.textPrimary} leading-relaxed`}>
                      {config.purpose}
                    </p>
                  </div>

                  {/* Sections */}
                  {config.sections.map((section, sectionIndex) => {
                    const SectionIcon = section.icon;
                    return (
                      <div key={sectionIndex} className={sectionIndex > 0 ? "mt-3" : ""}>
                        <div className="rounded-lg bg-white/5 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            {SectionIcon && <SectionIcon className="h-4 w-4 text-yellow-300" />}
                            <span className="text-sm font-medium text-white">
                              {section.title}
                            </span>
                          </div>
                          <ul className="space-y-1.5">
                            {section.items.map((item, itemIndex) => (
                              <li
                                key={itemIndex}
                                className="text-xs text-slate-200 flex items-start gap-2"
                              >
                                <span className={`${colorConfig.bullet} mt-0.5 flex-shrink-0`}>•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        ) : (
          // Loading State (prevents hydration mismatch)
          <GlassPanel className="p-5" gradient={colorConfig.gradient}>
            <div className="flex items-start gap-3">
              <div className={`rounded-lg ${colorConfig.iconBg} p-2 flex-shrink-0`}>
                <Icon className={`h-5 w-5 ${colorConfig.iconText}`} />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-base font-semibold text-white">
                  {config.title}
                </h3>
                <div className="mb-3">
                  <p className={`text-sm ${colorConfig.textPrimary} leading-relaxed`}>
                    {config.purpose}
                  </p>
                </div>
                {config.sections.map((section, sectionIndex) => {
                  const SectionIcon = section.icon;
                  return (
                    <div key={sectionIndex} className={sectionIndex > 0 ? "mt-3" : ""}>
                      <div className="rounded-lg bg-white/5 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          {SectionIcon && <SectionIcon className="h-4 w-4 text-yellow-300" />}
                          <span className="text-sm font-medium text-white">
                            {section.title}
                          </span>
                        </div>
                        <ul className="space-y-1.5">
                          {section.items.map((item, itemIndex) => (
                            <li
                              key={itemIndex}
                              className="text-xs text-slate-200 flex items-start gap-2"
                            >
                              <span className={`${colorConfig.bullet} mt-0.5 flex-shrink-0`}>•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassPanel>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
