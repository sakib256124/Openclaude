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
      role: Role.DEVELOPER
    },
    {
      email: "rimon@gmail.com",
      name: "Rimon",
      password: "111111",
      role: Role.VIEWER
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
      defaultRegion: process.env.MULTIPASS_DEFAULT_HOST ?? "localhost",
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

  await prisma.machineImage.upsert({
    where: { slug: "ubuntu-24.04-server" },
    update: {
      name: "Ubuntu 24.04 LTS",
      operatingSystem: "Ubuntu",
      version: "24.04",
      visibility: "PUBLIC",
      status: "AVAILABLE"
    },
    create: {
      imageId: "ami-ubuntu-2404",
      name: "Ubuntu 24.04 LTS",
      slug: "ubuntu-24.04-server",
      operatingSystem: "Ubuntu",
      version: "24.04",
      visibility: "PUBLIC",
      status: "AVAILABLE",
      description: "Default Ubuntu 24.04 image launched through Multipass."
    }
  });

  await prisma.machineImage.upsert({
    where: { slug: "ubuntu-22.04-server" },
    update: {
      name: "Ubuntu 22.04 LTS",
      operatingSystem: "Ubuntu",
      version: "22.04",
      visibility: "PUBLIC",
      status: "AVAILABLE"
    },
    create: {
      imageId: "ami-ubuntu-2204",
      name: "Ubuntu 22.04 LTS",
      slug: "ubuntu-22.04-server",
      operatingSystem: "Ubuntu",
      version: "22.04",
      visibility: "PUBLIC",
      status: "AVAILABLE",
      description: "Ubuntu 22.04 image available for lab workloads."
    }
  });

  const defaultNetwork = await prisma.virtualNetwork.upsert({
    where: { networkId: "vpc-local-multipass" },
    update: {
      name: "multipass-local",
      cidr: "10.10.0.0/16",
      status: "AVAILABLE"
    },
    create: {
      networkId: "vpc-local-multipass",
      name: "multipass-local",
      cidr: "10.10.0.0/16",
      status: "AVAILABLE",
      description: "Default local Multipass NAT network."
    }
  });

  await prisma.subnet.upsert({
    where: { subnetId: "subnet-local-a" },
    update: {
      name: "local-a",
      cidr: "10.10.9.0/24",
      availabilityZone: "local",
      status: "AVAILABLE",
      networkId: defaultNetwork.id
    },
    create: {
      subnetId: "subnet-local-a",
      name: "local-a",
      cidr: "10.10.9.0/24",
      availabilityZone: "local",
      status: "AVAILABLE",
      networkId: defaultNetwork.id
    }
  });

  const defaultSecurityGroup = await prisma.securityGroup.upsert({
    where: { groupId: "sg-web-default" },
    update: {
      name: "web-sg",
      description: "Default lab security group for SSH and web traffic.",
      networkId: defaultNetwork.id
    },
    create: {
      groupId: "sg-web-default",
      name: "web-sg",
      description: "Default lab security group for SSH and web traffic.",
      networkId: defaultNetwork.id
    }
  });

  await prisma.firewallRule.createMany({
    skipDuplicates: true,
    data: [
      {
        ruleId: "sgr-ssh-default",
        securityGroupId: defaultSecurityGroup.id,
        direction: "INGRESS",
        protocol: "TCP",
        fromPort: 22,
        toPort: 22,
        cidr: "0.0.0.0/0",
        description: "Allow SSH."
      },
      {
        ruleId: "sgr-http-default",
        securityGroupId: defaultSecurityGroup.id,
        direction: "INGRESS",
        protocol: "TCP",
        fromPort: 80,
        toPort: 80,
        cidr: "0.0.0.0/0",
        description: "Allow HTTP."
      },
      {
        ruleId: "sgr-https-default",
        securityGroupId: defaultSecurityGroup.id,
        direction: "INGRESS",
        protocol: "TCP",
        fromPort: 443,
        toPort: 443,
        cidr: "0.0.0.0/0",
        description: "Allow HTTPS."
      }
    ]
  });

  await prisma.pricingRule.createMany({
    skipDuplicates: true,
    data: [
      {
        name: "Default VM instance hourly estimate",
        service: "multipass",
        resourceType: "instance",
        unit: "INSTANCE_HOUR",
        unitPrice: "0.010",
        currency: "USD"
      },
      {
        name: "Default VM vCPU hourly estimate",
        service: "multipass",
        resourceType: "vcpu",
        unit: "VCPU_HOUR",
        unitPrice: "0.025",
        currency: "USD"
      },
      {
        name: "Default VM RAM hourly estimate",
        service: "multipass",
        resourceType: "ram_gb",
        unit: "GB_RAM_HOUR",
        unitPrice: "0.008",
        currency: "USD"
      },
      {
        name: "Default local storage monthly estimate",
        service: "multipass",
        resourceType: "volume_gb",
        unit: "GB_STORAGE_MONTH",
        unitPrice: "0.10",
        currency: "USD"
      },
      {
        name: "Default bridged network hourly estimate",
        service: "multipass",
        resourceType: "bridged_network",
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
