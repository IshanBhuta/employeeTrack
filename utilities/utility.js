class Utility {}

Utility.prototype.generateResponse = function(status, message, data) {
	switch(status) {
	    case "Success":
	    	return {message : message, status : status, data : data, statusCode : 200}
	    break;
	    
	    case "Error":
	    	return {message : message, status : status, data : data, statusCode : 300}
	    break;
	    
	    default:
	    	return {message : message, status : status, data : data, statusCode : 401};

	}
};

Utility.prototype.authenticate = function (request, reply) {
    const req = request.raw.req;
    const api_key = req.headers.api_key;
    if (api_key != 'api_key') {
    	return false;
    }else{
    	return true;
    }
}

module.exports = Utility;