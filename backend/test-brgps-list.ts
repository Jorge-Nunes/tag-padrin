import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { brgpsBaseUrl: { not: null }, brgpsToken: { not: null } }
  });
  
  if (!user) return;

  const url1 = `${user.brgpsBaseUrl}/device/list`;
  const url2 = `${user.brgpsBaseUrl}/tags`;
  const url3 = `${user.brgpsBaseUrl}/device`;
  
  const headers = {
    api_token: user.brgpsToken,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    'Content-Type': 'application/json',
  };

  const attempt = async (url: string) => {
    try {
        console.log("Trying: " + url);
        const res = await axios.get(url, { headers });
        console.log("Status:", res.status);
        if (res.data) {
           console.log("Success with", url);
           console.log("Data sample:", JSON.stringify(res.data).substring(0, 500));
        }
    } catch(e: any) {
        console.log("Failed", url, e.response?.status);
    }
  };

  await attempt(url1);
  await attempt(url2);
  await attempt(url3);
  
  // also let's just re-try the auth to see if token is valid?
}

main().finally(() => prisma.$disconnect());
