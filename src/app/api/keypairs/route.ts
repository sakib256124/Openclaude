import { NextResponse } from "next/server";
import { createHash, generateKeyPairSync } from "node:crypto";
import { z } from "zod";
import { requireApiPermission } from "@/app/api/_utils/auth";
import { ownerFields, ownedWhere } from "@/lib/cloud/ownership";
import { createCloudResourceId } from "@/lib/cloud/resource-ids";
import { prisma } from "@/lib/prisma";

const keyPairSchema = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.enum(["ssh-ed25519", "rsa"]).default("ssh-ed25519"),
  publicKey: z.string().trim().min(20).optional()
});

function fingerprint(publicKey: string) {
  return `SHA256:${createHash("sha256").update(publicKey).digest("base64url")}`;
}

export async function GET() {
  const auth = await requireApiPermission("resources:read");

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const keyPairs = await prisma.keyPair.findMany({
      where: ownedWhere(auth.user),
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ keyPairs });
  } catch {
    return NextResponse.json({ keyPairs: [] });
  }
}

export async function POST(request: Request) {
  const auth = await requireApiPermission("resources:write");

  if (!auth.ok) {
    return auth.response;
  }

  const parsed = keyPairSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_FAILED", message: "Key pair details are invalid.", fieldErrors: parsed.error.flatten().fieldErrors, requestId: null } },
      { status: 400 }
    );
  }

  const generated = parsed.data.publicKey
    ? null
    : parsed.data.type === "rsa"
      ? generateKeyPairSync("rsa", {
          modulusLength: 4096,
          publicKeyEncoding: { type: "spki", format: "pem" },
          privateKeyEncoding: { type: "pkcs8", format: "pem" }
        })
      : generateKeyPairSync("ed25519", {
          publicKeyEncoding: { type: "spki", format: "pem" },
          privateKeyEncoding: { type: "pkcs8", format: "pem" }
        });
  const publicKey = parsed.data.publicKey ?? generated?.publicKey ?? "";

  try {
    const keyPair = await prisma.keyPair.create({
      data: {
        keyPairId: createCloudResourceId("keyPair"),
        name: parsed.data.name,
        type: parsed.data.type,
        publicKey,
        fingerprint: fingerprint(publicKey),
        ...ownerFields(auth.user)
      }
    });

    return NextResponse.json({ keyPair, privateKey: generated?.privateKey }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { code: "DATABASE_UNAVAILABLE", message: "Key pair registry needs PostgreSQL/Neon to be available.", requestId: null } },
      { status: 503 }
    );
  }
}
