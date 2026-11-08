# AMK Animal AI — Complete AI Animal Expert & Livestock Platform

> **Brand:** AMK Animal AI  
> **Tagline:** Know Every Animal. Understand Every Need. (ہر جانور کو جانیں، ہر ضرورت کو سمجھیں۔)  
> **Brand Owner:** amkashif  
> **Contact / WhatsApp:** [+923346682654](https://wa.me/923346682654)  
> **Brand Signature:** `AMK Animal AI | By amkashif | WhatsApp: +923346682654`

---

## 🌟 Executive Overview

**AMK Animal AI** is a professional, production-ready, mobile-first, bilingual (Urdu پاکستانی اردو RTL & English LTR) web platform for livestock farmers, dairy owners, veterinary practitioners, traders, and companion pet owners in Pakistan and internationally.

The application integrates cutting-edge **Multimodal AI Vision Intelligence (Google Gemini 1.5 Flash)** with a curated **Veterinary Clinical Decision Support System** and scientific livestock economic algorithms.

---

## 🚀 Key Modules & Capabilities

### 1. 🔍 AI Animal Scanner (Multimodal Vision)
- **Multi-angle Image & Camera Capture:** Upload up to 4 high-resolution photos or take instant photos on mobile cameras.
- **Client-Side Video Frame Extractor:** Extracts representative keyframes from MP4/WebM videos via an off-screen HTML5 video canvas before passing to the AI vision model.
- **Multimodal Analysis:** Detects species, probable breed, gender, estimated age, coat color, body condition score (BCS 1-5), and live weight range.
- **Uncertainty & Purebred Notice:** Rigorously distinguishes verified breed standards from visual estimates; clearly warns that visual similarity does not guarantee purebred pedigree without certified genetic testing.
- **Complete Veterinary Breed Dossier:** Generates a detailed 16-point bilingual dossier covering origin, physical traits, sexual dimorphism, feed needs, climate housing, reproduction, common diseases, vaccinations, and dairy/economic uses.

### 2. 🩺 AI Animal Health Assistant (Clinical Triage)
- **Symptom Checker & Triage:** Analyzes observed symptoms, rectal temperature (°F), feed/water intake behavior, and duration.
- **Life-Threatening Emergency Detection:** Detects signs of severe respiratory distress, acute bloat/tympany, poisoning, or recumbency, prompting immediate emergency vet dispatch.
- **Differential Diagnostics:** Identifies high-risk conditions including Foot-and-Mouth Disease (FMD), Hemorrhagic Septicemia (HS / گل گھوٹو), Lumpy Skin Disease (LSD), Mastitis (ساڑو), Enterotoxemia (ETV), Newcastle Disease (ND), and more.
- **Strict Veterinary Safety:** Prominently warns that AI guidance does not replace a licensed RVMP doctor; never prescribes dangerous injections or antibiotic dosages; provides mandatory drug withdrawal period warnings for milk and meat.

### 3. ⚖️ Animal Mandi Price Estimator
- **Scientific Valuation Algorithm:** Calculates fair market valuations using live bodyweight, dentition age (کھیرہ، دوندہ، چوگا), milk yield (Liters/day), pregnancy status, and seasonal mandi benchmarks.
- **Major Livestock Mandis Supported:** Shahpur Kanjra (Lahore), Multan Bosan Road, Faisalabad Narwala Road, Sahiwal Central Mandi, Karachi Northern Bypass, Hyderabad Hala Naka, Peshawar, and Quetta.
- **Transparency:** Displays minimum, average, and maximum price brackets in PKR with confidence levels and mandatory limitation notices.

### 4. 🌾 Scientific Feed & Nutrition Planner
- **NRC Standard Formulations:** Computes daily dry matter (DM) requirement (2.8% to 3.5% of body weight), fresh green fodder, wheat straw (توڑی), and balanced Wanda concentrate.
- **Seasonal Local Fodder Guide:** Winter/Spring (Berseem, Lucerne, Oats, Mustard) vs. Summer/Autumn (Corn Silage, Sorghum, Maize, Rhodes grass).
- **Water & Minerals:** Clean drinking water requirements and calcium-to-phosphorus ratios (2:1).

### 5. 📅 Vaccination & Care Calendar
- **Official Immunization Schedules:** Standard protocols for FMD (bi-annual), HS (oil adjuvant pre-monsoon), Blackleg (BQ), LSD, ETV, PPR, and Newcastle Disease.
- **Gestation Calculator:** Precise pregnancy calendar based on biological gestation lengths (Cow: 283d, Buffalo: 310d, Goat/Sheep: 150d, Camel: 390d, Mare: 340d).
- **Interactive Reminders:** Add, track, complete, and filter care reminders.

### 6. 📋 Animal Profile & Record Management (My Herd)
- **Individual Digital Passports:** Ear tag/microchip number, photos, breed, purchase price, and current estimated valuation.
- **Daily Milk Production Log:** Track morning and evening milk yields (Liters) with automated weekly total calculations.
- **Weight Log:** Record live weight over time with observation notes.
- **Health & Vaccine History:** Complete journal of clinical incidents, treatments, and vaccine batches.
- **Printable Medical Passport:** Direct print/PDF export via browser `@media print` styling.

### 7. 🛒 Verified Livestock Marketplace
- **Direct Buyer-Seller Connection:** Post animals for sale with asking price, milk yields, photos, and city locations.
- **Instant Contact:** Direct WhatsApp and phone call buttons (`https://wa.me/...`).
- **Fraud Reporting Queue:** Built-in fraud reporting tool allowing buyers to report fake prices, stolen photos, sick animals, or fraudulent sellers.

### 8. 👨‍⚕️ Find a Veterinarian (Directory)
- **Doctor Profiles:** RVMP license numbers, degrees (DVM, M.Phil), clinic names, working hours, and specialties (dairy, equine, small animals, surgery).
- **Verified Badge System:** Distinguishes verified professional licenses from unverified/pending entries.
- **Consultation Options:** Farm visits, in-clinic consults, and 24/7 emergency service with OpenStreetMap directions.

### 9. 🤖 24/7 Bilingual AI Chat Assistant
- Converses fluently in Pakistani Urdu (اردو) and English.
- Answers veterinary, breeding, nutrition, and farm management inquiries with contextual memory of attached herd animals.

### 10. 🛡️ Administrative Control Dashboard
- Role-based authorization for system administrators (`role: 'admin'`).
- Oversees user subscriptions, reviews pending marketplace fraud reports, toggles RVMP doctor verification status, and audits AI system accuracy.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Typography:** Noto Nastaliq Urdu, Noto Naskh Arabic, Inter
- **Backend & Database:** Supabase PostgreSQL with Row Level Security (RLS) policies
- **AI Models:** Google Gemini 1.5 Flash (Multimodal Vision & Chat) with Curated Veterinary Knowledge Base Fallback
- **Mapping:** OpenStreetMap

---

## 📂 Project Structure

```
├── public/
│   └── logo.svg                 # Custom AI Animal Paw Emblem
├── src/
│   ├── types/                  # Strict TypeScript Data Models
│   │   ├── animal.ts           # Species, Breeds, Scans, Profiles
│   │   ├── health.ts           # Symptoms, Clinical Triage, Risk Levels
│   │   ├── marketPrice.ts      # Mandi Price Models & Factors
│   │   ├── nutrition.ts        # Feed & Ration Recommendations
│   │   ├── calendar.ts         # Vaccine Schedules & Reminders
│   │   ├── marketplace.ts      # Listings & Fraud Reports
│   │   ├── vet.ts              # Veterinarians & Clinics
│   │   ├── chat.ts             # AI Chat Sessions
│   │   └── user.ts             # User Roles & Tiers
│   ├── i18n/                   # Bilingual Engine
│   │   ├── en.ts               # Complete English Terminology
│   │   ├── ur.ts               # Authentic Pakistani Urdu (پاکستانی اردو)
│   │   └── index.tsx           # Language Context & RTL Handler
│   ├── data/                   # Veterinary & Agricultural Knowledge Bases
│   │   ├── speciesData.ts      # Livestock, Poultry & Pet Breeds
│   │   ├── diseaseData.ts      # Clinical Veterinary Pathology
│   │   ├── nutritionData.ts    # Scientific Ration Formulations
│   │   ├── vaccineData.ts      # Immunization & Gestation Tables
│   │   ├── priceData.ts        # Mandi Live-weight Benchmarks
│   │   └── sampleVets.ts       # Verified RVMP Veterinary Registry
│   ├── services/
│   │   ├── aiService.ts        # Gemini Vision & Chat Integration
│   │   ├── videoService.ts     # HTML5 Canvas Video Keyframe Extraction
│   │   ├── priceEstimator.ts   # Multi-parameter Mandi Algorithm
│   │   └── supabase.ts         # Database & Storage Client
│   ├── context/
│   │   ├── AuthContext.tsx     # Role-based Auth & Demo Switcher
│   │   └── AnimalContext.tsx   # Digital Herd & Medical Journal
│   ├── components/
│   │   ├── common/Logo.tsx     # Custom AI Paw Logo
│   │   ├── layout/             # Navbar, Footer, Language Switcher
│   │   ├── home/HomePage.tsx   # Premium Responsive Homepage
│   │   ├── scanner/            # AI Vision Animal Scanner
│   │   ├── health/             # Veterinary Health Assistant
│   │   ├── market/             # Mandi Price Estimator
│   │   ├── nutrition/          # Feed & Nutrition Planner
│   │   ├── calendar/           # Vaccination & Care Calendar
│   │   ├── profiles/           # Animal Herd & Medical Passports
│   │   ├── marketplace/        # Livestock Marketplace
│   │   ├── vetDirectory/       # Verified Doctors Directory
│   │   ├── chat/               # 24/7 AI Veterinary Chat
│   │   ├── admin/              # Admin Security Dashboard
│   │   └── settings/           # Multimodal AI Settings Modal
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css               # Tailored Urdu RTL & Print Styles
├── supabase/
│   └── migrations/
│       └── 01_amk_animal_ai_init.sql  # Full 18-Table Schema with RLS
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

---

## ⚙️ Installation & Running Locally

1. **Clone or Navigate to the Directory:**
   ```powershell
   cd "e:\AMK ANIMAL AI"
   ```

2. **Install Dependencies:**
   ```powershell
   npm install
   ```

3. **Configure Environment Variables (Optional):**
   Create a `.env` file in the root directory:
   ```env
   # Google Gemini API Key (Can also be set in-app via the Settings button)
   VITE_GEMINI_API_KEY=your_gemini_api_key_here

   # Supabase Configuration (Optional for cloud sync)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Run TypeScript Check & Development Server:**
   ```powershell
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

5. **Build for Production:**
   ```powershell
   npm run build
   ```

---

## 🔒 Security & Medical Standards

- **Row Level Security (RLS):** All private herd profiles, medical histories, and weight journals are strictly accessible only by their respective owner.
- **Veterinary Safety First:** AI assessments are accompanied by mandatory disclaimers, clear withdrawal warnings for food-producing animals, and direct contact details for emergency RVMP doctors.
- **Zero API Key Leakage:** Keys are stored in the user's isolated local storage or managed via secure environment variables.

---

**Developed for AMK Animal AI by amkashif**  
*Direct WhatsApp: +923346682654*
