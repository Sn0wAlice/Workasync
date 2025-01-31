# Workasync

![Workasync](./.github/banner.png)

If you just want to push jobs somewhere and you don't care about other fancy functions

# Installation

### Requirements
- Node.js >= 14.0.0
- npm >= 6.0.0

### Install
```bash
git clone https://github.com/Sn0wAlice/Workasync
cd Workasync
npm install
```

### Configuration
```json
{
    "web": {
        "port": 4000
    },
    "kind": "client",
    "security": {
        "key": "mysecretkey"
    }
}
```

# Use
Run the master node (kind: `default`) then plug client to it, and then you can push jobs to the master node API.

