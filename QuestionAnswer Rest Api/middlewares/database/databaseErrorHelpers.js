const User = require('../../models/User')
const Question = require('../../models/Question')
const Answer = require('../../models/Answer')

const CustomError=require('../../helpers/error/CustomError')

const asyncErrorWrapper=require('express-async-handler')

const checkUserExist=asyncErrorWrapper(async(req,res,next)=>{
    const {id}=req.params

    const user=await User.findById(id);

    if (!user) return next(new CustomError("There is no such user with that id",400))
    req.data=user
    next();
})


const checkQuestionExist=asyncErrorWrapper(async(req,res,next)=>{
    const questionId=req.params.id || req.params.questionId // İstediğimiz yerde questionId, istediğimiz yerde id olarak almak istiyoruz. Kodda karışıklık olmasın diye böyle yaptık

    const question=await Question.findById(questionId);

    if (!question) return next(new CustomError("There is no such user with that id",400))
    req.data=question
    next();
})


const checkQuestionAndAnswerExist=asyncErrorWrapper(async(req,res,next)=>{
    const questionId=req.params.questionId
    const answerId=req.params.answerId

    const answer=await Answer.findOne({
        _id:answerId,
        question:questionId
    })

    if(!answer) return next(new CustomError("There is no answer about this question",400))
    return next();
})
module.exports={
    checkUserExist,
    checkQuestionExist,
    checkQuestionAndAnswerExist
}