const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
    },
    id:{
        type:Number,
        required:true,
        default:Date.now
    },
    todo:{
        type:String,
        required:true
    },
    done:{
        type:Boolean,
        default:false,
    },
    img:{
        type:String,
    }

  });

const todoModel =   mongoose.model('todo',todoSchema)

module.exports = todoModel