const multer=require('multer');
const path=require('path');
const CustomError=require('../../helpers/error/CustomError')


// Storage , FileFilter

const storage=multer.diskStorage({ // Yüklenecek olan dosya sunucu dosyalarının içinde olacak. multer paketinin storage methodu yardımıyla dosya yolunu ve ismini belirliyoruz.
    destination:function(req,file,callback){
        const rootDir=path.dirname(require.main.filename) // server.js'in yerini bulan kod
        callback(null,path.join(rootDir,"/public/uploads")) // Başta null olmasının sebebi hata olmaması. Callback konusuna bakabilirsin.
    },
    filename:function(req,file,callback){
        // File - Mimetype - image/png
        const extension=file.mimetype.split('/')[1] // image 0. index, png 1. index
        req.savedProfileImage="image_"+req.user.id+"."+extension
        callback(null,req.savedProfileImage)
    }
})

const fileFilter=(req,file,callback)=>{ // Yüklenecek dosyayı filtreliyoruz.
    let allowedMimeTypes=["image/png","image/jpeg","image/gif","image/jpg"]
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return callback(new CustomError("Please provide a valid image file",400),false) // İşleme devam etmememiz gerektiği için false değerini verdik.
    }

    return callback(null,true)
}

const profileImageUpload=multer({storage,fileFilter});

module.exports = {profileImageUpload}