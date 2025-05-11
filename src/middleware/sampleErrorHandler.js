const sampleHandler = (err, req, res, next) =>{
    console.log("IN Error Handler")
    const statusCode = res.statusCode? res.statusCode:500;
    res.status(statusCode).json({
        message: err.message,
        stackTrace: err.stack
    });
};

module.exports = sampleHandler;