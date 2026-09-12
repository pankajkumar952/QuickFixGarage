# QuickFix Garage 🔧🚗

### Real-Time Garage Finder & Emergency Vehicle Assistance Platform

**QuickFix Garage** is a full-stack web application designed to help vehicle owners quickly discover nearby garages and request assistance during vehicle breakdowns or emergencies.

The platform provides **location-based garage discovery, secure authentication, role-based dashboards, garage services, and SOS assistance**, creating a practical connection between customers and nearby garage professionals.

> **Built and deployed as a real-world full-stack application using Next.js, PostgreSQL, Drizzle ORM, authentication, and interactive maps.**

---

## 🚀 Live Demo

### 👉 [Open QuickFix Garage](https://fixgarage-nm0lip7f6-pankaj-20b2.vercel.app/)

**Live Application:**  
https://fixgarage-nm0lip7f6-pankaj-20b2.vercel.app/

---

## 🎯 Problem Statement

Vehicle breakdowns can happen unexpectedly, and finding a reliable nearby garage can become difficult, especially during emergencies.

QuickFix Garage aims to simplify this process by providing a centralized platform where users can:

- 📍 Discover nearby garages
- 🔧 Explore available garage services
- 🚨 Send emergency/SOS assistance requests
- 🔐 Securely authenticate into the platform
- 👤 Access dashboards based on their role
- 🏪 Allow garage owners to manage their garage presence

---

## ✨ Key Features

### 📍 Real-Time Garage Discovery

Interactive maps allow users to discover garages based on their location and explore nearby service providers.

### 🚨 SOS Emergency Assistance

A dedicated SOS feature allows users to quickly request assistance when their vehicle requires urgent support.

### 🔐 Secure Authentication

Authentication functionality supports different types of users and provides secure access to the application's protected areas.

### 👥 Role-Based Dashboards

The application provides different experiences for:

- 👤 Customers
- 🔧 Garage Owners / Managers

Each role receives functionality relevant to its responsibilities.

### 🏪 Garage & Service Information

Users can discover garages and view information about the services they provide before requesting assistance.

### 📱 Responsive Interface

The application is designed to provide a smooth experience across desktop and mobile screen sizes.

---

## 🧩 Application Workflow

```text
                 ┌──────────────────┐
                 │      User        │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ Authentication  │
                 └────────┬─────────┘
                          │
             ┌────────────┴────────────┐
             │                         │
             ▼                         ▼
      ┌──────────────┐          ┌───────────────┐
      │   Customer   │          │ Garage Owner  │
      └──────┬───────┘          └───────┬───────┘
             │                          │
             ▼                          ▼
      ┌──────────────┐          ┌───────────────┐
      │ Find Nearby  │          │ Manage Garage │
      │   Garages    │          │   Services    │
      └──────┬───────┘          └───────────────┘
             │
             ▼
      ┌──────────────┐
      │ View Garage  │
      │ & Services   │
      └──────┬───────┘
             │
             ▼
      ┌──────────────┐
      │ Request Help │
      │ / SOS        │
      └──────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

- **Next.js**
- **React**
- **Tailwind CSS**
- **React Leaflet**
- **Leaflet**

### Backend / Application

- **Next.js Server-side functionality**
- **Node.js**
- **NextAuth.js / Auth.js**
- **Nodemailer**

### Database

- **PostgreSQL**
- **Drizzle ORM**
- **Neon PostgreSQL** compatible

### Deployment

- **Vercel**

---

## 🏗️ Technical Highlights

This project demonstrates practical experience with:

- Full-stack application development
- Next.js application architecture
- React component development
- REST/server-side application logic
- PostgreSQL database integration
- ORM-based database operations
- Authentication and authorization
- Role-based application design
- Location-based services
- Interactive map integration
- Environment variable management
- Production deployment with Vercel
- Responsive UI development

---

## 🔐 Authentication & Security

The application includes authentication functionality designed around different user roles.

Environment variables are used for sensitive configuration instead of hard-coding credentials into the source code.

Sensitive values such as:

```text
DATABASE_URL
AUTH_SECRET
GMAIL_EMAIL
GMAIL_APP_PASSWORD
```

are configured through environment variables.

---

## 🗺️ Mapping

QuickFix Garage uses **Leaflet + React Leaflet** to provide interactive map functionality.

The mapping layer allows the application to provide a location-oriented experience for discovering nearby garages.

---

## 🗄️ Database

The application uses **PostgreSQL** as its primary database with **Drizzle ORM** for database interaction.

The database layer is designed to manage application data such as:

- User information
- Garage information
- Services
- Authentication-related data
- Garage/customer relationships
- Assistance requests

---

## 📂 Project Structure

A simplified structure of the application:

```text
quickfix-garage/
│
├── app/
│   ├── api/
│   ├── dashboard/
│   ├── login/
│   └── ...
│
├── components/
│   └── ...
│
├── db/
│   └── ...
│
├── public/
│   └── ...
│
├── lib/
│   └── ...
│
├── drizzle.config.ts
├── package.json
├── next.config.*
├── tailwind.config.*
└── README.md
```

---

## ⚙️ Getting Started Locally

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd quickfix-garage
```

