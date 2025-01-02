const express = require("express");
const { addBook, findBookyById, getBooks, fetchApprovedBookWithFiltersFromUser, deleteBook, updateBook, getRecommendationsForUser, fetchMostSoldBooks, fetchAllAuthorBooksFromAdmin, fetchAllAuthorApprovedBooksForUser, fetchMostReviewedBooks, fetchTopRatedBooks, fetchBooksCreatedBetween,
     fetchBooksToday, fetchBooksLast7Days, fetchLoggedInAuthorBooksByStatus, fetchBooksByStatus,
      fetchLoggedInAuthorBooksById, 
      updateBookStatusAndCharge,
      approveBook,
      rejectBook,
      fetchAllLoggedInAuthorBook,
      addAudioForBook,
      findAudioyById,
      fetchAllAudioForbookloggedAuthor,
      fetchAllAudio,
      fetchAudioForBook,
      deleteAudioByID,
      fetchAllAuthorBooksExcept,
      searchBooksWithRecommendations,
      fetchLoggedInAuthorBooks} = require("../controllers/bookController");
const {  bookFileUpload } = require("../middlewares/imageupload");
const { verifyUser,verifyUserOrAdmin, verifyAdmin } = require("../middlewares/auth");
const { isAuthor, isAuthorOfTheBook } = require("../middlewares/author");
const checkSubscriptionLimit = require("../middlewares/subscription");
const { isPaidForBook, } = require("../middlewares/payment");
const upload = require("../middlewares/bookUpload");
//const { checkDuplicateBook } = require("../middlewares/duplicateChecker");


const router = express.Router()

//fetchOrdersWithUsersForBook


router.post(
      '/create',
      upload.fields([
          { name: 'pdfFilePath', maxCount: 1 },
          { name: 'imageFilePath', maxCount: 1 },
          { name: 'audio', maxCount: 5 }, // Multiple audio files allowed
      ]),
      verifyUserOrAdmin,
     addBook
  );


router.get('/get-all',  getBooks);
router.get('/filter',verifyUser, fetchApprovedBookWithFiltersFromUser);
router.get('/find/:id',findBookyById);
router.delete('/delete/:id', verifyUser,isAuthorOfTheBook,deleteBook );
router.get('/most-sold', fetchMostSoldBooks);
router.get('/by-authors-id/:id',verifyAdmin, fetchAllAuthorBooksFromAdmin);
router.get('/all-book-except/:id',fetchAllAuthorBooksExcept);
router.get('/approved-by-author-id/:id',fetchAllAuthorApprovedBooksForUser );
router.get('/most-reviewed',fetchMostReviewedBooks    );
router.get('/top-rated', fetchTopRatedBooks);
router.get('/between',fetchBooksCreatedBetween );
router.get('/today',fetchBooksToday);
router.get('/last7days',fetchBooksLast7Days);
router.get('/logged-author-bystatus/:status',verifyUser,fetchLoggedInAuthorBooksByStatus);
router.get('/by-status/:status',verifyAdmin,fetchBooksByStatus);
router.get('/logged-author/:id', verifyUser,isAuthorOfTheBook,fetchLoggedInAuthorBooksById);
router.get('/recommendations', getRecommendationsForUser); // i will check this
router.get('/search-recommendations',verifyUser, searchBooksWithRecommendations); // i will check this
router.put('/update-status/:id',verifyAdmin,  updateBookStatusAndCharge); 
router.put('/approve/:id',verifyAdmin, approveBook); 
router.put('/reject/:id',verifyAdmin, rejectBook); 
router.get('/allbooks-logged-author',verifyUser, fetchAllLoggedInAuthorBook); 
router.get('/all-approved-books-logged-author',verifyUser, fetchLoggedInAuthorBooks); 

router.get('/audio/:id',verifyAdmin, findAudioyById); 
router.get('/audio-for-logged-author/:id',verifyUser,isAuthorOfTheBook, fetchAllAudioForbookloggedAuthor);
router.get('/audio', fetchAllAudio);
router.delete('/delete-audio/:id',verifyUser,isAuthorOfTheBook, deleteAudioByID);
router.get('/audio-for-who-paid/:id',verifyUser,isPaidForBook, fetchAudioForBook);
router.post('/upload-audio/:id',verifyUser,isAuthorOfTheBook,bookFileUpload.single("audio"), addAudioForBook); 
router.put('/update-book/:id',     verifyUserOrAdmin,updateBook);

module.exports = router
