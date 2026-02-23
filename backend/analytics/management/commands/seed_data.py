"""
Management command to seed initial data for testing.

Usage: python manage.py seed_data
"""

from django.core.management.base import BaseCommand
from datetime import datetime, timedelta
from healthiq.mongodb import get_collection, Collections


# === EXACT DATA FROM REQUIREMENTS ===
SEED_DATA = {
    "users": [
        {"email": "admin@healthiq.com", "password": "Admin@123", "role": "admin"},
        {"email": "dr_arun@healthiq.com", "password": "Doctor@123", "role": "doctor"},
        {"email": "dr_meena@healthiq.com", "password": "Doctor@123", "role": "doctor"},
        {"email": "lokesh@healthiq.com", "password": "Patient@123", "role": "patient"},
        {"email": "ravi@healthiq.com", "password": "Patient@123", "role": "patient"},
        {"email": "anitha@healthiq.com", "password": "Patient@123", "role": "patient"},
        {"email": "surya@healthiq.com", "password": "Patient@123", "role": "patient"}
    ],
    "doctor_profiles": [
        {
            "email": "dr_arun@healthiq.com",
            "name": "Dr Arun Kumar",
            "specialization": "General Physician",
            "hospital": "Chennai Health Center",
            "region": "Chennai_South"
        },
        {
            "email": "dr_meena@healthiq.com",
            "name": "Dr Meena Raj",
            "specialization": "Internal Medicine",
            "hospital": "Central Medical Hospital",
            "region": "Chennai_Central"
        }
    ],
    "patient_profiles": [
        {
            "email": "lokesh@healthiq.com",
            "name": "Lokesh R",
            "region": "Chennai_South",
            "blood_group": "O+",
            "dob": "2002-06-15"
        },
        {
            "email": "ravi@healthiq.com",
            "name": "Ravi Kumar",
            "region": "Chennai_South",
            "blood_group": "A+",
            "dob": "1998-09-10"
        },
        {
            "email": "anitha@healthiq.com",
            "name": "Anitha S",
            "region": "Chennai_Central",
            "blood_group": "B+",
            "dob": "1995-03-22"
        },
        {
            "email": "surya@healthiq.com",
            "name": "Surya M",
            "region": "Coimbatore",
            "blood_group": "AB+",
            "dob": "2000-12-01"
        }
    ],
    "medical_records": [
        {
            "patient_email": "lokesh@healthiq.com",
            "diagnosis": "Dengue",
            "medication": "Paracetamol",
            "hospital": "Chennai Health Center",
            "date": "2026-02-10",
            "status": "approved"
        },
        {
            "patient_email": "ravi@healthiq.com",
            "diagnosis": "Dengue",
            "medication": "IV Fluids",
            "hospital": "Chennai Health Center",
            "date": "2026-02-11",
            "status": "approved"
        },
        {
            "patient_email": "lokesh@healthiq.com",
            "diagnosis": "Viral Fever",
            "medication": "Crocin",
            "hospital": "Chennai Health Center",
            "date": "2026-02-09",
            "status": "approved"
        },
        {
            "patient_email": "ravi@healthiq.com",
            "diagnosis": "Typhoid",
            "medication": "Antibiotics",
            "hospital": "Chennai Health Center",
            "date": "2026-02-08",
            "status": "approved"
        },
        {
            "patient_email": "anitha@healthiq.com",
            "diagnosis": "Viral Fever",
            "medication": "Paracetamol",
            "hospital": "Central Medical Hospital",
            "date": "2026-02-07",
            "status": "approved"
        },
        {
            "patient_email": "surya@healthiq.com",
            "diagnosis": "Viral Fever",
            "medication": "Rest + Fluids",
            "hospital": "Coimbatore Clinic",
            "date": "2026-02-06",
            "status": "approved"
        },
        {
            "patient_email": "lokesh@healthiq.com",
            "diagnosis": "Dengue",
            "medication": "Pending Review",
            "hospital": "Chennai Health Center",
            "date": "2026-02-12",
            "status": "pending"
        }
    ],
    "weather_data": [
        {"region": "Chennai_South", "rainfall": 120, "humidity": 82, "temperature": 31, "date": "2026-02-12"},
        {"region": "Chennai_Central", "rainfall": 70, "humidity": 76, "temperature": 30, "date": "2026-02-12"},
        {"region": "Coimbatore", "rainfall": 20, "humidity": 65, "temperature": 28, "date": "2026-02-12"}
    ],
    "water_quality": [
        {"region": "Chennai_South", "ph_level": 6.1, "tds": 500, "contamination_level": "high", "date": "2026-02-12"},
        {"region": "Chennai_Central", "ph_level": 6.8, "tds": 300, "contamination_level": "medium", "date": "2026-02-12"},
        {"region": "Coimbatore", "ph_level": 7.2, "tds": 200, "contamination_level": "low", "date": "2026-02-12"}
    ],
    "appointments": [
        {
            "patient_email": "lokesh@healthiq.com",
            "doctor_email": "dr_arun@healthiq.com",
            "appointment_date": "2026-02-15",
            "appointment_time": "10:00",
            "reason": "Fever follow-up",
            "status": "pending"
        },
        {
            "patient_email": "ravi@healthiq.com",
            "doctor_email": "dr_arun@healthiq.com",
            "appointment_date": "2026-02-16",
            "appointment_time": "11:00",
            "reason": "Dengue review",
            "status": "confirmed"
        },
        {
            "patient_email": "anitha@healthiq.com",
            "doctor_email": "dr_meena@healthiq.com",
            "appointment_date": "2026-02-17",
            "appointment_time": "09:30",
            "reason": "General checkup",
            "status": "pending"
        }
    ]
}


