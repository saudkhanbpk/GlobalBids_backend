export const validateBidFields = (data) => {
  const errors = {};

  if (!data?.amount) {
    errors.amount = "Amount is required";
  } else if (isNaN(data.amount)) {
    errors.amount = "Amount must be a number";
  }

  if (!data?.ownerId) {
    errors.ownerId = "Owner ID is required";
  } else if (!isValidObjectId(data.ownerId)) {
    errors.ownerId = "Owner ID is invalid";
  }

  if (!data?.contractorId) {
    errors.contractorId = "Contractor ID is required";
  } else if (!isValidObjectId(data.contractorId)) {
    errors.contractorId = "Contractor ID is invalid";
  }

  if (!data?.jobId) {
    errors.jobId = "Job ID is required";
  } else if (!isValidObjectId(data.jobId)) {
    errors.jobId = "Job ID is invalid";
  }

  if (!data?.bidBreakdown) {
    errors.bidBreakdown = "Bid breakdown is required";
  } else if (typeof data.bidBreakdown !== "string") {
    errors.bidBreakdown = "Bid breakdown must be a string";
  }

  if (!data?.jobTitle) {
    errors.jobTitle = "Job title is required";
  } else if (typeof data.jobTitle !== "string") {
    errors.jobTitle = "Job title must be a string";
  }

  if (!Array.isArray(data?.stages) || data.stages.length === 0) {
    errors.stages = "Stages must be an array with at least one stage";
  } else {
    data.stages.forEach((stage, index) => {
      if (!stage?.name) {
        errors[`stages[${index}].name`] = "Stage name is required";
      } else if (typeof stage.name !== "string") {
        errors[`stages[${index}].name`] = "Stage name must be a string";
      }

      if (!stage?.description) {
        errors[`stages[${index}].description`] =
          "Stage description is required";
      } else if (typeof stage.description !== "string") {
        errors[`stages[${index}].description`] =
          "Stage description must be a string";
      }

      if (!stage?.estimatedCompletion) {
        errors[`stages[${index}].estimatedCompletion`] =
          "Estimated completion date is required";
      } else if (isNaN(Date.parse(stage.estimatedCompletion))) {
        errors[`stages[${index}].estimatedCompletion`] =
          "Estimated completion must be a valid date";
      }
    });
  }

  if (!data?.comment) {
    errors.comment = "Comments you must provide an comment";
  }

  if (data?.attachments && !Array.isArray(data.attachments)) {
    errors.attachments = "Attachments must be an array";
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};
