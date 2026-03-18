import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { brgpsBaseUrl: { not: null }, brgpsToken: { not: null } }
  });
  
  if (!user) {
    console.log("No user with BRGPS credentials");
    return;
  }
  
  const tags = await prisma.tag.findMany({ where: { userId: user.id } });
  
  console.log("Found tags:", tags.length);
  
  if (tags.length === 0) return;
  
  const brgpsIds = tags.map(t => t.brgpsId).join(',');
  const url = `${user.brgpsBaseUrl}/tag?ids=${brgpsIds}`;
  console.log("Calling URL:", url);
  
  const headers = {
    api_token: user.brgpsToken,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    'Content-Type': 'application/json',
  };
  
  try {
    const response = await axios.get(url, { headers });
    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Response data:", JSON.stringify(error.response.data, null, 2));
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
