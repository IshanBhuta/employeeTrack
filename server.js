'use strict';

const Hapi = require('hapi');
// const UserClass = require('./user');
const serverConnection = require('./serverConnection');
const Good = require('good');
// Create a server with a host and port
const server = new Hapi.Server();  
server.connection(serverConnection.dev);


// const User = new UserClass();
// Add the route
server.route({  
    method: 'GET',
    path:'/test',
    handler: function (request, reply) {
        return reply('server working successfully');
    }
});

// Add the route
/*server.route({  
    method: 'POST',
    path:'/signUp',
    handler: function (request, reply) {
        return User.signUp(request, reply);
    }
});*/


server.register({
    register: Good,
    options: {
        reporters: {
            console: [{
                module: 'good-squeeze',
                name: 'Squeeze',
                args: [{
                    response: '*',
                    log: '*'
                }]
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
});


// Start the server
/*server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});*/

module.exports = server;