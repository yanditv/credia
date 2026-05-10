import { PrismaClient, Role, UserStatus, BusinessType, SourceType, RiskLevel } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('demo1234', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@credia.io' },
    update: {},
    create: {
      fullName: 'Administrador Credia',
      documentNumber: '9999999999',
      phone: '+593999999999',
      email: 'admin@credia.io',
      passwordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@credia.io' },
    update: {},
    create: {
      fullName: 'María García',
      documentNumber: '0123456789',
      phone: '+593990000000',
      email: 'demo@credia.io',
      passwordHash,
      role: Role.USER,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.businessProfile.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      businessName: 'Frutería La Mariscal',
      businessType: BusinessType.VENDOR,
      city: 'Quito',
      monthlyEstimatedIncome: '450.00',
      yearsActive: 3,
    },
  });

  const incomeRecords = [
    { amount: '25.00', sourceType: SourceType.DAILY_SALES, recordDate: new Date('2026-05-01') },
    { amount: '32.00', sourceType: SourceType.DAILY_SALES, recordDate: new Date('2026-05-02') },
    { amount: '18.50', sourceType: SourceType.DAILY_SALES, recordDate: new Date('2026-05-03') },
    { amount: '40.00', sourceType: SourceType.DAILY_SALES, recordDate: new Date('2026-05-04') },
    { amount: '28.00', sourceType: SourceType.DAILY_SALES, recordDate: new Date('2026-05-05') },
    { amount: '35.00', sourceType: SourceType.DAILY_SALES, recordDate: new Date('2026-05-06') },
    { amount: '22.00', sourceType: SourceType.DAILY_SALES, recordDate: new Date('2026-05-07') },
  ];

  const existingRecords = await prisma.incomeRecord.count({ where: { userId: demoUser.id } });
  if (existingRecords === 0) {
    for (const record of incomeRecords) {
      await prisma.incomeRecord.create({
        data: {
          userId: demoUser.id,
          ...record,
        },
      });
    }
  }

  const existingScore = await prisma.creditScore.count({ where: { userId: demoUser.id } });
  let creditScore: { id: string };
  if (existingScore === 0) {
    creditScore = await prisma.creditScore.create({
      data: {
        userId: demoUser.id,
        score: 642,
        riskLevel: RiskLevel.ACCEPTABLE,
        maxCreditAmount: '150.00',
        scoreHash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
        breakdown: {
          constantSales: 22,
          paymentHistory: 30,
          commercialReputation: 15,
          businessAge: 8,
          verifiedDocs: 6,
          usageBehavior: 10,
        },
      },
    });
  } else {
    creditScore = (await prisma.creditScore.findFirstOrThrow({ where: { userId: demoUser.id } }));
  }

  const existingRequests = await prisma.loanRequest.count({ where: { userId: demoUser.id } });
  let loanRequest: { id: string };
  if (existingRequests === 0) {
    loanRequest = await prisma.loanRequest.create({
      data: {
        userId: demoUser.id,
        requestedAmount: '100.00',
        termDays: 30,
        purpose: 'Ampliar inventario de frutas',
        status: 'APPROVED',
        scoreId: creditScore.id,
      },
    });
  } else {
    loanRequest = (await prisma.loanRequest.findFirstOrThrow({ where: { userId: demoUser.id } }));
  }

  const existingLoan = await prisma.loan.count({ where: { loanRequestId: loanRequest.id } });
  if (existingLoan === 0) {
    await prisma.loan.create({
      data: {
        userId: demoUser.id,
        loanRequestId: loanRequest.id,
        principalAmount: '100.00',
        interestAmount: '5.00',
        totalAmount: '105.00',
        status: 'ACTIVE',
      },
    });
  }

  console.log('✅ Seed completed');
  console.log('   Admin user: admin@credia.io (password: demo1234)');
  console.log('   Demo user: demo@credia.io (María García, password: demo1234)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
