const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const upload = require('../middleware/multer-config');

const bookCtrl = require('../controllers/book');

router.get('/', bookCtrl.getBooks);
router.get('/bestrating', bookCtrl.getBestRatedBooks);
router.get('/:id', bookCtrl.getOneBook);
router.post('/', auth, upload, bookCtrl.createBook);
router.post('/:id/rating', auth, bookCtrl.rateBook);
router.put('/:id', auth, upload, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);


module.exports = router;