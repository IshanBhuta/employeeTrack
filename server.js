'use strict';

const Hapi = require('hapi');
const UserClass = require('./user');
const serverConnection = require('./serverConnection');
const Good = require('good');
// Create a server with a host and port
const server = new Hapi.Server();  
// server.connection(serverConnection.dev);
server.connection(serverConnection.devServer);
const AuthBearer = require('hapi-auth-bearer-token');
const UtilityClass = require('./utilities/utility');
const constants = require('./config/constant');


const User = new UserClass();
const Utility = new UtilityClass();


// authenticating token

server.register(AuthBearer, (err) => {
 
    server.auth.strategy('advanceAuth', 'bearer-access-token', {
        allowQueryToken: false,              // optional, false by default 
        allowMultipleHeaders: false,        // optional, false by default 
        accessTokenName: 'access_token',    // optional, 'access_token' by default 
        validateFunc: function (token, callback) {
            // var userAuthenticated = Utility.authenticate(request, reply);
            // if (userAuthenticated) {
                return User.authorizationCheck(token,callback);
                reply.continue({currentUser : true})
            // }else{
            //     return reply(Utility.generateResponse(constants.UNAUTHORISED_ACCESS, "Un-Authorised", [])).code(401);
            // }
        }
    });

    const scheme = function (server, options) {

        return {
            authenticate: function (request, reply) {
                var userAuthenticated = Utility.authenticate(request, reply);
                if (userAuthenticated) {
                    reply.continue({credentials : true})
                }else{
                    return reply(Utility.generateResponse(constants.UNAUTHORISED_ACCESS, "Un-Authorised", [])).code(401);
                }
            }
        };
    };

    server.auth.scheme('custom', scheme);
    server.auth.strategy('default', 'custom');

    server.route({
        method: 'GET',

        path: '/check',
        config: {
        auth: 'default',
            handler: function (request, reply) {
                return reply("Okay");
            }
        }
    });

    // Add the route
    server.route({  
        method: 'GET',
        config: {
            handler: function (request, reply) {
                return reply('server working successfully');
            }
        },
        path:'/test',
    });

    // Add the route
    server.route({  
        method: 'POST',
        path:'/signUp',
        config : {
            auth : 'default',
            handler: function (request, reply) {
                return User.signUp(request, reply);
            }
        }
    })

    server.route({  
        method: 'POST',
        path:'/signIn',
        config : {
            auth : 'default',
            handler: function (request, reply) {
                return User.signIn(request, reply);
            }
        }
    })

    server.route({  
        method: 'POST',
        path:'/updateLocation',
        config : {
            auth : 'advanceAuth',
            handler: function (request, reply) {
                return User.updateLocation(request, reply);
            }
        }
    })


})

server.register({
    register: Good,
    options: {
        reporters: {
            console: [{
                module: 'good-squeeze',
                name: 'Squeeze',
                args: [{response: '*',log: '*'}]
            }, {
                module: 'good-console'
            }, 'stdout']
        }
    }
}, (err) => {

    if (err) {
        throw err; // something bad happened loading the plugin
    }

    server.start((err) => {
        if (err) {
            throw err;
        }
        server.log('info', 'Server running at: ' + server.info.uri);
    });
})