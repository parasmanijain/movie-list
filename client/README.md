# 🎬 Movie List — Client Application

The frontend of the Movie List application, built with **React 18**, **TypeScript**, and **Vite**. It provides an interactive dashboard for browsing movie statistics, visualizing data through charts, filtering by various dimensions, and managing movie-related entities through validated forms.

---

## 🛠️ Tech Stack

| Category              | Technology / Library              | Version   | Purpose                                      |
|-----------------------|-----------------------------------|-----------|----------------------------------------------|
| UI Framework          | React                             | ^18.x     | Component-based UI rendering                 |
| Language              | TypeScript                        | ^5.x      | Static typing and developer experience       |
| Build Tool            | Vite                              | ^5.x      | Fast dev server and optimized production build|
| Routing               | React Router DOM                  | ^6.x      | Client-side SPA routing                      |
| HTTP Client           | Axios                             | ^1.x      | REST API communication with the server       |
| Data Visualization    | Recharts                          | ^2.x      | Bar, Line, and Pie charts                    |
| Form Management       | Formik                            | ^2.x      | Form state management and submission         |
| Form Validation       | Yup                               | ^1.x      | Schema-based form validation                 |
| UI Component Library  | Material UI (MUI)                 | ^5.x      | Pre-built accessible UI components           |
| Package Manager       | pnpm                              | ^8.x      | Fast, disk-efficient package management      |
| Linting               | ESLint                            | ^9.x      | Code quality enforcement                     |
| Git Hooks             | Husky                             | latest    | Pre-commit linting hooks                     |

---

## 📁 Project Structure

```
client/
├── public/                    # Static assets (manifest, favicon, robots.txt)
├── src/
│   ├── App.tsx                # Root component — Router setup & route definitions
│   ├── index.tsx              # Application entry point
│   ├── components/
│   │   ├── HOC/
│   │   │   └── getData.tsx    # Higher-Order Component for data fetching
│   │   ├── pages/             # Route-level page components
│   │   │   ├── Home.tsx           # Main dashboard with movie stats & charts
│   │   │   ├── TopRatedMovies.tsx # Top rated movies with filtering
│   │   │   ├── AddNewMovie.tsx    # Complex form to add a new movie
│   │   │   ├── AddNewDirector.tsx # Form to add a new director
│   │   │   ├── AddNewAward.tsx    # Form to add a new award
│   │   │   ├── AddNewCategory.tsx # Form to add a new category
│   │   │   ├── AddNewCountry.tsx  # Form to add a new country
│   │   │   ├── AddNewFranchise.tsx# Form to add a new franchise
│   │   │   ├── AddNewGenre.tsx    # Form to add a new genre
│   │   │   ├── AddNewLanguage.tsx # Form to add a new language
│   │   │   ├── AddNewUniverse.tsx # Form to add a new universe
│   │   │   ├── Award.tsx          # Award listing/detail page
│   │   │   ├── Category.tsx       # Category listing/detail page
│   │   │   ├── Director.tsx       # Director listing/detail page
│   │   │   ├── DirectorMovies.tsx # Movies by a specific director
│   │   │   ├── Franchise.tsx      # Franchise listing/detail page
│   │   │   ├── Genre.tsx          # Genre listing/detail page
│   │   │   ├── Language.tsx       # Language listing/detail page
│   │   │   ├── Universe.tsx       # Universe listing/detail page
│   │   │   └── Year.tsx           # Movies grouped by year
│   │   ├── routes/
│   │   │   ├── routes.ts          # Centralized route path constants
│   │   │   └── ProtectedRoute.tsx # Route guard component
│   │   └── templates/
│   │       ├── ChartContainer.tsx # Reusable chart wrapper with filters
│   │       └── RenderChart.tsx    # Recharts renderer (Bar/Line/Pie)
│   ├── helper/
│   │   ├── axiosConfig.ts     # Axios instance with base URL from env
│   │   ├── colors.ts          # Color palette constants for charts
│   │   ├── config.ts          # Chart and filter configuration constants
│   │   └── validationScehmas.ts # Yup validation schemas for all forms
│   ├── hooks/
│   │   └── useWindowDimensions.tsx # Custom hook for responsive layout
│   ├── models/                # TypeScript class models for all entities
│   │   ├── Movie.ts
│   │   ├── Director.ts
│   │   ├── Award.ts
│   │   ├── Category.ts
│   │   ├── Country.ts
│   │   ├── Franchise.ts
│   │   ├── Genre.ts
│   │   ├── Language.ts
│   │   └── Universe.ts
│   └── types/
│       ├── api-types.ts       # API response type definitions
│       ├── hooks.ts           # Custom hook type definitions
│       └── index.ts           # Shared types (filters, chart configs, etc.)
├── index.html                 # HTML entry point
├── vite.config.ts             # Vite build configuration
├── tsconfig.json              # TypeScript compiler configuration
├── eslint.config.js           # ESLint flat config
└── package.json               # Dependencies and scripts
```

---

