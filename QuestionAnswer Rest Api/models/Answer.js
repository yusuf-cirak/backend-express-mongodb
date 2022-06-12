const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const Question=require('../models/Question')


const AnswerSchema= new Schema({
    content:{
        type:String,
        required:[true,"Please provide a content"],
        minlength: [10,"Please provide a content at least 10 character"],
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    likes:[ // Her cevap kullanıcılar tarafından like alabilir.
        {
            type:mongoose.Schema.ObjectId,
            ref:"User"
        }
    ],
    user:{ // Her bir yorumu yapan kullanıcı olması gerek.
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    question:{ // Her bir yorumun yapıldığı soru olması gerek.
        type:mongoose.Schema.ObjectId,
        ref:"Question",
        required:true
    },
})

AnswerSchema.pre("save",async function(next){
if (!this.isModified("user")) return next();

const question = await Question.findById(this.question)
question.answers.push(this._id)
question.answerCount=question.answers.length

await question.save();
next();
})




module.exports=mongoose.model("Answer",AnswerSchema)