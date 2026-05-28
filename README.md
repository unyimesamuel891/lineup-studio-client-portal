# Lineup Studio Client Portal

Lineup Studio is a full-stack-style client portal for a modern neighborhood barbershop. It is built to feel like a real business tool: customers can book and manage appointments quickly, while staff and owners get a practical operations dashboard for appointments, customers, services, revenue, and schedule planning.

This project was designed as a portfolio piece to demonstrate product thinking as much as code. The goal was not to make a decorative landing page, but to build the kind of workflow-heavy app a local service business could actually use.

## Live Project

- Live demo: https://lineup-studio-client-portal.vercel.app
- Source code: https://github.com/unyimesamuel891/lineup-studio-client-portal

## What It Demonstrates

- Role-based authentication for customers, staff, and admins
- Full CRUD workflows across users, barbers, services, appointments, reviews, and notes
- Scheduling logic with barber availability, service duration, slot conflicts, and cancellation cutoffs
- A seeded relational data model that makes the app feel alive immediately
- Staff dashboard UX with revenue, appointment volume, repeat customers, top services, and pending actions
- Customer booking UX optimized for speed and clarity
- Responsive layouts for mobile customers and desktop staff
- Form validation, empty states, success/error feedback, status badges, avatars, and calendar blocks

## Core Features

### Customer Portal

- Sign up and log in as a customer
- Manage profile details and preferences
- Browse realistic barbershop services
- Book an appointment by choosing service, barber, date, and time
- View upcoming and past appointments
- Cancel or reschedule before the cutoff window
- Leave a rating and review after completed appointments

### Staff/Admin Portal

- View today’s appointments and key business metrics
- Track weekly revenue, top services, repeat customers, and pending cancellations
- Confirm, complete, cancel, or mark appointments as no-show
- Search and filter appointment lists
- Manage barbers, specialties, services, pricing, duration, and availability
- Browse a customer directory with appointment history and internal notes
- Review simple revenue and service popularity charts
- Use a daily calendar view grouped by barber

## Tech Stack

- React
- TypeScript
- Vite
- Lucide React
- Local database abstraction over `localStorage`
- Custom scheduling and analytics helpers
- CSS modules-style component organization with plain CSS

## Demo Accounts

All demo accounts use:

```text
password123
```

| Role | Email |
| --- | --- |
| Customer | `jordan@lineup.test` |
| Admin | `owner@lineup.test` |
| Staff | `staff@lineup.test` |

## Running Locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://127.0.0.1:5173
```

Build for production:

```bash
npm run build
```

## Project Structure

```text
src/
  components/       Role-specific and shared UI components
  data/             Date-aware seed data
  lib/              Local database, formatting, and scheduling helpers
  App.tsx           Auth and role-based routing shell
  main.tsx          React entry point
  styles.css        Responsive product UI styling
```

## Data Model

The app models the core entities a service business needs:

- Users
- Barbers
- Services
- Appointments
- Reviews
- Business settings
- Customer notes
- Appointment notes

## Product Notes

The app intentionally opens directly into the booking flow or staff dashboard after login. That choice keeps the experience focused on actual work instead of marketing content. The seeded data is generated relative to the current date, so today’s schedule and dashboard metrics remain useful when the project is opened later.

## Future Improvements

- Move from `localStorage` to Postgres, SQLite, or Supabase
- Add secure server-side sessions and password hashing
- Add SMS/email appointment confirmations
- Support barber time-off rules and recurring availability exceptions
- Add deposits, payment status, and cancellation fees
- Add payroll/accounting exports
- Add owner-only permissions for business-critical settings
