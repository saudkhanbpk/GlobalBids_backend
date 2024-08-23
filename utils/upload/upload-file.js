import { v4 as uuid } from "uuid";
import { bucket } from "../../config/firebase.config.js";

export const uploadFileToTheFireStorage = async (file) => {
  const filename = `${uuid()}-${file.name}`;
  const uploadedFile = await bucket.file(filename).save(file.data);
  return uploadedFile
};
