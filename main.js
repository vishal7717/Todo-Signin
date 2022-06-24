const express = require("express");
const bodyParser = require('body-parser');
const app = express();
//const fs = require("fs")
const session = require("express-session")
const multer  = require("multer")
//const mongodb=require("mongodb")
const db=require("./database/main")
const userModel = require("./database/models/user.js")
const todoModel = require("./database/models/todo.js");
const res = require("express/lib/response");

//start the server
app.listen(3000, () => {
    console.log("Server is running at 3000 port")
})

//Database 
// const MongoClient=mongodb.MongoClient;
// const url="mongodb+srv://vishal:12345@cluster0.y2v89.mongodb.net/ToDoDB?retryWrites=true&w=majority"

// const client=new MongoClient(url);
// const dbName="ToDoDB"
// var dbInstance=null;
// client.connect().then(function(){
//     console.log("DB is connected");
//     dbInstance=client.db(dbName);
// })

//start db
db.start();
//EJS
app.set("views", "view-files")
app.set("view engine", "ejs")

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use("/todo", express.static(__dirname + '/todo'))
app.use("/uploads" ,express.static(__dirname+"/uploads"))

//MULTER 

const storage = multer.diskStorage({ 
    destination: function (req, file, cb) 
    {
      cb(null, 'uploads/')
    },
    filename: function(req, file, cb)
    {
      cb(null, Date.now()+".jpg");
    }
  })
  
  var upload = multer({ storage: storage })
// Session 
app.use(session({
    secret: 'team faltoo vp',
    saveUninitialized: true,
    resave: false
}))



// LOGIC started

app.get("/", (req, res) => {
    if (req.session.isLoggedIn) {
        // console.log("loggedin")
        res.redirect("/home");
    }
    else {
        // console.log("logged out");
        res.render("login.ejs",{ message: "" })
    }
})

app.get("/register",(req,res)=>{
    if(req.session.isLoggedIn){
        res.redirect("/");
    }
    else{
        res.render("signup.ejs",{message:""});
    }
})


app.post("/signup", (req, res) => {
    // console.log(req.body)
    let user = req.body;
    findUserByUsername(user.username, (users) => {
        let flag = false;
        // console.log(users, "from signup endpoint")
        // console.log(user, "from signup endpoint")
        for (let i = 0; i < users.length; i++) {
            if (users[i].username === user.username) {
                console.log(i, " ")
                flag = true;
                break;
            }
        }
        if (flag) {
            // console.log("aa raha hai yahan pe")
            res.render("signup.ejs", { message: "Username already exists" })
        }
        else {
            // console.log("else me aa raha hai ")
            writeUserDB(user);
            res.redirect("/");
        }
    })

})

app.get("/home",(req,res)=>{
    if(req.session.isLoggedIn){
        readToDoDB(allTodos=>{
            allTodos = allTodos.filter(todo=>{
                return todo.username === req.session.username;
            })
            // console.log(allTodos)
            res.render("home.ejs",{username:req.session.username,data:allTodos})
        })
    }
    else{
        res.redirect("/");
    }
})


app.post("/login", (req, res) => {
    // console.log(req.body)
    readUserDB(req.body.username,req.body.password,(user) => {
       
        if (user==null) {
            res.render("login.ejs", { message: "User/password not Correct" })
        }
        
        else {
            req.session.isLoggedIn = true;
            req.session.username = req.body.username;
            res.redirect("/home")
        }

    })


})

app.get("/logout", function (req, res) {
    req.session.destroy();
    res.redirect("/")    // console.log("log out clicked")
})

function findUserByUsername(username,call){
    userModel.find({username:username}).then(function(users){
        call(users);
    })
}


function readUserDB(username,password,call) {
   
    userModel.findOne({username:username,password:password}).then(function(users){
     console.log(users)
        call(users);
    })
}


function writeUserDB(user) {
   userModel.create({username:user.username,password:user.password},(err)=>{
   console.log(err)
   })
}



//All TODO Started




app.post("/save", upload.single("taskimage") , (req, res) => {
    // console.log(req.body)
    

        let task = {
            username:req.session.username,
            id: Date.now(),
            todo: req.body.task,
            done: false,
            img:req.file.path
        }

        
        // console.log(allTodos);
       saveToDoDB(task,()=>{
           console.log("Task Added")
        res.redirect("/");
    });
})

// for checking toDo
app.post("/check", (req, res) => {
   console.log(req.body.id);
   todoModel.updateOne({id:Number(req.body.id)},{done:Boolean(req.body.value)}, (err)=>{
     if(err){
         console.log(err);
     }
    else{
        console.log("data")
    }
   });
   res.redirect("/");
})

// For Editing toDo

app.get("/edit/:id", (req, res) => {

    if (req.session.isLoggedIn) {
        readSingleToDo(req.params.id, toDo => {
            console.log(toDo,"from edit ");
            // console.log(toDo,"from edit id endpoint")
            res.render("edit", { data: toDo, username: toDo.username })
        })
    }
    else {
        res.redirect("/");
    }

})


app.post("/update",(req,res)=>{
    // console.log(req.body.id)
 
     todoModel.updateOne({id:Number(req.body.id)},{todo:req.body.task},(err,data)=>{
     if(err){
         console.log(err);
     }
     else{
         console.log("data")
     }
    })
    res.redirect("/")
})



//for deleteTask

app.get("/delete/:id", (req, res) => {

    if(req.session.isLoggedIn){
      todoModel.deleteOne({id:Number(req.params.id)}).then(()=>{
      res.redirect("/");
       })
     }
    else{
        res.redirect("/");
    }

})



function readSingleToDo(tid,call) {
    todoModel.findOne({id:Number(tid)}).then(function(ToDo){
  // console.log(Todos,"from read function");
            call(ToDo);
        
    })
}


function saveToDoDB(task,call) {
   todoModel.create({username:task.username,id:task.id,todo:task.todo,done:task.done,img:task.img})
    call();
}

function readToDoDB(call){
    todoModel.find({}).then(function(allTodos){
        //console.log(allTodos);
        call(allTodos);
    })
}