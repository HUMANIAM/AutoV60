# Ubuntu 24 VM Dev Environment Setup (AutoV60)

This is a **CLI-first**, repeatable setup plan for an **Ubuntu 24.04** VirtualBox guest used as the primary development environment, with an **Ubuntu 20** host running VirtualBox CLIs.

It is written so you can re-run commands across multiple VMs with minimal edits.

---

## Goals (why this VM exists)

- Do all development **inside** the Ubuntu 24 VM.
- Use the host VS Code only as a UI via **Remote - SSH**.
- Keep setup **scriptable** and as **idempotent** as practical.

---

## Assumptions / known local facts

From current host inspection:

- VM name: `ubuntu24_dev`
- NAT SSH port-forward exists: **host `127.0.0.1:2224` → guest `:22`**
- A host-only adapter also exists: `nic2=hostonly` on `vboxnet0`
- The Ubuntu ISO is still attached and boot order is currently `dvd` then `disk`

If you clone this setup to other VMs, only the VM name and forwarded port should change.

---

## 0) Host prerequisites (Ubuntu 20)

Install VirtualBox (already present here) and basic host tooling:

```bash
sudo apt update
sudo apt install -y openssh-client git

# sanity
VBoxManage --version
```

Optional but helpful:

```bash
sudo apt install -y jq ripgrep
```

---

## 1) Normalize VirtualBox VM settings (host CLI)

### 1.1 Ensure disk boots first (avoid live-ISO confusion)

```bash
VM="ubuntu24_dev"

# must be powered off
VBoxManage controlvm "$VM" poweroff 2>/dev/null || true

VBoxManage modifyvm "$VM" --boot1 disk --boot2 dvd --boot3 none --boot4 none
```

### 1.2 Detach the Ubuntu ISO after installation is complete

If the install is done, detach the ISO so the VM can’t accidentally boot into the installer:

```bash
VM="ubuntu24_dev"

# find the exact controller name (here it is SATA) and then detach
VBoxManage storageattach "$VM" \
  --storagectl "SATA" --port 1 --device 0 \
  --type dvddrive --medium none
```

### 1.3 Confirm SSH port forwarding exists (NAT)

This project expects SSH to be reachable from the host without needing guest IP discovery:

```bash
VM="ubuntu24_dev"
VBoxManage showvminfo "$VM" --machinereadable | sed -n 's/^Forwarding([^)]*)=//p'
```

If you need to add it:

```bash
VM="ubuntu24_dev"
VBoxManage modifyvm "$VM" --natpf1 "guestssh,tcp,,2224,,22"
```

If you create multiple VMs, assign unique ports (e.g. 2225, 2226, …).

---

## 2) Boot the VM (host CLI)

Start headless (preferred for repeatability):

```bash
VM="ubuntu24_dev"
VBoxManage startvm "$VM" --type headless
```

If you need a GUI once (first login / troubleshooting):

```bash
VM="ubuntu24_dev"
VBoxManage startvm "$VM" --type gui
```

---

## 3) Guest: install and enable SSH (Ubuntu 24.04)

In the VM (locally in the guest terminal for the first time), run:

```bash
sudo apt update
sudo apt install -y openssh-server
sudo systemctl enable --now ssh
sudo systemctl status ssh --no-pager
```

Verify SSH is listening:

```bash
ss -lntp | grep ':22' || true
ip a
```

---

## 4) Host ↔ guest SSH access (keys, no passwords)

### 4.1 From host: verify the port-forward works

```bash
ssh -p 2224 -o StrictHostKeyChecking=accept-new <GUEST_USER>@127.0.0.1
```

If this fails:

- Confirm the VM is running: `VBoxManage list runningvms`
- Confirm the forward exists: `VBoxManage showvminfo ubuntu24_dev --machinereadable | grep -n '^Forwarding'`
- In guest: confirm SSH is enabled and port 22 is listening

### 4.2 From host: create an SSH key (if you don’t already have one)

```bash
test -f ~/.ssh/id_ed25519 || ssh-keygen -t ed25519 -C "autov60" -f ~/.ssh/id_ed25519
```

### 4.3 From host: install your public key into the guest

```bash
ssh-copy-id -p 2224 <GUEST_USER>@127.0.0.1
```

### 4.4 Optional hardening (guest)

Once key auth works, you can disable password SSH logins:

```bash
sudo sed -i 's/^\s*#\?\s*PasswordAuthentication\s\+.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^\s*#\?\s*PermitRootLogin\s\+.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl reload ssh
```

---

