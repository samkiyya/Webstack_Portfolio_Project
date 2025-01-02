
const multer = require('multer');
const path = require('path');

//for pdf image
const bookFileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/books');
  },
  filename: (req, file, cb) => {
   console.log(file, 'multer1')
    cb(null, `${file.originalname.split('.')[0]}-${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const bookFileUpload = multer({
  storage : bookFileStorage,
  limits: {fileSize: 25 * 1024 * 1024},
  fileFilter :(req, file, cb)=>{
  let fileTypes
  let text
  if (file.fieldname === "pdfImage") {
    
    fileTypes = /jpeg|png|jpg|gif/;
    text = "jpeg, jpg, png and gif "
} else if (file.fieldname === "pdf") {
    
    fileTypes = /pdf/;
    text = "pdf "  ;
} else if (file.fieldname === "audio") {
    fileTypes = /mpeg|mp3|wav|ogg/;
    text = "mp3, wav, ogg"  ; 
   }
//console.log(file.mimetype)
   const mimeType =  fileTypes.test(file.mimetype)
   const extName=  fileTypes.test(path.extname(file.originalname))
  if(mimeType && extName){
  return cb(null, true)
  }
   cb(`Only  ${text} files are allowed`,)
  }

})

// user image
const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/users');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.body?.fname}-userImage-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const userUpload = multer({
  storage : userStorage,
  limits: {fileSize: 10 * 1024 * 1024},
  fileFilter :(req, file, cb)=>{
    const fileTypes = /jpeg|png|PNG|JPG|JPEG|jpg|gif/
    const mimeType =  fileTypes.test(file.mimetype)
    const extName=  fileTypes.test(path.extname(file.originalname))
   if(mimeType && extName){
  return cb(null, true)
  }
   cb('Only jpeg, jpg, png, gif files are allowed', false)
  }

})





const orderStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/orders');
  },
  filename: (req, file, cb) => {
    cb(null, `receiptImage-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const storeOrderImage = multer({
  storage : orderStorage,
  limits: {fileSize: 10 * 1024 * 1024},
  fileFilter :(req, file, cb)=>{
   const fileTypes = /jpeg|png|PNG|JPG|JPEG|jpg|gif/
   const mimeType =  fileTypes.test(file.mimetype)
   const extName=  fileTypes.test(path.extname(file.originalname))
  if(mimeType && extName){
  return cb(null, true)
  }
   cb('Only jpeg, jpg, png, gif files are allowed', false)
  }

})


const promoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/promo');
  },
  filename: (req, file, cb) => {
    cb(null, `promoImage-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const promoImage = multer({
  storage : promoStorage,
  limits: {fileSize: 10 * 1024 * 1024},
  fileFilter :(req, file, cb)=>{
   const fileTypes = /jpeg|png|PNG|JPG|JPEG|jpg|gif/
   const mimeType =  fileTypes.test(file.mimetype)
   const extName=  fileTypes.test(path.extname(file.originalname))
  if(mimeType && extName){
  return cb(null, true)
  }
   cb('Only jpeg, jpg, png, gif files are allowed', false)
  }

})


module.exports = {
  userUpload,
  bookFileUpload,
  storeOrderImage,
  promoImage,
 
  
}


