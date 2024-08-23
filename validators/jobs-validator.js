import moment from "moment";

export function validateJobData(data) {
  const errors = {};

  if (
    !data.title ||
    typeof data.title !== "string" ||
    data.title.trim() === ""
  ) {
    errors.title = "Title is required. ";
  }

  if (
    !data.location ||
    typeof data.location !== "string" ||
    data.location.trim() === ""
  ) {
    errors.location = "Location is required.";
  }

  if (!data.deadLine || !moment(data.deadLine, "DD-MM-YYYY", true).isValid()) {
    errors.deadLine =
      "DeadLine is required. and must be a valid date in DD-MM-YYYY format.";
  }

  if (
    !data.estimateCost ||
    typeof data.estimateCost !== "string" ||
    data.estimateCost.trim() === ""
  ) {
    errors.estimateCost = "EstimateCost is required.";
  }

  if (
    !data.description ||
    typeof data.description !== "string" ||
    data.description.trim() === ""
  ) {
    errors.description = "Description is required. ";
  }

  return errors;
}
