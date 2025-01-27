export const SearchBar = ({ searchQuery, setSearchQuery }) => (
  <div className="mb-6">
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search entries..."
      className="w-full p-2 border dark:border-gray-700 rounded focus:ring-2 focus:ring-black dark:focus:ring-gray-300 focus:outline-none dark:bg-gray-800 dark:text-gray-100"
    />
  </div>
);