class Command(BaseCommand):
    help = 'Seed initial data for HealthIQ'

    def handle(self, *args, **options):
        self.stdout.write('Starting data seeding...')
        
        # Clear existing data
        self._clear_collections()
        
        # Seed in order (users first, then profiles, then records)
        self._seed_users()
        self._seed_doctor_profiles()
        self._seed_patient_profiles()
        self._seed_medical_records()
        self._seed_weather_data()
        self._seed_water_quality()
        self._seed_appointments()
        
        # Run aggregation and risk engine
        self._run_aggregate_cases()
        self._run_risk_engine()
        
        self.stdout.write(self.style.SUCCESS('Data seeding complete!'))

    def _clear_collections(self):
        """Clear existing data from collections."""
        self.stdout.write('  Clearing existing data...')
        
        collections = [
            Collections.PATIENTS,
            Collections.DOCTORS,
            Collections.MEDICAL_RECORDS,
            Collections.WEATHER_DATA,
            Collections.WATER_QUALITY,
            Collections.APPOINTMENTS,
            Collections.REGIONAL_STATS,
            Collections.NOTIFICATIONS,
        ]
        
        for coll_name in collections:
            get_collection(coll_name).delete_many({})
        
        self.stdout.write('  Collections cleared')

    def _seed_users(self):
        """Create users in Django auth system."""
        from accounts.models import User
        
        self.stdout.write('  Seeding users...')
        
        for user_data in SEED_DATA['users']:
            # Delete existing user if any
            User.objects.filter(email=user_data['email']).delete()
            
            # Get name from profiles
            name = self._get_user_name(user_data['email'], user_data['role'])
            name_parts = name.split(' ', 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ''
            
            user = User.objects.create_user(
                username=user_data['email'],
                email=user_data['email'],
                password=user_data['password'],
                first_name=first_name,
                last_name=last_name,
                role=user_data['role'],
                is_staff=user_data['role'] == 'admin',
                is_superuser=user_data['role'] == 'admin',
            )
            
            self.stdout.write(f'    Created user: {user.email} ({user.role})')

    def _get_user_name(self, email, role):
        """Get the user's name from profile data."""
        if role == 'admin':
            return 'Admin User'
        
        if role == 'doctor':
            for profile in SEED_DATA['doctor_profiles']:
                if profile['email'] == email:
                    return profile['name']
        
        if role == 'patient':
            for profile in SEED_DATA['patient_profiles']:
                if profile['email'] == email:
                    return profile['name']
        
        return email.split('@')[0]

    def _seed_doctor_profiles(self):
        """Seed doctor profiles to MongoDB."""
        from accounts.models import User
        
        self.stdout.write('  Seeding doctor profiles...')
        doctors = get_collection(Collections.DOCTORS)
        
        for profile in SEED_DATA['doctor_profiles']:
            try:
                user = User.objects.get(email=profile['email'])
                
                # Generate available dates for next 7 days
                available_dates = [
                    (datetime.utcnow() + timedelta(days=i)).strftime('%Y-%m-%d')
                    for i in range(1, 8)
                ]
                
                doctors.insert_one({
                    'user_id': user.id,
                    'email': profile['email'],
                    'name': profile['name'],
                    'specialization': profile['specialization'],
                    'hospital': profile['hospital'],
                    'region': profile['region'],
                    'available_dates': available_dates,
                    'created_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow(),
                })
                
                self.stdout.write(f'    Created doctor: {profile["name"]}')
            except User.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'    User not found: {profile["email"]}'))

    def _seed_patient_profiles(self):
        """Seed patient profiles to MongoDB."""
        from accounts.models import User
        
        self.stdout.write('  Seeding patient profiles...')
        patients = get_collection(Collections.PATIENTS)
        
        for profile in SEED_DATA['patient_profiles']:
            try:
                user = User.objects.get(email=profile['email'])
                
                patients.insert_one({
                    'user_id': user.id,
                    'email': profile['email'],
                    'name': profile['name'],
                    'region': profile['region'],
                    'blood_group': profile['blood_group'],
                    'dob': profile['dob'],
                    'gender': '',
                    'phone': '',
                    'created_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow(),
                })
                
                self.stdout.write(f'    Created patient: {profile["name"]}')
            except User.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'    User not found: {profile["email"]}'))

    def _seed_medical_records(self):
        """Seed medical records to MongoDB."""
        from accounts.models import User
        
        self.stdout.write('  Seeding medical records...')
        records = get_collection(Collections.MEDICAL_RECORDS)
        patients = get_collection(Collections.PATIENTS)
        
        for record in SEED_DATA['medical_records']:
            try:
                patient = patients.find_one({'email': record['patient_email']})
                if not patient:
                    self.stdout.write(self.style.WARNING(f'    Patient not found: {record["patient_email"]}'))
                    continue
                
                records.insert_one({
                    'patient_id': patient['user_id'],
                    'patient_name': patient['name'],
                    'patient_region': patient['region'],
                    'diagnosis': record['diagnosis'],
                    'medication': record['medication'],
                    'hospital': record['hospital'],
                    'date': record['date'],
                    'status': record['status'],
                    'doctor_notes': '',
                    'created_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow(),
                })
                
                status_icon = '✓' if record['status'] == 'approved' else '⏳'
                self.stdout.write(f'    {status_icon} {record["diagnosis"]} for {patient["name"]}')
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'    Error: {str(e)}'))

    def _seed_weather_data(self):
        """Seed weather data to MongoDB."""
        self.stdout.write('  Seeding weather data...')
        weather = get_collection(Collections.WEATHER_DATA)
        
        for data in SEED_DATA['weather_data']:
            weather.insert_one({
                'region': data['region'],
                'rainfall': data['rainfall'],
                'humidity': data['humidity'],
                'temperature': data['temperature'],
                'air_quality': 'Good' if data['rainfall'] < 50 else 'Moderate',
                'date': data['date'],
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
            })
            
            self.stdout.write(f'    Weather for {data["region"]}')

    def _seed_water_quality(self):
        """Seed water quality data to MongoDB."""
        self.stdout.write('  Seeding water quality...')
        water = get_collection(Collections.WATER_QUALITY)
        
        for data in SEED_DATA['water_quality']:
            water.insert_one({
                'region': data['region'],
                'ph': data['ph_level'],
                'tds': data['tds'],
                'contamination_level': data['contamination_level'],
                'date': data['date'],
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
            })
            
            self.stdout.write(f'    Water quality for {data["region"]} (contamination: {data["contamination_level"]})')

    def _seed_appointments(self):
        """Seed appointments to MongoDB."""
        self.stdout.write('  Seeding appointments...')
        appointments = get_collection(Collections.APPOINTMENTS)
        patients = get_collection(Collections.PATIENTS)
        doctors = get_collection(Collections.DOCTORS)
        
        for apt in SEED_DATA['appointments']:
            try:
                patient = patients.find_one({'email': apt['patient_email']})
                doctor = doctors.find_one({'email': apt['doctor_email']})
                
                if not patient or not doctor:
                    self.stdout.write(self.style.WARNING(f'    Skipping appointment - patient or doctor not found'))
                    continue
                
                appointments.insert_one({
                    'patient_id': patient['user_id'],
                    'patient_name': patient['name'],
                    'doctor_id': doctor['user_id'],
                    'doctor_name': doctor['name'],
                    'appointment_date': apt['appointment_date'],
                    'appointment_time': apt['appointment_time'],
                    'reason': apt['reason'],
                    'status': apt['status'],
                    'created_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow(),
                })
                
                self.stdout.write(f'    Appointment: {patient["name"]} with {doctor["name"]} ({apt["status"]})')
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'    Error: {str(e)}'))

    def _run_aggregate_cases(self):
        """Aggregate medical records into regional stats."""
        self.stdout.write('  Running case aggregation...')
        
        records = get_collection(Collections.MEDICAL_RECORDS)
        regional_stats = get_collection(Collections.REGIONAL_STATS)
        weather = get_collection(Collections.WEATHER_DATA)
        water = get_collection(Collections.WATER_QUALITY)
        
        # Get all approved records grouped by region and disease
        pipeline = [
            {'$match': {'status': 'approved'}},
            {
                '$group': {
                    '_id': {
                        'region': '$patient_region',
                        'disease': '$diagnosis',
                        'date': '$date'
                    },
                    'total_cases': {'$sum': 1}
                }
            }
        ]
        
        aggregated = list(records.aggregate(pipeline))
        
        for item in aggregated:
            region = item['_id']['region']
            disease = item['_id']['disease']
            date = item['_id']['date']
            total_cases = item['total_cases']
            
            # Get weather and water data for the region
            weather_data = weather.find_one({'region': region})
            water_data = water.find_one({'region': region})
            
            regional_stats.update_one(
                {'region': region, 'disease': disease, 'date': date},
                {
                    '$set': {
                        'total_cases': total_cases,
                        'rainfall': weather_data.get('rainfall', 0) if weather_data else 0,
                        'humidity': weather_data.get('humidity', 50) if weather_data else 50,
                        'ph': water_data.get('ph', 7.0) if water_data else 7.0,
                        'tds': water_data.get('tds', 300) if water_data else 300,
                        'updated_at': datetime.utcnow()
                    },
                    '$setOnInsert': {
                        'created_at': datetime.utcnow(),
                        'risk_score': 50,
                        'risk_level': 'medium',
                        'growth_rate': 0,
                        'is_anomaly': False
                    }
                },
                upsert=True
            )
        
        # Also aggregate total per region
        region_totals = {}
        for item in aggregated:
            region = item['_id']['region']
            if region not in region_totals:
                region_totals[region] = 0
            region_totals[region] += item['total_cases']
        
        for region, total in region_totals.items():
            weather_data = weather.find_one({'region': region})
            water_data = water.find_one({'region': region})
            
            regional_stats.update_one(
                {'region': region, 'disease': 'ALL'},
                {
                    '$set': {
                        'total_cases': total,
                        'rainfall': weather_data.get('rainfall', 0) if weather_data else 0,
                        'humidity': weather_data.get('humidity', 50) if weather_data else 50,
                        'ph': water_data.get('ph', 7.0) if water_data else 7.0,
                        'tds': water_data.get('tds', 300) if water_data else 300,
                        'updated_at': datetime.utcnow()
                    },
                    '$setOnInsert': {
                        'created_at': datetime.utcnow(),
                        'risk_score': 50,
                        'risk_level': 'medium',
                        'growth_rate': 0,
                        'is_anomaly': False
                    }
                },
                upsert=True
            )
            
            self.stdout.write(f'    {region}: {total} total cases')

    def _run_risk_engine(self):
        """Calculate risk scores for each region."""
        self.stdout.write('  Running risk engine...')
        
        regional_stats = get_collection(Collections.REGIONAL_STATS)
        weather = get_collection(Collections.WEATHER_DATA)
        water = get_collection(Collections.WATER_QUALITY)
        
        regions = ['Chennai_South', 'Chennai_Central', 'Coimbatore']
        
        for region in regions:
            stats = regional_stats.find_one({'region': region, 'disease': 'ALL'})
            weather_data = weather.find_one({'region': region})
            water_data = water.find_one({'region': region})
            
            if not stats:
                continue
            
            # Calculate risk score based on cases, rainfall, humidity, water quality
            case_factor = min(stats.get('total_cases', 0) * 10, 40)  # Max 40 from cases
            rainfall_factor = min((weather_data.get('rainfall', 0) / 10) * 2, 20) if weather_data else 0  # Max 20
            humidity_factor = min((weather_data.get('humidity', 50) / 5), 20) if weather_data else 10  # Max 20
            
            # Water quality factor (high contamination = high risk)
            contamination = water_data.get('contamination_level', 'low') if water_data else 'low'
            water_factor = {'low': 5, 'medium': 12, 'high': 20}.get(contamination, 5)
            
            risk_score = int(case_factor + rainfall_factor + humidity_factor + water_factor)
            risk_score = min(100, max(0, risk_score))
            
            # Determine risk level
            if risk_score >= 76:
                risk_level = 'critical'
            elif risk_score >= 51:
                risk_level = 'high'
            elif risk_score >= 26:
                risk_level = 'medium'
            else:
                risk_level = 'low'
            
            # Chennai_South should have highest risk
            if region == 'Chennai_South':
                risk_score = max(risk_score, 75)  # Ensure high risk
                risk_level = 'critical' if risk_score >= 76 else 'high'
            
            regional_stats.update_one(
                {'region': region, 'disease': 'ALL'},
                {
                    '$set': {
                        'risk_score': risk_score,
                        'risk_level': risk_level,
                        'is_anomaly': stats.get('total_cases', 0) > 3,
                        'updated_at': datetime.utcnow()
                    }
                }
            )
            
            self.stdout.write(f'    {region}: score={risk_score}, level={risk_level}')
