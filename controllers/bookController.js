const Book = require("../models/BookModel");
const Audio = require("../models/AudioModel");
const User = require("../models/Usermodel");
const Category = require("../models/CategoryModel");
const Review = require("../models/ReviewModel");
const Order = require("../models/OrderModel");
const { Op } = require("sequelize");
const Joi = require("joi");
const fs = require("fs").promises;
const path = require("path");
const { Sequelize } = require("sequelize");

const {
  paramsSchema,
  dayBetweenSchema,
  statusParamsSchema,
  bookFilterQuerySchema,
  bookCreationSchema,
  audioSchema,
  audioIDSchema,
} = require("../helpers/schema");
const Following = require("../models/FollowingModel");
const Level = require("../models/LevelModel");
const { createBookNotification } = require("../utils/notificationService");

const getBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      where: { status: "APPROVED" }, // Correctly specify the condition
    });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const findBookyById = async (req, res) => {
  try {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const data = await Book.findByPk(Number(req.params.id));
    if (!data) {
      return res.json({ success: false, error: "No book found" });
    }
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
/*
      
        if (req.files) {
            const imagesData = req.files.map(file => ({ url: file.path }));
            await book.createImages(imagesData); 
        }

 
});
*/

const fetchAllAuthorBooksExcept = async (req, res) => {
  const { error } = paramsSchema.validate(req.params);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const authorId = req.params.id;

  try {
    const books = await Book.findAll({
      where: {
        author_id: { [Op.ne]: Number(authorId) }, // Use Op.ne for "not equal"
      },
      include: [
        {
          model: User,
          attributes: ["id", "fname", "lname", "imageFilePath", "postCount"],
          as: "bookAuthor",
        },
        {
          model: Category,
          as: "category",
        },
      ],
    });

    if (!books || books.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No books found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Books fetched successfully", books });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching books",
      error: error.message,
    });
  }
};

const addBook = async (req, res) => {
  const userId =req.user.id;
  try {
      const { 
          title, 
          audio_price,
          description, 
          author, 
          publicationYear, 
          language, 
          price, 
          pages ,
          category_id,
      } = req.body;

      // Extract file paths from Multer
      const pdfFilePath = req.files.pdfFilePath
          ? req.files.pdfFilePath[0].path
          : null; // This will handle PDF, DOC, DOCX, EPUB files
      const imageFilePath = req.files.imageFilePath
          ? req.files.imageFilePath[0].path
          : null;

      // Create a new book entry
      const bookExists = await Book.findOne({
        where: { title, author_id: userId },
      });
      console.log("Book query result:", bookExists);
  
      if (bookExists) {
        return res.status(400).json({
          success: false,
          message: "Book already exists for this title and user.",
        });
      }
      const book = await Book.create({
          title,
          audio_price,
                 description,
          author,
          publicationYear,
          language,
          price,
          pages,
          pdfFilePath, // Store PDF, DOC, DOCX, EPUB file path in this field
          imageFilePath,
          category_id,
          author_id: userId,
      });

      // Insert audio files into the Audio model
      if (req.files?.audio) {
          const audioFiles = req.files.audio;

          // Create an array of promises to save each audio file
          const audioPromises = audioFiles.map(async (audioFile) => {
              return await Audio.create({
                  url: audioFile?.path,
                  episode: audioFile?.originalname.split('.')[0], // Episode name
                  book_id: book.id, // Link to the created book
              });
          });

          // Wait for all audio files to be saved
          await Promise.all(audioPromises);
      }

      res.status(201).json({ success: true, message: 'Book added successfully', book });
  } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to add book', details: error.message });
  }
};

const updateBook = async (req, res) => {
  const { error } = paramsSchema.validate(req.params);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const bookId = Number(req.params.id);
  const {
    title,
    author,
    price,
    pages,
    description,
    publicationYear,
    language,
  } = req.body;

  try {
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    book.title = title !== undefined ? title : book.title;
    book.author = author !== undefined ? author : book.author;
    book.price = price !== undefined ? price : book.price;
    book.pages = pages !== undefined ? pages : book.pages;
    book.description =
      description !== undefined ? description : book.description;
    book.publicationYear =
      publicationYear !== undefined ? publicationYear : book.publicationYear;
    book.language = language !== undefined ? language : book.language;

    await book.save();
    return res
      .status(200)
      .json({ success: true, message: "Book updated successfully", book });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Error updating book", error });
  }
};

