import ContractorProfileModel from "../model/contractor.profile.model.js";

async function sendJobNotifications(job, notificationService) {
  try {
    const jobCategory = job.category;  

    const matchingContractors = await ContractorProfileModel.find({
      services: jobCategory,
    }).select("_id user");
    for (const contractor of matchingContractors) {      
      await notificationService.sendNotification({
        recipientId: contractor.user,
        recipientType: "Contractor",
        senderId: job.user,
        senderType: "Homeowner",
        message: `A new job in your service category (${jobCategory}) is available!`,
        type: "Job Notification",
        url: `/contractor/project-detail/${job._id}`,
      });
    }
  } catch (error) {
    console.error("Error in sending job notifications:", error);
  }
}

export default sendJobNotifications;
