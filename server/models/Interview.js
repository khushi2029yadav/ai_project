const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
   userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
   },

   role:{
    type:'String',
    required:true
   },

   experience:{
    type:'String',
    required:true
   },

   difficulty:{
    type:'String',
    required:true
   },

   interviewType:{
    type:String,
    required:true
   },
   numberOfQuestions:{
    type:Number,
    required:true
   },
   questions:[{
    question:String,
    type:String,
    }]
},
{
    timestamps:true
  }
)

module.exports = mongoose.model('Interview',interviewSchema)