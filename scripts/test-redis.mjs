import 'dotenv/config';
import Redis from 'ioredis';

const url = process.env.REDIS_URL;
if (!url) {
  console.error('REDIS_URL is missing. Add it to your .env.');
  process.exit(1);
}

const r = new Redis(url);
try {
  const res = await r.ping();
  console.log('PING ->', res);
} catch (e) {
  console.error(e);
} finally {
  r.disconnect();
}
