export const validateJobFields = (data) => {
  const errors = {};

  if (!data?.title) {
    errors.title = "Title is required";
  } else if (typeof data.title !== "string") {
    errors.title = "Title must be a string";
  } else if (data.title.trim().length === 0) {
    errors.title = "Title cannot be empty";
  } else if (data.title.length > 100) {
    errors.title = "Title cannot be more than 100 characters";
  }

  if (!data?.description) {
    errors.description = "Description is required";
  } else if (typeof data.description !== "string") {
    errors.description = "Description must be a string";
  } else if (data.description.trim().length === 0) {
    errors.description = "Description cannot be empty";
  } else if (data.description.length > 500) {
    errors.description = "Description cannot be more than 500 characters";
  }

  if (data.budget === undefined || data.budget === null) {
    errors.budget = "Budget is required";
  } else if (data.budget < 0) {
    errors.budget = "Budget cannot be negative";
  }

  if (!data?.location) {
    errors.location = "Location is required";
  } else if (typeof data.location !== "string") {
    errors.location = "Location must be a string";
  } else if (data.location.trim().length === 0) {
    errors.location = "Location cannot be empty";
  } else if (data.location.length > 200) {
    errors.location = "Location cannot be more than 200 characters";
  }

  if (!data?.category) {
    errors.category = "Category is required";
  } else if (typeof data.category !== "string") {
    errors.category = "Category must be a string";
  } else if (data.category.trim().length === 0) {
    errors.category = "Category cannot be empty";
  } else if (data.category.length > 100) {
    errors.category = "Category cannot be more than 100 characters";
  }

  return Object.keys(errors).length > 0 ? errors : null;
};
