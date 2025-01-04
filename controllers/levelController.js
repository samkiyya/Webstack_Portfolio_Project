const { categorySchema, paramsSchema } = require('../helpers/schema');
const Level = require('../models/LevelModel'); 
const User = require('../models/Usermodel');


const createLevel = async (req, res) => {
  try {
    const { error } = categorySchema.validate(req.body);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
  
    const { name } = req.body;

    let data
    data = await Level.findOne({ where: { name:req.body.name } });
    if(data){
     return res.status(400).json({success: false, error: 'Level already exists.' });
     }
      data = await Level.create({ name });
    res.status(201).json({success: true, message: 'Level created successfully', level: data});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const getAllLevels = async (req, res) => {
  try {
    const levels = await Level.findAll();
    res.status(200).json({success: true, levels});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getLevelById = async (req, res) => {
  const { error } = paramsSchema.validate(req.params);

  if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const { id } = req.params;
  try {
    const level = await Level.findByPk(id);
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }
    res.status(200).json({success: true, level});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const updateLevel = async (req, res) => {
  const { error } = paramsSchema.validate(req.params);

  if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
  }
  const { error: bodyError } = categorySchema.validate(req.body);

  if (bodyError) {
      return res.status(400).json({ success: false, message: bodyError.details[0].message });
  }


  const { id } = req.params;
  const { name } = req.body;
  try {
    let updated
     updated= await Level.findOne( { where: { id: Number(id) } });
    if (!updated) {
      return res.status(404).json({ message: 'Level not found' });
    }
    updated.name = name !== undefined ? name : updated.name;

    await updated.save();
    res.status(200).json({ message: 'Level updated successfully', level: updated});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const deleteLevel = async (req, res) => {
  const { error } = paramsSchema.validate(req.params);

  if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const { id } = req.params;
  try {

    if(Number(id) ==1){
      return res.status(403).json({success: false, message: 'You can not delete this level, try to update' });
    }
    const deleted = await Level.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({success: false, message: 'Level not found' });
    }
    res.status(204).json({success: true,message: 'Level deleted successfully'});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const levelWithUser = async (req, res) => {
  try{

  const user = await Level.findAll({

    include: [{
      model: User,
      as: 'userLevel',

    }],
  });
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  return res.status(200).json({ success: true, user });
}
catch (error) {
    return res.status(500).json({ error: error.message });
}
}
module.exports = {
  levelWithUser,
  createLevel,
  getAllLevels,
  getLevelById,
  updateLevel,
  deleteLevel,
};