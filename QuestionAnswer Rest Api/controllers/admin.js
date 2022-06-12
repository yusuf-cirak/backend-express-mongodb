const User=require('../models/User')
const CustomError=require('../helpers/error/CustomError')

const asyncErrorWrapper=require('express-async-handler')

const blockUser=asyncErrorWrapper(async (req,res,next)=>{

    // const {id}=req.params;

    // const user= await User.findById(id);
    const user =req.data // Burayı böyle yapma sebebimiz userCheckExist'de zaten ilgili kullanıcının kontrol edilmiş olması ve req.data'ya atılması. Aynı request içerisinde olduğu
    // için verilerini aldık. Aynı request'te olmalarını da kendimzi ayarlıyoruz.
    console.log(user)

    user.blocked=!user.blocked; // True ise false olacak, false ise true olacak.
  
    await user.save();

    return res.status(200)
    .json({success:true,blocked:user.blocked,message:"Block-unblock successful"})

})


const deleteUser=asyncErrorWrapper(async (req,res,next)=>{

    // const {id}=req.params
    const user=req.data

    await user.remove();

    return res.status(200)
    .json({success:true,message:"User deleted successfully"})
})


module.exports ={blockUser,deleteUser}