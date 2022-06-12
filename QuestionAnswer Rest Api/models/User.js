const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;

const jwt=require("jsonwebtoken");

const crypto=require("crypto"); // Çok kullanıldığı için node'un içine eklendi.
const Question = require("./Question");

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  email: {
    type: String,
    required: [true,"Email is required"],
    unique: true, // Burada mesaj gönderemiyoruz çünkü unique alanının direkt boolean olması lazım, array içerisinde olmamalı.
    match: [
      /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      "Please provide a valid email",
    ],
  },

  role: { type: String, default: "user", enum: ["user", "admin"] },

  password:{
      type: String,
      minlength:[6,"Please provide a password with min length 6"],
      required: [true, "Please provide a password"],
      select:false
  },
  createdAt:{
      type:Date,
      default: Date.now
  },
  title:{ type: String},
  about:{ type: String},
  place:{type: String},
  website:{ type: String},
  profile_image:{ type: String, default:"default.jpg"},
  blocked:{ type: Boolean,default:false},
  resetPasswordToken:{ type: String},
  resetPasswordExpire:{type:Date},
});

UserSchema.methods.getResetPasswordTokenFromUser=function(){
  const {RESET_PASSWORD_EXPIRE}=process.env
const randomHexString=crypto.randomBytes(15).toString("hex"); // Byte değerlerini hexadecimal olarak stringe çeviriyor.


const resetPasswordToken=crypto.createHash("SHA256") // Şifreleme algoritması
.update(randomHexString) // hashimizi hexString'den oluşturuyoruz
.digest("hex") // hexadecimal şeklinde oluşacak

this.resetPasswordToken=resetPasswordToken;
this.resetPasswordExpire=Date.now() + parseInt(RESET_PASSWORD_EXPIRE) // 1 saat geçerli olacak

return resetPasswordToken;

}



// UserSchema methods
UserSchema.methods.generateJwtFromUser = function(){
  const {JWT_SECRET_KEY,JWT_EXPIRE}=process.env
  const payload={
    id:this._id,
    name:this.name,
  }

  const token=jwt.sign(payload,JWT_SECRET_KEY,{
    expiresIn:JWT_EXPIRE
  })

  return token
}


UserSchema.pre("save",function(next){ // Kaydedilme işleminden hemen önce
  console.log(this) // Örneğin post edilen kullanıcının objesi = this
  if (!this.isModified("password")) { // Bu kod sayesinde kullanıcı şifresini değiştirmemişse tekrar hashleme işlemi yapılmayacak.
    next();
  }
  bcrypt.genSalt(10,(err,salt)=>{
    if(err) next(err); // Eğer ki tuzlamada bir hata varsa next ile customErrorHandler'a gönder
    bcrypt.hash(this.password,salt,(err,hash)=>{
      if(err) next(err); // Hashlemede hata varsa next ile error'ı customErrorHandler'a gönder
      this.password=hash // Hashli değeri password yap. Ek olarak buradaki this bizim gönderdiğimiz User objesini göstermiyor çünkü iç içe fonksiyon kullandık. 
      //Bu sorunu çözmek için arrow function kullandık.
      next();
    })
  })
})

UserSchema.post("remove",async function(){ // Bu bir post hook, user remove edildikten sonra sorularının da silinmesi için gerekli kod.
  await Question.deleteMany({
    user:this._id
  })
})

module.exports=mongoose.model("User",UserSchema)

// User.create
