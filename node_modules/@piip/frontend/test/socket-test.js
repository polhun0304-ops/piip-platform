const io = require('socket.io-client');
const http = require('http');

const backend = process.env.BACKEND || 'http://localhost:5001';
const caseId = 'case-test-123';

console.log('Backend URL:', backend);

const clientA = io(backend, { transports: ['websocket'] });
const clientB = io(backend, { transports: ['websocket'] });

clientA.on('connect', () => console.log('A connected', clientA.id));
clientB.on('connect', () => console.log('B connected', clientB.id));

clientA.on('chat:message', (msg) => console.log('A received', JSON.stringify(msg)));
clientB.on('chat:message', (msg) => console.log('B received', JSON.stringify(msg)));

clientA.on('connect', () => clientA.emit('join', caseId));
clientB.on('connect', () => clientB.emit('join', caseId));

function postTestPush() {
  const data = JSON.stringify({ message: 'hello from test', senderId: 'script' });
  const options = {
    hostname: 'localhost',
    port: 5001,
    path: `/api/chat/${caseId}/test-push`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  };

  const req = http.request(options, (res) => {
    let buf = '';
    res.on('data', (d) => (buf += d));
    res.on('end', () => {
      console.log('POST response', res.statusCode, buf);
    });
  });

  req.on('error', (e) => console.error('POST error', e));
  req.write(data);
  req.end();
}

setTimeout(() => {
  console.log('Sending test push...');
  postTestPush();
}, 2000);

setTimeout(() => {
  console.log('Done, disconnecting');
  try {
    clientA.disconnect();
    clientB.disconnect();
  } catch (e) {}
  process.exit(0);
}, 8000);