### 2. Install Dependencies

Using pnpm:

```bash
pnpm install
```

Or using npm:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file from the example environment file:

```bash
cp .env.example .env
```

Configure the required values:

```env
DATABASE_URL=your_postgresql_connection_string
AUTH_SECRET=your_auth_secret
GMAIL_EMAIL=your_email
GMAIL_APP_PASSWORD=your_gmail_app_password
```

> Never commit real credentials or secrets to GitHub.

### 4. Push Database Schema

```bash
npx drizzle-kit push
```

### 5. Start Development Server

Using pnpm:

```bash
pnpm dev
```

Or using npm:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🌐 Deployment

QuickFix Garage is deployed using **Vercel**.

For production deployment:

1. Import the GitHub repository into Vercel.
2. Configure the required environment variables.
3. Connect the PostgreSQL database.
4. Deploy the application.
5. Verify authentication, database connectivity, and application functionality.

### Production Application

👉 **https://fixgarage-nm0lip7f6-pankaj-20b2.vercel.app/**

---

## 📈 Future Improvements

Potential improvements for future versions include:

- 🔔 Real-time notifications
- 📍 Advanced garage distance filtering
- ⭐ Garage ratings and reviews
- 💳 Online service/payment integration
- 📞 Direct calling functionality
- 🗺️ Route navigation to selected garages
- 📊 Garage owner analytics dashboard
- 🤖 AI-powered vehicle issue classification
- 📱 Progressive Web App support

---

## 💼 Why This Project?

QuickFix Garage was developed as a practical full-stack project rather than a simple CRUD application.

The project combines multiple real-world engineering concepts:

```text
Frontend
   ↓
Authentication
   ↓
Role-Based Access
   ↓
Server-Side Application Logic
   ↓
PostgreSQL Database
   ↓
Location & Mapping
   ↓
Emergency Assistance Workflow
   ↓
Production Deployment
```

This makes the project a demonstration of **end-to-end web application development**, from UI and authentication to database integration and production deployment.

---

## 📚 What I Practiced

Through this project, I worked with:

- Next.js application development
- React components and UI architecture
- Tailwind CSS
- PostgreSQL database design
- Drizzle ORM
- Authentication
- Role-based access control
- Email/OTP workflows
- Interactive maps
- Server-side application logic
- Environment configuration
- Production deployment
- Debugging and deployment workflows

---

## 📄 License

This project is released under the **MIT License**.

See the `LICENSE` file for more information.

---

## 👨‍💻 Developer

### Er. Pankaj Kumar

**Full-Stack Developer | Java | Spring Boot | React | Next.js | Python | AI/ML**

📍 Hyderabad, India

🔗 **Live Project:**  
https://fixgarage-nm0lip7f6-pankaj-20b2.vercel.app/

---

⭐ If you find this project interesting, consider giving the repository a star.

**Built with ❤️ and modern web technologies by Er. Pankaj Kumar.**
