var server = require('net').createServer().listen();

server.on('listening', function() {
    process.on('message', function(message) {
        if (message.type === 'shutdown') {
            server.close(function() {
                process.exit(0);
            });
        }
    });
});
