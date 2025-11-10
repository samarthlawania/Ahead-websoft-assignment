# Dynamic Form Builder

A full-stack application for creating and managing dynamic forms with a React frontend and Express.js backend.

## Features

- **Admin Interface**: Create, edit, and delete forms with drag-and-drop field management
- **Public Forms**: Render forms dynamically with validation
- **Field Types**: Support for text, textarea, number, email, date, checkbox, radio, and select fields
- **Validation**: Built-in validation with custom rules
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn/ui components
- React Router for navigation
- React Hook Form for form handling

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- CORS enabled
- Simple token-based authentication

## Setup Instructions

### Option 1: Docker (Recommended)

#### Prerequisites
- Docker and Docker Compose installed

#### Quick Start
```bash
# Start all services (Backend + Frontend + Database)
docker-compose up --build -d
```

#### Individual Services
```bash
# Backend + Database only
docker-compose up --build -d backend mongodb

# Frontend only
docker-compose up --build -d frontend

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Option 2: Manual Setup

#### Prerequisites
- Node.js (v22 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

#### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd Ahead-websoft-assignment
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start MongoDB:**
   Make sure MongoDB is running on your system. Default connection: `mongodb://localhost:27017/formbuilder`

5. **Start the Application:**
   
   **Option 1: Use the startup script (Windows):**
   ```bash
   # From the root directory
   start.bat
   ```
   
   **Option 2: Manual startup:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

### Access the Application

#### Docker Setup
- **Frontend (Admin & Public)**: http://localhost
- **Backend API**: http://localhost:3000
- **Admin Interface**: http://localhost/admin
- **Public Forms**: http://localhost/forms/{form-id}

#### Manual Setup
- **Frontend (Admin & Public)**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Admin Interface**: http://localhost:5173/admin
- **Public Forms**: http://localhost:5173/forms/{form-id}

## API Endpoints

### Admin Routes (Require Authentication)
- `GET /api/admin/forms` - List all forms
- `POST /api/admin/forms` - Create new form
- `GET /api/admin/forms/:id` - Get form by ID
- `PUT /api/admin/forms/:id` - Update form
- `DELETE /api/admin/forms/:id` - Delete form
- `GET /api/admin/forms/:id/submissions` - Get form submissions

### Public Routes
- `GET /api/forms/:id` - Get public form
- `POST /api/forms/:id/submissions` - Submit form data

## Authentication

The admin routes use a simple token-based authentication. The default token is `admin-secret-token`. Include it in the Authorization header:

```
Authorization: Bearer admin-secret-token
```

## Environment Variables

### Backend (.env)
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/formbuilder
ADMIN_TOKEN=admin-secret-token
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## Usage

1. **Create Forms**: Navigate to `/admin` to create and manage forms
2. **Add Fields**: Use the field editor to add various input types
3. **Configure Validation**: Set up validation rules for each field
4. **Preview Forms**: Use the preview feature to test forms
5. **Share Forms**: Copy the public form URL to share with users
6. **View Submissions**: Check form submissions in the admin interface

## Development

### Docker Development
```bash
# Start all services in development mode
docker-compose up --build

# View logs for specific service
docker-compose logs -f frontend
docker-compose logs -f backend

# Restart specific service
docker-compose restart frontend
docker-compose restart backend

# Stop all services
docker-compose down

# Reset all data (including database)
docker-compose down -v
```

### Manual Development

#### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

#### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon
npm start            # Start production server
```

## Project Structure

```
Ahead-websoft-assignment/
├── backend/
│   ├── middleware/     # Authentication middleware
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── server.js       # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── lib/        # Utilities and API
│   │   ├── types/      # TypeScript types
│   │   └── pages/      # Page components
│   └── public/         # Static assets
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request