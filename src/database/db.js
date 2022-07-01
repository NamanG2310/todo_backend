const mongoose = require("mongoose");
//connectivity of the data to the node.
mongoose.connect("mongodb://localhost:27017/todoBackend", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("connection successful");
}).catch((e) => {
    console.log("no connection");
})