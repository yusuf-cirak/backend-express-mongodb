const express=require('express');

const asyncErrorWrapper = require("express-async-handler"); // asyncErrorWrapper try-catch'i bizim için yapıyor

const mongoose= require('mongoose');


const Schema = mongoose.Schema;

//#region User Create Model
const UserSchema = new Schema({
    name: {
      type: String,
      required: [true, "Please provide a name"],
    },
    email: {
      type: String,
      required: [true,"Email is required"],
      unique: true,
      match: [
        /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        "Please provide a valid email",
      ],
    },
    createdAt:{
        type:Date,
        default: Date.now
    }
  });
  
  const User = mongoose.model("User",UserSchema,'users')
//#endregion

//#region Db connection
const connectionString='mongodb+srv://yusuf:123@expressjsprojectdb.z840a.mongodb.net/question-answer?retryWrites=true&w=majority'
mongoose.connect(connectionString).then(()=>console.log("MongoDb connection successful")).catch((err)=>console.log(err))

//#endregion

const app=express();

app.use(express.json()) // Response'ları json olarak alabilmek için.

//#region Db actions
const getUserById = asyncErrorWrapper(async (req, res, next) => {
//   const {id}=req.params
const id=req.query.id

console.log(id)

  const user=await User.findById(id)
  return res.status(200).json({ success: true, data: user });
})
const getUserWithAnyParameter=asyncErrorWrapper(async(req,res,next)=>{
    const {customParameter}=req.params;

    let users=await User.find({
      $or:[
        {_id:{$eq:customParameter.length==24?customParameter:null}},
        {email:{$eq:customParameter}},
        {name:{$eq:customParameter}}
      ]
    })
    return  res.status(200).json({success:true,data:users,count:Object.keys(result).length})
})

const addUser=asyncErrorWrapper(async (req,res,next)=>{ // express-async-handler kütüphanesi bizim için try catch işlemlerini halledecek.

    const {name,email} = req.body // Yolladığımız isteğin body'sinden gelecek değerler
    console.log(name,email)
        const user=await User.create({
            name, 
            email
        })

        return res.status(200).json({success:true,data:user})
        
    })

    const updateUser=asyncErrorWrapper(async (req,res,next)=>{ // express-async-handler kütüphanesi bizim için try cath işlemlerini halledecek.

        const {id} = req.params // Yolladığımız isteğin body'sinden gelecek değerler
        const body=req.body

            await User.findByIdAndUpdate(id,body)
    
            return res.status(200).json({success:true,message:'User updated'})
            
        })
//#endregion


//#region Router
const router=express.Router(); // Router önce yazılmalı. Daha sonra http istekleri gelmeli.


router.post("/get/:customParameter",getUserWithAnyParameter) // api/users endpointine request attığımızda çalışacak

router.post("/get",getUserById) // post ile verileri query parameter olarak aldım. /get-user?id=61fb8e3b0b66a91351ae2450 şeklinde

router.post('/add',addUser); // request body'de name ve email göndererek kullanıcı oluşturuyoruz

router.post('/update/:id',updateUser) // params olarak id verilir, body'de güncellenecek kolonlar json objesi olark gönderilir 

//#endregion

app.use("/api/user",router); // Bütün değişikliklerimizi tek bir dosyaya yani index'e yolladık, tek bir yerde de kullanıyoruz.

app.listen(3000,()=>{
    console.log(`App started on port : ${3000}`)
})