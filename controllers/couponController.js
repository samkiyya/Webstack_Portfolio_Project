const  Book  = require('../models/BookModel'); 
const  Coupon  = require('../models/CouponModel'); 
async function createOrder(userId, bookId, couponCode) {
    try {
        const book = await Book.findByPk(bookId);
        
        if (!book) throw new Error('Book not found');

        let discount = 0;
        
        if (couponCode) {
            const coupon = await Coupon.findOne({ where: { code: couponCode } });
            
            if (!coupon) throw new Error('Invalid coupon code');

       
            if (new Date() > new Date(coupon.expirationDate)) throw new Error('Coupon has expired');

      
            if (coupon.couponCount >= coupon.usageLimit) throw new Error('Coupon usage limit reached');

           
            if (coupon.discountType === 'percentage') {
                discount = (book.price * coupon.discountValue) / 100;
            } else if (coupon.discountType === 'fixed') {
                discount = coupon.discountValue;
            }

        
            coupon.couponCount += 1;
            await coupon.save();
        }

        const finalPrice = book.price - discount;

      
        
        return { success: true, finalPrice };
        
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function createCoupon(code, discountType, discountValue, expirationDate, usageLimit) {
    try {
        const coupon = await Coupon.create({ code, discountType, discountValue, expirationDate, usageLimit });
        
        return { success: true, coupon };
        
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function deactivateCoupon(couponId) {
    try {
        const coupon = await Coupon.findByPk(couponId);
        
        if (!coupon) throw new Error('Coupon not found');

        await coupon.destroy();
        
        return { success: true, message: 'Coupon deactivated' };
        
    } catch (error) {
        return { success: false, message: error.message };
    }
}

module.exports = { createOrder, createCoupon, deactivateCoupon };