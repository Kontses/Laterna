<h1 align="center">✨ Laterna ✨</h1>

<p align="center">
<img src="frontend/public/laternalogo-full.png" alt="Laterna Logo!" style="display: block; margin: 0 auto;">
</p>

# Ανάλυση Εφαρμογής Laterna

Ένα DEMO για το πως μπορεί να υλοποιηθεί η <a href="https://www.1431am.org/laterna/" target="laterna">Laterna</a> σε standalone εφαρμογή και browser.

## Γενική Επισκόπηση

Η εφαρμογή Laterna είναι μια πλατφόρμα streaming μουσικής και κοινωνικής δικτύωσης. Περιλαμβάνει:

-   🎸 Αναπαραγωγή μουσικής (επόμενο/προηγούμενο τραγούδι, έλεγχος έντασης)
-   🔈 Πίνακα διαχείρισης για admins (δημιουργία άλμπουμ και τραγουδιών)
-   🎧 Real-time chat ενσωματωμένο στο Laterna
-   💬 Ένδειξη online/offline χρηστών
-   👨🏼‍💼 Προβολή του τι ακούνε άλλοι χρήστες σε πραγματικό χρόνο
-   👀 Σελίδα αναλυτικών στατιστικών
-   📊 Και πολλά άλλα...

## Αρχιτεκτονική

- **Frontend**: React με TypeScript, Vite, Tailwind CSS, Shadcn UI, Three.js
- **Backend**: Node.js με Express, Node-cron, Express Fileupload
- **Βάση Δεδομένων**: MongoDB
- **Authentication**: Custom JWT
- **File Storage**: Cloudinary
- **Real-time επικοινωνία**: Socket.io

## Πρόσθετες Τεχνολογίες

### Frontend

-   **3D Graphics**: Three.js, @react-three/drei, @react-three/fiber
-   **HTTP Client**: Axios
-   **Routing**: React Router DOM
-   **Drag and Drop**: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
-   **Notifications**: React Hot Toast
-   **Layout**: React Resizable Panels
-   **Icons**: Lucide React, @radix-ui/react-icons
-   **UI Utilities**: class-variance-authority, clsx, tailwind-merge, tailwindcss-animate

### Backend

-   **Cryptography**: crypto-js

## Frontend State Management

Το frontend χρησιμοποιεί το Zustand για τη διαχείριση της κατάστασης. Χρησιμοποιούνται τα ακόλουθα stores:

- `useAuthStore`: Διαχειρίζεται την κατάσταση ελέγχου ταυτότητας και την ιδιότητα του διαχειριστή.
- `useChatStore`: Διαχειρίζεται δεδομένα chat σε πραγματικό χρόνο, συμπεριλαμβανομένων χρηστών, μηνυμάτων, κατάστασης online και δραστηριοτήτων χρηστών.
- `useMusicStore`: Διαχειρίζεται δεδομένα σχετικά με τραγούδια, άλμπουμ και στατιστικά.
- `usePlayerStore`: Διαχειρίζεται την κατάσταση του music player, συμπεριλαμβανομένου του τρέχοντος τραγουδιού, της αναπαραγωγής και της ουράς.

## Δομή Layout Frontend

Το κύριο layout της εφαρμογής περιλαμβάνει:

- Αριστερή πλευρική μπάρα (`LeftSidebar`)
- Κύρια περιοχή περιεχομένου
- Δεξιά πλευρική μπάρα για τη δραστηριότητα φίλων (`FriendsActivity`)
- Έλεγχοι αναπαραγωγής και audio player στο κάτω μέρος

Το layout είναι responsive και οι πλευρικές μπάρες είναι resizable.

## Ρύθμιση .env αρχείων

Για να λειτουργήσει σωστά η εφαρμογή, πρέπει να δημιουργήσετε τα παρακάτω .env αρχεία:

### Backend (.env)

Δημιουργήστε ένα αρχείο `.env` στον φάκελο `backend` με τα εξής περιεχόμενα:

```bash
PORT=5000
MONGODB_URI=mongodb+srv://username:<db_password>@laterna.aimfgzk.mongodb.net/?retryWrites=true&w=majority&appName=Laterna
ADMIN_EMAIL=your-email@example.com
NODE_ENV=development

CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_CLOUD_NAME=

JWT_SECRET=
```

