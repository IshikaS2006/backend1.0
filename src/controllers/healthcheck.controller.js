import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asynchandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    res.status(200).json(new ApiResponse(true, "OK"))
})

export {
    healthcheck
    }
// This controller is used to handle health check requests
// It can be used to check if the server is running and responding correctly
// The health check endpoint can be used by load balancers or monitoring tools to ensure the server is healthy
// It can also be used to check if the database connection is working properly
// This controller can be extended in the future to include more health check logic if needed