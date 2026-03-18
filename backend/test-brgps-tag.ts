import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { brgpsBaseUrl: { not: null }, brgpsToken: { not: null } }
  });
  
  if (!user) return;

  const url = `${user.brgpsBaseUrl}/tag?ids=3092510800`;
  
  const headers = {
    api_token: user.brgpsToken,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    'Content-Type': 'application/json',
  };

  try {
      console.log("Trying: " + url);
      const res = await axios.get(url, { headers });
      console.log("Status:", res.status);
      console.log("Data full:", JSON.stringify(res.data, null, 2));
  } catch(e: any) {
      console.log("Failed", url, e.response?.status, e.response?.data);
  }
}

main().finally(() => prisma.$disconnect());
