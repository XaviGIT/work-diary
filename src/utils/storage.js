/**
 * Safe storage utilities that work even when localStorage is unavailable
 */

// In-memory fallback storage
const memoryStorage = new Map();

/**
 * Safely get a value from storage
 * @param {string} key - The storage key
 * @param {any} defaultValue - Default value if key not found
 * @returns {any} The stored value or default
 */
export const getStorageItem = (key, defaultValue = null) => {
  try {
    if (typeof localStorage !== "undefined") {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : defaultValue;
    }
  } catch (e) {
    console.warn("Error accessing localStorage:", e);
  }

  // Fallback to memory storage
  return memoryStorage.has(key) ? memoryStorage.get(key) : defaultValue;
};

/**
 * Safely set a value in storage
 * @param {string} key - The storage key
 * @param {any} value - Value to store
 */
export const setStorageItem = (key, value) => {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
      return;
    }
  } catch (e) {
    console.warn("Error accessing localStorage:", e);
  }

  // Fallback to memory storage
  memoryStorage.set(key, value);
};

/**
 * Safely remove a value from storage
 * @param {string} key - The storage key to remove
 */
export const removeStorageItem = (key) => {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
      return;
    }
  } catch (e) {
    console.warn("Error accessing localStorage:", e);
  }

  // Remove from memory storage
  memoryStorage.delete(key);
};
