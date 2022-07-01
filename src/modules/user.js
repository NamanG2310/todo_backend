const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require('bcryptjs');
const Todo = require('../modules/todo');
const jwt = require('jsonwebtoken');
//userschema defination
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },

    email: {
        type: String,
        require: true,
        unique: [true, "Email id already present"],
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email");
            }
        }
    },

    password: {
        type: String,
        require: true
    },

    confirmPassword: {
        type: String,
        require: true
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }]

},{
    timestamps: true
}
)
userSchema.virtual('todos', {
    ref: 'Todo',
    localField: '_id',
    foreignField: 'author',
})


userSchema.methods.generateAuthToken = async function (){
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() },process.env.JWT_SECRET,{});
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}

userSchema.methods.toJSON = function (){
    const user = this;
    const userObject = user.toObject();
    // delete userObject.password,
    // delete userObject.tokens;
    return userObject;
}

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
        this.confirmPassword = undefined;
    }
    next();
})

const User = new mongoose.model('User', userSchema);

module.exports = User;