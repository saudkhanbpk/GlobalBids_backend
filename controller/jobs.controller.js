import cloudinary from "../config/cloudinary.config.js";
import {
  FileUploadError,
  InternalServerError,
  ValidationError,
} from "../error/AppError.js";
import { validateJobData } from "../validators/jobs-validator.js";
import JobModel from "../model/job.model.js";



export const createJobController = async (req, res, next) => {
  
  const file = req.file;
  const user = req.user;
  const { status, ...rest } = req.body;
  const validate = validateJobData(rest);
  if (Object.keys(validate).length > 0) {
    return next(
      new ValidationError(`validation fail: ${JSON.stringify(validate)}`)
    );
  }
  try {
    const jobData = {
      postedBy: user?._id,
      ...rest,
    };

    let secureUrl = "";
    if (file) {
      await cloudinary.uploader.upload(file.path, async (err, result) => {
        if (err) {
          return next(FileUploadError("can't upload image"));
        }
        secureUrl = result.secure_url;
      });
    }

    if (secureUrl) {
      jobData.fileUrl = secureUrl;
    }

    const newJob = new JobModel(jobData);

    const savedJob = await newJob.save();
    return res
      .status(200)
      .json({ success: true, message: "job created!", job: savedJob });
  } catch (error) {
    return next(new InternalServerError());
  }
};
