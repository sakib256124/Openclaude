-- Add the EC2-style control-plane resources used by the Multipass-backed console.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'DEVELOPER';

CREATE TYPE "ComputeInstanceStatus" AS ENUM ('PENDING', 'RUNNING', 'STOPPED', 'SUSPENDED', 'TERMINATED', 'ERROR');
CREATE TYPE "ImageStatus" AS ENUM ('AVAILABLE', 'PENDING', 'ERROR', 'DELETED');
CREATE TYPE "ImageVisibility" AS ENUM ('PUBLIC', 'PRIVATE');
CREATE TYPE "NetworkStatus" AS ENUM ('AVAILABLE', 'PENDING', 'ERROR', 'DELETED');
CREATE TYPE "IpAddressStatus" AS ENUM ('AVAILABLE', 'ASSOCIATED', 'RELEASED');
CREATE TYPE "SecurityRuleDirection" AS ENUM ('INGRESS', 'EGRESS');
CREATE TYPE "SecurityRuleProtocol" AS ENUM ('TCP', 'UDP', 'ICMP', 'ALL');
CREATE TYPE "VolumeStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'DELETING', 'DELETED', 'ERROR');
CREATE TYPE "SnapshotStatus" AS ENUM ('PENDING', 'COMPLETED', 'ERROR', 'DELETED');
CREATE TYPE "UsageMetricType" AS ENUM ('INSTANCE_HOUR', 'VCPU_HOUR', 'RAM_GB_HOUR', 'STORAGE_GB_MONTH', 'NETWORK_GB');

