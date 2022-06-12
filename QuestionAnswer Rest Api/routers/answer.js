const express = require('express');

const {getAccessToRoute,getAnswerOwnerAccess}=require('../middlewares/authorization/auth')
const {checkQuestionAndAnswerExist}=require('../middlewares/database/databaseErrorHelpers')

const {addNewAnswerToQuestion,getAllAnswersByQuestion,getSingleAnswer,updateAnswer,deleteAnswer,likeAnswer,undolikeAnswer}=require('../controllers/answer')

const router=express.Router({mergeParams:true});


router.post("/",getAccessToRoute,addNewAnswerToQuestion)
router.get("/",getAllAnswersByQuestion)
router.get("/:answerId",checkQuestionAndAnswerExist,getSingleAnswer) // burada questionId/answers/answerId şeklinde bir yapı var.
//                                                                      router.use("/:questionId/answers",checkQuestionExist,answer) question.js'de bu şekilde kullandık.

router.put("/:answerId/edit",[getAccessToRoute,checkQuestionAndAnswerExist,getAnswerOwnerAccess],updateAnswer)
router.delete("/:answerId/delete",[checkQuestionAndAnswerExist,getAccessToRoute,getAnswerOwnerAccess],deleteAnswer)
router.get("/:answerId/like",[checkQuestionAndAnswerExist,getAccessToRoute,getAnswerOwnerAccess],likeAnswer)
router.get("/:answerId/undo-like",[checkQuestionAndAnswerExist,getAccessToRoute,getAnswerOwnerAccess],undolikeAnswer)




module.exports = router
