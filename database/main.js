var mongoose = require('mongoose');

const url = "mongodb+srv://user@cluster0.y2v89.mongodb.net/ToDoDB?retryWrites=true&w=majority"

module.exports.start = function()
{
  mongoose.connect(url).then(function()
  {
    console.log("db is live")
  })
}
