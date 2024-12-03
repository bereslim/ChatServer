import express from 'express';

const router = express.Router();

router.get('/', async function(req, res, next) {

    res.json({ "success" : true, "body": "Hello World" });
});

export default router;