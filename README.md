# Zeus OPK Manager - Admin Portal

A modern, production-ready admin portal for managing users, subscriptions, and system settings for the Zeus OPK Manager desktop application.

## 🚀 Features

### Dashboard
- Real-time statistics (Total Users, Active Subscriptions, Trial Users, etc.)
- Recent user registrations
- System overview at a glance

### User Management
- View all registered users in a searchable, sortable table
- Filter users by status (Trial, Active, Expired, Banned)
- Search by username or HWID
- View detailed user information
- Upgrade users to paid subscriptions (1/3/6/12 months or lifetime)
- Set custom expiry dates
- Ban/Unban users with reasons
- Reset HWID (allow re-registration on new machine)
- Delete users
- Track user activity and sessions

### Active Sessions
- Monitor all active user sessions in real-time
- Auto-refresh every 30 seconds
- View session details (HWID, IP, last heartbeat)
- Terminate sessions manually

### Subscription Tiers Management
- CRUD operations for subscription plans
- Configure pricing (monthly and lifetime)
- Set max bots per tier
- Reorder tiers with drag-and-drop
- Toggle active/inactive status
- Prevent deletion of tiers with active users

### Game Servers Management
- CRUD operations for game servers
- Configure server details (name, master server, index)
- Reorder servers
- Toggle active/inactive status
- Prevent deletion of servers assigned to users

### Audit Logs
- Track all system activities and changes
- Filter by action type, username, and date range
- Pagination (50 logs per page)
- Detailed JSON information for each action

### Settings
- Configure system-wide settings:
  - Default trial duration
  - Session check interval
  - Maintenance mode
  - Force update version
  - Max login attempts
  - Session timeout

## 🛠️ Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **Routing:** React Router v6
- **Database:** Supabase (PostgreSQL)
- **Icons:** Lucide React
- **Date Formatting:** date-fns
- **Notifications:** React Hot Toast
- **Deployment:** Vercel

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase project with tables configured
- Admin credentials for portal access

## 🔧 Installation

1. **Clone or extract the project:**
   ```bash
   cd ZeusAdminPortal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   The `.env.local` file is already created with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://vcfcmctwufipwsiemrtw.supabase.co
   VITE_SUPABASE_SERVICE_KEY=your_service_role_key
   VITE_ADMIN_USERNAME=admin
   VITE_ADMIN_PASSWORD=Zeus2024!Admin
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Access the portal:**
   Open your browser to `http://localhost:3000`

## 🏗️ Build for Production

```bash
npm run build
```

The build output will be in the `dist` folder.

## 🚀 Deploy to Vercel

### Option 1: Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set environment variables in Vercel:**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_SERVICE_KEY
   vercel env add VITE_ADMIN_USERNAME
   vercel env add VITE_ADMIN_PASSWORD
   ```

### Option 2: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select this repository
4. Configure environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_SERVICE_KEY`
   - `VITE_ADMIN_USERNAME`
   - `VITE_ADMIN_PASSWORD`
5. Click "Deploy"

## 📁 Project Structure

```
zeus-admin/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx          # Main dashboard with stats
│   │   ├── UserList.jsx            # User management table
│   │   ├── UserDetails.jsx         # Detailed user view & actions
│   │   ├── SessionsList.jsx        # Active sessions monitor
│   │   ├── SubscriptionTiers.jsx   # Tier management
│   │   ├── GameServers.jsx         # Server management
│   │   ├── AuditLogs.jsx           # Activity logs
│   │   ├── Settings.jsx            # System settings
│   │   ├── Layout.jsx              # Main layout with sidebar
│   │   ├── Stats.jsx               # Statistics cards
│   │   └── Login.jsx               # Authentication page
│   ├── services/
│   │   └── supabaseClient.js       # Supabase configuration
│   ├── utils/
│   │   └── formatters.js           # Date/currency formatters
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles
├── .env.local                      # Environment variables
├── .gitignore                      # Git ignore rules
├── package.json                    # Dependencies
├── tailwind.config.js              # Tailwind configuration
├── vercel.json                     # Vercel config
└── README.md                       # This file
```

## 🔒 Security

- Uses Supabase Service Role key for admin-level database access
- Simple authentication with hardcoded credentials (stored in env variables)
- HTTPS enforced in production
- Session-based authentication with localStorage
- All sensitive data in environment variables
- `.env.local` excluded from git

## 🧪 Testing Checklist

- [x] Dashboard displays statistics correctly
- [x] User list loads and filters work
- [x] User details page shows complete information
- [x] User upgrade functionality works
- [x] Ban/Unban users with reasons
- [x] HWID reset functionality
- [x] User deletion with confirmation
- [x] Active sessions display and refresh
- [x] Session termination
- [x] Subscription tiers CRUD operations
- [x] Tier reordering
- [x] Game servers CRUD operations
- [x] Server reordering
- [x] Audit logs with filters and pagination
- [x] Settings page with all configurations
- [x] Login/Logout functionality
- [x] Responsive design
- [x] Error handling and notifications
- [x] Loading states

## 📝 Database Schema

The portal connects to these Supabase tables:

- **users** - User accounts and subscription info
- **subscription_tiers** - Available subscription plans
- **game_servers** - Available game servers
- **sessions** - Active user sessions
- **user_bots** - User-created bots
- **audit_logs** - System activity logs
- **app_settings** - Global configuration

## 🎨 Design

- Dark theme for comfortable extended use
- Responsive design (desktop and tablet)
- Professional admin dashboard aesthetic
- Consistent color scheme and spacing
- Smooth transitions and hover effects
- Loading states and error handling
- Toast notifications for user feedback

## 🔑 Default Credentials

**Username:** admin  
**Password:** Zeus2024!Admin

⚠️ **Important:** Change these credentials in the `.env.local` file before deploying to production!

## 📞 Support

For issues or questions about the Zeus OPK Manager Admin Portal, please refer to the main project documentation.

## 📄 License

This admin portal is part of the Zeus OPK Manager project.

---

**Version:** 1.0.0  
**Last Updated:** March 2026
