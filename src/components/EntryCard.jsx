import { Trash2 } from 'lucide-react';
import { marked } from 'marked';

export const EntryCard = ({ entry, isEditing, onEdit, onDelete, onUpdate, onCancel, isBlurred }) => (
  <div className="p-4 border dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors group ml-4">
    <div className="flex items-center justify-between mb-3">
      {isEditing ? (
        <input
          type="time"
          value={entry.entry_time.substring(0, 5)}
          onChange={(e) => onUpdate({ ...entry, entry_time: e.target.value })}
          className="p-2 border dark:border-gray-700 rounded w-24 dark:bg-gray-800 dark:text-gray-100"
        />
      ) : (
        <span className="font-mono text-gray-600 dark:text-gray-400">
          {entry.entry_time.substring(0, 5)}
        </span>
      )}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100">
        <button
          onClick={onEdit}
          className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-8 h-8 flex items-center justify-center"
        >
          {isEditing ? '✓' : '✎'}
        </button>
        <button
          onClick={isEditing ? () => onCancel(entry) : onDelete}
          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors w-8 h-8 flex items-center justify-center"
        >
          {isEditing ? 'x' : <Trash2 size={16} />}
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
      />
    ) : (
      <div
        className={`prose prose-sm dark:prose-invert max-w-none ${
          isBlurred ? 'blur-md hover:blur-none' : ''
        }`}
        dangerouslySetInnerHTML={{ __html: marked(entry.description) }}
      />
    )}
  </div>
);