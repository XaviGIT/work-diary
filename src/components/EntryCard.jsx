import React, { useState, useEffect } from 'react';
import { Trash2, Clipboard, ClipboardCheck, Loader, Save, X, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { marked } from 'marked';
import { LoadingSpinner } from './LoadingComponent';
import hljs from 'highlight.js';
import { format } from 'date-fns';

// Configure marked to use highlight.js for code syntax highlighting
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true
});

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  // Calculate character and word count
  useEffect(() => {
    if (entry.description) {
      setCharCount(entry.description.length);
      setWordCount(entry.description.trim().split(/\s+/).filter(Boolean).length);
    }
  }, [entry.description]);

  // Determine importance level based on entry length
  const getImportanceLevel = () => {
    return 'medium';
    // if (wordCount < 20) return 'low';
    // if (wordCount < 100) return 'medium';
    // return 'high';
  };

  const importanceColors = {
    low: 'bg-blue-100 dark:bg-blue-900',
    medium: 'bg-purple-100 dark:bg-purple-900',
    high: 'bg-pink-100 dark:bg-pink-900'
  };

  const importanceLevel = getImportanceLevel();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(entry.description);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Format the entry time for display
  const formatTime = (timeString) => {
    try {
      // Parse the time string (assuming format HH:MM:SS)
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));

      // Format in 12-hour format
      return format(date, 'h:mm a');
    } catch (e) {
      return timeString.substring(0, 5); // Fallback
    }
  };

  // Determine if content should be truncated
  const shouldTruncate = !isExpanded && !isEditing && entry.description.length > 300;

  // Get truncated content if needed
  const getDisplayContent = () => {
    if (shouldTruncate) {
      return entry.description.substring(0, 300) + '...';
    }
    return entry.description;
  };

  return (
    <div className={`p-0 border dark:border-gray-700 rounded-lg transition-all duration-300 group
                    hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-md
                    ${isEditing ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                    ml-4 relative overflow-hidden`}>
      {/* Loading overlay when deleting */}
      {isDeleting && (
        <div className="absolute inset-0 bg-white bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70
                      rounded-lg flex items-center justify-center z-10 backdrop-blur-sm">
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-700 px-4 py-2 rounded-lg shadow-lg">
            <LoadingSpinner size="sm" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Deleting...</span>
          </div>
        </div>
      )}

      {/* Card Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b dark:border-gray-700
                     ${importanceColors[importanceLevel]} transition-colors`}>
        <div className="flex items-center space-x-3">
          <div className="bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-sm flex items-center space-x-2">
            <Calendar size={14} className="text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {formatTime(entry.entry_time)}
            </span>
          </div>

          <div className="text-xs text-gray-600 dark:text-gray-400 hidden sm:flex space-x-2">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} characters</span>
          </div>
        </div>

        <div className="flex gap-1">
          {/* Card actions */}
          <button
            onClick={handleCopy}
            className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400
                     transition-colors p-1 rounded-full hover:bg-white/50 dark:hover:bg-black/20"
            title="Copy to clipboard"
            disabled={isDeleting || isSaving}
          >
            {isCopied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
          </button>

          <button
            onClick={onEdit}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400
                     transition-colors p-1 rounded-full hover:bg-white/50 dark:hover:bg-black/20"
            title={isEditing ? "Save changes" : "Edit entry"}
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
            className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400
                     transition-colors p-1 rounded-full hover:bg-white/50 dark:hover:bg-black/20"
            title={isEditing ? "Cancel editing" : "Delete entry"}
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

      {/* Card Content */}
      <div className="p-4">
        {isEditing ? (
          <div className="transition-all duration-300">
            <textarea
              value={entry.description}
              onChange={(e) => onUpdate({ ...entry, description: e.target.value })}
              className={`w-full p-3 border dark:border-gray-700 rounded dark:bg-gray-800
                        dark:text-gray-100 min-h-[150px] resize-y focus:ring-2
                        focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none
                        ${isBlurred ? 'blur-md focus:blur-none hover:blur-none' : ''}`}
              disabled={isSaving}
              placeholder="Write your entry here... Markdown is supported!"
            />

            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
              <span>Supports Markdown: **bold**, *italic*, # heading, ```code```</span>
              <span>{wordCount} words | {charCount} characters</span>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div
              className={`prose prose-sm max-w-none dark:prose-invert transition-all duration-300
                          prose-headings:font-bold prose-h1:text-xl prose-a:text-blue-600 dark:prose-a:text-blue-400
                          prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:p-0.5 prose-code:rounded
                          prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:p-2 prose-pre:rounded
                          ${isBlurred ? 'blur-md hover:blur-none' : ''}
                          ${shouldTruncate ? 'prose-lg' : ''}`}
              dangerouslySetInnerHTML={{ __html: marked(getDisplayContent()) }}
            />

            {/* Show expand/collapse button if needed */}
            {entry.description.length > 300 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp size={16} className="mr-1" /> Show less
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} className="mr-1" /> Show more
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Show save indicator at the bottom of form when saving */}
      {isEditing && isSaving && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border-t dark:border-gray-700 text-sm text-blue-700 dark:text-blue-300 flex items-center justify-center">
          <LoadingSpinner size="sm" className="mr-2" />
          Saving changes...
        </div>
      )}
    </div>
  );
};