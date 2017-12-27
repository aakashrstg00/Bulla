const express = require('express');
var router = express.Router();
// GET routes
router.get('/', (req, res) => {
    if(req.session.username){
        res.redirect('/users/feed');
    }
    else{
        res.render('index', {
            type: "login"
        });
    }
});
// POST routes
// export
module.exports = router;