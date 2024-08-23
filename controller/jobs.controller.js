import { uploadFileToTheFireStorage } from "../utils/upload/upload-file.js";

export const createJobController = async (req, res) => {
  const file = req.file;

  if (file) {
    const uploadedFile = await uploadFileToTheFireStorage(file);
  }

  console.log(uploadedFile);
  

  return res.status(200).json({ success: true, message: "job created!" });
};
