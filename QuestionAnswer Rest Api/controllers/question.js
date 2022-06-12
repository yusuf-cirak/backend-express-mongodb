const Question=require('../models/Question')
const CustomError=require('../helpers/error/CustomError')
const asyncErrorWrapper=require('express-async-handler')




const askNewQuestion=asyncErrorWrapper(async(req,res,next)=>{
    const information=req.body

    const question=await Question.create({
        // title:information.title,
        // content: information.content
        ...information, // Spread operator ile işler daha kolay
        user:req.user.id // Kullanıcımızın id'si işlenmiş olacak. req.body getAccessToRoute'dan geliyor.
    })

    res.status(200).json({
        success:true,
        data:question
    })
})


const getSingleQuestion=asyncErrorWrapper(async(req,res,next)=>{
    res.status(200).json(req.queryResults)
})

const getAllQuestions=asyncErrorWrapper(async(req,res,next)=>{

    res
    .status(200).json(res.queryResults)
})

const editQuestion=asyncErrorWrapper(async(req,res,next)=>{
    const {id}=req.params; // questionId
    const {title,content}=req.body; // question
    let question=await Question.findById(id); // await kullanmadığımızda burası promise olarak kalıyor.

    question.title=title;
    question.content=content;
    question=await question.save();
    res.status(200)
    .json({
        success:true,
        data:question
    })
})

const deleteQuestion=asyncErrorWrapper(async(req,res,next)=>{
    const {id}=req.params; // questionId
    await Question.findByIdAndDelete(id); // await kullanmadığımızda burası promise olarak kalıyor.
    res.status(200)
    .json({
        success:true,
        message:"Question deleted successfully"
    })
})

const likeQuestion=asyncErrorWrapper(async(req,res,next)=>{
    const {id}=req.params;
    console.log(id)

    const question=await Question.findById(id);
    console.log(question)

    if(question.likes.includes(req.user.id)) return next(new CustomError("You've already liked this",400));

    question.likes.push(req.user.id);
    question.likeCount=question.likes.length;

    await question.save();
    return res.status(200)
    .json({success:true, message:"You liked this question 👍",data:question})
})

const undolikeQuestion=asyncErrorWrapper(async(req,res,next)=>{
    const {id}=req.params;

    const question=await Question.findById(id);

    if(!question.likes.includes(req.user.id)) return next(new CustomError("You haven't liked this question",400));

    const index=question.likes.indexOf(req.user.id);

    question.likes.splice(index,1); // index'e git ve sil.
    question.likeCount=question.likes.length;

    await question.save();
    return res.status(200)
    .json({success:true, message:"You disliked this question ",data:question})
})



module.exports={
    getAllQuestions,
    askNewQuestion,
    getSingleQuestion,
    editQuestion,
    deleteQuestion,
    likeQuestion,
    undolikeQuestion
}
