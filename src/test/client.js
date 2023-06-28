const net = require('net');

const client = net.connect({port: 8765}, function () {
    console.log('connected to server!');
    client.write(JSON.stringify({
        "opcode": 0xA0,
        "data": {
            "username": "Thnks_CJ",
            "email": "admin@cjstevenson.com",
        }
    }));
});

client.on('data', function (data) {
    console.log(data.toString());
})

setInterval(function () {
    client.write(JSON.stringify({
        "opcode": 0xC1,
        "data": {
            "timestamp": Date.now(),
        }
    }));
}, 5000);