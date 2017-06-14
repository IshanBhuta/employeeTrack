'use strict';

const Hapi = require('hapi');

var settings = {
    host: 'employeetrack.cwsongchh825.us-east-2.rds.amazonaws.com',
    database: 'employee_tracking',
    user: 'vsi_tech',
    password: 'Mp09mx.6140'
};

var qb = require('node-querybuilder').QueryBuilder(settings, 'mysql', 'single');
var moment = require('moment');

// Create a server with a host and port
const server = new Hapi.Server();  
const port = 3000;
server.connection({  
    host: 'localhost',
    port: port
});

// Add the route
server.route({  
    method: 'GET',
    path:'/test',
    handler: function (request, reply) {
        return reply('server working successfully');
    }
});

// Add the route
server.route({  
    method: 'POST',
    path:'/signUp',
    handler: function (request, reply) {
        // console.log(request.payload);
        var utcDate = new Date( moment.utc().format("Y-m-d H:i:s"));
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

        // console.log(userObj)

        qb.select('*')
            .where({email: userObj.email})
            .limit(1)
            .get('user', function(err,response) {
                if (err) return console.error("Uh oh! Couldn't get results: " + err.msg); 
                // console.log("Query Ran: " + qb.last_query());
                if (response.length > 0) {
                    reply("User already exist")
                }else{
                    qb.insert('user', userObj, function(err, res) {
                        if (err) {
                            console.error(err);
                            reply('Something went wrong!!');
                        }
                        else {
                            if (res.affectedRows > 0) {
                                var insertId = res.insertId;
                                console.log(insertId);
                                userObj.userId = insertId
                                reply({
                                    responseCode : 200,
                                    message : "User Added Successfully",
                                    data : userObj
                                });
                                /*qb.get_where('user', {id: insertId}, function(err, res) {
                                    qb.release();
                                    console.dir(res);
                                });*/
                            }
                            else {
                                console.error("New user was not added to database!");
                            }
                        }
                    });
                }
            }
        );
    }
});


// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});