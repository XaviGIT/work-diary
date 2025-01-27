export const EntryEditor = ({ entry, onUpdate }) => (
  <div className="flex flex-col gap-4">
    <div className="flex gap-4">
      <input
        type="time"
        value={entry.entry_time.substring(0, 5)}
        onChange={(e) => onUpdate({ ...entry, entry_time: e.target.value })}
        className="p-2 border dark:border-gray-700 rounded w-24 dark:bg-gray-800 dark:text-gray-100"
      />
    </div>
    <textarea
      value={entry.description}
      onChange={(e) => onUpdate({ ...entry, description: e.target.value })}
      className="flex-1 p-2 border dark:border-gray-700 rounded dark:bg-gray-800 dark:text-gray-100 min-h-[100px] resize-y w-full"
    />
  </div>
);