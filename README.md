# Culinary Recipe Book (MERN Stack)

A modern, full-stack Recipe Book web application designed and built with the **MERN** architecture: **MongoDB Atlas**, **Express.js**, **React.js**, and **Node.js**.

The application provides an interactive digital kitchen notebook allowing users to save, organize, browse, update, and remove recipes in real time, with automatic persistent synchronization with a cloud-hosted MongoDB Atlas database.

---

## 🌟 Key Application Features

- **Full CRUD Capabilities**:
  - **Create**: Add new recipes with name, category (Breakfast, Lunch, Dinner, Snack, Dessert), ingredients list, preparation steps, and cooking time.
  - **Read**: View all saved recipes rendered as interactive cards, and inspect full details (ingredients and step-by-step instructions) in a focused modal.
  - **Update**: Edit existing recipes with pre-filled forms that update both cloud storage and the live UI instantaneously.
  - **Delete**: Remove recipes with a defensive confirmation dialog to avoid accidental loss.
- **Robust Multi-Layer Validation**:
  - Mandatory field checks ensuring name, category, ingredients, steps, and cooking duration are provided.
  - Cooking time verification requiring whole integers $\ge 0$ minutes (disallowing negative or fractional times).
  - Text length limits protecting database integrity.
- **Dynamic Search & Filtering**:
  - Live client-side text search by recipe name.
  - Quick-filter category pills (All, Breakfast, Lunch, Dinner, Snack, Dessert).
- **Responsive Culinary UI**:
  - Polished interface styled with custom CSS variables, accessible HTML5 `<dialog>` elements, backdrop filters, and responsive grids optimized for desktop, tablet, and mobile screens.

---

## 🛠️ Technology Stack

| Layer | Technology | Role |
|---|---|---|
| **Database** | MongoDB Atlas & Mongoose | Cloud NoSQL database storing structured recipe collections |
| **Backend** | Node.js & Express.js | RESTful API server handling validation, CORS, and routing |
| **Frontend** | React 18 & Vite | Component-driven user interface with hooks and modern styling |
| **Testing** | Node.js Test Runner (`node --test`) | Automated endpoint verification and payload contract tests |

---

## 📂 Repository Architecture

```text
recipe-book/
├── backend/
│   ├── models/
│   │   └── Recipe.js          # Mongoose schema and validation definitions
│   ├── test/
│   │   └── api.test.js        # Automated unit and contract test suites
│   ├── .env                   # Database connection string and server port
│   ├── app.js                 # Express application factory with REST endpoints
│   ├── package.json           # Backend dependencies and test scripts
│   ├── server.js              # Database connection and HTTP server bootstrap
│   └── validation.js          # Payload validation and sanitization utility
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HeroBanner.jsx # Hero showcase component
│   │   │   ├── Navbar.jsx     # Navigation bar with branding and quick-add button
│   │   │   ├── RecipeCard.jsx # Card presentation component with action buttons
│   │   │   └── RecipeModal.jsx# Accessible modal for Form, Details, and Deletion
│   │   ├── services/
│   │   │   └── api.js         # Fetch client communicating with Express REST API
│   │   ├── main.jsx           # Main React container handling state and routing
│   │   └── style.css          # Custom responsive culinary design system
│   ├── .env                   # Vite API proxy configuration
│   ├── index.html             # HTML5 entry document
│   ├── package.json           # Frontend dependencies and Vite build scripts
│   └── vite.config.js         # Vite configuration with backend proxy
├── .gitignore                 # Excludes node_modules and build artifacts
├── package.json               # Root npm workspace configuration
└── README.md                  # Comprehensive project documentation
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### 1. Installation
Clone the repository and install all dependencies for both frontend and backend using npm workspaces:

```bash
git clone https://github.com/adhiehh/recipe-book.git
cd recipe-book
npm install
```

### 2. Configure Environment Variables
Verify that `backend/.env` is configured with your MongoDB Atlas URI:

```dotenv
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/recipe_book?retryWrites=true&w=majority
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

### 3. Run Development Server
Start both backend (port 5000) and frontend (port 5173) simultaneously:

```bash
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

### 4. Running Automated Tests
Execute the backend test suite:

```bash
npm test
```

### 5. Production Build
Compile the client bundle and start the production server:

```bash
npm run build
npm start
```

---

## 📡 RESTful API Reference

| HTTP Method | Route | Description | Expected Status |
|---|---|---|---|
| `GET` | `/api/health` | Service and MongoDB connectivity check | `200` (Ready) / `503` |
| `GET` | `/api/recipes` | Fetch all recipes (sorted newest first) | `200 OK` |
| `GET` | `/api/recipes/:id` | Fetch complete recipe details by ID | `200 OK` / `404` |
| `POST` | `/api/recipes` | Create a new recipe entry | `201 Created` / `400` |
| `PUT` | `/api/recipes/:id` | Update an existing recipe by ID | `200 OK` / `400` / `404` |
| `DELETE` | `/api/recipes/:id` | Remove a recipe by ID | `200 OK` / `404` |

---

## 📝 License
This project was developed for the Full Stack Development (MERN) Exit Examination.
