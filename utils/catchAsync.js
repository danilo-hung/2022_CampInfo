const catchAsync = (func) => {
    return function(req, res, next){
        func(req, res, next).catch(next);
    }
}

module.exports = catchAsync;

// //in tutorial it use shorter code
// module.exports = func => {
//     return function(req, res, next){
//         func(req, res, next).catch(next);
//     }
// }