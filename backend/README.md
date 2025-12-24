# Rose Backend

Node.js backend server for the Rose application built with Express.js and TypeScript.

## Features

- ✅ Express.js server with TypeScript
- ✅ CORS configuration for frontend integration
- ✅ Helmet for security headers
- ✅ Environment-based configuration
- ✅ Error handling middleware
- ✅ Health check endpoint
- ✅ Hot reload with nodemon
- ✅ API versioning structure

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables in `.env`:**
   ```env
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

## Available Scripts

### Development
```bash
npm run dev
```
Starts the development server with hot reload on port 5000 (or configured PORT).

### Build
```bash
npm run build
```
Compiles TypeScript to JavaScript in the `dist` folder.

### Production
```bash
npm start
```
Runs the compiled production build.

### Type Check
```bash
npm run type-check
```
Runs TypeScript type checking without emitting files.

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and uptime information.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "OK",
    "timestamp": "2025-11-29T15:05:00.000Z",
    "uptime": 123.456,
    "environment": "development"
  }
}
```

### API v1
All API endpoints are prefixed with `/api/v1/`

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration management
│   │   └── index.ts
│   ├── controllers/      # Route controllers
│   │   └── healthController.ts
│   ├── middleware/       # Express middleware
│   │   └── errorHandler.ts
│   ├── routes/          # API routes
│   │   └── index.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   └── index.ts         # Main server file
├── dist/                # Compiled JavaScript (generated)
├── .env                 # Environment variables (create from .env.example)
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
└── tsconfig.json
```

## Adding New Routes

1. Create a controller in `src/controllers/`
2. Create a route file in `src/routes/`
3. Import and use the route in `src/routes/index.ts`

Example:
```typescript
// src/controllers/userController.ts
export const getUsers = (req: Request, res: Response) => {
  res.json({ success: true, data: [] });
};

// src/routes/userRoutes.ts
import { Router } from 'express';
import { getUsers } from '../controllers/userController';

const router = Router();
router.get('/', getUsers);

export default router;

// src/routes/index.ts
import userRoutes from './userRoutes';
apiRouter.use('/users', userRoutes);
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

## Development Workflow

1. Make changes to files in `src/`
2. Server automatically restarts (nodemon)
3. Test endpoints using curl, Postman, or your frontend
4. Build for production when ready

## Testing the Server

```bash
# Test health check
curl http://localhost:5000/health

# Expected response
{"success":true,"data":{"status":"OK","timestamp":"...","uptime":...,"environment":"development"}}
```

## Integration with Frontend

The backend is configured to accept requests from `http://localhost:3000` by default. Update `CORS_ORIGIN` in `.env` if your frontend runs on a different port.

## License

ISC
