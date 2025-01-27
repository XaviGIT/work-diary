import { Moon, Sun } from 'lucide-react';

export const ThemeToggle = () => {
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