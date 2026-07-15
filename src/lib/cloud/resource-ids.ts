import { randomBytes } from "node:crypto";

const prefixes = {
  instance: "i",
  image: "ami",
  network: "vpc",
  subnet: "subnet",
  securityGroup: "sg",
  rule: "sgr",
  keyPair: "key",
  address: "eipalloc",
  volume: "vol",
  snapshot: "snap"
} as const;

export type CloudResourceKind = keyof typeof prefixes;

export function createCloudResourceId(kind: CloudResourceKind) {
  return `${prefixes[kind]}-${randomBytes(8).toString("hex")}`;
}
