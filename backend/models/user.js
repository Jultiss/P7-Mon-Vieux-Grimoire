const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); // package qui permet de s'assurer que deux utilisateurs ne peuvent pas utiliser la même adresse mail

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true }, // unique: true empêche plusieurs utilisateurs de s'inscrire avec la même adresse mail
    password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator); // applique le validateur au schéma avant d'en faire un modèle
module.exports = mongoose.model('User', userSchema);