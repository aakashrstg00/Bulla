var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
// mongoose connect
mongoose.connect('mongodb://localhost:27017/bulla');

var db = mongoose.connection;
var Schema = mongoose.Schema;
var userSchema = new Schema({
    Username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    Name: {
        type: String,
        required: true,
        trim: true
    },
    Email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    DOB: {
        type: String,
        required: true,
        trim: true
    },
    Password: {
        type: String,
        required: true
    },
    Posts: {
        type: Array
    }
});
var User = module.exports = mongoose.model('users', userSchema);

// FUNCTIONS
module.exports.createUser = (newUser, callback) => {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.Password, salt, (err, hash) => {
            newUser.Password = hash;
            newUser.save(callback);
        });
    });
}

module.exports.getUserById = (id, callback) => {
    User.findById(id, callback);
}

module.exports.getUserByUsername = (username, callback) => {
    User.findOne({
        Username: username
    }, callback);
}

module.exports.comparePassword = (candidatePassword, hash, callback) => {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) {
            throw err;
        }
        callback(null, isMatch);
        // console.log('[model] isMatch :',isMatch);
    });
}