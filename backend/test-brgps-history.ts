import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { brgpsBaseUrl: { not: null }, brgpsToken: { not: null } }
  });
  
  if (!user || !user.brgpsBaseUrl || !user.brgpsToken) {
    console.log("No user with brgps credentials found.");
    return;
  }

  const id = '3092505932';
  const timeTo = Math.floor(Date.now() / 1000); // Current time in seconds
  const timeFrom = timeTo - (24 * 60 * 60); // 24 hours ago in seconds

  const url = `${user.brgpsBaseUrl}/tag/history?Id=${id}&TimeFrom=${timeFrom}&TimeTo=${timeTo}`;
  
  const headers = {
    api_token: user.brgpsToken,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    'Content-Type': 'application/json',
  };

  try {
      console.log("Trying: " + url);
      const res = await axios.get(url, { headers });
      console.log("Status:", res.status);
      console.log("Data:", JSON.stringify(res.data, null, 2).substring(0, 1000));
  } catch(e: any) {
      console.log("Failed", url, e.response?.status, e.response?.data);
  }
}

main().finally(() => prisma.$disconnect());
