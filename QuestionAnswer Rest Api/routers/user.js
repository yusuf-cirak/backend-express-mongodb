const express = require('express');



const {getSingleUser,getAllUsers}=require('../controllers/user')

const {checkUserExist}=require('../middlewares/database/databaseErrorHelpers')

const {userQueryMiddleware} =require('../middlewares/query/userQueryMiddleware');
const User = require('../models/User');

const router=express.Router(); // Router önce yazılmalı. Daha sonra http istekleri gelmeli.


router.get("/",userQueryMiddleware(User),getAllUsers) // api/users dediğimizde çalışacak // population yapmadığımız için userQueryMiddleware'de tek parametre gönderdik.

router.get("/:id",checkUserExist,getSingleUser)



module.exports =router;