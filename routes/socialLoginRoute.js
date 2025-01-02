const express = require("express")
const passport = require('passport');
const router = express.Router()




router.get('/google', passport.authenticate('google', { scope: ['profile','email' ] }));

router.get('/social/faied', (req, res) => {
    res.status(401).json({ success: false,error: 'failed to authenticate' });
});

router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/social/faied', 
        session: false    
       
     }), 
    (req, res) => {
        try {
            

           
            if (!req.user.token) {
                return res.status(500).json({ success: false, message: 'Authentication failed, no token received.' });
            }
            const { user, token } = req.user; 
          
    
            // res.status(200).cookie('userToken',token,{ httpOnly: true , sameSite : 'None'}).json({ userToken:token, userData: {id: user.id, fname: user.fname, lname:user.lname , role: user.role,provider:user.provider, image: user.imageFilePath}});
            // Encode user data as a JSON string
            const userData = {
                id: user.id,
                fname: user.fname,
                lname: user.lname,
                role: user.role,
                provider: user.provider,
                image: user.imageFilePath
            };
            const userDataEncoded = encodeURIComponent(JSON.stringify(userData));
            
const frontendUrl = process.env.FRONTEND_URL || "samuel://open.my.firstapp.app";
            const redirectUrl = `${frontendUrl}/gcallback?token=${encodeURIComponent(token)}&userData=${userDataEncoded}`;
      res.redirect(redirectUrl);


        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false,message:'server error', error: error.message });
        }

       
    }
);



router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));


router.get('/facebook/callback', 
    passport.authenticate('facebook', { session: false }), 
    (req, res) => {
        const { user, token } = req.user; 

        // res.status(200).cookie('userToken',userToken,{ httpOnly: true , sameSite : 'None'}).json({ userToken:token });
        const frontendUrl = process.env.FRONTEND_URL || "samuel://open.my.firstapp.app/gcallback";
      const redirectUrl = `${frontendUrl}/auth/callback?token=${token}`;
      res.redirect(redirectUrl);
    }
);
module.exports = router
