import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { brgpsBaseUrl: { not: null }, brgpsToken: { not: null } }
  });
  
  if (!user || !user.brgpsBaseUrl || !user.brgpsToken) return;

  const headers = {
    api_token: user.brgpsToken,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    'Content-Type': 'application/json',
  };

  try {
      const u = `${user.brgpsBaseUrl}/tag`;
      console.log("\nTrying: " + u);
      const res = await axios.get(u, { headers });
      console.log("Status:", res.status);
      console.log("Data full:", JSON.stringify(res.data, null, 2).substring(0, 1000));
  } catch(e: any) {
      console.log("Failed", e.response?.status, e.response?.data);
  }
}

main().finally(() => prisma.$disconnect());
