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

## Users

When you start your server for the first time, you will be asked to create a `root` user and whill show you his token.

> [!NOTE]
> If you wanna use the api, you need to use the token in the header `Authorization: <token>`. This is the unique authentication method allowed.

Next, you will be able to create more users with the API. And you will be able to give users the permission they need.

## API


<details>
  <summary>Root api endpoints (click to see more)</summary>


### 1. Create a new user
**Endpoint:**  
`GET /api/users/create/{username}`  

**Description:**  
Will create user named `username` and will send you the auth token.

**Response Example:**
```json
{
    "error": false,
    "message": "User alice created with apikey: eca1815f-1eb5-443f-9a34-0856ae9afe9a"
}
```

### 2. List all users
**Endpoint:**  
`GET /api/users/list`  

**Description:**  
Will send you the list with all users (except the auth token available in `./config/users.json`).

**Response Example:**
```json
{
    "error": false,
    "message": "User alice created with apikey: eca1815f-1eb5-443f-9a34-0856ae9afe9a"
}
```

### 3. Delete a user
**Endpoint:**  
`GET /api/users/delete/{username}`  

**Description:**  
Will delete user named `username`.

**Response Example:**
```json
{
    "error": false,
    "message": "User alice deleted"
}
```


</details>

<details>
  <summary>User api endpoints (click to see more)</summary>


### 1. Claim server
**Endpoint:**  
`GET /api/clients/claim/{serveruuid}`  

**Description:**  
Will claim server `serveruuid` to the user. (use the key showed in client console)

**Response Example:**
```json
{
    "error": false,
    "message": "Server claimed"
}
```

> [!NOTE]
> You can only claim one time a server.

### 2. Share server
**Endpoint:**  
`GET /api/clients/share/{serveruuid}/{username}`  

**Description:**  
Will share the acces to server `serveruuid` to the user `username`.

**Response Example:**
```json
{
    "error": false,
    "message": "Server shared"
}
```

### 3. Get my server
**Endpoint:**  
`GET /api/clients/mine`

**Description:**  
Get all the server that you have `claimed` AND `shared`.

**Response Example:**
```json
{
    "error": false,
    "clients": [
        {
            "client_key": "8ebefb55-e2b2-4043-b253-2f2027803a1f",
            "name": "Christian Daphne",
            "tags": [],
            "shared": [
                "root"
            ],
            "status": "online"
        }
    ]
}
```

### 4. Get my server details
**Endpoint:**  
`GET /api/clients/show/{serveruuid}`

**Description:**  
Get all the details of the server `serveruuid`.

**Response Example:**
```json
{
    "error": false,
    "server": {
        "client_key": "8ebefb55-e2b2-4043-b253-2f2027803a1f",
        "name": "Christian Daphne",
        "shared": [
            "root"
        ],
        "tags": [],
        "owner": "alice",
        "status": "offline"
    }
}
```



</details>