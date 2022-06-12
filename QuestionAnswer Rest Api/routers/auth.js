const express=require("express");
// api/auth

const {register,getUser,login,logout,imageUpload,forgotPassword,resetPassword,editDetails}=require('../controllers/auth')
const {getAccessToRoute}=require('../middlewares/authorization/auth')
const {profileImageUpload}=require('../middlewares/libraries/profileImageUpload')

const router=express.Router(); // Bu aslında bir middleware // Router önce yazılmalı. Daha sonra http istekleri gelmeli.



router.post("/register",register)
router.post("/login",login)
router.get("/logout",getAccessToRoute,logout) // Kullanıcı login olduysa kontrol etmemiz gerek bu yüzden
                                              // getAccessToRoute kullanıyoruz.


router.get("/profile",getAccessToRoute,getUser)
router.put("/edit",getAccessToRoute,editDetails)
router.post("/upload",[getAccessToRoute,profileImageUpload.single("profile_image")],imageUpload) // Yükleme yapabilmek için kullanıcının login olmuş olması yani tokeni olması gerekir.
// Tek bir upload yapacak ve profile_image olarak yapacak.


router.post("/forgotpassword",forgotPassword)
router.put("/resetpassword",resetPassword); // Bu iki route'ı kullanabilmek için gmail'den az güvenli uygulamaları açman gerek. Açmak istemezsen postman'den ve MongoDb'den işini halletmelisin.


module.exports=router; // Auth route'larını server.js'de kullanacağımız için export ediyoruz.
