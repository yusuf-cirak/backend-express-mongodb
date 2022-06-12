class CustomError extends Error {
    constructor(message,status){
        super(message) // Error prototype'ından ctoruna ulaşup mesajı alacak.
        this.status=status;
    }

}

module.exports=CustomError;