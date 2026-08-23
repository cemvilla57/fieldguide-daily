# Pinnacle Daily Reports

A comprehensive field operations management platform that combines **AI-powered field update analysis**, **real-time project tracking**, **photo documentation**, and **automated reporting** with enterprise-grade file storage.

## 🌟 Key Features

### Field Operations
- ✅ **Daily Field Updates** - Technicians submit text and voice notes with photos
- ✅ **Photo Management** - Upload to Supabase or Box with automatic organization
- ✅ **Voice Notes** - Record and transcribe field updates
- ✅ **Real-time Sync** - Instant data synchronization across devices

### AI-Powered Intelligence
- ✅ **Automated Analysis** - OpenAI GPT-4 analyzes field updates
- ✅ **Intelligent Extraction** - Automatically identifies completed work, planned work, risks, materials needed
- ✅ **Change Order Detection** - AI flags potential change orders
- ✅ **Confidence Scoring** - Validates AI analysis accuracy

### Project Management
- ✅ **Project Tracking** - Full lifecycle project management
- ✅ **Milestones** - Track project phases and progress
- ✅ **Task Management** - Assign and monitor crew tasks
- ✅ **Leads Pipeline** - Sales opportunity tracking

### Enterprise Features
- ✅ **Multi-tenant Architecture** - Complete data isolation
- ✅ **Role-Based Access** - Admin, Project Manager, Supervisor, Crew Lead, Technician
- ✅ **Audit Logs** - Complete activity tracking
- ✅ **Automated Reports** - Daily, weekly, and monthly reports
- ✅ **Box Integration** - Enterprise file storage with secure sharing

## 🏗️ Tech Stack

