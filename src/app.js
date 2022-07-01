require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
require('./database/db');
const User = require("./modules/user");
const bcrypt = require('bcryptjs');
const Todo = require("./modules/todo");
const auth = require('./middleware/auth');


const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

//home page
app.get('/', (req, res) => {
    res.send('This is working');
})

//signin page
app.post('/signin', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userEmail = await User.findOne({ email: email });

        const isMatch = await bcrypt.compare(password, userEmail.password);
        const token = await userEmail.generateAuthToken();
        if (isMatch) {
            res.status(201).send({ token, userEmail })
        } else {
            res.status(404).send("Email/password is incorrect");
        }
    } catch (error) {
        res.status(404).send("Invalid Login details")
    }
})

//register page
app.post('/register', async (req, res) => {
    // console.log(req.body);
    try {
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;

        if (password === confirmPassword) {
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: password,
                confirmPassword: confirmPassword
            })
            //password hashing

            const register = await user.save();
            const token = await user.generateAuthToken();
            // console.log("token:"+token);
            res.status(201).send({ token, user });
        } else {
            res.status(404).send("Please enter the correct password");
        }
    } catch (error) {
        res.send(error);
    }
})

//profile page getting all users inside the database
app.get('/profile', async (req, res) => {
    try {
        const userData = await User.find();
        res.send(userData);
    } catch (e) {
        res.send(e);
    }
})

//getting a single user by its id
app.get('/profile/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const userData = await User.findById(id);
        if (!userData) {
            return res.status(404).send();
        } else {
            res.send(userData);
        }
    } catch (e) {
        res.send(e);
    }
})




app.post('/todo', auth, async (req, res) => {

    const todo = new Todo({
        ...req.body,
        author: req.user._id
        
    });
    try {
        const todoResponse = await todo.save();
        res.status(201).send(todoResponse);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
})

app.post('/todo/many', auth, async (req, res) => {
    const todos = req.body.map(todo => (
        new Todo({
            ...todo,
            author: req.user._id
        })
    ));
    try {
        todos.forEach(async (todo) => { await todo.save() });
        res.status(200).send({ message: 'Saved!' })
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
})





app.get("/todo", auth, async (req, res) => {
    try {
      const todos = await Todo.find({
        author: req.user._id,
      }).sort({ date: -1 });
      res.json(todos);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  })

app.delete('/todo/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const deletedTodo = await Todo.findOneAndDelete({ _id, author: req.user._id });
        if (!deletedTodo) {
            return res.status(404).send({ error: `Todo does not exist.` });
        }
        return res.status(200).send(deletedTodo);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
})


app.listen(3003, () => {
    console.log('this is working');
})


/*
res  complete   done
signin -- post   success/fail  done
register -- post  user    done
profile -- userid = get user    done
add -- post task  done 
add many -- post task  done
show todo -- get task done
delete -- delete task  done 
*/