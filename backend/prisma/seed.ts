import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const DEMO_EMAIL = process.env.DEMO_EMAIL ?? "demo@careerpilot.dev";
export const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "Demo1234!";

async function main() {
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { password: hashedPassword, verified: true },
    create: {
      name: "Demo User",
      email: DEMO_EMAIL,
      password: hashedPassword,
      verified: true,
    },
  });

  await prisma.application.deleteMany({ where: { userId: user.id } });

  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

  const applications = await Promise.all([
    prisma.application.create({
      data: {
        userId: user.id,
        company: "Nimbus Analytics",
        position: "Senior Frontend Engineer",
        status: "INTERVIEW",
        location: "Remote",
        salary: "$135k",
        applicationDate: daysAgo(9),
        notes: "Recruiter reached out via LinkedIn. Team seems friendly, stack is React + TypeScript.",
      },
    }),
    prisma.application.create({
      data: {
        userId: user.id,
        company: "Northwind Robotics",
        position: "Full Stack Developer",
        status: "APPLIED",
        location: "Austin, TX",
        salary: "$120k",
        applicationDate: daysAgo(5),
      },
    }),
    prisma.application.create({
      data: {
        userId: user.id,
        company: "Bluepeak Systems",
        position: "Backend Engineer",
        status: "ASSESSMENT",
        location: "Remote",
        salary: "$128k",
        applicationDate: daysAgo(3),
      },
    }),
    prisma.application.create({
      data: {
        userId: user.id,
        company: "Wave & Co",
        position: "Product Engineer",
        status: "OFFER",
        location: "New York, NY",
        salary: "$150k",
        applicationDate: daysAgo(21),
      },
    }),
    prisma.application.create({
      data: {
        userId: user.id,
        company: "Cedar Labs",
        position: "Software Engineer",
        status: "SAVED",
        location: "Remote",
        salary: "$110k",
      },
    }),
    prisma.application.create({
      data: {
        userId: user.id,
        company: "Fieldstone Health",
        position: "Frontend Developer",
        status: "REJECTED",
        location: "Chicago, IL",
        applicationDate: daysAgo(30),
      },
    }),
  ]);

  const interviewApp = applications[0];
  await prisma.interview.deleteMany({ where: { application: { userId: user.id } } });
  await prisma.interview.create({
    data: {
      applicationId: interviewApp.id,
      date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      location: "Video call (Google Meet)",
      notes: "Final round with the engineering manager.",
    },
  });

  console.log(`Seeded demo user ${DEMO_EMAIL} with ${applications.length} applications.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
