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

  const id = '3092505932'; // The ID you provided
  
  // Set timeframe specifically around 2026-03-12
  // We'll just be generous, e.g., 3 days span around now
  const timeTo = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
  const timeFrom = timeTo - (3 * 24 * 60 * 60); // 3 days ago

  const headers = {
    api_token: user.brgpsToken,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    'Content-Type': 'application/json',
  };

  const attempt = async (u: string) => {
    try {
        console.log("\nTrying: " + u);
        const res = await axios.get(u, { headers });
        console.log("Status:", res.status);
        console.log("Data full:", JSON.stringify(res.data, null, 2).substring(0, 1000));
    } catch(e: any) {
        console.log("Failed", u, e.response?.status, e.response?.data);
    }
  }

  // Test variations of parameters based on the documentation screenshot
  await attempt(`${user.brgpsBaseUrl}/tag/history?Id=${id}&TimeFrom=${timeFrom}&TimeTo=${timeTo}`);
  await attempt(`${user.brgpsBaseUrl}/tag/history?id=${id}&TimeFrom=${timeFrom}&TimeTo=${timeTo}`);
  await attempt(`${user.brgpsBaseUrl}/tag/history?imei=${id}&TimeFrom=${timeFrom}&TimeTo=${timeTo}`);
  
  // Also try passing as strings instead of numbers just in case? Or passing in body? The doc said query.
}

main().finally(() => prisma.$disconnect());