## 5) Shared workspace strategy (choose one)

You have two viable CLI-friendly patterns. Pick one per VM fleet.

### Option A (recommended): keep the repo inside the guest

This is the most robust approach for Linux guests and avoids filesystem edge cases.

In guest:

```bash
sudo apt install -y git
mkdir -p ~/work
cd ~/work
git clone <YOUR_REPO_URL> AutoV60
```

Then use VS Code Remote SSH to open `~/work/AutoV60` in the guest.

### Option B: VirtualBox shared folder (host path mounted into guest)

This is convenient if you want one host folder visible in many VMs. It’s also CLI-manageable.

On host, define a shared folder pointing at your repo:

```bash
VM="ubuntu24_dev"
HOST_REPO="/media/ibrahim/data/Apps_ideas/AutoV60"

VBoxManage sharedfolder add "$VM" \
  --name "autov60" \
  --hostpath "$HOST_REPO" \
  --automount
```

In guest, install shared-folder support and mount:

```bash
sudo apt update
sudo apt install -y virtualbox-guest-utils virtualbox-guest-utils-hwe

# reboot if mount does not appear automatically
sudo reboot
```

After reboot, check mount:

```bash
mount | grep -En 'vboxsf|autov60' || true
ls -la /media | head
```

If auto-mount didn’t happen, mount manually:

```bash
sudo mkdir -p /mnt/autov60
sudo mount -t vboxsf autov60 /mnt/autov60
```

If you hit permission issues, add your user to `vboxsf` and re-login:

```bash
sudo usermod -aG vboxsf "$USER"
newgrp vboxsf
```

---

## 6) Install the minimal dev toolchain (guest)

AutoV60 v1 docs imply:

- a lightweight **Python** simulator
- optional ESP32 firmware work (Wokwi first, then real toolchains)

### 6.1 Base packages

```bash
sudo apt update
sudo apt install -y \
  build-essential \
  ca-certificates \
  curl \
  git \
  python3 \
  python3-pip \
  python3-venv \
  unzip \
  zip
```

Quality-of-life:

```bash
sudo apt install -y ripgrep jq
```

### 6.2 Python virtual environment (repo-local)

In the repo root (inside the guest):

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
```

If/when the repo adds dependencies, prefer a pinned `requirements.txt` (or `pyproject.toml`) and install from that.

---

## 7) Optional: ESP32 toolchains (guest)

The docs currently recommend **Wokwi in a browser** first. If you also want local CLI tooling:

### 7.1 Arduino CLI (simple starting point)

```bash
cd /tmp
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
sudo install -m 0755 /tmp/bin/arduino-cli /usr/local/bin/arduino-cli

arduino-cli version
arduino-cli config init
arduino-cli core update-index
arduino-cli core install esp32:esp32
```

### 7.2 PlatformIO (often convenient for ESP32)

```bash
python3 -m pip install --user -U platformio
~/.local/bin/pio --version
```

---

## 8) VS Code Remote - SSH (host)

Once SSH works, VS Code will install its server inside the guest automatically on first connect.

Add (or generate) a host entry:

```bash
cat >> ~/.ssh/config <<'EOF'
Host autov60-ubuntu24
  HostName 127.0.0.1
  User <GUEST_USER>
  Port 2224
  IdentityFile ~/.ssh/id_ed25519
EOF
```

Test from host:

```bash
ssh autov60-ubuntu24 'uname -a && lsb_release -a || true'
```

Then in VS Code:

- Remote Explorer → “SSH Targets” → connect to `autov60-ubuntu24`
- Open the repo folder inside the guest (Option A) or the mount path (Option B)

---

## 9) “Golden checks” (quick verification)

Run these as a small acceptance checklist.

On host:

```bash
ssh autov60-ubuntu24 'echo ok-from-ssh'
```

On guest (in repo root):

```bash
python3 -c "import sys; print(sys.version)"
python3 -m venv /tmp/autov60_venv_test && rm -rf /tmp/autov60_venv_test
```

If using shared folders:

```bash
touch <MOUNT_PATH>/.write_test && rm <MOUNT_PATH>/.write_test
```

---

## 10) Scaling to multiple VMs

Standardize these per-VM variables:

- VM name
- NAT forwarded SSH port
- SSH host alias in `~/.ssh/config`

Recommended convention:

- `ubuntu24_dev_01` → port 2224 → `Host autov60-01`
- `ubuntu24_dev_02` → port 2225 → `Host autov60-02`
- …

You can apply the same `VBoxManage modifyvm ... --natpf1 ...` patterns with only these edits.