const deleteBook = async (req, res) => {
  const { error } = paramsSchema.validate(req.params);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const bookId = Number(req.params.id);

  try {
    let book = await Book.findByPk(bookId);

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    const pdfFilePath = path.join(__dirname, "..", book.pdfFilePath);
    const imageFilePath = path.join(__dirname, "..", book.imageFilePath);

    try {
      await fs.access(pdfFilePath);
      await fs.unlink(pdfFilePath);
      console.log(`Deleted PDF file: ${pdfFilePath}`);
    } catch (err) {
      console.error(`Error handling PDF file: ${err.message}`);
    }

    try {
      await fs.access(imageFilePath);
      await fs.unlink(imageFilePath);
      console.log(`Deleted image file: ${imageFilePath}`);
    } catch (err) {
      console.error(`Error handling image file: ${err.message}`);
    }

    const audios = await Audio.findAll({ where: { book_id: bookId } });
    if (audios.length > 0) {
      for (let audio of audios) {
        const audioFilePath = path.join(__dirname, "..", audio.url);
        try {
          await fs.access(audioFilePath);
          await fs.unlink(audioFilePath);
          console.log(`Deleted audio file: ${audioFilePath}`);
        } catch (err) {
          console.error(`Error handling audio file: ${err.message}`);
        }
        await audio.destroy();
        console.log(`Deleted audio record with ID: ${audio.id}`);
      }
    }

    await book.destroy();

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting book:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error deleting book",
      error: error.message,
    });
  }
};

const bodySchema = Joi.object({
  last7days: Joi.boolean().optional(),
  body_category: Joi.string().optional(),
});

const fetchApprovedBookWithFiltersFromUser = async (req, res) => {
  const { error: queryError } = bookFilterQuerySchema.validate(req.query);

  if (queryError) {
    return res
      .status(400)
      .json({ success: false, message: queryError.details[0].message });
  }

  const { error: bodyError } = bodySchema.validate(req.body);

  if (bodyError) {
    return res
      .status(400)
      .json({ success: false, message: bodyError.details[0].message });
  }

  const {
    page = 1,
    size = 10,
    title,
    author,
    category,
    sortBy,
    publicationYear,
    language,
    minPrice,
    maxPrice,
  } = req.query;
  const { last7days, body_category } = req.body;
  try {
    const limit = parseInt(size);
    const offset = (parseInt(page) - 1) * limit;

    let whereCondition = {
      status: "APPROVED",
    };
    if (isNaN(limit) || isNaN(offset)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid pagination parameters." });
    }

    if (title) {
      whereCondition.title = { [Op.like]: `%${title}%` };
    }

    if (author) {
      whereCondition.author = { [Op.like]: `%${author}%` };
    }

    if (body_category) {
      whereCondition.category = body_category;
    }
    if (publicationYear) {
      whereCondition.publicationYear = publicationYear; // Publication year filter
    }

    if (language) {
      whereCondition.language = { [Op.like]: `%${language}%` }; // Language filter
    }

    if (last7days === true) {
      const lastWeekDate = new Date();
      lastWeekDate.setDate(lastWeekDate.getDate() - 7);
      whereCondition.createdAt = { [Op.gte]: lastWeekDate };
    }
    if (minPrice && maxPrice) {
      if (parseFloat(minPrice) > parseFloat(maxPrice)) {
        return res.status(400).json({
          success: false,
          message: "Minimum price cannot be greater than maximum price.",
        });
      }
      whereCondition.price = {
        [Op.between]: [parseFloat(minPrice), parseFloat(maxPrice)],
      };
    } else if (minPrice) {
      whereCondition.price = {
        [Op.gte]: parseFloat(minPrice),
      };
    } else if (maxPrice) {
      whereCondition.price = {
        [Op.lte]: parseFloat(maxPrice),
      };
    }

    let order;
    if (sortBy === "ratingAsc") {
      order = [["rating", "ASC"]];
    } else if (sortBy === "ratingDesc") {
      order = [["rating", "DESC"]];
    } else if (sortBy === "rateCountAsc") {
      order = [["rateCount", "ASC"]];
    } else if (sortBy === "rateCountDesc") {
      order = [["rateCount", "DESC"]];
    }
    if (sortBy === "mostSold") {
      order = [["sold", "DESC"]];
    } else if (sortBy === "leastSold") {
      order = [["sold", "ASC"]];
    } else if (sortBy === "priceAsc") {
      order = [["price", "ASC"]];
    } else if (sortBy === "priceDesc") {
      order = [["price", "DESC"]];
    } else {
      order = [["createdAt", "DESC"]];
    }

    const { count, rows } = await Book.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          attributes: ["id", "fname", "lname", "imageFilePath", "postCount"],
          as: "bookAuthor",
        },
        {
          model: Category,
          as: "category",
          where: body_category
            ? { name: body_category }
            : category
            ? { name: { [Op.like]: `%${category}%` } }
            : {},
        },
      ],
      attributes: {
        exclude: [
          "serviceCharges",
          "revenue",
          "pdfFilePath",
          "status",
          "reason",
          "reviewedBy",
        ],
      },
      limit,
      offset,
      order,
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      totalItems: count,
      books: rows,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching books", error: error.message });
  }
};

