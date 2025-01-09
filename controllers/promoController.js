const { promotionSchema, paramsSchema } = require('../helpers/schema');
const Promotion  = require('../models/PromotionModel');
const fs = require('fs').promises;;
const path = require('path');

const createPromotion = async (req, res) => {
    try {
        const { error } = promotionSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const {title,discription,url} = req.body;

        if(!req.files?.path){
            return res.status(400).json({success: false, message:'image is required' });
              }
        
        const newPromotion = await Promotion.create({title,discription,url, imagePath:req.files.path});

        res.status(201).json({ success: true, message: 'Promotion created successfully', newPromotion});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllPromotions = async (req, res) => {

    try {
        const promotions = await Promotion.findAll();
        if (!promotions) {
           return res.status(404).json({ message: 'Promotions not found' }); 
        }
        res.status(200).json({ success: true, promotions});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPromotionById = async (req, res) => {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    
     
    const { id } = req.params;
    try {
        const promotion = await Promotion.findByPk(id);
        if (!promotion) {
            return res.status(404).json({ message: 'Promotion not found' });
        }
        res.status(200).json(promotion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updatePromotion = async (req, res) => {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    
    const { id } = req.params;
    const {title,discription,url} = req.body;
    try {
        let updated
        updated= await Promotion.findOne( {
            where: { id : Number(id) },
        });
        if (!updated) {
            return res.status(404).json({ message: 'Promotion not found' });
        }
     
        updated.title =  title !== undefined ? title : updated.title;
        updated.discription = discription !== undefined ? discription : updated.discription;
        updated.url =  url !== undefined ? url : updated.url;


        await updated.save();

        res.status(200).json({ message: 'Promotion updated successfully', promotion: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deletePromotion = async (req, res) => {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    
    const { id } = req.params;
    try {

        let promo = await Promotion.findByPk(id);

        if (!promo) {
            return res.status(404).json({ success: false, message: 'Promotion not found' });
        }       
        const imagePath = path.join(__dirname, '..', promo.imagePath);
       
        if(promo.imagePath){
             try {
                await fs.access(imagePath); 
                await fs.unlink(imagePath); 
           console.log(`Deleted promotion image file: ${imagePath}`);
             } catch (err) {
           console.error(`Error handling image file: ${err.message}`);
                 }
                }
     

        const deleted = await Promotion.destroy({
            where: { id },
        });
        if (!deleted) {
            return res.status(404).json({ message: 'Promotion not found' });
        }
        res.status(204).json({ message: 'Promotion deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    createPromotion,
    getAllPromotions,
    getPromotionById,
    updatePromotion,
    deletePromotion,
};