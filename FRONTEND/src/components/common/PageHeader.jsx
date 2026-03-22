import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable PageHeader
 *
 * Props:
 *  - title      : string
 *  - subtitle   : string (optional)
 *  - backPath   : path to navigate back (optional, shows back arrow)
 *  - actions    : React node for right-side actions (optional)
 */
const PageHeader = ({ title, subtitle, backPath, actions }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-3">
        {backPath && (
          <button
            onClick={() => navigate(backPath)}
            className="p-2 rounded-xl text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </button>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight truncate max-w-md">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-400 text-sm mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

export default PageHeader;
