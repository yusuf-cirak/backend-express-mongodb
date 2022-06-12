const CustomError = require("../../helpers/error/CustomError");

const customErrorHandler = (err, req, res, next) => { // Bir hata olduğunda buraya yönlendiriliyor. ExpressJs yapısı anlıyor bu yüzden herhangi bir yönlendirme yapmamıza gerek yok.
  // Yazdığımız fonksiyonlarda err olmadığı için yönlendiriyor olabilir.
  let customError = err;
  console.log(err);

  if (err.name === "SyntaxError") {
    customError = new CustomError(err.message,400);
  }

  if (err.name === "ValidationError") {
    customError = new CustomError(err.message, 400);
  }
  // console.log(customError.message,customError.status)

  if (err.code===11000) { // 11000 kodlu MongoError'ı
    // Duplicate key
    customError = new CustomError("Duplicate key found",400) // 400 Bad Request
  }

  if (err.name==="CastError") customError=new CustomError("Please provide a valid id",400)

  res.status(customError.status || 500).json({
    success: false,
    message: customError.message
  });
};

module.exports = {
  customErrorHandler,
};
