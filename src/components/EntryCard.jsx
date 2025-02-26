import { Trash2, Clipboard, ClipboardCheck, Loader, Save, X } from 'lucide-react';
import React, { useState } from 'react';
import { marked } from 'marked';
import { LoadingSpinner } from './LoadingComponent';

export const EntryCard = ({
  entry,
  isEditing,
  onEdit,
  onDelete,
  onUpdate,
  onCancel,
  isBlurred,
  isDeleting = false,
  isSaving = false
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(entry.description);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="p-4 border dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors group ml-4 relative">
      {/* Show loading overlay when deleting */}
      {isDeleting && (
        <div className="absolute inset-0 bg-white bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-50 rounded-lg flex items-center justify-center z-10">
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-700 px-3 py-1 rounded-lg shadow-md">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-gray-700 dark:text-gray-200">Deleting...</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        {isEditing ? (
          <input
            type="time"
            value={entry.entry_time.substring(0, 5)}
            onChange={(e) => onUpdate({ ...entry, entry_time: e.target.value })}
            className="p-2 border dark:border-gray-700 rounded w-24 dark:bg-gray-800 dark:text-gray-100"
            disabled={isSaving}
          />
        ) : (
          <span className="font-mono text-gray-600 dark:text-gray-400">
            {entry.entry_time.substring(0, 5)}
          </span>
        )}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors w-8 h-8 flex items-center justify-center"
            title="Copy to clipboard"
            disabled={isDeleting || isSaving}
          >
            {isCopied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
          </button>

          <button
            onClick={onEdit}
            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-8 h-8 flex items-center justify-center"
            disabled={isDeleting || isSaving}
          >
            {isEditing ? (
              isSaving ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )
            ) : (
              '✎'
            )}
          </button>

          <button
            onClick={isEditing ? onCancel : onDelete}
            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors w-8 h-8 flex items-center justify-center"
            disabled={isDeleting || isSaving}
          >
            {isEditing ? (
              <X size={16} />
            ) : (
              isDeleting ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )
            )}
          </button>
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={entry.description}
          onChange={(e) => onUpdate({ ...entry, description: e.target.value })}
          className={`w-full p-2 border dark:border-gray-700 rounded dark:bg-gray-800 dark:text-gray-100 min-h-[100px] resize-y ${
            isBlurred ? 'blur-md focus:blur-none hover:blur-none' : ''
          }`}
          disabled={isSaving}
        />
      ) : (
        <div
          className={`prose prose-sm dark:prose-invert max-w-none ${
            isBlurred ? 'blur-md hover:blur-none' : ''
          }`}
          dangerouslySetInnerHTML={{ __html: marked(entry.description) }}
        />
      )}

      {/* Show save indicator at the bottom of form when saving */}
      {isEditing && isSaving && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center">
          <LoadingSpinner size="sm" className="mr-2" />
          Saving changes...
        </div>
      )}
    </div>
  );
};