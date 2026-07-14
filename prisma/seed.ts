import { PrismaClient, Role } from "@prisma/client";
import { loadEnvConfig } from "@next/env";
import bcrypt from "bcryptjs";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@opencloud.local";
  const adminName = process.env.SEED_ADMIN_NAME ?? "OpenCloud Admin";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const demoUsers = [
    {
      email: "rakib@gmail.com",
      name: "Rakib",
      password: "111111",
      role: Role.USER
    },
    {
      email: "rimon@gmail.com",
      name: "Rimon",
      password: "111111",
      role: Role.USER
    }
  ];

  if (adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        name: adminName,
        passwordHash,
        role: Role.ADMIN,
        isActive: true
      },
      create: {
        email: adminEmail,
        name: adminName,
        passwordHash,
        role: Role.ADMIN,
        preferences: {
          create: {
            theme: "dark",
            sidebarCollapsed: false,
            tableDensity: "comfortable",
            defaultRefreshSeconds: 15,
            tablePageSize: 20
          }
        }
      }
    });
  }

  for (const demoUser of demoUsers) {
    const passwordHash = await bcrypt.hash(demoUser.password, 12);

    await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {
        name: demoUser.name,
        passwordHash,
        role: demoUser.role,
        isActive: true
      },
      create: {
        email: demoUser.email,
        name: demoUser.name,
        passwordHash,
        role: demoUser.role,
        isActive: true,
        preferences: {
          create: {
            theme: "dark",
            sidebarCollapsed: false,
            tableDensity: "comfortable",
            defaultRefreshSeconds: 15,
            tablePageSize: 20
          }
        }
      }
    });
  }

  await prisma.applicationSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      defaultPageSize: 20,
      defaultRegion: process.env.OPENSTACK_DEFAULT_REGION ?? "RegionOne",
      defaultProject: null,
      sessionTimeoutMinutes: 60,
      defaultRefreshSeconds: 15,
      estimatedBillingCurrency: "USD",
      dateTimeFormat: "yyyy-MM-dd HH:mm",
      notificationDefaults: {
        operationFailed: true,
        serviceUnavailable: true,
        quotaWarning: true
      }
    }
  });

  await prisma.pricingRule.createMany({
    skipDuplicates: true,
    data: [
      {
        name: "Default vCPU hourly estimate",
        service: "nova",
        resourceType: "vcpu",
        unit: "VCPU_HOUR",
        unitPrice: "0.025",
        currency: "USD"
      },
      {
        name: "Default RAM hourly estimate",
        service: "nova",
        resourceType: "ram_gb",
        unit: "GB_RAM_HOUR",
        unitPrice: "0.008",
        currency: "USD"
      },
      {
        name: "Default block storage monthly estimate",
        service: "cinder",
        resourceType: "volume_gb",
        unit: "GB_STORAGE_MONTH",
        unitPrice: "0.10",
        currency: "USD"
      },
      {
        name: "Default floating IP hourly estimate",
        service: "neutron",
        resourceType: "floating_ip",
        unit: "FLOATING_IP_HOUR",
        unitPrice: "0.004",
        currency: "USD"
      }
    ]
  });
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
