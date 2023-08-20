const Book = require('../models/books');
const fs = require('fs');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

exports.getBooks = (req, res, next) => {
    Book.find()
        .then((books) => {
            res.status(200).json(books);
        })
        .catch((error) => {
            res.status(400).json({
                error: error
            });
        });
};

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject.userId;
  
    const book = new Book({
      ...bookObject,
      imageUrl: `${req.protocol}://${req.get('host')}/${req.imagePath}`, // Utilisation de req.imagePath
      userId: req.auth.userId,
    });
  
    book.save()
      .then(() => res.status(201).json({ message: 'Book saved successfully!' }))
      .catch(error => res.status(400).json({ error }));
  };
  
exports.getOneBook = (req, res, next) => {
    Book.findOne({
        _id: req.params.id
    }).then(
        (book) => {
            res.status(200).json(book);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ?
    {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body};

    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId !== req.auth.userId) {
                res.status(403).json({message: 'Unauthorized request!'});
            } else {
                Book.updateOne({_id: req.params.id}, {...bookObject, _id: req.params.id})
                .then(() => res.status(200).json({message: 'Book updated successfully!'}))
                .catch(error => res.status(400).json({error}));
            }
        })
        .catch(error => res.status(400).json({error}));
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
        .then(book => {
            if (book.userId !== req.auth.userId) {
                res.status(403).json({message: 'Unauthorized request!'});
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: req.params.id})
                        .then(() => res.status(200).json({message: 'Book deleted successfully!'}))
                        .catch(error => res.status(400).json({error}));
                });
            }
        })
        .catch(error => res.status(500).json({error}));
};

exports.addRating = (req, res, next) => {
    const { bookId, userId, grade } = req.body; 

    Book.findById(bookId)
        .then(book => {
            if (!book) {
                return res.status(404).json({ message: "Livre non trouvé" });
            }

            book.ratings.push({ userId, grade });

            const totalRatings = book.ratings.length;
            const totalGrade = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
            const averageRating = totalGrade / totalRatings;

            book.averageRating = averageRating;

            return book.save();
        })
        .then(() => res.status(200).json({ message: "Notation ajoutée avec succès" }))
        .catch(error => res.status(500).json({ error }));
};

    



