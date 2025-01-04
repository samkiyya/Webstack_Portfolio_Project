const { categorySchema, paramsSchema } = require('../helpers/schema');
const Category  = require('../models/CategoryModel');

const findCategory = async (req, res) => {
  try {
    const data = await Category.findAll();
    if (!data || data.length <1 ) {
      return res.status(400).json({ success: false,error: "No category found" });
    }
    return res.json({success: true, data });
  } catch (err) {
    return res.status(500).json({success: false, error: err.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { error } = categorySchema.validate(req.body);

  if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
  }


    let data
    data = await Category.findOne({ where: { name:req.body.name } });
    if(data){
     return res.status(400).json({success: false, error: 'Category already exists.' });
     }
     data = await Category.create({
      name: req.body.name,
    });
    if (!data) {
      return res.json({ error: "Category not created" });
    }
    return res.json({ success: true, message: 'Created', data });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ success: false,error: err.message });
  }
};

const findCategoryById = async (req, res) => {
  try {
    const { error } = paramsSchema.validate(req.params);

  if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
  }

    const data = await Category.findByPk(Number(req.params.id));
    if (!data) {
      return res.json({success: false, error: "No category found" });
    }
    return res.json({success: true, data });
  } catch (err) {
    return res.status(500).json({success: false, error: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { error } = paramsSchema.validate(req.params);

  if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
  }

    const data = await Category.destroy({
      where: {
        id: Number(req.params.id),
      },
    });
    if (data === 0) {
      return res.json({success: false, error: "No category found" });
    }
    return res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({success: false, error: err.message });
  }
};

const updateCategory = async (req, res) => {
  const { error: paramsError } = paramsSchema.validate(req.params);
    
  if (paramsError) {
      return res.status(400).json({ success: false, message: paramsError.details[0].message });
  }

  const { error: bodyError } = categorySchema.validate(req.body);
  
  if (bodyError) {
      return res.status(400).json({ success: false, message: bodyError.details[0].message });
  }

  const categoryId = Number(req.params.id);
  const { name,  } = req.body;

  try {
      const category = await Category.findByPk(categoryId);
      if (!category) {
          return res.status(404).json({ success: false, message: 'Category not found' });
      }

      category.name = name !== undefined ? title : category.name;
    

      await category.save();
      return res.status(200).json({success: true, message: 'Category updated successfully', category });
  } catch (error) {
      console.error(error);
      return res.status(500).json({success: false, message: 'Error updating category', error });
  }
};
const getMostSoldCategory = async (req, res) => {
  try {
    
    const results = await Order.findAll({
      attributes: [
        'bookId',
        [sequelize.fn('COUNT', sequelize.col('bookId')), 'totalSold'],
      ],
      include: [{
        model: Book,
        attributes: [],
        include: [{
          model: Category,
          attributes: ['id', 'name'], 
        }],
      }],
      group: ['Book.categoryId', 'Category.id'], 
      order: [[sequelize.fn('COUNT', sequelize.col('bookId')), 'DESC']], 
      limit: 1, 
    });

    if (!results.length) {
      return res.status(404).json({ message: 'No orders found.' });
    }

   
    const mostSoldCategory = {
      categoryId: results[0].Category.id,
      categoryName: results[0].Category.name,
      totalSold: parseInt(results[0].get('totalSold')),
    };

    res.json(mostSoldCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error .' });
  }
};


module.exports = {
  findCategory,
  createCategory,
  findCategoryById,
  deleteCategory,
  updateCategory,
  getMostSoldCategory,
};