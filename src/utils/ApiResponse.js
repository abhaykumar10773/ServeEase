class ApiResponse{
    constructor(statusCode,data,message = "Success"){
        this.statusCode = data
        this.data = data 
        this.message = message
        this.success = statusCode < 400
    }
}

export {ApiResponse}