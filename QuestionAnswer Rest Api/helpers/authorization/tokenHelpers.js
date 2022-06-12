const sendJwtToClient=(user,res)=>{ // Kullanıcı kayıt olduğunda veya login olduğunda bu fonksiyon çalışıyor.
    // Generate JWT
    const token= user.generateJwtFromUser(); // Kullanıcı kayıt olduktan sonra kendisi için bir token üretiliyor.
    // Not : Bu fonksiyon instance'ı olmamasına rağmen UserSchema'ya ait bir fonksiyonu kullanıyor. İlla ki burada örneğini üretmemeize gerek yok. Kullanacağımız yerde yani
    // kullanıcının oluşturulduğu yerde kullanmamız yeterli.

    const {JWT_COOKIE,NODE_ENV}=process.env // Cookie expire süresini ve environment ortamını alıyoruz. if(env==='development') ise secure=false

    return res
    .status(200)
    .cookie("access_token",token,{ // name, value, settings{} name:value durumu olacak.
        httpOnly: true,
        expires:new Date(Date.now()+parseInt(JWT_COOKIE)*1000 * 60),
        secure:NODE_ENV ==="development"?false:true // secure true ise sadece https bağlantılarında çalışır, yani veriler şifrelenerek gönderilir.
    })
    .json({ // döndürdüğümüz data
        success:true,
        data:{
            name:user.name,
            email:user.email
        },
        access_token:token,

    })
}

const isTokenIncluded=(req)=>{ // Authorization yapılmadan giriş yapıldığında hata alınmıyor, undefined oluyor yine de hoşgeldin mesajı alıyor çünkü kontrol yapmıyoruz.
    return (req.headers.authorization && req.headers.authorization.startsWith('Bearer:'))
}

const getAccessTokenFromHeader=(req)=>{ // Header'dan token'ı alıyoruz. Frontend tarafından alıyoruz header'ı. Örneğin Postman
    const authorization=req.headers.authorization // Req=>Headers=>Authorization'ı seç
    const access_token=authorization.split(':')[1] // Bearer:token ayrımını yapıyoruz. Burada 0. index Bearer, 1. indeks ise tokenımız.
    // 1. indeksi seçip tokeni alıyoruz.
    return access_token
}

module.exports={sendJwtToClient,
    isTokenIncluded,
    getAccessTokenFromHeader
}