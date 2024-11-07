export const validateBidFields = (data) => {
  const errors = {};

  if (!data?.bidAmount?.trim()) {
    errors.bidAmount = "Bid amount is required";
  }

  if (!data?.estimatedTimeLine?.trim()) {
    errors.estimatedTimeline = "Estimated timeline is required";
  }

  if (!data?.scopeOfWork?.trim()) {
    errors.scopeOfWork = "Scope of work is required";
  }

  if (!data?.projectMilestones?.trim()) {
    errors.projectMilestones = "Project milestones are required";
  }

  if (!data?.termsConditions?.trim()) {
    errors.termsConditions = "Terms and conditions are required";
  }

  if (!data?.additionalNotes?.trim()) {
    errors.additionalNotes = "Additional notes are required";
  }

  if (!data?.homeowner?.trim()) {
    errors.homeowner = "Owner ID is required";
  }

  if (!data?.contractor?.trim()) {
    errors.contractor = "Contractor ID is required";
  }

  if (!data?.job?.trim()) {
    errors.job = "Job ID is required";
  }

  if (!data?.jobTitle?.trim()) {
    errors.jobTitle = "Job title is required";
  }

  return Object.keys(errors).length > 0 ? errors : null;
};
