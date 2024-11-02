export const removeEmptyFields = (obj) => {
  if (!obj) {
    return obj;
  }
  if (Array.isArray(obj)) {
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
