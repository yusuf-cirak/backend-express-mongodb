const User = require("../models/User");

const CustomError = require("../helpers/error/CustomError");

const asyncErrorWrapper = require("express-async-handler");

const getSingleUser = asyncErrorWrapper(async (req, res, next) => {
  // const {id}=req.params

  // const user=await User.findById(id)
  return res.status(200).json({ success: true, data: req.data }); // Buradaki req.data checkUserExist'ten geliyor. 2 defa kontrol yapmamak için böyle performanslı bir yöntem kullanılabilir.
  // Yaptığımız şey router/user.js'deki get requesti için 2 fonksiyon çalıştırmak, ikisi aynı request olduğu için req.data dediğimizde aynı data iki fonksiyonda da kullanılabiliyor.
})

const getAllUsers=asyncErrorWrapper(async(req,res,next)=>{
    return res.status(200).json(res.queryResults)


})

module.exports = {
  getSingleUser,
  getAllUsers,
};
