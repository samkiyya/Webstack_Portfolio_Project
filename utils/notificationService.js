const Notification = require("../models/NotificationModel");
const { notificationSchema } = require("../helpers/schema");

const createNotification = async (data) => {
  try {
    const { error } = notificationSchema.validate(data);
    if (error) {
      throw new Error(error.details[0].message);
    }

    const notification = await Notification.create(data);
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

const createBookNotification = async (bookData, userId) => {
  console.log(`Creating notification for user ID: ${userId}`);
  if (!userId) {
    throw new Error("User ID is required for creating a notification.");
  }

  // Validate bookData structure
  if (!bookData.title || !bookData.description) {
    throw new Error("Invalid book data passed for notification.");
  }

  try {
    const notificationData = {
      title: bookData.title,
      body: bookData.description,
      type: "BOOK",
      user_id: userId,
    };

    return await createNotification(notificationData);
  } catch (error) {
    console.error("Error creating book notification:", error);
    throw error;
  }
};

const createAnnouncementNotification = async (announcement, userId) => {
  console.log(`Creating notification for user ID: ${userId}`); // Log userId to check its value

  try {
    const notificationData = {
      title: announcement.title,
      body: announcement.content,
      type: "ANNOUNCEMENT",
      user_id: userId,
    };

    return await createNotification(notificationData);
  } catch (error) {
    console.error("Error creating announcement notification:", error);
    throw error;
  }
};

module.exports = {
  createNotification,
  createBookNotification,
  createAnnouncementNotification,
};
