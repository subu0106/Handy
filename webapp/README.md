# Handy WebApp

A modern, professional web application for managing service requests and offers, built with React and Material UI (MUI).

## Features

- Responsive, split-screen Home page for Service Requests and Offers
- Fixed NavBar with app name, Home icon, theme switch, notifications, and user profile
- Light/dark theme with auto system detection and manual toggle (remembers user preference)
- Smooth client-side navigation (no page refresh)
- Modern UI: icons, hover effects, paper/shadow, and visually appealing buttons
- State management with Redux Toolkit
- API integration ready (see `src/utils/apiService.tsx`)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Install dependencies

```sh
npm install
# or
yarn install
```

### Run the app

```sh
npm run dev
# or
yarn dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) by default.

## Project Structure

- `src/pages/` — Main pages (Home, About, CreateServiceRequest, NotFound)
- `src/components/` — Reusable UI components (NavBar, etc.)
- `src/layouts/` — Layout wrappers (MainLayout)
- `src/store/` — Redux Toolkit slices and store
- `src/routes/` — React Router configuration
- `src/utils/` — Utility functions (API service)

## Customization

- Theme colors and palette: see `src/App.tsx`
- NavBar: edit `src/components/NavBar.tsx`
- Home page layout: edit `src/pages/Home/index.tsx`

## License

MIT
