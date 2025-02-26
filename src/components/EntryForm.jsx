import { LoadingButton } from './LoadingComponent';

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

  return (
    <form onSubmit={onSubmit} className="sticky top-0 bg-white dark:bg-gray-900 pb-6 mb-8 border-b dark:border-gray-700">
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onPaste={handlePaste}
        placeholder="What happened?"
        className='w-full mb-4 p-2 border dark:border-gray-700 rounded focus:ring-2 focus:ring-black dark:focus:ring-gray-300 focus:outline-none min-h-[100px] resize-y dark:bg-gray-800 dark:text-gray-100'
        disabled={isSubmitting}
        required
      />
      <div className="flex gap-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 border dark:border-gray-700 rounded focus:ring-2 focus:ring-black dark:focus:ring-gray-300 focus:outline-none dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
          disabled={isSubmitting}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="p-2 border dark:border-gray-700 rounded focus:ring-2 focus:ring-black dark:focus:ring-gray-300 focus:outline-none dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
          disabled={isSubmitting}
          required
        />
        <LoadingButton
          type="submit"
          isLoading={isSubmitting}
          loadingText="Adding..."
        >
          Add
        </LoadingButton>
      </div>
    </form>
  );
};