const { io } = require('socket.io-client');
const axios = require('axios');

const BACKEND = process.env.TEST_BACKEND || 'http://localhost:5001';
const CASE_ID = process.env.TEST_CASE_ID || 'test-case-1';

async function run() {
  console.log('Starting socket test...');

  // 두 클라이언트 생성
  const socketA = io(BACKEND, { transports: ['websocket'] });
  const socketB = io(BACKEND, { transports: ['websocket'] });

  socketA.on('connect', () => console.log('A connected', socketA.id));
  socketB.on('connect', () => console.log('B connected', socketB.id));

  socketA.on('chat:message', (msg) => {
    console.log('A received:', msg);
  });
  socketB.on('chat:message', (msg) => {
    console.log('B received:', msg);
  });

  // join
  socketA.emit('join', CASE_ID);
  socketB.emit('join', CASE_ID);

  // 잠깐 대기
  await new Promise((r) => setTimeout(r, 1000));

  // 테스트용 엔드포인트로 메시지 푸시
  try {
    const resp = await axios.post(`${BACKEND}/api/chat/${CASE_ID}/test-push`, {
      message: 'Hello from test script',
      senderId: 'script-client',
      senderRole: 'client',
    });
    console.log('test-push response:', resp.data?.ok);
  } catch (e) {
    console.error('test-push failed', e.toString());
  }

  // 대기하여 메시지 수신 로그 확인 후 종료
  await new Promise((r) => setTimeout(r, 2000));
  socketA.disconnect();
  socketB.disconnect();
  console.log('Test complete');
}

run().catch((e) => console.error(e));
