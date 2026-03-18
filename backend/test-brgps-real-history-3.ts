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
  
  // Let's create a specific timeframe for 2026-03-12
  const timeFrom = Math.floor(new Date('2026-03-11T00:00:00Z').getTime() / 1000);
  const timeTo = Math.floor(new Date('2026-03-13T00:00:00Z').getTime() / 1000);

  const headers = {
    api_token: user.brgpsToken,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    'Content-Type': 'application/json',
  };

  const attempt = async (path: string, qs: string) => {
    const u = `${user.brgpsBaseUrl}${path}?${qs}`;
    try {
        console.log("\nTrying: " + u);
        const res = await axios.get(u, { headers });
        console.log("Status:", res.status);
        console.log("Data full:", JSON.stringify(res.data, null, 2).substring(0, 1000));
    } catch(e: any) {
        console.log("Failed", u, e.response?.status, e.response?.data);
    }
  }

  // Maybe it's not a tag but a device?
  await attempt(`/device/history`, `imei=${id}&TimeFrom=${timeFrom}&TimeTo=${timeTo}`);
  await attempt(`/device/history`, `id=${id}&TimeFrom=${timeFrom}&TimeTo=${timeTo}`);
  
  // Or maybe coordinates?
  await attempt(`/location/history`, `imei=${id}&TimeFrom=${timeFrom}&TimeTo=${timeTo}`);
  
  // Tag history with exact case 'Id' as in docs
  await attempt(`/tag/history`, `Id=${id}&TimeFrom=${timeFrom}&TimeTo=${timeTo}`);
  await attempt(`/tag/history`, `imei=${id}&TimeFrom=${timeFrom}&TimeTo=${timeTo}`);
}

main().finally(() => prisma.$disconnect());
