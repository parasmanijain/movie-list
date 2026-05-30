# 🎬 Movie List — Server Application

The backend REST API for the Movie List application, built with **Node.js**, **Express**, and **TypeScript**, backed by **MongoDB** via **Mongoose**. It exposes a full CRUD API for movies and all related entities (directors, genres, awards, categories, franchises, universes, languages, countries).

---

## 🛠️ Tech Stack

| Category            | Technology / Library | Version   | Purpose                                          |
|---------------------|----------------------|-----------|--------------------------------------------------|
| Runtime             | Node.js              | >=18.x    | JavaScript server-side runtime                   |
| Language            | TypeScript           | ^6.0.3    | Static typing and developer experience           |
| Web Framework       | Express              | ^5.2.1    | HTTP routing and middleware                      |
| ODM                 | Mongoose             | ^9.6.3    | MongoDB object modeling and schema validation    |
| Database            | MongoDB              | >=6.x     | NoSQL document database                          |
| Environment Config  | dotenv               | ^17.4.2   | Environment variable management                  |
| CORS                | cors                 | ^2.8.6    | Cross-Origin Resource Sharing middleware         |
| TS Execution        | tsx                  | ^4.22.3   | Run TypeScript directly in Node.js (ESM support) |
| TS Execution (dev)  | ts-node              | ^10.9.2   | TypeScript execution for development             |
| Package Manager     | pnpm                 | ^11.5.0   | Fast, disk-efficient package management          |
| Linting             | ESLint               | ^10.4.0   | Code quality enforcement                         |
| Formatting          | Prettier             | ^3.8.3    | Code formatting                                  |
| Git Hooks           | Husky                | ^9.1.7    | Pre-commit linting hooks                         |

---

## 📁 Project Structure

```
server/
├── src/
│   ├── app.ts                  # Express app setup, middleware, route registration
│   ├── database.ts             # MongoDB connection logic
│   ├── env.d.ts                # TypeScript declarations for environment variables
│   ├── controllers/            # Route handler functions (business logic)
│   │   ├── movie.ts            # Movie CRUD + aggregation queries
│   │   ├── director.ts         # Director CRUD
│   │   ├── award.ts            # Award CRUD
│   │   ├── category.ts         # Category CRUD
│   │   ├── country.ts          # Country CRUD
│   │   ├── franchise.ts        # Franchise CRUD
│   │   ├── genre.ts            # Genre CRUD
│   │   ├── language.ts         # Language CRUD
│   │   └── universe.ts         # Universe CRUD
│   └── schemaModels/           # Mongoose schema definitions and model exports
│       ├── movie.ts            # Movie schema (with all entity references)
│       ├── director.ts         # Director schema
│       ├── award.ts            # Award schema
│       ├── category.ts         # Category schema
│       ├── country.ts          # Country schema
│       ├── franchise.ts        # Franchise schema
│       ├── genre.ts            # Genre schema
│       ├── language.ts         # Language schema
│       └── universe.ts         # Universe schema
├── tsconfig.json               # TypeScript compiler configuration
├── eslint.config.js            # ESLint flat config
├── .eslintrc.json              # ESLint legacy config
└── package.json                # Dependencies and scripts
```

---

## 🏗️ Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     app.ts                              │
│         Express App + Middleware + Route Mounting        │
│   ┌──────────────────────────────────────────────────┐  │
│   │  Middleware: JSON parser, CORS, URL-encoded body  │  │
│   └──────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
  ┌────────────┐  ┌────────────┐  ┌────────────┐
  │  /movies   │  │/directors  │  │  /genres   │  ... (9 routers)
  │  Router    │  │  Router    │  │  Router    │
  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
        │               │               │
        ▼               ▼               ▼
  ┌────────────┐  ┌────────────┐  ┌────────────┐
  │  movie     │  │  director  │  │  genre     │
  │ Controller │  │ Controller │  │ Controller │
  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
        │               │               │
        ▼               ▼               ▼
  ┌────────────┐  ┌────────────┐  ┌────────────┐
  │  Movie     │  │  Director  │  │  Genre     │
  │  Model     │  │  Model     │  │  Model     │
  │ (Mongoose) │  │ (Mongoose) │  │ (Mongoose) │
  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
        │               │               │
        └───────────────┴───────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │     MongoDB      │
              └──────────────────┘
```

### Key Architectural Patterns

| Pattern                    | Implementation                                                           |
|----------------------------|--------------------------------------------------------------------------|
| **MVC (Model-View-Controller)** | Models in `schemaModels/`, Controllers in `controllers/`, Express routes act as the view layer |
| **Centralized App Bootstrap** | `app.ts` registers all middleware and mounts all routers               |
| **Mongoose ODM**           | All database interactions go through typed Mongoose models               |
| **Reference-based Relations** | Movie schema uses `ObjectId` refs to link all related entities         |
| **Environment-based Config** | `dotenv` + `env.d.ts` for typed environment variable access            |

---

## 🗄️ Database Schema

### Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Movie                                │
│  title, year, rating, runtime, plot, poster, imdbId        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Director │  │  Genre[] │  │ Award[]  │  │Category[]│   │
│  │  (ref)   │  │  (refs)  │  │  (refs)  │  │  (refs)  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Franchise │  │Universe  │  │Language[]│  │Country[] │   │
│  │  (ref)   │  │  (ref)   │  │  (refs)  │  │  (refs)  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Director   │    │    Genre     │    │    Award     │
│  name        │    │  name        │    │  name        │
│  nationality │    └──────────────┘    └──────────────┘
│  birthdate   │
└──────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Category   │    │  Franchise   │    │   Universe   │
│  name        │    │  name        │    │  name        │
└──────────────┘    └──────────────┘    └──────────────┘

┌──────────────┐    ┌──────────────┐
│   Language   │    │   Country    │
│  name        │    │  name        │
└──────────────┘    └──────────────┘
```

