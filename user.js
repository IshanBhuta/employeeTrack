
/*
*
*
*
*/
class User {
	constructor() {
		this.qb = require('./databaseConnector');
		this.moment = require('moment');
		this.UtilityClass = require('./utilities/utility');
        this.constants = require('./config/constant');
        this.underscore = require('underscore');
        this.uuidV4 = require('uuid/v4');
        var cryptr = require('cryptr');
        this.Cryptr = new cryptr('employeeTrack');
	}
}

User.prototype.signUp = function(request, reply) {
	var self = this;
	// var Utility = new this.Utility();
    var userObj = {
        "email" : request.payload.email,
        "password" : this.Cryptr.encrypt(request.payload.password),
        "firstName" : request.payload.firstName,
        "lastName" : request.payload.lastName,
        "mobileNo" : request.payload.mobileNo,
        "deviceType" : request.payload.deviceType,
        "address" : request.payload.address,
        "authToken" : this.uuidV4(),
        "role" : request.payload.role,
        "currentLocation" : request.payload.currentLocation,
        "description" : request.payload.description,
        "crd" : this.moment.utc().format("YYYY-MM-DD HH:mm:ss"),
        "upd" : this.moment.utc().format("YYYY-MM-DD HH:mm:ss")
    }


    // checking that user already exist
    self.Utility = new self.UtilityClass();
    self.qb.select('*').where({email: userObj.email}).limit(1).get('user', function(err,response) {
        if (err) {
        	// console.log("Query Ran: " + qb.last_query());
        	return console.error("Uh oh! Couldn't get results: " + err); 
        }


        if (response.length > 0) {
            return reply(self.Utility.generateResponse(self.constants.SUCCESS, "Already Exist", [])).code(200);
            // return reply("User already exist");
        }else{
            self.qb.insert('user', userObj, function(err, res) {
                if (err) {
                    console.error(err);
            		return reply(self.Utility.generateResponse(self.constants.SUCCESS, "Something went wrong!!", [])).code(500);
                }
                else {
                    if (res.affectedRows > 0) {
                        var insertId = res.insertId;
                        delete userObj.password;
                        userObj.userId = insertId
            			return reply(self.Utility.generateResponse(self.constants.SUCCESS, "User added successfully", userObj)).code(200);
                        /*self.qb.get_where('user', {id: insertId}, function(err, res) {
                            self.qb.release();
                            console.dir(res);
                        });*/
                    }
                    else {
            			return reply(self.Utility.generateResponse(self.constants.ERROR, "Something went wrong", [])).code(500);
                    }
                }
            });
        }
    });
};

User.prototype.signIn = function(request, reply) {
    var self = this;
    var utcDate = this.moment.utc().valueOf();
    


    // checking that user already exist
    self.Utility = new self.UtilityClass();
    self.qb.select('id as userId, email, authToken, firstName, lastName, deviceType, role, crd, upd').where({
        email: request.payload.email,
        password: this.Cryptr.encrypt(request.payload.password)
    }).limit(1).get('user', function(err,response) {
        if (err) {
            // console.log("Query Ran: " + qb.last_query());
            return console.error("Uh oh! Couldn't get results: " + err); 
        }

        if (response.length > 0) {
            var authToken = self.uuidV4();
            var userObj = response;
            userObj.authToken = authToken;
            console.log(userObj)
            // response.authToken = authToken;
            self.qb.update('user', {"authToken" : authToken}, {id: response.userId}, function(err, res) {
                if (response.length > 0) {
                    console.log("****************")
                } else {
                    this.qb.release();
                }
            });
            return reply(self.Utility.generateResponse(self.constants.SUCCESS, "Login Success", userObj)).code(200);
        }else{
            return reply(self.Utility.generateResponse(self.constants.SUCCESS, "Incorrect Email OR Password", [])).code(201);
        }
    });
};

User.prototype.authorizationCheck = function (token, callback) {

    // For convenience, the request object can be accessed 
    // from `this` within validateFunc. 
    var request = this;

    // Use a real strategy here, 
    // comparing with a token from your database for example 
    if (token === "employTracking") {
        return callback(null, true, { token: token });
    }

    return callback(null, false, { token: token }, { artifact1: 'an artifact' });
}

module.exports = User;