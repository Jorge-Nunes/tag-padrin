import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { brgpsBaseUrl: { not: null }, brgpsToken: { not: null } }
  });
  
  if (!user || !user.brgpsBaseUrl || !user.brgpsToken) return;

  const id = '3092505932';
  const timeFrom = Math.floor(new Date('2026-03-11T00:00:00Z').getTime()); // ms
  const timeTo = Math.floor(new Date('2026-03-13T00:00:00Z').getTime()); // ms

  const headers = {
    api_token: user.brgpsToken,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    'Content-Type': 'application/json',
  };

  const url = `${user.brgpsBaseUrl}/tag/history?Id=${id}&TimeFrom=${timeFrom}&TimeTo=${timeTo}`;
  
  try {
      console.log("\nTrying: " + url);
      const res = await axios.get(url, { headers });
      console.log("Status:", res.status);
      console.log("Data full:", JSON.stringify(res.data, null, 2).substring(0, 1000));
  } catch(e: any) {
      console.log("Failed", e.response?.status, e.response?.data);
  }
}
main().finally(() => prisma.$disconnect());