### Schema Details

#### Movie Schema (`schemaModels/movie.ts`)
```typescript
{
  title:      String  (required)
  year:       Number  (required)
  rating:     Number
  runtime:    Number
  plot:       String
  poster:     String
  imdbId:     String
  director:   ObjectId → Director
  genre:      [ObjectId] → Genre[]
  award:      [ObjectId] → Award[]
  category:   [ObjectId] → Category[]
  franchise:  ObjectId → Franchise
  universe:   ObjectId → Universe
  language:   [ObjectId] → Language[]
  country:    [ObjectId] → Country[]
}
```

#### Supporting Schemas (award, category, franchise, universe, genre, language, country)
```typescript
{ name: String (required, unique) }
```

#### Director Schema (`schemaModels/director.ts`)
```typescript
{
  name:        String (required)
  nationality: String
  birthdate:   Date
}
```

---

## 🔄 Data Flow

### 1. Incoming HTTP Request

```
HTTP Request (from Axios client)
        │
        ▼
  app.ts — Express middleware chain
  ├── cors()              → Validates origin against CLIENT_URL
  ├── express.json()      → Parses JSON request body
  └── express.urlencoded()→ Parses URL-encoded body
        │
        ▼
  Route matching (e.g., POST /api/movies)
        │
        ▼
  Controller function (e.g., movie.ts → createMovie)
        │
        ▼
  Mongoose Model operation (e.g., Movie.create(data))
        │
        ▼
  MongoDB write/read
        │
        ▼
  Controller sends JSON response
        │
        ▼
  HTTP Response → Client
```

### 2. Movie Creation Flow (Detailed)

```
POST /api/movies
  Body: { title, year, rating, director, genre[], award[], ... }
        │
        ▼
  movie controller → createMovie()
        │
        ├── Validates required fields
        ├── Resolves ObjectId references for related entities
        │
        ▼
  new Movie({ ...body }).save()
        │
        ▼
  MongoDB inserts document into `movies` collection
        │
        ▼
  Returns: { success: true, data: <saved movie> }
```

### 3. Movie Query / Aggregation Flow

```
GET /api/movies?filter=...
        │
        ▼
  movie controller → getMovies()
        │
        ▼
  Movie.find(query).populate(['director','genre','award',...])
        │
        ▼
  MongoDB executes query with $lookup (populate)
        │
        ▼
  Returns: populated movie documents array
        │
        ▼
  JSON response → Client renders charts/tables
```

---

## 🌐 API Routes Reference

### Movies — `/api/movies`

| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| GET    | `/api/movies`             | Get all movies (with populate)       |
| GET    | `/api/movies/:id`         | Get a single movie by ID             |
| POST   | `/api/movies`             | Create a new movie                   |
| PUT    | `/api/movies/:id`         | Update a movie by ID                 |
| DELETE | `/api/movies/:id`         | Delete a movie by ID                 |

### Directors — `/api/directors`

| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| GET    | `/api/directors`          | Get all directors                    |
| GET    | `/api/directors/:id`      | Get a single director                |
| POST   | `/api/directors`          | Create a new director                |
| PUT    | `/api/directors/:id`      | Update a director                    |
| DELETE | `/api/directors/:id`      | Delete a director                    |

### Other Entities

The same CRUD pattern applies to all other entities:

| Entity      | Base Route           |
|-------------|----------------------|
| Awards      | `/api/awards`        |
| Categories  | `/api/categories`    |
| Countries   | `/api/countries`     |
| Franchises  | `/api/franchises`    |
| Genres      | `/api/genres`        |
| Languages   | `/api/languages`     |
| Universes   | `/api/universes`     |

---

## 🌍 Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/movie-list
CLIENT_URL=http://localhost:5173
```

| Variable     | Description                                  |
|--------------|----------------------------------------------|
| `PORT`       | Port the Express server listens on           |
| `MONGO_URI`  | MongoDB connection string                    |
| `CLIENT_URL` | Allowed CORS origin (React client URL)       |

---

## 📦 Key Scripts

```bash
pnpm dev        # Start server with ts-node (development)
pnpm build      # Compile TypeScript to JavaScript
pnpm start      # Run compiled JavaScript (production)
pnpm lint       # Run ESLint
```

---

## 🔒 CORS Configuration

The server uses the `cors` middleware configured to allow requests only from the `CLIENT_URL` environment variable, preventing unauthorized cross-origin access in production.

```typescript
app.use(cors({ origin: process.env.CLIENT_URL }));
```
