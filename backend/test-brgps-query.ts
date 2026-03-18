import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { brgpsBaseUrl: { not: null }, brgpsToken: { not: null } }
  });
  
  if (!user) return;

  const url = `${user.brgpsBaseUrl}/tag?imei=3092510800`;
  const url2 = `${user.brgpsBaseUrl}/tag?imeis=3092510800`;
  const url3 = `${user.brgpsBaseUrl}/tag?id=3092510800`;
  const url4 = `${user.brgpsBaseUrl}/tag?mac=3092510800`;
  
  const headers = {
    api_token: user.brgpsToken,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    'Content-Type': 'application/json',
  };

  const attempt = async (u: string) => {
    try {
        console.log("Trying: " + u);
        const res = await axios.get(u, { headers });
        console.log("Status:", res.status);
        console.log("Data full:", JSON.stringify(res.data, null, 2));
    } catch(e: any) {
        console.log("Failed", u, e.response?.status, e.response?.data);
    }
  }

  await attempt(url);
  await attempt(url2);
  await attempt(url3);
  await attempt(url4);
}

main().finally(() => prisma.$disconnect());
