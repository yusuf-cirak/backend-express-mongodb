const express=require('express');
const dotenv=require("dotenv");
const path=require("path"); // Express'in içerisinde olan bir paket.

const routers=require("./routers/index.js");
const {connectDatabase} = require('./helpers/database/connectDatabase'); // Bu kod ise connectDatabase fonksiyonunu.
// const connectDatabase = require('./helpers/database/connectDatabase'); Bu kod dosyayı dahil ediyor.
const {customErrorHandler} = require('./middlewares/errors/customErrorHandler')


// Environment variables
dotenv.config({
    path:"./config/env/config.env"
})



connectDatabase();

const app=express();

app.use(express.json()) // Response'ları json olarak alabilmek için.


const port=process.env.port;






// Routers Middleware

app.use("/api",routers); // Bütün değişikliklerimizi tek bir dosyaya yani index'e yolladık, tek bir yerde de kullanıyoruz.

app.use(customErrorHandler);

// Static Files (middleware)
app.use(express.static(path.join(__dirname,"public"))) // Statik dosyaları okuyabilmek için


app.listen(port,()=>{
    console.log(`App started on ${port} : ${process.env.NODE_ENV}`)
})