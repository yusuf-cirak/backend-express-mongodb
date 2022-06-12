const asyncErrorWrapper=require('express-async-handler');
const { populateHelper,paginationHelper } = require('./queryMiddlewareHelpers');

const answerQueryMiddleware=function(model,options){
    return asyncErrorWrapper(async function(req,res,next){
        const {id}=req.params // Answer almak için önce question'ı almak gerek. getSingleQuestion'da id ile question'ı alıyoruz.
        const arrayName="answers";

        const total=await model.findById(id)["answerCount"]

        const paginationResult=await paginationHelper(total,undefined,req)

        const startIndex=paginationResult.startIndex // Bunu alabilmek için queryMiddlewareHelpers'da startIndex özelliğini döndük
        const limit=paginationResult.limit // Bunu alabilmek için queryMiddlewareHelpers'da startIndex özelliğini döndük
// model göndermeyeceğimiz için skip ve limit methodunu kullanamıyoruz. slice kullanıp işi halletmeye çalışacağız.
        let queryObject={}
        // $slice bir projection'dır. kullanımı için mongodb slice yazabilirsin.
        queryObject[arrayName]={$slice:[startIndex,limit]} // array'in startindex'ten itibaren limit değeri kadar almamızı sağlayacak. örn [1]'den başlayıp 2 adet almamız gerekirse => [1],[2] almış oluruz.

        let query=model.find({_id:id},queryObject)

        query=populateHelper(query,options.population)

        const queryResults=await query;
        console.log(query)

        req.queryResults={
            success:true,
            pagination:paginationResult.pagination,
            data:queryResults
        }
      next();
    })

}

module.exports={answerQueryMiddleware}