const fetchLoggedInAuthorBooks = async (req, res) => {
  const authorId = req.user.id;

  try {
    const books = await Book.findAll({
      where: { author_id: authorId, status: "APPROVED" },
      include: [
        {
          model: Category,
          as: "category",
        },
      ],
    });
    if (!books) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Book fetched successfully", books });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ success: true, message: error.message });
  }
};

const fetchAllAuthorBooksFromAdmin = async (req, res) => {
  const { error } = paramsSchema.validate(req.params);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const authorId = req.params.id;

  try {
    const books = await Book.findAll({
      where: { author_id: Number(authorId) },
      include: [
        {
          model: User,
          attributes: ["id", "fname", "lname", "imageFilePath", "postCount"],
          as: "bookAuthor",
        },
        {
          model: Category,
          as: "category",
        },
      ],
    });
    if (!books) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Book fetched successfully", books });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({
      success: true,
      mess: "Error fetching books",
      message: error.message,
    });
  }
};

const fetchAllAuthorApprovedBooksForUser = async (req, res) => {
  const { error } = paramsSchema.validate(req.params);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  const authorId = req.params.id;

  try {
    const books = await Book.findAll({
      where: { author_id: Number(authorId), status: "APPROVED" },
      include: [
        {
          model: User,
          attributes: ["id", "fname", "lname", "imageFilePath", "postCount"],
          as: "bookAuthor",
        },
        {
          model: Category,
          as: "category",
        },
      ],
      attributes: {
        exclude: [
          "serviceCharges",
          "revenue",
          "pdfFilePath",
          "status",
          "reason",
          "reviewedBy",
        ],
      },
    });
    if (!books) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Book fetched successfully", books });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ success: true, message: error.message });
  }
};

