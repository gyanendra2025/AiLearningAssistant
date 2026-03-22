import React from 'react';

/**
 * Reusable Tabs component
 *
 * Props:
 *  - tabs      : Array of { id, label, icon: LucideIcon }
 *  - activeTab : current active tab id
 *  - onChange  : (tabId) => void
 */
const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-xl p-1 border border-gray-100 overflow-x-auto">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200 cursor-pointer whitespace-nowrap
              ${isActive
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200/50'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }
            `}
          >
            {Icon && (
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} strokeWidth={isActive ? 2 : 1.8} />
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
