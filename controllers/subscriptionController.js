
const { paramsSchema, subscriptionSchema } = require('../helpers/schema');
const  Subscription  = require('../models/SubscriptionModel'); 
const User = require('../models/Usermodel');



const createSubscription = async (req, res) => {

    const { error } = subscriptionSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    
    const {  name, limitCount, price } = req.body; 

    try {

        let data
    data = await Subscription.findOne({ where: { name:req.body.name } });
    if(data){
     return res.status(400).json({success: false, error: 'Subscription already exists.' });
     }
         data = await Subscription.create({
      
            name,
            limitCount,
            price,
        });

        res.status(201).json({ message: 'Subscription created successfully', subscription: data});
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ message: 'Error creating subscription', error });
    }
};

const updateSubscription = async (req, res) => {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const { id } = req.params; 
    const {  name, limitCount, price, } = req.body; 

    try {
        const subscription = await Subscription.findByPk(Number(id));

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

       
        
        subscription.name = name || subscription.name;
        subscription.limitCount = limitCount || subscription.limitCount;
        subscription.price = price || subscription.price;
   
        await subscription.save(); 

        res.status(200).json({ message: 'Subscription updated successfully', subscription });
    } catch (error) {
        console.error('Error updating subscription:', error);
        res.status(500).json({ message: 'Error updating subscription', error });
    }
};


const deleteSubscription = async (req, res) => {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const { id } = req.params; 

    try {
        
       if(Number(id) ==1){
        return res.status(403).json({success: false, message: 'You can not delete this subscription, try to update' });
      }

        const subscription = await Subscription.findByPk(Number(id));

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        await subscription.destroy(); 

        res.status(200).json({ message: 'Subscription deleted successfully' });
    } catch (error) {
        console.error('Error deleting subscription:', error);
        res.status(500).json({ message: 'Error deleting subscription', error });
    }
};


const fetchSubscriptions = async (req, res) => {
    try {
        const {count,rows: subscriptions} = await Subscription.findAndCountAll();
        
        res.status(200).json({success: true,count, subscriptions});
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ message: 'Error fetching subscriptions', error });
    }
};

const fetchSubscriptionOrders = async (req, res) => {
    try {
      const subscriptionOrders = await SubscriptionOrder.findAll({
        include: [
          {
            model: Subscription,
            attributes: ['name'], // Fetch only the subscription name
          },
        ],
        order: [['createdAt', 'DESC']], // Order by creation date
      });
  
      res.status(200).json({
        success: true,
        message: 'Subscription orders retrieved successfully.',
        data: subscriptionOrders,
      });
    } catch (error) {
      console.error('Error fetching subscription orders:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while fetching subscription orders.',
      });
    }
  };
  

const fetchSubscriptionById = async (req, res) => {
    const { error } = paramsSchema.validate(req.params);

    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const { id } = req.params; 

    try {
        const subscription = await Subscription.findByPk(Number(id));

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        res.status(200).json(subscription);
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({ message: 'Error fetching subscription', error });
    }
};

const fetchmySubscription = async (req, res) => {
   // console.log('abc');
    const id =  req.user.id;
    try {
       const user = await User.findOne({
           where: {id},
           attributes: ['id','fname','lname','imageFilePath','email',],
           include: [
            { model: Subscription, as: 'subscription',
              
             }
        ]

       });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }  

        res.status(200).json({success: true, user});
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({ message: 'Error fetching subscription', error });
    }
};


module.exports = {
    createSubscription,
    updateSubscription,
    deleteSubscription,
    fetchSubscriptions,
    fetchSubscriptionById,
    fetchmySubscription,
    fetchSubscriptionOrders
};