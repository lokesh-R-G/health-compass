# 🏥 Health Compass (HealthIQ)

**Regional Health Intelligence & Emergency Medical System**

Health Compass (HealthIQ) is a full-stack healthcare platform designed to:

* Store patient-level medical records securely
* Enable doctor validation workflows
* Aggregate anonymized regional health data
* Detect early disease spread patterns
* Calculate regional risk scores
* Integrate environmental indicators (weather + water quality)
* Provide role-based dashboards for patients, doctors, and admins

---

## 🚀 Vision

Health Compass is not just a healthcare management system.

It is a **privacy-first regional health intelligence platform** that combines:

* Patient medical records
* Doctor validation
* Environmental indicators
* Statistical anomaly detection
* Risk scoring engine

To provide **early disease detection and emergency response insights**.

---

# 🧱 System Architecture

```
Frontend (React + TypeScript)
        ↓
Django REST API
        ↓
MongoDB Atlas
        ↓
Aggregation Engine
        ↓
Risk Engine
        ↓
Regional Intelligence Dashboard
```

---

# 🛠 Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn-ui
* Axios
* JWT Authentication

## Backend

* Django
* Django REST Framework
* SimpleJWT
* MongoDB Atlas
* Custom Risk Engine (Python)

---

# 👥 User Roles

## 👤 Patient

* Register & Login
* Maintain profile
* Add medical records
* View record approval status
* Book appointments
* View regional risk dashboard
* Receive notifications

## 🏥 Doctor

* Login
* Review pending medical records
* Approve / Reject records
* Manage appointments
* View patient medical history (read-only)

## 🏛 Admin

* View regional risk overview
* Monitor anomalies
* Monitor environmental data
* Track health trends

---

# 🔐 Security & Privacy Model

* JWT-based authentication
* Role-based access control
* Password hashing
* Protected API endpoints
* Doctor-validated medical records
* Analytics uses **only aggregated data**
* Risk engine never reads raw patient records

---

# 📊 Core Modules

## 1️⃣ Authentication & Authorization

* JWT login
* Refresh tokens
* Role-based route protection

## 2️⃣ Patient Medical Record Management

* Doctor validation workflow
* Pending → Approved/Rejected status
* Only approved records used in analytics

## 3️⃣ Appointment System

* Patient booking
* Doctor confirmation
* Notification triggers

## 4️⃣ Aggregation Engine

* Groups approved records by:

  * Region
  * Disease
  * Date
* Stores anonymized RegionalStats

## 5️⃣ Environmental Data Integration

* Weather data (rainfall, humidity, temperature)
* Water quality (pH, TDS, contamination level)

## 6️⃣ Risk Engine

Risk Score Formula:

```
RiskScore =
0.5 × DiseaseGrowthRate
0.2 × RainfallIndex
0.2 × HumidityIndex
0.1 × WaterQualityImpact
```

Risk Levels:

* 0–25 → Low
* 26–50 → Medium
* 51–75 → High
* 76–100 → Critical

Includes anomaly detection using statistical thresholds.

## 7️⃣ Notification System

Triggers:

* Record approved/rejected
* Appointment confirmed
* Risk threshold exceeded

---

# 📁 Project Structure

```
health-compass/
│
├── backend/
│   ├── accounts/
│   ├── patients/
│   ├── doctors/
│   ├── appointments/
│   ├── analytics/
│   ├── notifications/
│   └── healthiq/
│
├── src/
│   ├── components/
│   ├── contexts/
│   ├── pages/
│   ├── services/
│   ├── types/
│   └── lib/
│
├── .env
├── package.json
└── manage.py
```

---

# ⚙️ Setup Instructions

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/health-compass.git
cd health-compass
```

---

## 2️⃣ Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `.env` file inside backend:

```
MONGODB_URI=your_mongodb_atlas_connection_string
SECRET_KEY=your_secret_key
```

Run migrations:

```bash
python manage.py migrate
```

Seed data:

```bash
python manage.py seed_data
```

Start server:

```bash
python manage.py runserver
```

Backend runs at:

```
http://localhost:8000
```

---

## 3️⃣ Frontend Setup

```bash
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:8081
```

---

# 🧪 Test Credentials

| Role    | Email                                                 | Password    |
| ------- | ----------------------------------------------------- | ----------- |
| Admin   | [admin@healthiq.com](mailto:admin@healthiq.com)       | Admin@123   |
| Doctor  | [dr_arun@healthiq.com](mailto:dr_arun@healthiq.com)   | Doctor@123  |
| Doctor  | [dr_meena@healthiq.com](mailto:dr_meena@healthiq.com) | Doctor@123  |
| Patient | [lokesh@healthiq.com](mailto:lokesh@healthiq.com)     | Patient@123 |
| Patient | [ravi@healthiq.com](mailto:ravi@healthiq.com)         | Patient@123 |

---

# 📈 MVP Scope

Included:

* Patient-level data storage
* Doctor validation workflow
* Regional aggregation
* Risk scoring engine
* Appointment booking
* Notifications
* Role-based dashboards

Excluded (Future Scope):

* Aadhaar integration
* IoT live sensor integration
* Kafka streaming
* ML-based LSTM forecasting
* Microservices architecture

---

# 🔮 Future Enhancements

* Real-time streaming analytics
* LSTM disease forecasting
* IoT water sensors
* Government API integration
* Insurance analytics integration
* Distributed microservices

---

# 🎯 Project Objective

To build a:

> Privacy-first, doctor-validated, regional health intelligence system capable of early disease detection and emergency forecasting.

---

# 📌 Why This Project Matters

* Enables early outbreak detection
* Supports emergency medical decisions
* Integrates environmental health indicators
* Provides scalable analytics architecture
* Balances privacy with intelligence

---

# 🧑‍💻 Author

**Lokesh Ramesh**
Full Stack Developer | Data & AI Enthusiast

