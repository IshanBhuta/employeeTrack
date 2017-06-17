'use strict';

const Hapi = require('hapi');
const UserClass = require('./user');
const serverConnection = require('./serverConnection');
// Create a server with a host and port
const server = new Hapi.Server();  
server.connection(serverConnection.devServer);


const User = new UserClass();
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
        return User.signUp(request, reply);
    }
});


// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});