const fetchBooksByStatus = async (req, res) => {
  try {
    const { error } = statusParamsSchema.validate(req.params);

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { status } = req.params;
    const books = await Book.findAll({
      where: { status },
      include: [
        {
          model: User,
          as: "bookAuthor",
          attributes: [
            "id",
            "fname",
            "lname",
            "imageFilePath",
            "postCount",
            "point",
            "bio",
          ],
        },
      ],
    });

    if (!books.length) {
      return res.status(404).json({
        success: false,
        message: "No books found with the specified status.",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Book fetched successfully", books });
  } catch (error) {
    console.error("Error fetching books by status:", error);
    res.status(500).json({ message: error.message });
  }
};

const fetchLoggedInAuthorBooksByStatus = async (req, res) => {
  try {
    const { error } = statusParamsSchema.validate(req.params);

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    const { status } = req.params;
    const authorId = req.user.id;

    const books = await Book.findAll({
      where: { status, author_id: authorId },
    });

    if (!books) {
      return res
        .status(404)
        .json({ message: "No books found with the specified status." });
    }

    res.status(200).json({ books });
  } catch (error) {
    console.error("Error fetching books by status:", error);
    res.status(500).json({ message: error.message });
  }
};

const fetchLoggedInAuthorBooksById = async (req, res) => {
  const { error } = paramsSchema.validate(req.params);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { id } = req.params;
  const authorId = req.user.id;

  try {
    const book = await Book.findOne({
      where: { id: Number(id), author_id: authorId },
    });

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Book fetched successfully", book });
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({ message: error.message });
  }
};

const fetchAudioForBook = async (req, res) => {
  const { error } = paramsSchema.validate(req.params);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { id } = req.params;

  try {
    const audioFiles = await Audio.findAll({
      where: { book_id: id },
      include: [
        {
          model: Book,
          as: "audioBook",
          attributes: [
            "title",
            "description",
            "author",
            "publicationYear",
            "language",
          ],
        },
      ],
    });
    if (!audioFiles) {
      return res
        .status(404)
        .json({ success: false, message: "Book does not has audio file" });
    }

    res.status(200).json({
      success: true,
      message: "Book audio fetched successfully",
      audioFiles,
    });
  } catch (error) {
    console.error("Error fetching audio files:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const fetchAllAudio = async (req, res) => {
  try {
    // Fetch books with all associated audios
    const booksWithAudios = await Book.findAll({
      attributes: [
        "id",
        "title",
        "description",
        "author",
        "author_id",
        "publicationYear",
        "language",
        "audio_price",
        "price",
        "rating",
        "rateCount",
        "serviceCharges",
        "revenue",
        "pages",
        "sold",
        "pdfFilePath",
        "imageFilePath",
        "status",
        "reason",
        "reviewedBy",
      ],
      include: [
        {
          model: Audio,
          as: "audio",
          attributes: ["id", "episode", "url", "createdAt", "updatedAt"],
        },
      ],
    });

    // Format the response to include the audio count
    const result = booksWithAudios.map((book) => ({
      id: book.id,
      title: book.title,
      description: book.description,
      author: book.author,
      author_id: book.author_id,
      publicationYear: book.publicationYear,
      language: book.language,
      audio_price: book.audio_price,
      price: book.price,
      rating: book.rating,
      rateCount: book.rateCount,
      serviceCharges: book.serviceCharges,
      revenue: book.revenue,
      pages: book.pages,
      sold: book.sold,
      imageFilePath: book.imageFilePath,
      pdfFilePath: book.pdfFilePath,
      reviewedBy: book.reviewedBy,
      audioCount: book.audio ? book.audio.length : 0, // Count the associated audio files
      audios: book.audio.map((audio) => ({
        id: audio.id,
        episode: audio.episode,
        url: audio.url,
      })),
    }));

    // Return the books with all audios and their counts
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching books with audios:");
    res.status(500).json({ success: false, message: error.message });
  }
};

const findAudioyById = async (req, res) => {
  try {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const data = await Audio.findByPk(Number(req.params.id));
    if (!data) {
      return res.json({ success: false, error: "No audio found" });
    }
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const fetchAllAudioForbookloggedAuthor = async (req, res) => {
  const { error } = paramsSchema.validate(req.params);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { id: authorId } = req.user;
  const { id: book_id } = req.params;

  try {
    const book = await Book.findOne({
      where: { author_id: authorId, id: book_id },
      include: [{ model: Audio, as: "audio" }],
    });
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book does not has audio file" });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error("Error fetching audio files:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteAudioByID = async (req, res) => {
  const { error } = audioIDSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { audio_id } = req.body;

  if (!audio_id) {
    return res
      .status(400)
      .json({ message: "audio_id is required in the request body." });
  }

  try {
    const audio = await Audio.findOne({ where: { id: Number(audio_id) } });
    if (!audio) {
      return res.status(404).json({ message: "Audio not found" });
    }

    const audioPath = path.join(__dirname, "..", audio.url);

    try {
      await fs.access(audioPath); // Check if the file exists
      await fs.unlink(audioPath); // Delete the file
      console.log(`Deleted audio file: ${audioPath}`);
    } catch (err) {
      console.error(`Error handling audio file: ${err.message}`);
    }

    await Audio.destroy({ where: { id: audio_id } });

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting audio", error });
  }
};

const fetchBooksToday = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const booksToday = await Book.findAll({
      where: { createdAt: { [Op.gte]: startOfDay }, status: "APPROVED" },
      attributes: {
        exclude: [
          "serviceCharges",
          "revenue",
          "pdfFilePath",
          "status",
          "reason",
          "reviewedBy",
        ],
      },
    });
    if (!booksToday) {
      return res
        .status(404)
        .json({ success: false, message: "book posted today not found" });
    }

    res.status(200).json({ success: true, books: booksToday });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

const fetchBooksLast7Days = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const booksLast7Days = await Book.findAll({
      where: {
        createdAt: { [Op.gte]: sevenDaysAgo },
        status: "APPROVED",
      },
      attributes: {
        exclude: [
          "serviceCharges",
          "revenue",
          "pdfFilePath",
          "status",
          "reason",
          "reviewedBy",
        ],
      },
    });

    if (!booksLast7Days || booksLast7Days.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No books posted within the last 7 days",
      });
    }

    res.status(200).json({ success: true, books: booksLast7Days });
  } catch (error) {
    console.error("Error fetching books from the last 7 days:", error);
    res.status(500).json({ message: error.message });
  }
};

const fetchMostSoldBooks = async (req, res) => {
  try {
    //console.log('fetching most sold books');

    const mostSoldBooks = await Book.findAll({
      where: {
        status: "APPROVED",
      },

      attributes: {
        exclude: [
          "serviceCharges",
          "revenue",
          "pdfFilePath",
          "status",
          "reason",
          "reviewedBy",
        ],
      },
      limit: 10,
      order: [["sold", "DESC"]],
    });

    if (!mostSoldBooks) {
      return res
        .status(404)
        .json({ success: false, message: "no most sold book found currently" });
    }
    res.status(200).json({ success: true, books: mostSoldBooks });
  } catch (error) {
    console.error("Error fetching most sold books:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const fetchTopRatedBooks = async (req, res) => {
  try {
    const topRatedBooks = await Book.findAll({
      where: {
        status: "APPROVED",
      },
      attributes: {
        exclude: [
          "serviceCharges",
          "revenue",
          "pdfFilePath",
          "status",
          "reason",
          "reviewedBy",
        ],
      },
      limit: 10,
      order: [
        ["rating", "DESC"],
        ["rateCount", "DESC"],
      ],
    });

    if (!topRatedBooks) {
      return res
        .status(404)
        .json({ success: false, message: "no top rated book found " });
    }
    res.json({ success: true, books: topRatedBooks });
  } catch (error) {
    console.error("Error fetching top rated books:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const fetchBooksCreatedBetween = async (req, res) => {
  const { error } = dayBetweenSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { startDate, endDate } = req.body;

  try {
    const booksCreatedBetween = await Book.findAll({
      where: {
        status: "APPROVED",
        createdAt: {
          [Op.between]: [
            new Date(startDate),
            new Date(endDate).setHours(23, 59, 59, 999),
          ],
        },
      },
      attributes: {
        exclude: [
          "serviceCharges",
          "revenue",
          "pdfFilePath",
          "status",
          "reason",
          "reviewedBy",
        ],
      },
    });

    if (!booksCreatedBetween) {
      return res
        .status(404)
        .json({ success: false, message: "no book found " });
    }
    res.json({ success: true, books: booksCreatedBetween });
  } catch (error) {
    console.error("Error fetching books created between dates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const fetchMostReviewedBooks = async (req, res) => {
  try {
    const mostReviewedBooks = await Book.findAll({
      where: {
        status: "APPROVED",
      },
      attributes: {
        exclude: [
          "serviceCharges",
          "revenue",
          "pdfFilePath",
          "status",
          "reason",
          "reviewedBy",
        ],
      },
      limit: 10,
      order: [["rateCount", "DESC"]],
    });

    if (!mostReviewedBooks) {
      return res
        .status(404)
        .json({ success: false, message: "no book found " });
    }
    res.json({ success: true, books: mostReviewedBooks });
  } catch (error) {
    console.error("Error fetching most reviewed books:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const defaultRecommendations = async () => {
  return await Book.findAll({
    attributes: {
      exclude: [
        "serviceCharges",
        "revenue",
        "pdfFilePath",
        "status",
        "reason",
        "reviewedBy",
      ],
    },
    limit: 5,
    order: [["rating", "DESC"]],
  });
};

const getRecommendationsForUser = async (req, res) => {
  const userId = req.user.id;
  try {
    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [{ model: Book, as: "orderBook" }],
    });

    if (orders.length === 0) {
      const defaultBooks = await defaultRecommendations();
      return res
        .status(200)
        .json({ success: true, recommendations: defaultBooks });
    }

    //const bookIds = orders.map(order => order.book_id);

    const recommendedBooks = await Book.findAll({
      where: { id: { [Op.not]: orders.book_id } },
      include: [
        {
          model: Category,
          as: "category",
          where: { id: 2 },
          required: true,
        },
      ],
      attributes: {
        exclude: [
          "serviceCharges",
          "revenue",
          "pdfFilePath",
          "status",
          "reason",
          "reviewedBy",
        ],
      },
      limit: 10,
      order: [["sold", "DESC"]],
    });

    res.status(200).json({ success: true, recommendations: recommendedBooks });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ message: "Error fetching recommendations" });
  }
};

const searchBooksWithRecommendations = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user is authenticated and their ID is available
    const { query } = req.query; // The search query for the book name

    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: "Search query is required." });
    }

    // Step 1: Fetch user's previous orders with status APPROVED
    const approvedOrders = await Order.findAll({
      where: {
        user_id: userId,
        status: "APPROVED",
      },
    });

    // Step 2: Get book IDs from these orders
    const orderedBookIds = approvedOrders.map((order) => order.bookId); // Assuming `bookId` exists in Order

    // Step 3: Fetch books associated with those IDs
    const previouslyOrderedBooks = await Book.findAll({
      where: { id: orderedBookIds },
    });

    // Step 4: Search for books by name and recommend similar ones
    const matchingBooks = await Book.findAll({
      where: {
        title: { [Op.like]: `%${query}%` }, // Search by book title
        status: "APPROVED", // Only include approved books
      },
    });

    // Step 5: Recommend books similar to previously ordered books
    const recommendedBooks = await Book.findAll({
      where: {
        id: { [Op.notIn]: orderedBookIds }, // Exclude already ordered books
        [Op.or]: previouslyOrderedBooks.map((book) => ({
          author: book.author, // Match by author
          language: book.language, // Match by language
        })),
      },
      limit: 10, // Limit recommendations
    });

    res.status(200).json({
      success: true,
      matchingBooks,
      recommendedBooks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBookStatusAndCharge = async (req, res) => {
  try {
    console.log(req);
    const { error } = paramsSchema.validate(req.params);

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { error: bodyError } = statusParamsSchema.validate(req.body);

    if (bodyError) {
      return res
        .status(400)
        .json({ success: false, message: bodyError.details[0].message });
    }

    const { status } = req.body;
    const { id } = req.params;
    const adminName = req.user.fname;
    const book = await Book.findOne({ where: { id: Number(id) } });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (book.status === "APPROVED") {
      return res.status(400).json({ message: "Book already approved" });
    }

    book.status = status;

    await book.save();
    if (status === "APPROVED") {
      const tempPoint = 100;
      const user = await User.findByPk(book.author_id);
      user.postCount++;
      user.postLimitCount++;

      if (parseInt(user.point) < 9) {
        user.point = parseInt(user.point) + tempPoint;
        await user.save();
        //console.log(user.point, 'hhhhh')
      } //point
      if (parseInt(user.point) >= 10) {
        const nextLevel = parseInt(user.level_id) + 1;
        const level = await Level.findByPk(nextLevel);
        if (level) {
          user.level_id = level.id;
          user.point = 0;
          await user.save();
        } else {
          user.point = parseInt(user.point) + tempPoint;
          await user.save();
        }
      }
      await user.save();
      const followers = await Following.findAll({
        where: { followed_id: book.author_id },
        include: [
          {
            model: User,
            as: "followerUser",
            attributes: ["id", "fname", "lname", "imageFilePath", "email"],
          },
        ],
      });

      if (followers?.length > 0) {
        const notificationPromises = followers.map(async (follower) => {
          if (follower?.follower_id) {
            return await createBookNotification(
              {
                title: `New Book from ${user.fname} ${user.lname}`,
                description: `${user.fname} ${user.lname} just published a new book: "${book.title}" (${book.price})`,
              },
              follower.follower_id
            );
          }
        });

        await Promise.all(notificationPromises);
      }
    } //end of my if approved

    res.status(200).json({
      message:
        "Book status updated successfully and notification sent to author and followers",
      book,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating book", error });
  }
};

const approveBook = async (req, res) => {
  try {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { id } = req.params;
    const { reason } = req.body;
    const adminName = req.user.fname;

    const book = await Book.findOne({ where: { id: Number(id) } });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found or already approved",
      });
    }
    if (book.status === "APPROVED") {
      return res
        .status(400)
        .json({ success: false, message: "Book already approved" });
    }

    book.status = "APPROVED";
    book.reason = reason || "No reason provided";
    await book.save();

    const user = await User.findByPk(book.author_id);
    user.postCount++;
    user.postLimitCount++;
    await user.save();

    await createBookNotification(
      {
        title: `Book Approval: ${book.title}`,
        description: `hey, ${user?.fname}, ${
          adminName ? adminName : "Admin"
        } has approved your book named ${book?.title} published by ${
          book?.author
        }.`,
      },
      book.author_id
    );

    const followers = await Following.findAll({
      where: { followed_id: book.author_id },
      include: [
        {
          model: User,
          as: "followerUser",
          attributes: ["id", "fname", "lname", "imageFilePath", "email"],
        },
      ],
    });

    if (followers?.length > 0) {
      const authorsFollowers = followers.map(async (follower) => {
        if (follower?.follower_id) {
          return await createBookNotification(
            {
              title: `New Book from ${user.fname} ${user.lname}`,
              description: `Your following author ${user?.fname} ${user?.lname} posted a book named ${book.title} published by ${book.author} with price ${book.price} `,
            },
            follower?.follower_id
          );
        } //end of my if null
      });

      await Promise.all(authorsFollowers);
    }

    res.status(200).json({
      success: true,
      message:
        "Book status updated to approved and notification sent to author and followers",
      book,
    });
  } catch (error) {
    console.error("Error updating book status:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const rejectBook = async (req, res) => {
  try {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    const { id } = req.params;
    const { reason } = req.body;

    const book = await Book.findByPk(id);

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    book.status = "REJECTED";
    book.reason = reason || "No reason provided";
    await book.save();
    await createBookNotification(
      {
        title: `Book Rejection: ${book.title}`,
        description: `Your book named ${book.title} published by ${book.author} has been rejected.beacuse of ${reason}`,
      },
      book.author_id
    );

    res.status(200).json({
      success: true,
      message: "Book status updated to approved",
      book,
    });
  } catch (error) {
    console.error("Error updating book status:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const fetchAllLoggedInAuthorBook = async (req, res) => {
  const authorId = req.user.id;

  try {
    const book = await Book.findAll({
      where: { author_id: authorId },

      include: [
        {
          model: Category,
          as: "category",
        },
      ],
    });

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "you have no books" });
    }

    res.status(200).json({
      success: true,
      message: "Books fetched successfully",
      books: book,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const addAudioForBook = async (req, res) => {
  const { error } = paramsSchema.validate(req.params);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { error: bodyError } = audioSchema.validate(req.body);

  if (bodyError) {
    return res
      .status(400)
      .json({ success: false, message: bodyError.details[0].message });
  }

  const { episode } = req.body;

  const bookId = Number(req.params.id);
  try {
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (!req.file.path) {
      return res
        .status(400)
        .json({ success: false, error: "Audio does not exists." });
    }

    let audio;
    audio = await Audio.findOne({
      where: { book_id: book.id, episode },
    });

    if (audio) {
      return res
        .status(400)
        .json({ message: "Audio already exists for this epsoide and book." });
    }

    audio = await Audio.create({
      url: req.file.path,
      episode,
      book_id: bookId,
    });

    return res
      .status(200)
      .json({ success: true, message: "Audio uploaded successfully", audio });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  deleteAudioByID,
  addAudioForBook,
  fetchAllAudioForbookloggedAuthor,
  findAudioyById,
  fetchAllAudio,
  fetchAudioForBook,
  fetchAllLoggedInAuthorBook,
  approveBook,
  rejectBook,
  getRecommendationsForUser,
  fetchMostSoldBooks,
  fetchAllAuthorBooksFromAdmin,
  fetchAllAuthorApprovedBooksForUser,
  fetchMostReviewedBooks,
  fetchTopRatedBooks,
  fetchBooksCreatedBetween,
  fetchBooksToday,
  fetchBooksLast7Days,
  addBook,
  updateBookStatusAndCharge,
  getBooks,
  findBookyById,
  updateBook,
  deleteBook,
  fetchApprovedBookWithFiltersFromUser,
  fetchLoggedInAuthorBooksByStatus,
  fetchLoggedInAuthorBooks,
  fetchBooksByStatus,
  fetchLoggedInAuthorBooksById,
  fetchAllAuthorBooksExcept,
  searchBooksWithRecommendations,
};
