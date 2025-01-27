import React, { useState, useEffect } from 'react';
import { Trash2, Moon, Sun } from 'lucide-react';
import { marked } from 'marked';
import { createRoot } from 'react-dom/client';
import { jsPDF } from 'jspdf';

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const stripMarkdown = (text) => {
  // Basic markdown stripping - can be enhanced
  return text
    .replace(/\!\[.*?\]\(.*?\)/g, '[Image]') // Replace images with [Image]
    .replace(/\[.*?\]\(.*?\)/g, '') // Remove links
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\#+ /g, '') // Remove headers
    .replace(/\- /g, '• '); // Convert list items to bullets
};

const exportToPDF = (date, entries) => {
  const doc = new jsPDF();
  let yPos = 20;

  // Add title
  doc.setFontSize(16);
  doc.text(formatDate(date), 20, yPos);

  entries.forEach((entry) => {
    yPos += 10;

    // Add time
    doc.setFontSize(12);
    doc.text(entry.entry_time.substring(0, 5), 20, yPos);

    // Add description with stripped markdown
    const cleanText = stripMarkdown(entry.description);
    const lines = doc.splitTextToSize(cleanText, 170);
    lines.forEach(line => {
      yPos += 7;
      if (yPos >= 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, 30, yPos);
    });

    yPos += 5; // Space between entries
  });

  doc.save(`diary-${date}.pdf`);
};

marked.use({ breaks: true });

const getRoundedTime = () => {
  const now = new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;
  now.setMinutes(roundedMinutes);
  now.setSeconds(0);

  return now.toTimeString().substring(0, 5);
};

const ThemeToggle = () => {
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle dark mode"
    >
      <Sun className="hidden dark:block text-gray-100" />
      <Moon className="block dark:hidden text-gray-800" />
    </button>
  );
};

const DiaryEntry = () => {
  const [entries, setEntries] = useState([]);
  const [time, setTime] = useState(getRoundedTime().toString());
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    const toggleContainer = document.getElementById('theme-toggle');
    if (toggleContainer) {
      const root = createRoot(toggleContainer);
      root.render(<ThemeToggle />);
    }
  }, []);

  const loadEntries = async () => {
    try {
      const response = await fetch('/api/entries');
      const data = await response.json();
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
    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time, description })
      });

      if (!response.ok) throw new Error('Failed to add entry');
      setTime('');
      setDescription('');
      loadEntries();
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  const handleEdit = async (entry) => {
    if (editingId === entry.id) {
      try {
        const response = await fetch(`/api/entries?id=${entry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: entry.entry_date,
            time: entry.entry_time.substring(0, 5),
            description: entry.description
          })
        });
        if (!response.ok) throw new Error('Failed to update entry');
        setEditingId(null);
        loadEntries();
      } catch (error) {
        console.error('Error updating entry:', error);
      }
    } else {
      setEditingId(entry.id);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/entries?id=${id}`, { method: 'DELETE' });
      loadEntries();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

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
      <form onSubmit={handleSubmit} className="sticky top-0 bg-white dark:bg-gray-900 pb-6 mb-8 border-b dark:border-gray-700">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onPaste={handlePaste}
          placeholder="What happened?"
          className="w-full mb-4 p-2 border dark:border-gray-700 rounded focus:ring-2 focus:ring-black dark:focus:ring-gray-300 focus:outline-none min-h-[100px] resize-y dark:bg-gray-800 dark:text-gray-100"
          required
        />
        <div className="flex gap-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 border dark:border-gray-700 rounded focus:ring-2 focus:ring-black dark:focus:ring-gray-300 focus:outline-none dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="p-2 border dark:border-gray-700 rounded focus:ring-2 focus:ring-black dark:focus:ring-gray-300 focus:outline-none dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-black dark:bg-gray-700 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
          >
            Add
          </button>
        </div>
      </form>

      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search entries..."
          className="w-full p-2 border dark:border-gray-700 rounded focus:ring-2 focus:ring-black dark:focus:ring-gray-300 focus:outline-none dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

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
              {dayEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 border dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors group ml-4"
                >
                  {editingId === entry.id ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-4">
                        <input
                          type="time"
                          value={entry.entry_time.substring(0, 5)}
                          onChange={(e) => {
                            const updatedEntries = {...entries};
                            const entryDate = entry.entry_date.split('T')[0];
                            const entryIndex = updatedEntries[entryDate].findIndex(e => e.id === entry.id);
                            updatedEntries[entryDate][entryIndex] = {
                              ...entry,
                              entry_time: e.target.value
                            };
                            setEntries(updatedEntries);
                          }}
                          className="p-2 border dark:border-gray-700 rounded w-24 dark:bg-gray-800 dark:text-gray-100"
                        />
                      </div>
                      <textarea
                        value={entry.description}
                        onChange={(e) => {
                          const updatedEntries = {...entries};
                          const entryDate = entry.entry_date.split('T')[0];
                          const entryIndex = updatedEntries[entryDate].findIndex(e => e.id === entry.id);
                          updatedEntries[entryDate][entryIndex] = {
                            ...entry,
                            description: e.target.value
                          };
                          setEntries(updatedEntries);
                        }}
                        className="flex-1 p-2 border dark:border-gray-700 rounded dark:bg-gray-800 dark:text-gray-100 min-h-[100px] resize-y w-full"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-gray-600 dark:text-gray-400">{entry.entry_time.substring(0, 5)}</span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-8 h-8 flex items-center justify-center"
                          >
                            {editingId === entry.id ? '✓' : '✎'}
                          </button>
                          <button
                            onClick={() => editingId === entry.id ? setEditingId(null) : handleDelete(entry.id)}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors w-8 h-8 flex items-center justify-center"
                          >
                            {editingId === entry.id ? 'x' : <Trash2 size={16} />}
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: marked(entry.description) }}></div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default DiaryEntry;