### Frontend (.env)

Δημιουργήστε ένα αρχείο `.env` στον φάκελο `frontend` με τα εξής περιεχόμενα:

```bash
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=
```

### Οδηγίες για τις μεταβλητές περιβάλλοντος

1. **Cloudinary**:
   - Δημιουργήστε λογαριασμό στο [Cloudinary](https://cloudinary.com/)
   - Βρείτε τα κλειδιά API στον πίνακα ελέγχου

2. **MongoDB**:
   - Χρησιμοποιήστε τοπική εγκατάσταση ή [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Αντικαταστήστε το MONGODB_URI με το δικό σας connection string

3. **JWT_SECRET**:
   - Δημιουργήστε μια τυχαία, μεγάλη και πολύπλοκη συμβολοσειρά για το JWT_SECRET.
   - Μπορείτε να χρησιμοποιήσετε ένα online εργαλείο δημιουργίας τυχαίων συμβολοσειρών.

## Λειτουργία Backend

Το backend είναι δομημένο ως εξής:

1. **Express Server**: Χειρίζεται τα HTTP requests
2. **Routes**: Διαχωρισμένα σε διαφορετικά αρχεία ανά λειτουργικότητα (users, songs, albums, κλπ)
3. **Controllers**: Περιέχουν την επιχειρησιακή λογική
4. **Models**: Ορίζουν τα σχήματα MongoDB
5. **Middleware**: Για authentication και άλλες λειτουργίες

### Εκκίνηση Backend

```bash
cd backend
npm install
npm run dev
```

## Βάση Δεδομένων

- **Τύπος**: MongoDB
- **Σύνδεση**: Μέσω mongoose στο `backend/src/lib/db.js`
- **Μοντέλα**:
  - User: Χρήστες της εφαρμογής
  - Song: Τραγούδια
  - Album: Άλμπουμ με αναφορές σε τραγούδια
  - Message: Μηνύματα μεταξύ χρηστών

### Seed Data

Υπάρχουν scripts για αρχικοποίηση της βάσης με δεδομένα:
```bash
npm run seed:songs
npm run seed:albums
```

## Authentication

Η εφαρμογή χρησιμοποιεί προσαρμοσμένο authentication με JWT:

1. **Frontend**: Διαχειρίζεται τα tokens στο localStorage και στέλνει επικεφαλίδες Authorization.
2. **Backend**: Χρησιμοποιεί middleware για την επαλήθευση των JWT tokens.
3. **Admin Access**: Ελέγχεται μέσω του πεδίου `role` στο μοντέλο χρήστη.

### Middleware Ασφαλείας

- `protectRoute`: Εξασφαλίζει ότι ο χρήστης είναι συνδεδεμένος και έχει έγκυρο token.
- `requireAdmin`: Εξασφαλίζει ότι ο χρήστης είναι διαχειριστής.

## Επίπεδο Ασφάλειας

1. **Authentication**: Ασφαλές μέσω Custom JWT (με bcrypt για κωδικούς).
2. **Authorization**: Έλεγχοι για admin πρόσβαση.
3. **CORS**: Ρυθμισμένο για να επιτρέπει μόνο το frontend origin.
4. **File Uploads**: Περιορισμοί μεγέθους (1GB) και προσωρινή αποθήκευση.
5. **Error Handling**: Γενικά μηνύματα σφάλματος σε production.

## Real-time Λειτουργικότητα

Υλοποιείται με Socket.io για:
- Chat μεταξύ χρηστών
- Ενημερώσεις κατάστασης χρηστών (online/offline)
- Προβολή του τι ακούνε οι χρήστες

## Αποθήκευση Αρχείων

Χρησιμοποιεί το Cloudinary για:
- Αποθήκευση εικόνων άλμπουμ/τραγουδιών
- Αποθήκευση αρχείων ήχου

## Εκτέλεση της Εφαρμογής

1. **Εγκατάσταση εξαρτήσεων**:
```bash
npm install
```

2. **Εκκίνηση σε development mode**:
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

3. **Build για production**:
```bash
npm run build
```

4. **Εκκίνηση σε production mode**:
```bash
npm start
```

Η εφαρμογή θα είναι διαθέσιμη στο http://localhost:3000 για το frontend και http://localhost:5000 για το backend.
