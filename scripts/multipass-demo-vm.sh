#!/usr/bin/env bash
set -euo pipefail

VM_NAME="${1:-opencloud-demo-01}"
IMAGE="${MULTIPASS_DEFAULT_IMAGE:-24.04}"
CPUS="${MULTIPASS_DEFAULT_CPUS:-1}"
MEMORY="${MULTIPASS_DEFAULT_MEMORY:-2G}"
DISK="${MULTIPASS_DEFAULT_DISK:-10G}"

if multipass info "$VM_NAME" >/dev/null 2>&1; then
  echo "VM already exists: $VM_NAME"
else
  multipass launch "$IMAGE" --name "$VM_NAME" --cpus "$CPUS" --memory "$MEMORY" --disk "$DISK"
fi

multipass list
