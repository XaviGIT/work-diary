import { Eye, EyeOff } from 'lucide-react';

export const VisibilityToggle = ({ isBlurred, onToggle }) => {
  const shortcut = navigator.platform.indexOf('Mac') === 0 ? '⌘H' : 'Ctrl+H';
  const tooltipText = `${isBlurred ? 'Show' : 'Hide'} content (${shortcut})`;

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label={isBlurred ? "Show content" : "Hide content"}
      >
        {isBlurred ? (
          <Eye className="text-gray-800 dark:text-gray-100" />
        ) : (
          <EyeOff className="text-gray-800 dark:text-gray-100" />
        )}
      </button>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        {tooltipText}
      </div>
    </div>
  );
};