import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const tags = [
  "movies","gaming","music","fitness","coding","ai","travel","food","books","art",
  "photography","fashion","football","basketball","tennis","yoga","startups","crypto",
  "investing","science","history","philosophy","cars","bikes","hiking","camping",
  "cooking","baking","board games","anime","manga","kpop","jazz","metal","classical",
  "hip hop","design","ux","productivity","learn languages","cats","dogs","memes",
  "gardening","DIY","3d printing","arduino","raspberry pi","chess","coffee","tea"
].map(s => s.toLowerCase());

await Promise.all(tags.map(name =>
  prisma.interest.upsert({ where: { name }, update: {}, create: { name } })
));

console.log(`Seeded ${tags.length} interests.`);
await prisma.$disconnect();