## 🏗️ Architecture

### Component Architecture (Atomic Design)

```
┌─────────────────────────────────────────────────────────┐
│                        App.tsx                          │
│              (Router + Route Definitions)               │
└────────────────────────┬────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
   ┌──────────┐    ┌──────────┐    ┌──────────────┐
   │  Pages   │    │Templates │    │Protected     │
   │(Route    │    │(Reusable │    │Route (Guard) │
   │ Level)   │    │ Layouts) │    └──────────────┘
   └────┬─────┘    └────┬─────┘
        │               │
        ▼               ▼
   ┌──────────┐    ┌──────────────┐
   │ getData  │    │ RenderChart  │
   │  (HOC)   │    │ (Recharts)   │
   └────┬─────┘    └──────────────┘
        │
        ▼
   ┌──────────┐
   │  Axios   │ → REST API
   └──────────┘
```

### Key Architectural Patterns

| Pattern                  | Implementation                                                      |
|--------------------------|---------------------------------------------------------------------|
| **Higher-Order Component** | `getData.tsx` wraps page components to inject fetched API data    |
| **Centralized Routing**  | `routes.ts` defines all route path constants; `App.tsx` maps them  |
| **Reusable Chart Template** | `ChartContainer.tsx` + `RenderChart.tsx` abstract chart rendering |
| **Schema-Driven Validation** | Yup schemas in `validationScehmas.ts` used by all Formik forms  |
| **Typed API Contracts**  | `api-types.ts` and `models/` ensure type-safe API consumption       |
| **Responsive Hooks**     | `useWindowDimensions` drives responsive chart sizing                |

---

## 🔄 Data Flow

### 1. Page Load / Data Fetching

```
User navigates to a route
        │
        ▼
  App.tsx (React Router)
        │
        ▼
  Page Component (e.g., Home.tsx)
        │  wrapped by
        ▼
  getData HOC
        │  calls
        ▼
  axiosConfig.ts (Axios instance)
        │  HTTP GET
        ▼
  Express REST API (server)
        │  queries
        ▼
  MongoDB (Mongoose)
        │  returns data
        ▼
  getData HOC injects data as props
        │
        ▼
  Page Component renders UI
        │
        ▼
  ChartContainer.tsx (if chart needed)
        │
        ▼
  RenderChart.tsx (Recharts Bar/Line/Pie)
```

### 2. Form Submission (Add New Entity)

```
User fills out form (e.g., AddNewMovie.tsx)
        │
        ▼
  Formik manages form state
        │  on submit
        ▼
  Yup validates against schema (validationScehmas.ts)
        │  if valid
        ▼
  Axios POST → Express API endpoint
        │
        ▼
  Controller processes request
        │
        ▼
  Mongoose saves to MongoDB
        │
        ▼
  API returns success response
        │
        ▼
  UI updates / navigates to listing page
```

### 3. Chart Filtering Flow

```
User selects filter in ChartContainer.tsx
        │
        ▼
  Filter state updates (local React state)
        │
        ▼
  Filtered data passed to RenderChart.tsx
        │
        ▼
  Recharts re-renders with filtered dataset
```

---

## 🌍 Environment Variables

Create a `.env` file in the `client/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> The `axiosConfig.ts` reads `VITE_API_BASE_URL` to configure the Axios base URL.

---

## 📦 Key Scripts

```bash
pnpm dev        # Start Vite development server
pnpm build      # Build for production
pnpm preview    # Preview production build
pnpm lint       # Run ESLint
```

---

## 🗺️ Routes Reference

| Route Path              | Component            | Description                        |
|-------------------------|----------------------|------------------------------------|
| `/`                     | `Home`               | Main dashboard with stats & charts |
| `/top-rated`            | `TopRatedMovies`     | Top rated movies with filters      |
| `/award`                | `Award`              | Award listings                     |
| `/category`             | `Category`           | Category listings                  |
| `/director`             | `Director`           | Director listings                  |
| `/director/:id/movies`  | `DirectorMovies`     | Movies by a specific director      |
| `/franchise`            | `Franchise`          | Franchise listings                 |
| `/genre`                | `Genre`              | Genre listings                     |
| `/language`             | `Language`           | Language listings                  |
| `/universe`             | `Universe`           | Universe listings                  |
| `/year`                 | `Year`               | Movies grouped by year             |
| `/add/movie`            | `AddNewMovie`        | Add a new movie                    |
| `/add/director`         | `AddNewDirector`     | Add a new director                 |
| `/add/award`            | `AddNewAward`        | Add a new award                    |
| `/add/category`         | `AddNewCategory`     | Add a new category                 |
| `/add/country`          | `AddNewCountry`      | Add a new country                  |
| `/add/franchise`        | `AddNewFranchise`    | Add a new franchise                |
| `/add/genre`            | `AddNewGenre`        | Add a new genre                    |
| `/add/language`         | `AddNewLanguage`     | Add a new language                 |
| `/add/universe`         | `AddNewUniverse`     | Add a new universe                 |
