import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { marked } from 'marked';
import { Toaster, toast } from 'react-hot-toast';

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

marked.use({ breaks: true });

const DiaryEntry = () => {
  const [entries, setEntries] = useState([]);
  const [time, setTime] = useState(getRoundedTime().toString());
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isBlurred, setIsBlurred] = useState(() =>
    getStorageItem('contentBlurred', false)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadEntries();
    initThemeToggle();
  }, []);

  useEffect(() => {
    loadEntries();
  }, [selectedMonth]);

  useEffect(() => {
    setStorageItem('contentBlurred', isBlurred);
  }, [isBlurred]);

  // Add keyboard shortcut (Ctrl+H or Cmd+H) to toggle blur
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl+H or Cmd+H
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setIsBlurred(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    try {
      const data = await api.getEntriesByMonth(selectedMonth);
      const groupedEntries = data.reduce((groups, entry) => {
        const date = entry.entry_date.split('T')[0];
        if (!groups[date]) groups[date] = [];
        groups[date].push(entry);
        return groups;
      }, {});

      Object.keys(groupedEntries).forEach(date => {
        groupedEntries[date].sort((a, b) => a.entry_time.localeCompare(b.entry_time));
      });

      setEntries(groupedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
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
      setIsSubmitting(true);

      try {
        await api.updateEntry(entry.id, {
          date: entry.entry_date,
          time: entry.entry_time.substring(0, 5),
          description: entry.description
        });
        toast.success('Entry edited successfully');
        setEditingId(null);
        loadEntries();
      } catch (error) {
        toast.error(error.message || 'Failed to edit entry');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setEditingId(entry.id);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this entry?');
    if (!confirmed) return;
    setIsSubmitting(true);

    try {
      await api.deleteEntry(id);
      toast.success('Entry deleted successfully');
      loadEntries();
    } catch (error) {
      toast.error(error.message || 'Failed to delete entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = (dateStr, entryIndex, updatedEntry) => {
    const updatedEntries = {...entries};
    updatedEntries[dateStr][entryIndex] = updatedEntry;
    setEntries(updatedEntries);
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

  return (
    <div className="max-w-2xl mx-auto p-6 dark:bg-gray-900">
      {/* Controls in the top-right corner */}
      <div className="fixed top-4 right-4 z-10 flex gap-2">
        <MonthPicker
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
        <div id="visibility-toggle"></div>
        <div id="theme-toggle"></div>
      </div>

      <Toaster position="top-right" toastOptions={{
        className: 'dark:bg-gray-800 dark:text-gray-100'
      }} />

      <EntryForm
        description={description}
        setDescription={setDescription}
        date={date}
        setDate={setDate}
        time={time}
        setTime={setTime}
        onSubmit={handleSubmit}
        isBlurred={isBlurred}
      />

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="space-y-8">
        {Object.entries(filteredEntries)
          .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
          .map(([date, dayEntries]) => (
            <div key={date} className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {formatDate(date)}
                </h2>
                <button
                  onClick={() => exportToPDF(date, dayEntries)}
                  className="px-3 py-1 text-sm bg-black dark:bg-gray-700 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                >
                  Export PDF
                </button>
              </div>
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
                />
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default DiaryEntry;