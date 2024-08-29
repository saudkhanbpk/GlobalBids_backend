import moment from "moment";

export function validateJobData(data) {
  const errors = {};

  if (
    !data.title ||
    typeof data.title !== "string" ||
    data.title.trim() === ""
  ) {
    errors.title = "Title is required.";
  }

  if (
    !data.description ||
    typeof data.description !== "string" ||
    data.description.trim() === ""
  ) {
    errors.description = "Description is required.";
  }

  if (
    !data.startDate ||
    !moment(data.startDate, "YYYY-MM-DD", true).isValid()
  ) {
    errors.startDate =
      "Start Date is required and must be a valid date in YYYY-MM-DD format.";
  }

  if (!data.startTime || !moment(data.startTime, "HH:mm", true).isValid()) {
    errors.startTime =
      "Start Time is required and must be a valid time in HH:mm format.";
  }

  if (!data.endDate || !moment(data.endDate, "YYYY-MM-DD", true).isValid()) {
    errors.endDate =
      "End Date is required and must be a valid date in YYYY-MM-DD format.";
  }

  if (!data.endTime || !moment(data.endTime, "HH:mm", true).isValid()) {
    errors.endTime =
      "End Time is required and must be a valid time in HH:mm format.";
  }

  if (
    !data.estimateCost ||
    typeof data.estimateCost !== "string" ||
    data.estimateCost.trim() === ""
  ) {
    errors.estimateCost = "Estimate Cost is required.";
  }

  if (
    !data.location ||
    typeof data.location !== "string" ||
    data.location.trim() === ""
  ) {
    errors.location = "Location is required.";
  }

  return errors;
}
