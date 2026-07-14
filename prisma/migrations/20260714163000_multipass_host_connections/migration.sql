DROP TABLE IF EXISTS "CloudConnection";
DROP TYPE IF EXISTS "EndpointInterface";

CREATE TYPE "MultipassDriver" AS ENUM ('qemu', 'lxd', 'hyperv', 'virtualbox');

CREATE TABLE "MultipassConnection" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "driver" "MultipassDriver" NOT NULL DEFAULT 'qemu',
    "socketPath" TEXT,
    "encryptedAccessSecret" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "ownerUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MultipassConnection_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MultipassConnection_ownerUserId_idx" ON "MultipassConnection"("ownerUserId");
CREATE INDEX "MultipassConnection_active_idx" ON "MultipassConnection"("active");

ALTER TABLE "MultipassConnection"
ADD CONSTRAINT "MultipassConnection_ownerUserId_fkey"
FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
