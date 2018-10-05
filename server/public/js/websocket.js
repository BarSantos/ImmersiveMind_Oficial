// Script de comunicação entre a página web 
// e aplicação mobile que reproduz os videos

// Cria um websocket em que tem o IP associado 

//var socket;
/*
window.navigator.tcpPermission.requestPermission({remoteAddress:"192.168.1.79", remotePort:6321}).then(
  () =>{ socket = new TCPSocket("192.168.1.79", 6321);}

 // This function sends URL from the browser to the mobile 
function sendURL2Mobile()
{
    if(socket.readyState)
        socket.send('https://youtu.be/HqmBa8FPMx8'); 
        
}
*/
 var clients = null;

'use strict';
var net = require('net');

var server = net.createServer(function(socket) {
    socket.write('Echo server\r\n');
    clients = socket;
});

server.listen(6321, '192.168.1.74');

function sendURL2Mobile()
{
    if(clients != null)
        clients.write('https://www.youtube.com/watch?v=HqmBa8FPMx8'); 
}