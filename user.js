
/*
*
*
*
*/
class User {
	constructor() {
		this.qb = require('./databaseConnector');
		this.moment = require('moment');
		this.utilityClass = require('./utilities/utility');
		this.constants = require('./config/constant');
	}
}

User.prototype.signUp = function(request, reply) {
	var self = this;
	var utcDate = new Date( this.moment.utc().format("Y-m-d H:i:s"));
	// var utility = new this.utility();
    var userObj = {
        "email" : request.payload.email,
        "password" : request.payload.password,
        "firstName" : request.payload.firstName,
        "lastName" : request.payload.lastName,
        "mobileNo" : request.payload.mobileNo,
        "deviceType" : request.payload.deviceType,
        "address" : request.payload.address,
        "role" : request.payload.role,
        "currentLocation" : request.payload.currentLocation,
        "description" : request.payload.description,
        "crd" : utcDate,
        "upd" : utcDate
    }


    // checking that user already exist
    self.utility = new self.utilityClass();
    self.qb.select('*').where({email: userObj.email}).limit(1).get('user', function(err,response) {
        if (err) {
        	// console.log("Query Ran: " + qb.last_query());
        	return console.error("Uh oh! Couldn't get results: " + err.msg); 
        }


        if (response.length > 0) {
            return reply(self.utility.returnReply(self.constants.SUCCESS, "Already Exist", [])).code(200);
            // return reply("User already exist");
        }else{
            self.qb.insert('user', userObj, function(err, res) {
                if (err) {
                    console.error(err);
            		return reply(self.utility.returnReply(self.constants.SUCCESS, "Something went wrong!!", [])).code(500);
                }
                else {
                    if (res.affectedRows > 0) {
                        var insertId = res.insertId;
                        console.log(insertId);
                        userObj.userId = insertId
            			return reply(self.utility.returnReply(self.constants.SUCCESS, "User added successfully", userObj)).code(200);
                        /*self.qb.get_where('user', {id: insertId}, function(err, res) {
                            self.qb.release();
                            console.dir(res);
                        });*/
                    }
                    else {
            			return reply(self.utility.returnReply(self.constants.ERROR, "Something went wrong", [])).code(500);
                    }
                }
            });
        }
    });
};

module.exports = User;