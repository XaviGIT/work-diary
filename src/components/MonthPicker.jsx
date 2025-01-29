import { Calendar } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';

export const MonthPicker = ({ selectedMonth, onMonthChange }) => {
  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2">
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow"
            aria-label="Select month"
          >
            <Calendar className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl"
            sideOffset={5}
          >
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="p-2 border dark:border-gray-700 rounded focus:ring-2 focus:ring-black dark:focus:ring-gray-300 focus:outline-none dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
            />
            <Popover.Arrow className="fill-white dark:fill-gray-800" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
};