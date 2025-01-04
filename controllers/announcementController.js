const fs = require("fs");
const path = require("path");
const Announcement = require("../models/announcmentModel");
const Comment = require("../models/commentModel");
const Like = require("../models/likeModel");
const { Sequelize } = require("sequelize");
const {
  createAnnouncementNotification,
} = require("../utils/notificationService");
const User = require("../models/Usermodel");
/** 
 * Helper function to delete files
 */
const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Error deleting file: ${filePath}`, err);
    } else {
      console.log(`File deleted: ${filePath}`);
    }
  });
};

/**
 * Create Announcement
 */

const createAnnouncement = async (req, res) => {
  try {
    const { title, content,link,creatorId } = req.body;
  
    const imagePath = req.files?.image?.[0]?.path || null;
    const videoPath = req.files?.video?.[0]?.path || null;

    const announcement = await Announcement.create({
      title,
      content,
      creatorId,
      link,
      image: imagePath,
      video: videoPath,
      status: "pending",
    });

    res.status(201).json({
      message: "Announcement created successfully",
      announcement,
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({
      error: "Failed to create announcement",
      details: error.message,
    });
  }
};


/**
 * Update Announcement
 */
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const announcement = await Announcement.findByPk(id);
    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    // Check if a new file is uploaded
    if (req.file) {
      // Delete old file
      if (announcement.filePath) {
        deleteFile(path.resolve(announcement.filePath));
      }

      // Update file path with the new file
      announcement.filePath = req.file.path;
    }

    // Update other fields
    announcement.title = title || announcement.title;
    announcement.content = content || announcement.content;

    await announcement.save();

    const allUsers = await User.findAll({
      attributes: ["id"], // Fetch only user IDs
    });
    console.log("All Users", allUsers); // Generate notifications for all users
    for (const user of allUsers) {
      console.log("User ID:", user.id);
      try {
        await createAnnouncementNotification(announcement, user.id);
      } catch (error) {
        console.error(
          `Failed to create notification for user ${user.id}:`,
          error.message
        );
      }
    }

    res
      .status(200)
      .json({ message: "Announcement updated successfully", announcement });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update announcement", details: error.message });
  }
};

/**
 * Delete Announcement
 */
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByPk(id);
    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    // Delete associated file
    if (announcement.filePath) {
      deleteFile(path.resolve(announcement.filePath));
    }

    // Delete associated comments and likes
    await Comment.destroy({ where: { announcementId: id } });
    await Like.destroy({ where: { announcementId: id } });

    // Delete the announcement itself
    await announcement.destroy();
    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete announcement", details: error.message });
  }
};

/**
 * Get All Announcements
 */

getApprovedAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
      where: {
        status: "approved", // Fetch only announcements with status = 'approved'
      },
      include: [
        {
          model: Like,
          attributes: [], // Exclude individual like details, we just want the count
        },
        {
          model: Comment,
          attributes: [], // Exclude individual comment details, we just want the count
        },
      ],
      attributes: {
        include: [
          [Sequelize.fn("COUNT", Sequelize.col("Likes.id")), "likesCount"], // Counting the number of likes
          [
            Sequelize.fn("COUNT", Sequelize.col("Comments.id")),
            "commentsCount",
          ], // Counting the number of comments
        ],
      },
      group: ["Announcement.id"], // Group by announcement ID to get accurate counts
    });

    res.status(200).json({
      message: "Announcements fetched successfully",
      data: announcements,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching announcements",
      error: error.message,
    });
  }
};

getMyAnnouncements = async (req, res) => {
  const { id: creatorId } = req.user;
  try {
    const announcements = await Announcement.findAll({
      where: {
        creatorId: creatorId, // Fetch only announcements with status = 'approved'
      },
      include: [
        {
          model: Like,
          attributes: [], // Exclude individual like details, we just want the count
        },
        {
          model: Comment,
          attributes: [], // Exclude individual comment details, we just want the count
        },
      ],
      attributes: {
        include: [
          [sequelize.fn("COUNT", sequelize.col("Likes.id")), "likesCount"], // Counting the number of likes
          [
            sequelize.fn("COUNT", sequelize.col("Comments.id")),
            "commentsCount",
          ], // Counting the number of comments
        ],
      },
      group: ["Announcement.id"], // Group by announcement ID to get accurate counts
    });

    res.status(200).json({
      message: "Announcements fetched successfully",
      data: announcements,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching announcements",
      error: error.message,
    });
  }
};
const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.findAll();
    res.status(200).json(announcements);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch announcements", details: error.message });
  }
};

/**
 * Add Like
 */
const toggleLike = async (req, res) => {
  try {
    const { announcementId } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!announcementId || !userId) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    const like = await Like.findOne({ where: { announcementId, userId } });

    if (like) {
      await like.destroy();
      return res.status(200).json({ wasLiked: true });
    }

    const newLike = await Like.create({ announcementId, userId });
    res.status(201).json({ wasLiked: false, like: newLike });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Failed to toggle like on announcement",
      details: error.message,
    });
  }
};



/**
 * Add Comment
 */
const addComment = async (req, res) => {
  try {
    const { announcementId, comment } = req.body;
    const userId = req.user.id;

    const newComment = await Comment.create({
      announcementId,
      userId,
      comment,
    });
    res
      .status(201)
      .json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to add comment", details: error.message });
  }
};

/**
 * Delete Comment
 */
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    await comment.destroy();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete comment", details: error.message });
  }
};

/**
 * Get Comments
 */
const getComments = async (req, res) => {
  try {
    const { announcementId } = req.params;

    const comments = await Comment.findAll({ where: { announcementId } });
    res.status(200).json(comments);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch comments", details: error.message });
  }
};

/**
 * Get Likes Count
 */
const getLikesCount = async (req, res) => {
  try {
    const { announcementId } = req.params;

    const likesCount = await Like.count({ where: { announcementId } });
    res.status(200).json({ likes: likesCount });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch likes count", details: error.message });
  }
};

module.exports = {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
  toggleLike,

  addComment,
  deleteComment,
  getComments,
  getLikesCount,
  getMyAnnouncements,
  getApprovedAnnouncements,
};
