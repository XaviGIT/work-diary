const defaultOptions = {
  headers: {
    "Content-Type": "application/json",
  },
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error ${response.status}`);
  }

  // Return null for 204 No Content responses
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const api = {
  getEntriesByMonth: async (month) => {
    try {
      const response = await fetch(
        `/api/entries?month=${month}`,
        defaultOptions
      );
      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching entries:", error);
      throw error;
    }
  },

  addEntry: async (entry) => {
    try {
      const response = await fetch("/api/entries", {
        ...defaultOptions,
        method: "POST",
        body: JSON.stringify(entry),
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Error adding entry:", error);
      throw error;
    }
  },

  updateEntry: async (id, data) => {
    try {
      const response = await fetch(`/api/entries?id=${id}`, {
        ...defaultOptions,
        method: "PUT",
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Error updating entry:", error);
      throw error;
    }
  },

  deleteEntry: async (id) => {
    try {
      const response = await fetch(`/api/entries?id=${id}`, {
        ...defaultOptions,
        method: "DELETE",
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Error deleting entry:", error);
      throw error;
    }
  },
};
