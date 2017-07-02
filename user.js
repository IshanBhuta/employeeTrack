
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
        let cryptr = require('cryptr');
        this.Cryptr = new cryptr('employeeTrack');
        this.Promise = require('promise');
	}
}

User.prototype.signUp = function(request, reply) {
	let self = this;
	// let Utility = new this.Utility();
    let latLngArr = request.payload.currentLocation.split(',');
    let userObj = {
        "email" : request.payload.email,
        "password" : this.Cryptr.encrypt(request.payload.password),
        "firstName" : request.payload.firstName,
        "lastName" : request.payload.lastName,
        "mobileNo" : request.payload.mobileNo,
        "deviceType" : request.payload.deviceType,
        "address" : request.payload.address,
        "authToken" : this.uuidV4(),
        "role" : request.payload.role,
        "lat" : latLngArr[0],
        "lng" : latLngArr[1],
        "description" : request.payload.description,
        "crd" : this.moment.utc().format("YYYY-MM-DD HH:mm:ss"),
        "upd" : this.moment.utc().format("YYYY-MM-DD HH:mm:ss")
    }


    // checking that user already exist
    self.Utility = new self.UtilityClass();
    self.qb.select('*').where({email: userObj.email}).limit(1).get('user', function(err,response) {
        if (err) {
            return console.error("Uh oh! Couldn't get results: " + err); 
        }


        if (response.length > 0) {
            return reply(self.Utility.generateResponse(self.constants.SUCCESS, "Already Exist", [])).code(200);
            // return reply("User already exist");
        }else{
            self.qb.insert('user', userObj, function(err, res) {
                if (err) {
                    return reply(self.Utility.generateResponse(self.constants.SUCCESS, "Something went wrong!!", [])).code(500);
                }
                else {
                    if (res.affectedRows > 0) {
                        let insertId = res.insertId;
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
    let self = this;
    let utcDate = this.moment.utc().valueOf();
    


    // checking that user already exist
    self.Utility = new self.UtilityClass();
    self.qb.select('user.id as userId, email, authToken, firstName, lastName, user.lat as userLat, user.lng as userLng, deviceType, role, firm.id as firmId, firm.name as firmName, firm.lat as firmLat, firm.lng as firmLng, user.crd, user.upd')
    .join('firm_employees', 'firm_employees.employeeId = user.id', 'left')
    .join('firm', 'firm_employees.firmId = firm.id', 'left')
    .where({
        email: request.payload.email,
        password: this.Cryptr.encrypt(request.payload.password)
    }).limit(1).get('user', function(err,response) {
        if (err) {
            // console.log("Query Ran: " + qb.last_query());
            return console.error("Uh oh! Couldn't get results: " + err); 
        }

        if (response.length > 0) {
            let currentUser = response[0];
            let distanceObj = self.getDistance(currentUser.firmLat, currentUser.firmLng, request.payload.lat, request.payload.lng);
            currentUser['distanceNow'] = distanceObj.distance + ' ' + distanceObj.metric
            if (distanceObj.distance < 1) {
                currentUser['underRadius'] = true;
            }else{
                currentUser['underRadius'] = false;
            }

            return reply(self.Utility.generateResponse(self.constants.SUCCESS, "Login Success", currentUser)).code(200);
        }else{
            return reply(self.Utility.generateResponse(self.constants.SUCCESS, "Incorrect Email OR Password", [])).code(201);
        }
    });
};

User.prototype.updateLocation = function(request, reply) {
    let self = this;
    let currentUser = request.auth.credentials.currentUser;
    self.Utility = new self.UtilityClass();
    let latLngArr = request.payload.currentLocation.split(',');
    let updObj = {
        "lat" : latLngArr[0],
        "lng" : latLngArr[1],
        "upd" : this.moment.utc().format("YYYY-MM-DD HH:mm:ss"),
    }

    let condition = {id:request.auth.credentials.currentUser.userId}
    self.qb.update('user', updObj, condition, function(err, res) {
        if (err) {
            return reply(self.Utility.generateResponse(self.constants.ERROR, "Something went wrong", [])).code(201);
        }

        // getting distance between the user and his workplace
        let distanceObj = self.getDistance(currentUser.firmLat, currentUser.firmLng, updObj.lat, updObj.lng);
        currentUser['distanceNow'] = distanceObj.distance + ' ' + distanceObj.metric
        if (distanceObj.distance < 1) {
            currentUser['underRadius'] = true;
        }else{
            currentUser['underRadius'] = false;
        }
        

        return reply(self.Utility.generateResponse(self.constants.SUCCESS, "location Updated successfully", currentUser)).code(200);
    });
};

User.prototype.authorizationCheck = function (token, callback) {

    // For convenience, the request object can be accessed 
    // from `this` within validateFunc. 
    let self = this;

    // Use a real strategy here, 
    // comparing with a token from your database for example 
    self.qb.select('user.id as userId, email, authToken, firstName, lastName, user.lat as userLat, user.lng as userLng, deviceType, role, firm.id as firmId, firm.name as firmName, firm.lat as firmLat, firm.lng as firmLng, user.crd, user.upd')
    .join('firm_employees', 'firm_employees.employeeId = user.id', 'left')
    .join('firm', 'firm_employees.firmId = firm.id', 'left')
    .where({
        authToken: token
    }).limit(1).get('user', function(err,response) {
        if (err) {
            return reply("Uh oh! Couldn't get results: " + err); 
        }else{
            return callback(null, true, {currentUser:response[0]});
        }
    });

    // return callback(null, false, { token: token }, { artifact1: 'an artifact' });
}

User.prototype.getDistance = function(lat1,lon1,lat2,lon2) {
    let R = 6371; // Radius of the earth in km
    let dLat = deg2rad(lat2-lat1);
    let dLon = deg2rad(lon2-lon1); 
    let a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    let d = R * c; // Distance in km
    
    let resp = {
        "distance" : Math.round(d),
        "metric" : (R == 6371) ? "KM" : "M",
    };
    return resp;

};

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

module.exports = User;