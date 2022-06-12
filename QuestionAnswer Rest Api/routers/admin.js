const express=require('express');

const {getAccessToRoute,getAdminAccess}=require('../middlewares/authorization/auth')

const {checkUserExist}=require('../middlewares/database/databaseErrorHelpers')

const {blockUser,deleteUser}=require('../controllers/admin')

// Block and delete user 
const router=express.Router();


router.use([getAccessToRoute,getAdminAccess]); // En üstte yazdığımız için bütün route'larda geçerli olacak.



router.get("/",(req,res,next)=>{

    res.status(200)
    .json({success:true, message:"Admin Page"})
})

router.get("/user/block/:id",checkUserExist,blockUser);

router.delete("/user/delete/:id",checkUserExist,deleteUser)

module.exports =router;