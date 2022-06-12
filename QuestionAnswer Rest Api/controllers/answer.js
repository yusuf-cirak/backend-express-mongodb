const CustomError=require('../helpers/error/CustomError')

const asyncErrorWrapper=require('express-async-handler')
const Answer = require('../models/Answer')
const Question = require('../models/Question')

const addNewAnswerToQuestion=asyncErrorWrapper(async (req,res,next)=>{
    const questionId=req.params.questionId
    const userId=req.user.id
    console.log(questionId,userId)

    const information=req.body

    const answer=await Answer.create({
        ...information,
        question:questionId,
        user:userId
    })
    return res.status(200)
    .json({success:true,data:answer})

})



const getAllAnswersByQuestion=asyncErrorWrapper(async (req,res,next)=>{
    const questionId=req.params.questionId
    const question=await Question.findById(questionId).populate("answers"); // populate methodu ile question'ın sadece answer id'si değil, değerleri de gelecek.
    const answers=question.answers

    return res.status(200)
    .json({success:true,
        count:answers.length,data:answers})

})

const getSingleAnswer=asyncErrorWrapper(async (req,res,next)=>{
    const {answerId}=req.params
    const answer=await Answer.findById(answerId)
    .populate({path:"question", select:"title"}) // İstediğimiz alanları seçmek için obje içerisinde gönderiyoruz. path olarak istediğimiz alanı, select ile istediğimiz özelliklerini veriyoruz.
    .populate({path:"user",select:"name profile_image"}) // Birden fazla özelliği almak istiyorsak arada boşluk bırakmamız gerek. {select:"özellik1 özellik2"}


    return res.status(200)
    .json({success:true,
        data:answer})

})
const updateAnswer=asyncErrorWrapper(async (req,res,next)=>{
    const {answerId}=req.params
    // const answerId2=req.params.answerId İki şekilde de veri alınabiliyor.
    const {content}=req.body

    let answer=await Answer.findById(answerId)
    console.log(answerId2)

    answer.content=content;

    answer=await answer.save();


    return res.status(200)
    .json({success:true,
        data:answer})

})

const deleteAnswer=asyncErrorWrapper(async (req,res,next)=>{
    const {answerId}=req.params
    const {questionId}=req.params

    // const answerId2=req.params.answerId İki şekilde de veri alınabiliyor.

    await Answer.findByIdAndRemove(answerId)

    const question=await Question.findById(questionId)

    question.answers.splice(question.answers.indexOf(answerId),1) // Bu işlemi question modelinde Question.pre("remove") şeklinde Schema'ya da kaydedebiliriz. İstersek burada da yapılabilir.
    question.answerCount=question.answers.length


    await question.save();


    return res.status(200)
    .json({success:true,
        message:"Your answer has been deleted"})

})

const likeAnswer=asyncErrorWrapper(async(req,res,next)=>{
    const {answerId}=req.params;

    const answer=await Answer.findById(answerId);

    if(answer.likes.includes(req.user.id)) return next(new CustomError("You've already liked this",400));

    answer.likes.push(req.user.id);

    await answer.save();
    return res.status(200)
    .json({success:true, message:"You liked this answer 👍",data:answer})
})

const undolikeAnswer=asyncErrorWrapper(async(req,res,next)=>{
    const {answerId}=req.params;

    const answer=await Answer.findById(answerId);

    if(!answer.likes.includes(req.user.id)) return next(new CustomError("You haven't liked this answer",400));

    const index=answer.likes.indexOf(req.user.id);

    answer.likes.splice(index,1); // index'e git ve sil.

    await answer.save();
    return res.status(200)
    .json({success:true, message:"You removed your like for this answer ",data:answer})
})



module.exports={
    addNewAnswerToQuestion,
    getAllAnswersByQuestion,
    getSingleAnswer,
    updateAnswer,
    deleteAnswer,
    likeAnswer,
    undolikeAnswer
}