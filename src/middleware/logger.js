const logger = (req, res, next) => {
    //console.log ("Hello, I am the logger");
    console.log(`\n\n${req.method}: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
    console.log('headers:');
    console.log(req.headers);
    console.log('body:');
    console.log(req.body);

    next();
}


export default logger;