# Room Vista

Room Vista is a web-based interior design tool developed for the PUSL3122 HCI, Computer Graphics, and Visualisation coursework.  
It allows designers to create room layouts in 2D and preview them in 3D with customizable furniture, lighting, and room appearance.

## Live Deployment

- Vercel: `https://room-vista-sooty.vercel.app/`

## Demo Accounts

Use these credentials for testing:

### Super Admin
- Email: `superadmin@roomvista.com`
- Password: `Superadmin@123`

### Designer
- Email: `designer@roomvista.com`
- Password: `Designer@123`

## Core Features

- Firebase authentication with role-based access (`superadmin`, `designer`)
- Admin approval workflow for designer accounts
- Furniture library management (add/edit/delete items, upload GLB + thumbnails)
- 2D room editor with:
  - Grid + ruler
  - Drag, rotate, resize furniture
  - Collision checks
  - Undo/redo
  - Save/update/load/delete designs
- 3D room visualization with:
  - Real-time 2D to 3D mapping
  - GLB model rendering
  - Room/furniture color control
  - Shading/light intensity controls

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- Konva / React Konva (2D editor)
- Three.js + React Three Fiber + Drei (3D view)
- Firebase Auth + Firebase Admin SDK
- MongoDB + Mongoose
- Cloudinary (model/thumbnail upload)

## Project Structure

```txt
src/
  app/
    api/                # Auth, users, designs, furniture endpoints
    dashboard/          # Saved designs and design management
    editor/             # 2D/3D editor experience
    furniture/          # Superadmin furniture management
    login/signup/       # Authentication pages
  components/           # Shared UI components (e.g. dialogs)
  lib/                  # Firebase, MongoDB, Cloudinary clients
  models/               # Mongoose models
```

## Environment Variables

Create a `.env.local` file in the project root with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

MONGODB_URI=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Local Setup

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Useful Scripts

```bash
npm run dev      # start development server
npm run lint     # run ESLint
npm run build    # production build
npm run start    # run production server
```

## Notes

- This repository is coursework-focused and includes demo credentials for marking/testing.
- For production use, rotate credentials and never expose account passwords in public documentation.
