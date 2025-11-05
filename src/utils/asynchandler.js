// const asyncHandler = ()  => {};
// const asyncHandler = () => {() => {}}; 
// const asyncHandler = () => () => {};


// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         res.status(error.code || 500).json({ message: error.message, success: false });
//     }
// };
export const asynchandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch(next);
    };
};
