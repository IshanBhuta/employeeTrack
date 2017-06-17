'use strict';

const Hapi = require('hapi');
const UserClass = require('./user');
const serverConnection = require('./serverConnection');
const Good = require('good');
// Create a server with a host and port
const server = new Hapi.Server();  
server.connection(serverConnection.dev);
const AuthBearer = require('hapi-auth-bearer-token');


const User = new UserClass();


// authenticating token

server.register(AuthBearer, (err) => {
 
    server.auth.strategy('simple', 'bearer-access-token', {
        allowQueryToken: false,              // optional, false by default 
        allowMultipleHeaders: false,        // optional, false by default 
        accessTokenName: 'access_token',    // optional, 'access_token' by default 
        validateFunc: function (token, callback) {
            return User.authorizationCheck(token,callback);
        }
    });

    // Add the route
    server.route({  
        method: 'GET',
        config: {
           auth: 'simple',
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
            auth : 'simple',
            handler: function (request, reply) {
                return User.signUp(request, reply);
            }
        }
    });
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