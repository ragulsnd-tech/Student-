# CampusDesk — Student Management System

A beginner-friendly responsive student management dashboard built with Next.js, React and TypeScript.

## Features
- Dashboard statistics
- Add and delete student records
- Search students
- Toggle attendance between Present and Absent
- Update marks and see a simple grade
- Responsive layout for phone and desktop
- Saves data in the current browser using localStorage

## Run in GitHub Codespaces or on your computer

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
npm run dev
```

Open the forwarded port 3000 in your browser.

## Build for production

```bash
npm run build
npm start
```

## Important note about data

This first version saves records in the browser where the app is opened. It does not yet have cloud database sync, real admin login, or role-based access. If browser storage is cleared, locally saved records may be lost. Do not use real or sensitive student information in this demo. The next development step can connect Supabase for shared cloud storage and authentication.
