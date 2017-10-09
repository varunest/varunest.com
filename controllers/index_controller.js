'use strict';

let express = require('express');
let router = express.Router();

router.get('/', function (req, res) {
    res.render('index');
});

router.use(function (req, res, next) {
    res.status(404);
    res.render('error_404');
});

module.exports = router;