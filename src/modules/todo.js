const mongoose = require("mongoose");


// const todo = await Todo.findbyId(_id);
// await todo.populate('author').execPopulate();
const todoSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true,
    },
    completed: {
        type: Boolean,
        required: false,
        default: false,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
},
    {
        timestamps: true
    }
);
todoSchema.index({ description: 'text' });

const Todo = mongoose.model('Todo', todoSchema)
module.exports = Todo;
