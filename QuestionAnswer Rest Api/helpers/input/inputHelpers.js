const bcrypt = require('bcryptjs')

const validateUserInput=(email,password)=>{ // Login kontrolü için yazdığımız helper
    return email && password; // Burada birisi dolu olmasa bile false dönecek.
}


const comparePassword=(password,hashedPassword)=>{
    return bcrypt.compareSync(password,hashedPassword); // Hazır fonksiyon, 
    // hashedPassword'ü decode edip değerler uyuşuyor mu kontrol edecek,
    // doğruysa true dönecek.
}

module.exports ={validateUserInput,comparePassword}; // Modül şeklinde aktarım yapmak önemli.