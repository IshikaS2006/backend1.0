class ApiResponse {
    constructor(
        statusCode,
        message = "Operation successful",
        data = null
    ) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode >= 200 && statusCode < 300;
    }
}
export default ApiResponse;
