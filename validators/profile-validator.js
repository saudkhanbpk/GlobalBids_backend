export function validateOwnerProfile(data) {
  const errors = {}; 

  if (!data.userId) {
    errors.userId = "User ID is required";
  }

  if (data?.languages?.length === 0) {
    errors.languages = "At least one language is required";
  }

  if (!data.description || data.description.trim() === "") {
    errors.description = "Description is required";
  }

  if (!data.firstName || data.firstName.trim() === "") {
    errors.firstName = "First name is required";
  }

  if (!data.lastName || data.lastName.trim() === "") {
    errors.lastName = "Last name is required";
  }

  if (!data.address || data.address.trim() === "") {
    errors.address = "Address is required";
  }

  if (!data.cityName || data.cityName.trim() === "") {
    errors.cityName = "City name is required";
  }

  if (!data.country || data.country.trim() === "") {
    errors.country = "Country is required";
  }

  if (!data.zipCode || data.zipCode.trim() === "") {
    errors.zipCode = "Zip code is required";
  }

  if (!data.phone || data.phone.trim() === "") {
    errors.phone = "Phone number is required";
  }

  return errors;
}

export function validateContractorProfile(data) {
  const errors = {};
  if (!data.userId) {
    errors.userId = "User ID is required";
  }

  if (!data.workTitle || data.workTitle.trim() === "") {
    errors.workTitle = "Work title is required";
  }

  if (!data.experience || data.experience.trim() === "") {
    errors.experience = "Experience is required";
  }

  if (!data.education || data.education.trim() === "") {
    errors.education = "Education is required";
  }

  if (data?.languages?.length === 0) {
    errors.languages = "At least one language is required";
  }

  if (data?.skills?.length === 0) {
    errors.skills = "At least one skill is required";
  }

  if (!data.description || data.description.trim() === "") {
    errors.description = "Description is required";
  }

  if (!data.hourlyRate || data.hourlyRate.trim() === "") {
    errors.hourlyRate = "Hourly rate is required";
  }

  if (!data.firstName || data.firstName.trim() === "") {
    errors.firstName = "First name is required";
  }

  if (!data.lastName || data.lastName.trim() === "") {
    errors.lastName = "Last name is required";
  }

  if (!data.address || data.address.trim() === "") {
    errors.address = "Address is required";
  }

  if (!data.cityName || data.cityName.trim() === "") {
    errors.cityName = "City name is required";
  }

  if (!data.country || data.country.trim() === "") {
    errors.country = "Country is required";
  }

  if (!data.zipCode || data.zipCode.trim() === "") {
    errors.zipCode = "Zip code is required";
  }

  if (!data.phone || data.phone.trim() === "") {
    errors.phone = "Phone number is required";
  }

  return errors;
}
