
const User=require('../models/User')
const CustomError=require('../helpers/error/CustomError')

const asyncErrorWrapper=require('express-async-handler')

const {sendJwtToClient}=require('../helpers/authorization/tokenHelpers')

const {validateUserInput,comparePassword}=require('../helpers/input/inputHelpers')

const {sendEmail} = require('../helpers/libraries/sendEmail')

const { update } = require('../models/User')

const register=asyncErrorWrapper(async (req,res,next)=>{ // express-async-handler kütüphanesi bizim için try cath işlemlerini halledecek.

    const {name,email,password,role} = req.body // Yolladığımız isteğin body'sinden gelecek değerler
        const user=await User.create({
            name, 
            email, // ES6 standartları sayesinde eğer ki User özellikleri ile gönderdiğimiz özelliklerin isimleri aynıysa name:name şeklinde yazmamıza gerek yok.
            password,
            role
        })

        sendJwtToClient(user,res) // 
        
    })

    const getUser=(req,res,next)=>{ // Kullanıcının verilerini almak için
        res.json({
            success: true,
            data:{
                id:req.user.id,
                name:req.user.name
            },
            message:"Welcome"
        })
    }


    const login=asyncErrorWrapper(async(req,res,next)=>{

        const {email,password}=req.body // Verileri kullanıcıdan alıyoruz

        if (!validateUserInput(email,password)) { // Email ve password'ün kesinlikle gönderilmesi için helper yazmalıyız.
            return next(new CustomError("Please check your inputs",404))
        }

        const user=await User.findOne({email}).select("+password") // Ek olarak bize password lazım. 
                                                                   // Güvenlik dolayısıyla User modelinde selected değeri false yapılmıştı, burada gerekli olduğu için aldık.
                                                                //    console.log(user)

        if (!comparePassword(password,user.password)) { // password= user'ın giriş yaptığı değerler yani 123456
                                                        // user.password ise veri tabanından aldığımız hashli password.
            return next(new CustomError("Please check your credentials",400))
        }   
        
        sendJwtToClient(user,res) // Kullanıcıya her giriş yaptığında farklı token üretillir ve döndürülür.
                                  // Bu yüzden register için yazdığımız fonksiyonu burda da kullanabiliriz.
    })


    const logout=asyncErrorWrapper(async(req,res,next)=>{
      const {NODE_ENV}= process.env  

        return res.status(200)
        .cookie({
            httpOnly: true,
            expires:new Date(Date.now()), // Bunu yaptığımız an cookie'miz yok olacak. Çünkü expire time'ı şu an demiş oluyoruz.
            secure:NODE_ENV==="development"?false:true
        }).json({
            success:true,
            message:"You've logged out"
        })
    })

    const imageUpload=asyncErrorWrapper(async(req,res,next)=>{
        // Image upload success
        let user; // ReferenceError Cannot access 'user' before initialization undefined hatası aldığım için böyle tanımladım.

        user=await User.findByIdAndUpdate(req.user.id,{ // Bize güncellenmiş user'ı dönmesini istediğimiz için değişkene tanımladık. Veritabanından kullanıcımızı buluyoruz, güncellemek istediğimiz alanı giriyoruz,
            "profile_image":req.savedProfileImage // Profil resminin sunucudaki yolunu kaydettiğimiz için bu şekilde kaydettik. profileImageUpload.js storage değişkenine bakabilirsin.
        },{
            new:true, // Güncellenmiş kullanıcı gelmesi için new:true tanımlaması yapmamız şart.
            runValidators:true, // Validator'ların çalışması için
            data:user
        })

        res.status(200)
        .json({success:true,
        message:"Image upload success"})
    }
    )


    const forgotPassword = asyncErrorWrapper (async(req,res,next)=>{
        const resetEmail=req.body.email; // Request body'den emaili aldık.
        const {URL}=process.env
        // console.log(User.findOne({email:resetEmail}))
        const user=await User.findOne({email:resetEmail}) // Burayı await etmezsek promise olarak kalır, Promise de bir objeydi fakat içerisinde getResetPasswordTokenFromUser yok. Bu yüzden hata alırız.

        if (!user) {
            return next(new CustomError("There is no user with that email",400)) // Kullanıcı email'i sistemimizde yoksa hata fırlatıyoruz.
        }

        const resetPasswordToken=user.getResetPasswordTokenFromUser(); // Parola sıfırlamak için token üretiyoruz.

        await user.save(); // Kullanıcının bilgilerini kaydediyoruz.
        console.log(user);


        const resetPasswordUrl=`${URL}/api/auth/resetpassword?resetPasswordToken=${resetPasswordToken}` // Kullanıcı maile tıkladığında bu url'ye yönlendirilecek.

        const emailTemplate= // Göndereceğimiz mailin içeriği
        `
        <h3>Reset your password</h3>
        <p> This <a href='${resetPasswordUrl}' target='_blank'>link</a> will expire in 1 hour</p>
        `
        try {
            await sendEmail({
                from:process.env.SMTP_USER, // Kendi sistemimizin email'i örneğin questinanswerapi@gmail.com
                to:resetEmail, // Şifresi sıfırlanacak kullanıcımızın e-postası
                subject:"Reset your password", // Konu
                html:emailTemplate // İçerik
            })
            return res.status(200).json({success:true,
                message:"Token sent to your email"})
            
        } catch (error) { // Eğer ki bir hata olduysa bu değerlerin undefined yani tanımsız hale getirilmesi gerekiyor.
            user.resetPasswordToken=undefined,
            user.resetPasswordExpire=undefined
            await user.save(); // Daha sonra kaydedilmesi gerekiyor. Kullanıcı başka zaman yine aynı işlemleri yapabilir.
            return next(new CustomError("Email could not be sent",500)) // Sistem kaynaklı bir sorun olduğu için 500 döndürüyoruz.
        }
    })


    const resetPassword=asyncErrorWrapper(async(req,res,next)=>{

        const {resetPasswordToken}=req.query // req.query == örneklink.com/ad?=asdasd  // buradaki asdasd bizim query'den gelen değerimiz

        const {password}=req.body

        console.log(password,resetPasswordToken)

        if (!resetPasswordToken) return next(new CustomError("Please provide a valid token",400))

        let user =await User.findOne({
            resetPasswordToken:resetPasswordToken,
            resetPasswordExpire:{$gt:Date.now()} // MongoDb'nin özelliği, resetPasswordExpire Date.now()'dan büyükse değerini alacağız
        })

        if (!user) return next(new CustomError("Invalid token or session expired",404))

        user.password=password;
        user.resetPasswordToken=undefined
        user.resetPasswordExpire=undefined

        await user.save();


        return res.status(200).json({success:true,message:"Your password is successfully changed"})
    })



    const editDetails=asyncErrorWrapper(async(req,res,next)=>{

        const editInformation=req.body

        const user=await User.findByIdAndUpdate(req.user.id,editInformation,{
            new:true,
            runValidators:true
        })

        return res.status(200)
        .json({success:true,data:user,message:"User updated successfully"})




    })






module.exports={
    register,
    getUser,
    login,
    logout,
    imageUpload,
    forgotPassword,
    resetPassword,
    editDetails
}