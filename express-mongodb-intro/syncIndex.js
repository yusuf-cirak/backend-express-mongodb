const express = require("express");

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//#region User Create Model
const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [
      /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      "Please provide a valid email",
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", UserSchema, "users");
//#endregion

//#region Db connection
const connectionString =
  "mongodb+srv://yusuf:123@expressjsprojectdb.z840a.mongodb.net/question-answer?retryWrites=true&w=majority";
mongoose
  .connect(connectionString)
  .then(() => console.log("MongoDb connection successful"))
  .catch((err) => console.log(err));

//#endregion

const app = express();

app.use(express.json()); // Response'ları json olarak alabilmek için.

//#region Db actions

const getUserById = (req, res) => {
  // sync
  const id = req.query.id;

  User.findById(id, function (err, result) {
    if (!err) return res.status(200).json({ success: true, data: result });
    else throw err;
  });
};

const getUserWithAnyParameter = (req, res) => {
  const { customParameter } = req.params;
    User.find({
      $or: [
        { _id: { $eq: customParameter.length == 24 ? customParameter : null } },
        { email: { $eq: customParameter } },
        { name: { $eq: customParameter } },
      ],
    },function(err,result){
      if(!err) return  res.status(200).json({success:true,data:result,count:Object.keys(result).length})
      else throw err;
    })

};

const addUser = (req, res) => {
  const { name, email } = req.body; // Yolladığımız isteğin body'sinden gelecek değerler

  User.create(
    {
      name,
      email,
    },
    function (err, result) {
      if (!err) return res.status(200).json({ success: true, data: result });
      else throw err;
    }
  );
};

const updateUser = (req, res) => {
  const { id } = req.params; // Yolladığımız isteğin body'sinden gelecek değerler
  const body = req.body;

  User.findByIdAndUpdate(id, body, function (err, result) {
    if (!err)
      return res.status(200).json({ success: true, message: "User updated" });
    else throw err;
  });
};

//#endregion

//#region Router
const router = express.Router(); // Router önce yazılmalı. Daha sonra http istekleri gelmeli.

router.post("/get/:customParameter", getUserWithAnyParameter); // api/users endpointine request attığımızda çalışacak

router.post("/get", getUserById); // post ile verileri query parameter olarak aldım. /get?id=61fb8e3b0b66a91351ae2450 şeklinde

router.post("/add", addUser); // request body'de name ve email göndererek kullanıcı oluşturuyoruz

router.post("/update/:id", updateUser); // params olarak id verilir, body'de güncellenecek kolonlar json objesi olark gönderilir

//#endregion

app.use("/api/user", router); // Bütün değişikliklerimizi tek bir dosyaya yani index'e yolladık, tek bir yerde de kullanıyoruz.

app.listen(3000, () => {
  console.log(`App started on port : ${3000}`);
});
