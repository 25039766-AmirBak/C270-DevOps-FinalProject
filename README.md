# SharePlate — Volunteering Web App

A full-stack volunteering platform: a landing page showing live "available food"
pulled from MongoDB, a scheduling page where volunteers pick a date and book a
delivery slot to a family's address (styled after a date-chip + slot-card
layout), and a confirmation page once the booking is saved.

## Project structure

```
shareplate-app/
├── backend/
│   ├── models/
│   │   ├── FoodDonation.js       -> reads/writes the existing "donations" collection
│   │   ├── FamilyLocation.js     -> new "familyLocations" collection
│   │   └── VolunteerBooking.js   -> new "volunteerBookings" collection
│   ├── routes/
│   │   ├── food.js               -> GET /api/food
│   │   ├── locations.js          -> GET /api/locations
│   │   └── bookings.js           -> GET /api/bookings?date=, POST /api/bookings, GET /api/bookings/:id
│   ├── server.js
│   ├── seed.js                   -> populates sample data
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── api/index.js          -> all fetch calls to the backend
    │   ├── components/NavBar.jsx
    │   └── pages/
    │       ├── LandingPage.jsx   -> hero banner + Available Food section
    │       ├── SchedulePage.jsx  -> date chips + location slot cards, matching the reference UI
    │       └── ConfirmationPage.jsx
    └── package.json
```

## How the three pages connect

1. **Landing Page (`/`)** — fetches `GET /api/food` and shows every donation
   currently marked `Available` in your `donations` collection.
2. **Schedule Page (`/schedule`)** — a horizontal row of date chips (like the
   reference screenshot) lets volunteers pick a day. Below that, each family
   location shows three colored slot cards (Morning / Afternoon / Evening).
   Cards already booked for that date show "Booked" and are disabled; open
   ones show "Available" with a Book button. Booking calls
   `POST /api/bookings` with the volunteer's name, email, date, time slot,
   and chosen location.
3. **Confirmation Page (`/confirmation/:bookingId`)** — after a successful
   booking, the app redirects here and fetches `GET /api/bookings/:id` to
   display the saved details back to the volunteer, proving it's now in the
   database.

## Step-by-step setup

### 1. Extract the zip

Unzip `shareplate-app.zip` anywhere on your computer, e.g.:
```
C:\Users\AuYongXian\Downloads\RP\AY2026 Semester 1\C270 DevOps Essentials\Project\shareplate-app
```

### 2. Set up the backend

```powershell
cd shareplate-app\backend
npm install
```

Copy `.env.example` to `.env`:
```powershell
copy .env.example .env
```
Open `.env` in VS Code and confirm `MONGO_URI` points to your real Atlas
connection string (it's pre-filled with the one from your earlier messages —
double check it's still correct, and change the password if you've rotated it).

### 3. Seed sample data (optional but recommended)

This adds a handful of sample food items and family addresses so the app has
something to show immediately:
```powershell
npm run seed
```
You should see confirmation messages for both collections. Safe to run again —
it skips collections that already have data.

### 4. Start the backend

```powershell
npm run dev
```
(If `nodemon` isn't installed, run `npm install --save-dev nodemon` first, or
just use `npm start` instead.)

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

### 5. Set up the frontend

Open a **new** terminal (keep the backend running in the first one):
```powershell
cd shareplate-app\frontend
npm install
npm start
```
This opens `http://localhost:3000` in your browser automatically.

### 6. Try the full flow

1. On the landing page, scroll to **Available Food** — you should see the
   seeded (or real) donations pulled live from MongoDB.
2. Click **Become a Volunteer** or **Schedule a Slot**.
3. Fill in your name, email, pick a date, time slot, and family address.
4. Click **Confirm Slot**.
5. You'll be redirected to the confirmation page showing your booking details.
6. Check your MongoDB Atlas `volunteerBookings` collection — your new booking
   should now be there.

## Exporting / re-zipping your own copy

Once you've made changes in VS Code, you can re-zip the project to share with
teammates (excluding `node_modules`, which regenerates from `package.json`):

```powershell
cd shareplate-app
Compress-Archive -Path backend,frontend -DestinationPath shareplate-app.zip -Force
```
(If `node_modules` folders exist and you want to exclude them from the zip,
delete them first, or zip via Git — `git archive` naturally skips
gitignored folders.)

## Deploying with Docker + Ansible

The backend from your earlier project already has a `Dockerfile` and
`docker-compose.yml` pattern you can reuse here — copy those into
`backend/`, point `CMD` at `server.js`, and reuse the same Ansible
playbook structure (`deploy.yml`, `inventory.ini`, `vault.yml`) to deploy
this backend to your teammate's VM. Ask me for the updated Dockerfile and
playbook once you're ready for that step — they just need the port and
folder names adjusted to match this project.

## Security note

Your MongoDB username and password have appeared in this chat several times.
Once your setup is confirmed working, go to **Atlas → Database Access** and
rotate the password, then update it in your local `.env` file only (never
commit `.env` to GitHub — it's already in `.gitignore`).
