import type { ReactNode } from 'react';

export interface TabDefinition {
  id: string;
  label: string;
  panel: ReactNode;
}

interface TabsProps {
  tabs: TabDefinition[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeTab, onTabChange, className = '' }: TabsProps) {
  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Tabs"
        className="flex border-b border-[var(--color-border)]"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={[
                'flex-1 px-4 py-3 text-sm font-medium transition',
                isActive
                  ? 'border-b-2 border-[var(--color-highlight)] text-[var(--color-text)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
              ].join(' ')}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => {
        if (tab.id !== activeTab) return null;
        return (
          <div
            key={tab.id}
            role="tabpanel"
            id={`panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            className="pt-6"
          >
            {tab.panel}
          </div>
        );
      })}
    </div>
  );
}
