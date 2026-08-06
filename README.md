# VillageConnect

VillageConnect is a full-stack community platform that connects village users with services including agriculture, healthcare, education, jobs, environmental awareness, and grievance management.

## 🌟 Main Features

- Secure user authentication with role-based access
- Job listings, details, and application workflows
- Agriculture guidance and support resources
- Healthcare service listings and information
- Education programs, scholarships, and resources
- Environmental awareness and sustainability content
- Grievance submission, tracking, and detail views
- Admin dashboard for management and oversight

## 🧱 Tech Stack

### Frontend

- React 19
- Vite 7.3
- Wouter for client-side routing
- @tanstack/react-query for API state
- Tailwind CSS and Radix UI components
- Zod for validation

### Backend

- Node.js
- Express 5
- MongoDB with Mongoose
- JSON Web Tokens for auth
- bcryptjs for password hashing
- CORS for cross-origin access

## 🚀 Setup Instructions

### 1. Install dependencies

Install backend and frontend dependencies separately:

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 2. Configure environment variables

Create `.env` files for backend and frontend.

#### backend/.env

```env
NODE_ENV=development
PORT=8001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:5174
```

#### frontend/.env

```env
VITE_API_URL=http://localhost:8001
```

### 3. Run the backend

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:8001`.

### 4. Run the frontend

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5174`.

## 📁 Project Structure

```plain
Village-Connect-main/
├── backend/
│   ├── build.mjs
│   ├── package.json
│   ├── src/
│   │   ├── app.js
│   │   ├── index.js
│   │   ├── lib/
│   │   │   ├── auth.js
│   │   │   ├── db/
│   │   │   │   ├── adapter.js
│   │   │   │   ├── connection.js
│   │   │   │   ├── index.js
│   │   │   │   └── models.js
│   │   │   └── logger.js
│   │   └── routes/
│   │       ├── agriculture.js
│   │       ├── auth.js
│   │       ├── dashboard.js
│   │       ├── education.js
│   │       ├── environmental.js
│   │       ├── grievances.js
│   │       ├── healthcare.js
│   │       └── jobs.js
│   └── .env

├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── api-client/
│   │   │   └── utils.js
│   │   └── pages/
│   │       ├── admin.jsx
│   │       ├── agriculture.jsx
│   │       ├── applications.jsx
│   │       ├── dashboard.jsx
│   │       ├── education.jsx
│   │       ├── environmental.jsx
│   │       ├── environmental-detail.jsx
│   │       ├── grievances.jsx
│   │       ├── healthcare.jsx
│   │       ├── home.jsx
│   │       ├── jobs.jsx
│   │       ├── job-detail.jsx
│   │       ├── job-post.jsx
│   │       ├── login.jsx
│   │       ├── profile.jsx
│   │       ├── register.jsx
│   │       └── not-found.jsx

└── README.md
```

## 🧪 Scripts

### Backend

- `npm run dev` — Build and start backend
- `npm run build` — Build backend with ESBuild
- `npm start` — Run built backend

### Frontend

- `npm run dev` — Start Vite dev server
- `npm run build` — Build frontend
- `npm run serve` — Preview production build

## 🔌 Environment Variables

Backend `.env` example:

```env
NODE_ENV=development
PORT=8001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:5174
```

Frontend `.env` example:

```env
VITE_API_URL=http://localhost:8001
```

## 📌 Notes

- Frontend routing uses `wouter`.
- Data fetching is handled using `@tanstack/react-query`.
- Backend uses `mongoose` to connect to MongoDB and `jsonwebtoken` for auth.
- Update `MONGO_URI` before starting the backend.

## 🤝 Contribution

Contributions are welcome. Open issues or submit pull requests to improve the project.

- **Grievances** - Community grievances and resolutions

## 📦 Available Scripts

### Backend

```bash
npm run build    # Build the project
npm run dev      # Start in development mode
npm run start    # Run production build
```

### Frontend

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Verify `MONGO_URI` is correct in `.env`
- Ensure MongoDB Atlas network access includes your IP
- Check that credentials are properly encoded

### Port Already in Use

- Backend: Change `PORT` in `.env` (default: 8001)
- Frontend: Update `VITE_PORT` in `.env`

### CORS Errors

- Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL
- Default: `http://localhost:5174`

### Missing Dependencies

```bash
# Reinstall dependencies
cd backend
npm install

cd ../frontend
npm install
```

## 📝 Environment Variables

### Backend (.env)

```env
NODE_ENV=development              # Environment mode
PORT=8001                         # Server port
MONGO_URI=<connection_string>     # MongoDB Atlas URI
JWT_SECRET=<secret_key>           # JWT signing key
JWT_EXPIRY=7d                     # Token expiration time
CORS_ORIGIN=http://localhost:5174 # Allowed frontend origin
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8001 # Backend API URL
```

## 🚀 Deployment

### Frontend (Vercel, Netlify, GitHub Pages)

```bash
npm run build
# Deploy the dist/ folder
```

### Backend (Heroku, Railway, AWS)

```bash
# Set environment variables on hosting platform
# Deploy with appropriate buildpack
```

### Database

Use MongoDB Atlas for cloud database or deploy MongoDB server on your platform.

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues, feature requests, or questions, please open an issue on GitHub or contact the development team.

---

**Happy coding!** 🎉
