import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { marked } from 'marked';

marked.use({ breaks: true });

const DiaryEntry = () => {
  const [entries, setEntries] = useState([]);
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEntries();
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

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const deleteEntry = async (id) => {
    try {
      await fetch(`/api/entries?id=${id}`, { method: 'DELETE' });
      loadEntries();
    } catch (error) {
      console.error('Error deleting:', error);
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
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="sticky top-0 bg-white pb-6 mb-8 border-b">

        <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What happened?"
            className="w-full mb-4 p-2 border rounded focus:ring-2 focus:ring-black focus:outline-none min-h-[100px] resize-y"
            required
          />
        <div className="flex gap-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 border rounded focus:ring-2 focus:ring-black focus:outline-none"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="p-2 border rounded focus:ring-2 focus:ring-black focus:outline-none"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
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
          className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:outline-none"
        />
      </div>

      <div className="space-y-8">
        {Object.entries(filteredEntries)
          .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
          .map(([date, dayEntries]) => (
            <div key={date} className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-700">{formatDate(date)}</h2>
              {dayEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 border rounded-lg hover:border-gray-400 transition-colors flex justify-between items-center group ml-4"
                >
                  <div className="flex-1 mr-4">
                    {editingId === entry.id ? (
                      <div className="flex gap-4 items-start">
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
                          className="p-2 border rounded w-24"
                        />
                        <input
                          type="text"
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
                          className="flex-1 p-2 border rounded"
                        />
                      </div>
                    ) : (
                      <>
                        <span className="font-mono text-gray-600">{entry.entry_time.substring(0, 5)}</span>
                        <p className="mt-1 text-gray-800 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: marked(entry.description) }}></p>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center"
                    >
                      {editingId === entry.id ? '✓' : '✎'}
                    </button>
                    <button
                      onClick={() => editingId === entry.id ? setEditingId(null) : deleteEntry(entry.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center"
                    >
                      {editingId === entry.id ? 'x' : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default DiaryEntry;