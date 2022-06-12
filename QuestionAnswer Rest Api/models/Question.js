const mongoose = require('mongoose')

const slugify = require('slugify')

const Schema = mongoose.Schema;

const QuestionSchema=new Schema({
    title:{
        type: String,
        required: [true,"Please provide a title"],
        minLength:[10,"Please provide a title with min 10 characters"],
        unique: true
    },

    content: {
        type:String,
        required: [true,"Please provide a content"],
        minLength:[20,"Please provide a title with min 20 characters"],

    },
    slug:String, // Sadece tipi tanımlayacaksak bu şekilde yazabiliriz.
    createdAt:{
        type:Date,
        default:Date.now
    },
    user:{
        type:mongoose.Schema.ObjectId, // Burada user objesinin ObjectId bulundurması gerektiğini belirtiyoruz
        required:true,
        ref:"User" // User'a referans verdik, arada ilişki kurduk gibi.
    },
    likes:[{ // Like array'i olacak. ObjectId olacak ve User'ı referans alacak.
        type: mongoose.Schema.ObjectId,
        ref:"User"
    }],
    answers:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"Answer"
        }
    ],
    answerCount:{
        type:Number,
        default:0,

    },
    likeCount:{
        type:Number,
        default:0
    }
})


QuestionSchema.pre("save",function(next){

    if (!this.isModified("title")) next();
    this.slug=this.makeSlug();
    next();
})

QuestionSchema.methods.makeSlug=function(){

    return slugify(this.title,{
        replacement:'-',
        remove:/[*+~.()'"!:@]/g,
        lower:true
    })

}

module.exports=mongoose.model("Question",QuestionSchema)