const multer = require('multer');
const sharp = require('sharp');

const storage = multer.memoryStorage();

const upload = multer({ storage: storage }).single('image');

function generateFileName(originalName) {
  const cleanedName = originalName.replace(/[^a-zA-Z0-9]/g, '_');
  return `${cleanedName}_${Date.now()}`;
}

module.exports = (operation) => {
  return (req, res, next) => {
      upload(req, res, async (err) => {
          if (err) {
              return res.status(400).json({ error: err.message });
          }

          if (!req.file) {
              if (operation === 'create') {
                  return res.status(400).json({ error: 'Aucune image n\'a été envoyée' });
              }
              return next();
          }

          // Redimensionnement de l'image et enregistrement dans le dossier 'images'
          try {
              const resizedImageBuffer = await sharp(req.file.buffer)
                  .resize(({
                      width: 375,
                      height: 568,
                      fit: 'inside' 
                  }))
                  .webp({ quality: 80 }) 
                  .toBuffer()

              const originalFileName = req.file.originalname;
              const imageName = generateFileName(originalFileName) + '.webp'; 
              const imagePath = 'images/' + imageName;

              require('fs').writeFileSync(imagePath, resizedImageBuffer);

              req.imagePath = imagePath; 
              next();
          } catch (error) {
              return res.status(500).json({ error: 'Erreur lors du redimensionnement de l\'image' });
          }
      });
  }
};