CREATE TABLE "MachineImage" (
  "id" TEXT NOT NULL,
  "imageId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "operatingSystem" TEXT NOT NULL,
  "version" TEXT,
  "architecture" TEXT NOT NULL DEFAULT 'x86_64',
  "visibility" "ImageVisibility" NOT NULL DEFAULT 'PRIVATE',
  "status" "ImageStatus" NOT NULL DEFAULT 'AVAILABLE',
  "sourceInstanceId" TEXT,
  "ownerUserId" TEXT,
  "ownerEmail" TEXT,
  "description" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MachineImage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VirtualNetwork" (
  "id" TEXT NOT NULL,
  "networkId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "cidr" TEXT NOT NULL,
  "status" "NetworkStatus" NOT NULL DEFAULT 'AVAILABLE',
  "ownerUserId" TEXT,
  "ownerEmail" TEXT,
  "description" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VirtualNetwork_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Subnet" (
  "id" TEXT NOT NULL,
  "subnetId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "cidr" TEXT NOT NULL,
  "availabilityZone" TEXT NOT NULL DEFAULT 'local',
  "status" "NetworkStatus" NOT NULL DEFAULT 'AVAILABLE',
  "networkId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Subnet_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SecurityGroup" (
  "id" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" "NetworkStatus" NOT NULL DEFAULT 'AVAILABLE',
  "networkId" TEXT,
  "ownerUserId" TEXT,
  "ownerEmail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SecurityGroup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FirewallRule" (
  "id" TEXT NOT NULL,
  "ruleId" TEXT NOT NULL,
  "securityGroupId" TEXT NOT NULL,
  "direction" "SecurityRuleDirection" NOT NULL DEFAULT 'INGRESS',
  "protocol" "SecurityRuleProtocol" NOT NULL DEFAULT 'TCP',
  "fromPort" INTEGER,
  "toPort" INTEGER,
  "cidr" TEXT NOT NULL DEFAULT '0.0.0.0/0',
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FirewallRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ComputeInstance" (
  "id" TEXT NOT NULL,
  "instanceId" TEXT NOT NULL,
  "multipassName" TEXT,
  "name" TEXT NOT NULL,
  "status" "ComputeInstanceStatus" NOT NULL DEFAULT 'PENDING',
  "powerState" TEXT,
  "operatingSystem" TEXT NOT NULL,
  "imageRef" TEXT NOT NULL,
  "imageId" TEXT,
  "cpu" INTEGER NOT NULL,
  "ramMb" INTEGER NOT NULL,
  "storageGb" INTEGER NOT NULL,
  "privateIp" TEXT,
  "publicIp" TEXT,
  "availabilityZone" TEXT NOT NULL DEFAULT 'local',
  "networkId" TEXT,
  "subnetId" TEXT,
  "securityGroupId" TEXT,
  "ownerUserId" TEXT,
  "ownerEmail" TEXT NOT NULL,
  "launchedAt" TIMESTAMP(3),
  "stoppedAt" TIMESTAMP(3),
  "terminatedAt" TIMESTAMP(3),
  "lastSyncedAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ComputeInstance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KeyPair" (
  "id" TEXT NOT NULL,
  "keyPairId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'ssh-ed25519',
  "fingerprint" TEXT NOT NULL,
  "publicKey" TEXT,
  "ownerUserId" TEXT,
  "ownerEmail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "KeyPair_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ElasticIpAddress" (
  "id" TEXT NOT NULL,
  "allocationId" TEXT NOT NULL,
  "publicIp" TEXT NOT NULL,
  "status" "IpAddressStatus" NOT NULL DEFAULT 'AVAILABLE',
  "networkId" TEXT,
  "instanceId" TEXT,
  "ownerUserId" TEXT,
  "ownerEmail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ElasticIpAddress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Volume" (
  "id" TEXT NOT NULL,
  "volumeId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" "VolumeStatus" NOT NULL DEFAULT 'AVAILABLE',
  "sizeGb" INTEGER NOT NULL,
  "availabilityZone" TEXT NOT NULL DEFAULT 'local',
  "mountPath" TEXT,
  "attachedInstanceId" TEXT,
  "ownerUserId" TEXT,
  "ownerEmail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Volume_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Snapshot" (
  "id" TEXT NOT NULL,
  "snapshotId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" "SnapshotStatus" NOT NULL DEFAULT 'PENDING',
  "sizeGb" INTEGER NOT NULL,
  "volumeId" TEXT,
  "sourceInstanceId" TEXT,
  "ownerUserId" TEXT,
  "ownerEmail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Snapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UsageRecord" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "instanceId" TEXT,
  "volumeId" TEXT,
  "metric" "UsageMetricType" NOT NULL,
  "quantity" DECIMAL(14,6) NOT NULL,
  "unitPrice" DECIMAL(12,6),
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "startedAt" TIMESTAMP(3) NOT NULL,
  "endedAt" TIMESTAMP(3) NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MachineImage_imageId_key" ON "MachineImage"("imageId");
CREATE UNIQUE INDEX "MachineImage_slug_key" ON "MachineImage"("slug");
CREATE INDEX "MachineImage_ownerUserId_idx" ON "MachineImage"("ownerUserId");
CREATE INDEX "MachineImage_visibility_status_idx" ON "MachineImage"("visibility", "status");

CREATE UNIQUE INDEX "VirtualNetwork_networkId_key" ON "VirtualNetwork"("networkId");
CREATE INDEX "VirtualNetwork_ownerUserId_idx" ON "VirtualNetwork"("ownerUserId");
CREATE INDEX "VirtualNetwork_status_idx" ON "VirtualNetwork"("status");

CREATE UNIQUE INDEX "Subnet_subnetId_key" ON "Subnet"("subnetId");
CREATE INDEX "Subnet_networkId_idx" ON "Subnet"("networkId");
CREATE INDEX "Subnet_status_idx" ON "Subnet"("status");

CREATE UNIQUE INDEX "SecurityGroup_groupId_key" ON "SecurityGroup"("groupId");
CREATE INDEX "SecurityGroup_ownerUserId_idx" ON "SecurityGroup"("ownerUserId");
CREATE INDEX "SecurityGroup_networkId_idx" ON "SecurityGroup"("networkId");

CREATE UNIQUE INDEX "FirewallRule_ruleId_key" ON "FirewallRule"("ruleId");
CREATE INDEX "FirewallRule_securityGroupId_idx" ON "FirewallRule"("securityGroupId");
CREATE INDEX "FirewallRule_direction_idx" ON "FirewallRule"("direction");

CREATE UNIQUE INDEX "ComputeInstance_instanceId_key" ON "ComputeInstance"("instanceId");
CREATE UNIQUE INDEX "ComputeInstance_multipassName_key" ON "ComputeInstance"("multipassName");
CREATE INDEX "ComputeInstance_ownerUserId_createdAt_idx" ON "ComputeInstance"("ownerUserId", "createdAt");
CREATE INDEX "ComputeInstance_status_idx" ON "ComputeInstance"("status");
CREATE INDEX "ComputeInstance_networkId_idx" ON "ComputeInstance"("networkId");
CREATE INDEX "ComputeInstance_securityGroupId_idx" ON "ComputeInstance"("securityGroupId");

CREATE UNIQUE INDEX "KeyPair_keyPairId_key" ON "KeyPair"("keyPairId");
CREATE INDEX "KeyPair_ownerUserId_idx" ON "KeyPair"("ownerUserId");
CREATE UNIQUE INDEX "KeyPair_ownerUserId_name_key" ON "KeyPair"("ownerUserId", "name");

CREATE UNIQUE INDEX "ElasticIpAddress_allocationId_key" ON "ElasticIpAddress"("allocationId");
CREATE UNIQUE INDEX "ElasticIpAddress_publicIp_key" ON "ElasticIpAddress"("publicIp");
CREATE INDEX "ElasticIpAddress_ownerUserId_idx" ON "ElasticIpAddress"("ownerUserId");
CREATE INDEX "ElasticIpAddress_status_idx" ON "ElasticIpAddress"("status");

CREATE UNIQUE INDEX "Volume_volumeId_key" ON "Volume"("volumeId");
CREATE INDEX "Volume_ownerUserId_idx" ON "Volume"("ownerUserId");
CREATE INDEX "Volume_status_idx" ON "Volume"("status");
CREATE INDEX "Volume_attachedInstanceId_idx" ON "Volume"("attachedInstanceId");

CREATE UNIQUE INDEX "Snapshot_snapshotId_key" ON "Snapshot"("snapshotId");
CREATE INDEX "Snapshot_ownerUserId_idx" ON "Snapshot"("ownerUserId");
CREATE INDEX "Snapshot_status_idx" ON "Snapshot"("status");
CREATE INDEX "Snapshot_volumeId_idx" ON "Snapshot"("volumeId");

CREATE INDEX "UsageRecord_userId_startedAt_idx" ON "UsageRecord"("userId", "startedAt");
CREATE INDEX "UsageRecord_instanceId_idx" ON "UsageRecord"("instanceId");
CREATE INDEX "UsageRecord_volumeId_idx" ON "UsageRecord"("volumeId");
CREATE INDEX "UsageRecord_metric_idx" ON "UsageRecord"("metric");

ALTER TABLE "MachineImage" ADD CONSTRAINT "MachineImage_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VirtualNetwork" ADD CONSTRAINT "VirtualNetwork_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Subnet" ADD CONSTRAINT "Subnet_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "VirtualNetwork"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SecurityGroup" ADD CONSTRAINT "SecurityGroup_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "VirtualNetwork"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SecurityGroup" ADD CONSTRAINT "SecurityGroup_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FirewallRule" ADD CONSTRAINT "FirewallRule_securityGroupId_fkey" FOREIGN KEY ("securityGroupId") REFERENCES "SecurityGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ComputeInstance" ADD CONSTRAINT "ComputeInstance_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "MachineImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ComputeInstance" ADD CONSTRAINT "ComputeInstance_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "VirtualNetwork"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ComputeInstance" ADD CONSTRAINT "ComputeInstance_subnetId_fkey" FOREIGN KEY ("subnetId") REFERENCES "Subnet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ComputeInstance" ADD CONSTRAINT "ComputeInstance_securityGroupId_fkey" FOREIGN KEY ("securityGroupId") REFERENCES "SecurityGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ComputeInstance" ADD CONSTRAINT "ComputeInstance_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "KeyPair" ADD CONSTRAINT "KeyPair_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ElasticIpAddress" ADD CONSTRAINT "ElasticIpAddress_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "VirtualNetwork"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ElasticIpAddress" ADD CONSTRAINT "ElasticIpAddress_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "ComputeInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ElasticIpAddress" ADD CONSTRAINT "ElasticIpAddress_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Volume" ADD CONSTRAINT "Volume_attachedInstanceId_fkey" FOREIGN KEY ("attachedInstanceId") REFERENCES "ComputeInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Volume" ADD CONSTRAINT "Volume_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_volumeId_fkey" FOREIGN KEY ("volumeId") REFERENCES "Volume"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_sourceInstanceId_fkey" FOREIGN KEY ("sourceInstanceId") REFERENCES "ComputeInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "ComputeInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_volumeId_fkey" FOREIGN KEY ("volumeId") REFERENCES "Volume"("id") ON DELETE SET NULL ON UPDATE CASCADE;
