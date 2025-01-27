export const handleKeyDown = (e) => {
  if (isEditing) {
    if (e.key === "Escape") {
      onEdit(entry); // Cancel edit
      toast.error("Edit cancelled");
    } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onEdit(entry); // Save
      toast.success("Changes saved");
    }
  }
};
