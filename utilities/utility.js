class Utility {}

Utility.prototype.returnReply = function(status, message, data) {
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

module.exports = Utility;