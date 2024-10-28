export const removeEmptyFields = (obj) => {
  if (Array.isArray(obj)) {
    if (obj === null) {
    }
    return obj
      .map(removeEmptyFields)
      .filter((item) => item != null && item !== "");
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .map(([key, value]) => [key, removeEmptyFields(value)])
        .filter(([_, value]) => value != null && value !== "")
    );
  }
  return obj;
};
