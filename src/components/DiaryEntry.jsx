import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { marked } from 'marked';
import { Toaster, toast } from 'react-hot-toast';
import { Calendar, AlertCircle, FileUp } from 'lucide-react';

import { ThemeToggle } from './ThemeToggle';
import { SearchBar } from './SearchBar';
import { EntryForm } from './EntryForm';
import { EntryCard } from './EntryCard';
import { MonthPicker } from './MonthPicker';
import { VisibilityToggle } from './VisibilityToggle';
import { formatDate, getRoundedTime } from '../utils/dates';
import { exportToPDF } from '../utils/pdf';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { api } from '../utils/api';
import { LoadingSpinner, LoadingOverlay } from './LoadingComponent';

marked.use({ breaks: true });

const DiaryEntry = () => {
  // State management for entry form
  const [time, setTime] = useState(getRoundedTime().toString());
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // State management for entries
  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // UI state
  const [isBlurred, setIsBlurred] = useState(() => getStorageItem('contentBlurred', false));
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savingIds, setSavingIds] = useState([]);
  const [deletingIds, setDeletingIds] = useState([]);
  const [exportingDate, setExportingDate] = useState(null);
  const [error, setError] = useState(null);

  // Initialize on component mount
  useEffect(() => {
    loadEntries();
    initThemeToggle();

    // Listen for Esc key to cancel editing
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && editingId) {
        setEditingId(null);
      }

      // Toggle blur with Ctrl+H or Cmd+H
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setIsBlurred(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingId]);

  // Load entries when selected month changes
  useEffect(() => {
    loadEntries();
  }, [selectedMonth]);

  // Store blur preference
  useEffect(() => {
    setStorageItem('contentBlurred', isBlurred);
  }, [isBlurred]);

  // Initialize theme toggle
  const initThemeToggle = () => {
    const toggleContainer = document.getElementById('theme-toggle');
    if (toggleContainer) {
      const root = createRoot(toggleContainer);
      root.render(<ThemeToggle />);
    }

    // Initialize visibility toggle
    const visibilityContainer = document.getElementById('visibility-toggle');
    if (visibilityContainer) {
      const root = createRoot(visibilityContainer);
      root.render(
        <VisibilityToggle
          isBlurred={isBlurred}
          onToggle={() => setIsBlurred(prevState => !prevState)}
        />
      );
    }
  };

  const loadEntries = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.getEntriesByMonth(selectedMonth);

      // Group entries by date
      const groupedEntries = data.reduce((groups, entry) => {
        const date = entry.entry_date.split('T')[0];
        if (!groups[date]) groups[date] = [];
        groups[date].push(entry);
        return groups;
      }, {});

      // Sort entries by time within each date group
      Object.keys(groupedEntries).forEach(date => {
        groupedEntries[date].sort((a, b) => a.entry_time.localeCompare(b.entry_time));
      });

      setEntries(groupedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
      setError('Failed to load entries. Please try again later.');
      toast.error('Failed to load entries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.addEntry({ date, time, description });
      toast.success('Entry added successfully');
      setTime(getRoundedTime().toString());
      setDescription('');
      loadEntries();
    } catch (error) {
      toast.error(error.message || 'Failed to add entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (entry) => {
    if (editingId === entry.id) {
      setSavingIds(prev => [...prev, entry.id]);

      try {
        await api.updateEntry(entry.id, {
          date: entry.entry_date,
          time: entry.entry_time.substring(0, 5),
          description: entry.description
        });
        toast.success('Entry updated successfully');
        setEditingId(null);
        loadEntries();
      } catch (error) {
        toast.error(error.message || 'Failed to update entry');
      } finally {
        setSavingIds(prev => prev.filter(id => id !== entry.id));
      }
    } else {
      setEditingId(entry.id);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this entry?');
    if (!confirmed) return;

    setDeletingIds(prev => [...prev, id]);

    try {
      await api.deleteEntry(id);
      toast.success('Entry deleted successfully');
      loadEntries();
    } catch (error) {
      toast.error(error.message || 'Failed to delete entry');
    } finally {
      setDeletingIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleUpdate = (dateStr, entryIndex, updatedEntry) => {
    const updatedEntries = {...entries};
    updatedEntries[dateStr][entryIndex] = updatedEntry;
    setEntries(updatedEntries);
  };

  const handleExportPDF = async (date, dayEntries) => {
    setExportingDate(date);
    try {
      await exportToPDF(date, dayEntries);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error(error.message || 'Failed to export PDF');
    } finally {
      setExportingDate(null);
    }
  };

  const filterEntries = (entries, query) => {
    if (!query) return entries;

    const filteredGroups = {};
    Object.entries(entries).forEach(([date, dayEntries]) => {
      const filtered = dayEntries.filter(entry =>
        entry.description.toLowerCase().includes(query.toLowerCase()) ||
        entry.entry_time.includes(query)
      );
      if (filtered.length > 0) {
        filteredGroups[date] = filtered;
      }
    });
    return filteredGroups;
  };

  const filteredEntries = filterEntries(entries, searchQuery);
  const hasEntries = Object.keys(filteredEntries).length > 0;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 dark:bg-gray-900 min-h-screen">
      {/* App header and controls */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          <Calendar className="mr-2 h-6 w-6" />
          Work Diary
        </h1>

        <div className="flex gap-2 items-center">
          <MonthPicker
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
          <div id="visibility-toggle"></div>
          <div id="theme-toggle"></div>
        </div>
      </div>

      <Toaster position="top-right" toastOptions={{
        className: 'dark:bg-gray-800 dark:text-gray-100',
        duration: 3000
      }} />

      <EntryForm
        description={description}
        setDescription={setDescription}
        date={date}
        setDate={setDate}
        time={time}
        setTime={setTime}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 border border-red-300 bg-red-50 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center text-red-800 dark:text-red-400">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 animate-fadeIn">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading entries...</p>
        </div>
      ) : !hasEntries ? (
        /* Empty state */
        <div className="text-center p-12 border border-dashed rounded-lg border-gray-300 dark:border-gray-700 transition-all animate-fadeIn">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {searchQuery
                ? "No entries match your search"
                : "No entries found for this month"}
            </p>
            {!searchQuery && (
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                Create your first entry using the form above
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Entries list */
        <div className="space-y-8 animate-fadeIn">
          {Object.entries(filteredEntries)
            .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
            .map(([date, dayEntries]) => (
              <div key={date} className="space-y-3 transition-all">
                <div className="flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 py-2 z-10">
                  <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {formatDate(date)}
                  </h2>
                  <button
                    onClick={() => handleExportPDF(date, dayEntries)}
                    className="px-3 py-1 text-sm bg-black dark:bg-gray-700 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors flex items-center"
                    disabled={exportingDate === date}
                  >
                    {exportingDate === date ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <FileUp size={14} className="mr-1" />
                        Export PDF
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-3 pl-3 border-l-2 border-gray-200 dark:border-gray-700">
                  {dayEntries.map((entry, index) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      isEditing={editingId === entry.id}
                      onEdit={() => handleEdit(entry)}
                      onDelete={() => handleDelete(entry.id)}
                      onUpdate={(updatedEntry) => handleUpdate(date, index, updatedEntry)}
                      onCancel={() => setEditingId(null)}
                      isBlurred={isBlurred}
                      isDeleting={deletingIds.includes(entry.id)}
                      isSaving={savingIds.includes(entry.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default DiaryEntry;