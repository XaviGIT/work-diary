import React, { useState } from 'react';
import { LoadingButton } from './LoadingComponent';
import { Image, Calendar, Clock } from 'lucide-react';

export const EntryForm = ({
  description,
  setDescription,
  date,
  setDate,
  time,
  setTime,
  onSubmit,
  isSubmitting = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle image paste functionality
  const handlePaste = async (e) => {
    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.type.indexOf('image') === 0) {
        e.preventDefault();
        const file = item.getAsFile();
        const reader = new FileReader();

        reader.onload = async (e) => {
          const base64 = e.target.result;
          const imageMarkdown = `![image](${base64})`;
          setDescription(prev => prev + '\n' + imageMarkdown);
        };

        reader.readAsDataURL(file);
      }
    }
  };

  // Auto-expand textarea when focused
  const handleFocus = () => {
    setIsExpanded(true);
  };

  // When text area loses focus and is empty, collapse it
  const handleBlur = () => {
    if (!description.trim()) {
      setIsExpanded(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="sticky top-0 bg-white dark:bg-gray-900 pt-1 pb-6 mb-8 border-b dark:border-gray-700 z-20 transition-all duration-300"
    >
      <div className="relative">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onPaste={handlePaste}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isExpanded ? "What happened?" : "Add a new entry..."}
          className={`w-full p-3 border dark:border-gray-700 rounded-lg
                     focus:ring-2 focus:ring-black dark:focus:ring-gray-400 focus:outline-none
                     resize-none dark:bg-gray-800 dark:text-gray-100 transition-all duration-300
                     ${isExpanded ? 'min-h-[120px]' : 'min-h-[60px]'}`}
          disabled={isSubmitting}
          required
        />

        {/* Image paste indicator */}
        <div className="absolute bottom-3 right-3 text-gray-400 dark:text-gray-500 text-sm flex items-center">
          <Image size={14} className="mr-1" />
          <span className="hidden sm:inline">Paste images</span>
        </div>
      </div>

      <div className={`mt-3 flex gap-3 flex-wrap transition-opacity duration-300 ${isExpanded || description ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center border dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 bg-gray-50 dark:bg-gray-800 border-r dark:border-gray-700">
            <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 h-10 focus:outline-none dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex items-center border dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 bg-gray-50 dark:bg-gray-800 border-r dark:border-gray-700">
            <Clock size={16} className="text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="p-2 h-10 focus:outline-none dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
            disabled={isSubmitting}
            required
          />
        </div>

        <LoadingButton
          type="submit"
          isLoading={isSubmitting}
          loadingText="Adding..."
          className="ml-auto"
          disabled={!description.trim()}
        >
          Add Entry
        </LoadingButton>
      </div>

      {/* Markdown support hint */}
      <div className={`mt-2 text-xs text-gray-500 dark:text-gray-500 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
        Supports Markdown: **bold**, *italic*, [links](url), `code`, and pasted images
      </div>
    </form>
  );
};