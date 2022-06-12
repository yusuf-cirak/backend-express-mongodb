const CustomError = require("../../helpers/error/CustomError");
const User= require('../../models/User')
const asyncErrorWrapper=require('express-async-handler')
const jwt = require("jsonwebtoken");
const {
  isTokenIncluded,
  getAccessTokenFromHeader,
} = require("../../helpers/authorization/tokenHelpers");
const Question = require("../../models/Question");
const Answer = require("../../models/Answer");




const getAccessToRoute = (req, res, next)=>{ // Token'ın geçerliliği kontrol edilecek.
  // Token

  const { JWT_SECRET_KEY } = process.env; // Kullanmak için mysupersupersecretkey'i aldık.

  // 401 Unauthorized
  // 403 Forbidden
  if (!isTokenIncluded(req)) {
    return next(new CustomError("You are not authorized to access this route (isTokenIncluded)"),401);
  }

  const accessToken = getAccessTokenFromHeader(req);

  jwt.verify(accessToken, JWT_SECRET_KEY, (err, decoded) => {
    // Decode işlemi yapacak
    if (err) {
      return next(
        // new CustomError("You are not authorized to access this route (verify)", 401)
        new CustomError(err, 401)

      );
    }
    req.user={
      id:decoded.id,
      name:decoded.name
    }
    next();
  });

  // Custom Error
};

const getAdminAccess=asyncErrorWrapper(async(req,res,next)=>{
  const {id}=req.user; // getAccessToRoute aynı route'da çalışacağı için requestleri bir olacak.
  const user=await User.findById(id);

  if(user.role!=="admin") return next(new CustomError("Only admins can access this route",403))
  next();
})

const getQuestionOwnerAccess=asyncErrorWrapper(async(req,res,next)=>{

  const userId=req.user.id // 
  const questionId=req.params.id

  const question= await Question.findById(questionId);

  if (question.user!=userId) return next(new CustomError('You are not authorized, you didnt ask this question',403)) // Kişi soruyu sormadıysa next ile kod devam edecek ve kullanıcıya izin verilmeyecek.

  next(); // Program buraya geldiyse kontrolde sıkıntı olmamış demektir. 
})

const getAnswerOwnerAccess=asyncErrorWrapper(async(req,res,next)=>{

  const userId=req.user.id // 
  const answerId=req.params.answerId

  const answer= await Answer.findById(answerId);

  if (answer.user!=userId) return next(new CustomError('You are not authorized, you didnt ask this question',403)) // Kişi soruyu sormadıysa next ile kod devam edecek ve kullanıcıya izin verilmeyecek.

  next(); // Program buraya geldiyse kontrolde sıkıntı olmamış demektir. 
})

module.exports = {getAccessToRoute,getAdminAccess,getQuestionOwnerAccess,getAnswerOwnerAccess};
