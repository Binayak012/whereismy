# WhereIsMy

A campus lost-and-found web app. Post items you've lost or found, browse a map of all reported items, submit claims with proof, and get notified in real time when your claim is approved.

## Features

- **Post items** — describe a lost or found item, pin it on an interactive map, and upload photos
- **Browse & filter** — search items by type (lost/found), category, and status
- **Map view** — see all items plotted on a Mapbox map with clickable popups
- **Claim system** — submit a claim with proof text/photos; owners approve or reject claims
- **Real-time notifications** — Socket.io push notifications for claim submissions and approvals
- **JWT authentication** — secure registration, login, and protected routes

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express 5 |
| Database | PostgreSQL |
| Real-time | Socket.io |
| Auth | JWT + bcrypt |
| File uploads | Multer + Cloudinary |
| Maps | Mapbox GL JS |
| Frontend | Vanilla HTML/CSS/JS |

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL
- [Cloudinary](https://cloudinary.com) account
- [Mapbox](https://mapbox.com) API token

### Installation

1. Clone the repo and install dependencies:

```bash
git clone <repo-url>
cd WhereisMy
npm install
```

2. Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MAPBOX_TOKEN=your_mapbox_token
PORT=3000
```

3. Initialize the database:

```bash
psql -f db/schema.sql
```

4. Start the server:

```bash
npm start        # production
npm run dev      # development (auto-reload)
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Reference

### Auth — `/api/auth`
| Method | Path | Description |
|---|---|---|
| POST | `/register` | Create account |
| POST | `/login` | Login and receive JWT |
| GET | `/me` | Get current user (protected) |

### Items — `/api/items`
| Method | Path | Description |
|---|---|---|
| GET | `/` | List items (filter: `type`, `category`, `status`) |
| GET | `/:id` | Get item details |
| POST | `/` | Create item (protected) |
| PUT | `/:id` | Update item (protected, owner only) |
| DELETE | `/:id` | Delete item (protected, owner only) |

### Claims — `/api/claims`
| Method | Path | Description |
|---|---|---|
| POST | `/:itemId` | Submit a claim (protected) |
| GET | `/:itemId` | Get claims for an item (protected, owner only) |
| PUT | `/:claimId/approve` | Approve a claim (protected, owner only) |
| PUT | `/:claimId/reject` | Reject a claim (protected, owner only) |

### Other
| Method | Path | Description |
|---|---|---|
| GET | `/api/notifications` | Get notifications (protected) |
| PUT | `/api/notifications/read` | Mark all as read (protected) |
| POST | `/api/upload` | Upload image to Cloudinary (protected) |
| GET | `/api/ping` | Health check |
| GET | `/api/map-token` | Get Mapbox token for frontend |

## Project Structure

```
WhereisMy/
├── server.js              # App entry point, Socket.io setup
├── db/
│   ├── index.js           # PostgreSQL connection pool
│   └── schema.sql         # Database schema
├── middleware/
│   └── auth.js            # JWT verification middleware
├── routes/
│   ├── auth.js
│   ├── items.js
│   ├── claims.js
│   ├── notifications.js
│   └── upload.js
└── public/                # Static frontend
    ├── *.html
    ├── css/style.css
    └── js/
        ├── auth.js
        ├── items.js
        ├── post.js
        ├── map.js
        ├── claim.js
        ├── manage-claims.js
        └── notifications.js
```

## Item Categories

`Electronics` · `Keys` · `Bag/Backpack` · `Wallet/Purse` · `Clothing` · `ID/Card` · `Other`

## License

MIT
