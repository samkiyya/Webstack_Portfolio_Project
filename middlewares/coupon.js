// middleware/checkCouponValidity.js
const { Coupon, Book } = require('../models'); // Adjust based on your project structure

const checkCouponValidity = async (req, res, next) => {
    const { bookId, couponCode } = req.body; // Assuming bookId and couponCode are sent in the request body

    try {
        const book = await Book.findByPk(bookId);
        
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        let discount = 0;

        if (couponCode) {
            const coupon = await Coupon.findOne({ where: { code: couponCode } });
            
            if (!coupon) {
                return res.status(400).json({ message: 'Invalid coupon code' });
            }

         
            if (new Date() > new Date(coupon.expirationDate)) {
                return res.status(400).json({ message: 'Coupon has expired' });
            }

        
            if (coupon.couponCount >= coupon.usageLimit) {
                return res.status(400).json({ message: 'Coupon usage limit reached' });
            }

            if (coupon.discountType === 'percentage') {
                discount = (book.price * coupon.discountValue) / 100;
            } else if (coupon.discountType === 'fixed') {
                discount = coupon.discountValue;
            }
se
            req.coupon = {
                discount,
                coupon,
            };
        }

        next();
        
    } catch (error) {
        console.error('Error checking coupon validity:', error);
        return res.status(500).json({ message: 'Error checking coupon validity', error });
    }
};

module.exports = checkCouponValidity;