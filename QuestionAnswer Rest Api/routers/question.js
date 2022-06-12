const express=require("express");
// api/question

const answer=require('./answer') // Answer'lar bir sorunun cevabı olduğu için burada kullanılacak.

const {getAccessToRoute,getQuestionOwnerAccess}=require('../middlewares/authorization/auth')

const {getAllQuestions,askNewQuestion,getSingleQuestion,editQuestion,deleteQuestion, likeQuestion,undolikeQuestion}=require('../controllers/question')

const {checkQuestionExist}=require('../middlewares/database/databaseErrorHelpers')
const questionQueryMiddleware=require('../middlewares/query/questionQueryMiddleware');
const {answerQueryMiddleware}=require('../middlewares/query/answerQueryMiddleware');

const Question = require("../models/Question");


const router=express.Router(); // Bu aslında bir middleware // Router önce yazılmalı. Daha sonra http istekleri gelmeli.


router.post("/ask",getAccessToRoute,askNewQuestion)

router.get("/",questionQueryMiddleware(Question,{
    population:{
        path:"user",select:"name profile_image"
    }
}),getAllQuestions)

router.get("/:id",checkQuestionExist,answerQueryMiddleware(Question,{
    population:[
        {
            path:"user",
            select:"name profile_image"
        },
        {
            path:"answers",
            select:"content"
        }
    ]
}),getSingleQuestion)

router.put("/:id/edit",[getAccessToRoute,checkQuestionExist,getQuestionOwnerAccess],editQuestion)
router.delete("/:id/delete",[getAccessToRoute,checkQuestionExist,getQuestionOwnerAccess],deleteQuestion)

router.get("/:id/like",[getAccessToRoute,checkQuestionExist,getQuestionOwnerAccess],likeQuestion)
router.get("/:id/undo-like",[getAccessToRoute,checkQuestionExist,getQuestionOwnerAccess],undolikeQuestion)

router.use("/:questionId/answers",checkQuestionExist,answer) // Index.js'de yazmak yerine burada yazacağız çünkü her bir cevap bir soruda verilir.


module.exports=router; // Auth route'larını server.js'de kullanacağımız için export ediyoruz.
