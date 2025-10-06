# Cognis - AI Forensic Assistant

A comprehensive digital forensics platform that combines AI-powered analysis with intuitive user interfaces for law enforcement and investigative agencies.

## 🚀 Features

- **File Upload & Processing**: Upload UFDR files for forensic analysis
- **AI-Powered Search**: Natural language queries across evidence
- **Network Analysis**: Visual relationship mapping and entity detection
- **Real-time Chat**: Interactive AI assistant for case analysis
- **Audit Logging**: Comprehensive activity tracking
- **Role-based Access**: Admin and Investigator permissions
- **Dashboard Analytics**: Case statistics and insights

## 🏗️ Architecture

### Backend (FastAPI)
- **Authentication**: JWT-based auth with role management
- **Database**: PostgreSQL with SQLAlchemy ORM
- **API**: RESTful endpoints with versioning
- **File Processing**: UFDR file upload and artifact extraction
- **AI Integration**: Conversation and search capabilities

### Frontend (React + Vite)
- **Modern UI**: Clean, responsive interface
- **Real-time Updates**: Live chat and notifications
- **Interactive Visualizations**: Network graphs and dashboards
- **Authentication**: Secure login/signup flow

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/cognis_db
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   ```

5. **Initialize database:**
   ```bash
   alembic upgrade head
   ```

6. **Start the backend server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd Cognis-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Backend Configuration
- **CORS**: Configured for `localhost:3000` and `localhost:5173`
- **API Versioning**: All endpoints prefixed with `/api/v1`
- **Authentication**: JWT tokens with 60-minute expiry
- **File Upload**: Supports UFDR files in uploads directory

### Frontend Configuration
- **API Base URL**: `http://localhost:8000`
- **Authentication**: Token stored in localStorage
- **Real-time Updates**: WebSocket connections for live data

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/users/me` - Get current user

### File Management
- `POST /api/v1/ufdr/upload` - Upload UFDR files
- `GET /api/v1/artifacts/list/{ufdr_file_id}` - List artifacts
- `GET /api/v1/chat/conv/{ufdr_file_id}` - AI conversation

### Dashboard
- `GET /api/v1/dashboard/summary` - System statistics
- `GET /api/v1/audit/logs` - Audit logs (admin only)

## 🎯 Usage

### For Investigators
1. **Login** with your credentials
2. **Upload Evidence** using the drag-and-drop interface
3. **Search Evidence** with natural language queries
4. **Analyze Networks** using the visual dashboard
5. **Chat with AI** for real-time assistance

### For Administrators
1. **Access Admin Panel** for system management
2. **View Audit Logs** for security monitoring
3. **Manage Cases** and user permissions
4. **System Analytics** for performance insights

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Admin and Investigator permissions
- **Audit Logging**: Complete activity tracking
- **CORS Protection**: Configured for specific origins
- **Input Validation**: Pydantic schemas for data validation

## 🚀 Deployment

### Production Backend
```bash
# Install production dependencies
pip install gunicorn

# Run with Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Production Frontend
```bash
# Build for production
npm run build

# Serve with a web server (nginx, Apache, etc.)
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS includes your frontend URL
2. **Database Connection**: Check PostgreSQL is running and credentials are correct
3. **File Upload Issues**: Verify uploads directory has write permissions
4. **Authentication Errors**: Check JWT secret key is consistent

### Debug Mode
- Backend: Add `--reload` flag to uvicorn command
- Frontend: Use `npm run dev` for hot reloading

## 📝 Development

### Adding New Features
1. **Backend**: Add routes in `app/api/routes/`
2. **Frontend**: Create components in `src/components/`
3. **Database**: Create migrations with Alembic
4. **API Integration**: Update `src/services/api.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

**Cognis** - Empowering digital forensics with AI-driven insights.

