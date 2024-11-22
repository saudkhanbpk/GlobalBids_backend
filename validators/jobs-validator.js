export const validateJobFields = (data) => {
  const errors = {};
  if (
    !data.title ||
    typeof data.title !== "string" ||
    data.title.trim() === ""
  ) {
    errors.title = "Title is required and must be a non-empty string.";
  }

  if (
    !data.description ||
    typeof data.description !== "string" ||
    data.description.trim() === ""
  ) {
    errors.description =
      "Description is required and must be a non-empty string.";
  }

  if (!data.budget) {
    errors.budget = "Budget is required.";
  }

  if (
    !data.category ||
    typeof data.category !== "string" ||
    data.category.trim() === ""
  ) {
    errors.category = "Category is required and must be a non-empty string.";
  }

  if (!["yes", "no"].includes(data.HOA)) {
    errors.HOA = "HOA must be either 'yes' or 'no'.";
  }

  return Object.keys(errors).length > 0 ? errors : null;
};