**Frontend:**
- Next.js 14 (React with App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui Components
- TanStack React Query (data fetching)
- Zustand (state management)

**Backend:**
- Next.js API Routes
- Node.js
- TypeScript
- Axios for HTTP requests

**Database & Storage:**
- Supabase (PostgreSQL)
- Row Level Security (RLS) for multi-tenancy
- Supabase Storage (default)
- Box API (enterprise option)

**AI & External Services:**
- OpenAI GPT-4 Turbo
- Box API (OAuth 2.0)

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project
- OpenAI API key
- Box account (optional, for enterprise file storage)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/cemvilla57/pinnacle-daily-reports.git
cd pinnacle-daily-reports
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables
```bash
cp .env.local.example .env.local
```

Fill in your values:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=sk_your_key

# Box (optional)
BOX_CLIENT_ID=your_box_client_id
BOX_CLIENT_SECRET=your_box_client_secret
BOX_ENTERPRISE_ID=your_enterprise_id

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Up Supabase Database
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase
supabase init

# Run migrations
supabase db push
```

Or use the Supabase dashboard:
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Run migrations from `supabase/migrations/` folder in order:
   - `001_create_core_schema.sql`
   - `002_create_rls_policies.sql`
   - `003_seed_data.sql`

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
pinnacle-daily-reports/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── auth/             # Authentication pages
│   │   └── (app)/            # Protected app pages
│   ├── components/           # React components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and helpers
│   ├── services/             # API service layer
│   └── types/                # TypeScript types
├── supabase/
│   └── migrations/           # Database migrations
├── public/                   # Static assets
└── package.json
```

## 🔐 Authentication

### Sign Up Flow
1. User registers with email, password, full name, and organization name
2. New organization is created with user as admin
3. User profile is linked to organization
4. Session created with Supabase Auth

### Sign In Flow
1. User logs in with email and password
2. User profile and organization fetched
3. Last login timestamp updated
4. User can access organization data

### Role-Based Access
- **Admin** - Full system access
- **Project Manager** - Create/manage projects
- **Supervisor** - Approve field updates and AI analysis
- **Crew Lead** - Create tasks and assign work
- **Technician** - Submit field updates
- **Customer** - View-only access to projects

## 🤖 AI Analysis Workflow

1. **Field Technician** submits daily update with text/voice/photos
2. **Update Status** changes to `pending_review`
3. **AI System** analyzes update using OpenAI GPT-4:
   - Extracts completed work
   - Identifies planned work
   - Flags risks and issues
   - Detects materials needed
   - Identifies change orders
4. **Supervisor** reviews AI analysis
5. **Approval Actions**:
   - ✅ **Approve**: Creates tasks, materials, risks, change orders
   - ❌ **Reject**: Sends back for resubmission
6. **Update Status** becomes `approved` or `rejected`

## 📸 Photo Management

### Upload Options

**Supabase Storage (Default)**
- Simple cloud storage
- Automatic organization hierarchy
- Public URLs for sharing
- Perfect for most use cases

**Box Storage (Enterprise)**
- Enterprise compliance
- Advanced sharing controls
- Workflow integration
- Automatic folder hierarchy

```bash
# Upload to Supabase
POST /api/updates/[id]/photos
Content-Type: multipart/form-data
{
  file: File
  caption: string (optional)
  projectId: string
  storageProvider: 'supabase'
}

# Upload to Box
POST /api/updates/[id]/photos
Content-Type: multipart/form-data
{
  file: File
  caption: string (optional)
  projectId: string
  storageProvider: 'box'
}
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Sign in user
- `POST /api/auth/logout` - Sign out user
- `GET /api/auth/session` - Get current session

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Archive project

### Daily Updates
- `GET /api/updates` - List updates
- `POST /api/updates` - Create update
- `GET /api/updates/[id]` - Get update details
- `POST /api/updates/[id]/analyze` - Analyze with AI
- `POST /api/updates/[id]/approve` - Approve update
- `POST /api/updates/[id]/reject` - Reject update

### Photos
- `POST /api/updates/[id]/photos` - Upload photo
- `GET /api/updates/[id]/photos` - List photos
- `PUT /api/photos/[photoId]` - Update caption
- `DELETE /api/photos/[photoId]` - Delete photo

### Tasks
- `GET /api/projects/[id]/tasks` - List tasks
- `POST /api/projects/[id]/tasks` - Create task
- `GET /api/tasks/[id]` - Get task details
- `PUT /api/tasks/[id]` - Update task
- `GET /api/tasks/overdue` - Get overdue tasks

### Reports
- `GET /api/reports` - List reports
- `POST /api/reports/daily` - Generate daily report
- `POST /api/reports/weekly` - Generate weekly report
- `GET /api/reports/[id]` - Get report
- `POST /api/reports/[id]/export` - Export report

## 🔧 Configuration

### Box Integration Setup

1. **Create Box Developer Account**
   - Visit [Box Developer Console](https://app.box.com/developers/console)
   - Create new application (Service Account)

2. **Generate Credentials**
   - Copy Client ID
   - Copy Client Secret
   - Note Enterprise ID

3. **Configure Environment**
   ```env
   BOX_CLIENT_ID=your_client_id
   BOX_CLIENT_SECRET=your_client_secret
   BOX_ENTERPRISE_ID=your_enterprise_id
   BOX_ROOT_FOLDER_ID=0
   ```

4. **Set Permissions**
   - Enable "Manage service accounts"
   - Enable "Read/write all files and folders"
   - Enable "Manage enterprise properties"

### OpenAI Setup

1. **Get API Key**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create new API key

2. **Configure**
   ```env
   OPENAI_API_KEY=sk_your_key
   OPENAI_MODEL=gpt-4-turbo-preview
   ```

## 📈 Database Schema

### Core Tables
- `organizations` - Organization accounts
- `users` - User profiles and roles
- `projects` - Project details
- `daily_updates` - Field update submissions
- `ai_analysis` - AI analysis results
- `tasks` - Task assignments
- `milestones` - Project phases
- `photos` - Photo documentation
- `materials` - Material tracking
- `risks` - Risk identification
- `change_orders` - Scope change tracking
- `reports` - Generated reports
- `audit_logs` - Activity tracking

## 🧪 Testing

```bash
# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## 📦 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t pinnacle-daily-reports .

# Run container
docker run -p 3000:3000 pinnacle-daily-reports
```

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_prod_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_prod_service_key
OPENAI_API_KEY=your_prod_openai_key
BOX_CLIENT_ID=your_prod_box_id
BOX_CLIENT_SECRET=your_prod_box_secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

## 🐛 Troubleshooting

### Supabase Connection Issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check Supabase project is active
- Verify RLS policies are enabled

### Box Upload Failures
- Verify Box credentials in `.env.local`
- Check enterprise ID is correct
- Ensure Box app has proper permissions
- Verify root folder ID exists

### AI Analysis Errors
- Check OpenAI API key is valid
- Verify API key has sufficient credits
- Check rate limits haven't been exceeded
- Review OpenAI error messages in logs

### Photo Upload Issues
- Verify file size is under 10MB
- Ensure file type is JPEG, PNG, or WebP
- Check storage provider is configured
- Verify organization and project IDs are correct

## 📚 Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Box API Documentation](https://developer.box.com/reference/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please:
- Open an issue on GitHub
- Email support@pinnacledailyreports.com
- Check our documentation at [docs.pinnacledailyreports.com](https://docs.pinnacledailyreports.com)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- AI by [OpenAI](https://openai.com/)
- Enterprise storage with [Box](https://www.box.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

---

**Made with ❤️ for field operations teams everywhere**
