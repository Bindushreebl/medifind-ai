import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  DatabaseSchema,
  User,
  Pharmacy,
  Medicine,
  InventoryItem,
  Alternative,
  RestockAlert,
  Reservation,
  SearchHistoryItem,
  Notification,
  StockStatus,
  ReservationStatus
} from './types.js';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'medifind_db.json');

const INITIAL_PASSWORD_HASH = bcrypt.hashSync('password123', 10);
const USER_PASSWORD_HASH = bcrypt.hashSync('user123', 10);
const PHARMACY_PASSWORD_HASH = bcrypt.hashSync('pharmacy123', 10);
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('admin123', 10);

const SEED_DATA: DatabaseSchema = {
  users: [
    {
      id: 'usr-1',
      name: 'Aditya Sen',
      email: 'user@medifind.com',
      phone: '+91 98765 43210',
      password_hash: USER_PASSWORD_HASH,
      role: 'USER',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      id: 'usr-2',
      name: 'Dr. Rajesh Rao (Apollo Manager)',
      email: 'apollo@medifind.com',
      phone: '+91 98220 12345',
      password_hash: PHARMACY_PASSWORD_HASH,
      role: 'PHARMACY',
      created_at: new Date(Date.now() - 40 * 86400000).toISOString()
    },
    {
      id: 'usr-3',
      name: 'Suresh Kumar (MedPlus Pharmacist)',
      email: 'medplus@medifind.com',
      phone: '+91 97110 56789',
      password_hash: PHARMACY_PASSWORD_HASH,
      role: 'PHARMACY',
      created_at: new Date(Date.now() - 35 * 86400000).toISOString()
    },
    {
      id: 'usr-4',
      name: 'Dr. Ananya Sharma (Chief Medical Officer)',
      email: 'admin@medifind.com',
      phone: '+91 99000 88888',
      password_hash: ADMIN_PASSWORD_HASH,
      role: 'ADMIN',
      created_at: new Date(Date.now() - 60 * 86400000).toISOString()
    }
  ],
  pharmacies: [
    {
      id: 'ph-1',
      owner_id: 'usr-2',
      name: 'Apollo Pharmacy – Green Glen',
      address: '14/B, Outer Ring Road, Bellandur, Bengaluru',
      latitude: 12.9298,
      longitude: 77.6742,
      phone: '+91 80 2574 1100',
      opening_time: '07:00 AM',
      closing_time: '11:00 PM',
      verified: true,
      rating: 4.8,
      review_count: 312,
      created_at: new Date(Date.now() - 60 * 86400000).toISOString()
    },
    {
      id: 'ph-2',
      owner_id: 'usr-3',
      name: 'MedPlus Wellness Store – 100ft Indiranagar',
      address: '422, 100ft Road, HAL 2nd Stage, Indiranagar, Bengaluru',
      latitude: 12.9719,
      longitude: 77.6412,
      phone: '+91 80 4123 9087',
      opening_time: '08:00 AM',
      closing_time: '11:30 PM',
      verified: true,
      rating: 4.7,
      review_count: 245,
      created_at: new Date(Date.now() - 55 * 86400000).toISOString()
    },
    {
      id: 'ph-3',
      owner_id: 'usr-2',
      name: 'HealthCare Corner Chemist – Koramangala',
      address: '88, 5th Block, Jyoti Nivas College Rd, Koramangala, Bengaluru',
      latitude: 12.9352,
      longitude: 77.6245,
      phone: '+91 80 2553 4412',
      opening_time: '07:30 AM',
      closing_time: '10:30 PM',
      verified: true,
      rating: 4.6,
      review_count: 189,
      created_at: new Date(Date.now() - 50 * 86400000).toISOString()
    },
    {
      id: 'ph-4',
      owner_id: 'usr-2',
      name: 'Guardian Lifecare Pharmacy – HSR Sector 2',
      address: '19th Main, 27th Cross, Sector 2, HSR Layout, Bengaluru',
      latitude: 12.9121,
      longitude: 77.6446,
      phone: '+91 80 4172 8890',
      opening_time: '24 Hours Open',
      closing_time: '24 Hours Open',
      verified: true,
      rating: 4.9,
      review_count: 420,
      created_at: new Date(Date.now() - 48 * 86400000).toISOString()
    },
    {
      id: 'ph-5',
      owner_id: 'usr-3',
      name: 'Noble Medicare Chemist – Whitefield ITPL',
      address: 'Shop 4, Prestige Ozone Arcade, Whitefield Main Rd, Bengaluru',
      latitude: 12.9833,
      longitude: 77.7500,
      phone: '+91 80 2845 6112',
      opening_time: '08:00 AM',
      closing_time: '10:00 PM',
      verified: false,
      rating: 4.3,
      review_count: 98,
      created_at: new Date(Date.now() - 25 * 86400000).toISOString()
    },
    {
      id: 'ph-6',
      owner_id: 'usr-2',
      name: 'Sanjeevani Day & Night Chemists – Marathahalli',
      address: 'Bridge Junction, Outer Ring Rd, Marathahalli, Bengaluru',
      latitude: 12.9592,
      longitude: 77.7011,
      phone: '+91 80 2522 3901',
      opening_time: '24 Hours Open',
      closing_time: '24 Hours Open',
      verified: true,
      rating: 4.5,
      review_count: 165,
      created_at: new Date(Date.now() - 40 * 86400000).toISOString()
    },
    {
      id: 'ph-7',
      owner_id: 'usr-3',
      name: 'TrustPharma Dispensary – MG Road Brigade',
      address: 'Brigade Towers, 135 MG Road, Bengaluru',
      latitude: 12.9756,
      longitude: 77.6066,
      phone: '+91 80 2558 7723',
      opening_time: '09:00 AM',
      closing_time: '09:30 PM',
      verified: true,
      rating: 4.4,
      review_count: 132,
      created_at: new Date(Date.now() - 38 * 86400000).toISOString()
    },
    {
      id: 'ph-8',
      owner_id: 'usr-2',
      name: 'City Care 24x7 Pharmacy – Jayanagar 4th Block',
      address: '33, 11th Main, 4th Block, Jayanagar, Bengaluru',
      latitude: 12.9281,
      longitude: 77.5831,
      phone: '+91 80 2664 1990',
      opening_time: '24 Hours Open',
      closing_time: '24 Hours Open',
      verified: true,
      rating: 4.8,
      review_count: 388,
      created_at: new Date(Date.now() - 45 * 86400000).toISOString()
    }
  ],
  medicines: [
    {
      id: 'med-1',
      name: 'Crocin 650',
      generic_name: 'Paracetamol',
      category: 'Analgesics & Antipyretics',
      dosage_form: 'Tablet',
      strength: '650 mg',
      manufacturer: 'GlaxoSmithKline Consumer Healthcare',
      prescription_required: false,
      description: 'Used for mild to moderate pain relief and fever reduction in conditions including headaches, toothache, and viral illnesses.',
      created_at: new Date(Date.now() - 60 * 86400000).toISOString()
    },
    {
      id: 'med-2',
      name: 'Calpol 650',
      generic_name: 'Paracetamol',
      category: 'Analgesics & Antipyretics',
      dosage_form: 'Tablet',
      strength: '650 mg',
      manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd',
      prescription_required: false,
      description: 'Bioequivalent paracetamol formulation used for rapid fever reduction, muscle aches, and pain management.',
      created_at: new Date(Date.now() - 60 * 86400000).toISOString()
    },
    {
      id: 'med-3',
      name: 'Cetzine 10mg',
      generic_name: 'Cetirizine Hydrochloride',
      category: 'Antihistamines & Allergy',
      dosage_form: 'Tablet',
      strength: '10 mg',
      manufacturer: 'Dr. Reddy’s Laboratories Ltd',
      prescription_required: false,
      description: 'Second-generation antihistamine relieving allergic symptoms such as watery eyes, runny nose, sneezing, and hives.',
      created_at: new Date(Date.now() - 58 * 86400000).toISOString()
    },
    {
      id: 'med-4',
      name: 'Alerid 10mg',
      generic_name: 'Cetirizine Hydrochloride',
      category: 'Antihistamines & Allergy',
      dosage_form: 'Tablet',
      strength: '10 mg',
      manufacturer: 'Cipla Ltd',
      prescription_required: false,
      description: 'Equivalent 10mg cetirizine tablet used for seasonal allergic rhinitis, perennial rhinitis, and urticaria.',
      created_at: new Date(Date.now() - 58 * 86400000).toISOString()
    },
    {
      id: 'med-5',
      name: 'Mox 500mg',
      generic_name: 'Amoxicillin Trihydrate',
      category: 'Antibiotics',
      dosage_form: 'Capsule',
      strength: '500 mg',
      manufacturer: 'Sun Pharmaceutical Industries Ltd',
      prescription_required: true,
      description: 'Broad-spectrum penicillin antibiotic used to treat bacterial infections of the chest, tonsils, ear, sinuses, and urinary tract.',
      created_at: new Date(Date.now() - 55 * 86400000).toISOString()
    },
    {
      id: 'med-6',
      name: 'Azithral 500mg',
      generic_name: 'Azithromycin',
      category: 'Antibiotics',
      dosage_form: 'Tablet',
      strength: '500 mg',
      manufacturer: 'Alembic Pharmaceuticals Ltd',
      prescription_required: true,
      description: 'Macrolide antibiotic active against respiratory infections, skin infections, and certain sexually transmitted infections.',
      created_at: new Date(Date.now() - 55 * 86400000).toISOString()
    },
    {
      id: 'med-7',
      name: 'Brufen 400mg',
      generic_name: 'Ibuprofen',
      category: 'Analgesics & Antipyretics',
      dosage_form: 'Tablet',
      strength: '400 mg',
      manufacturer: 'Abbott Healthcare Pvt Ltd',
      prescription_required: false,
      description: 'Non-steroidal anti-inflammatory drug (NSAID) for relieving inflammatory swelling, arthritis pain, and muscular stiffness.',
      created_at: new Date(Date.now() - 52 * 86400000).toISOString()
    },
    {
      id: 'med-8',
      name: 'Pan 40',
      generic_name: 'Pantoprazole Sodium',
      category: 'Gastrointestinal & Antacids',
      dosage_form: 'Gastro-resistant Tablet',
      strength: '40 mg',
      manufacturer: 'Alkem Laboratories Ltd',
      prescription_required: true,
      description: 'Proton pump inhibitor (PPI) that decreases stomach acid secretion to heal gastric ulcers and acid reflux (GERD).',
      created_at: new Date(Date.now() - 50 * 86400000).toISOString()
    },
    {
      id: 'med-9',
      name: 'Pantocid 40',
      generic_name: 'Pantoprazole Sodium',
      category: 'Gastrointestinal & Antacids',
      dosage_form: 'Gastro-resistant Tablet',
      strength: '40 mg',
      manufacturer: 'Sun Pharmaceutical Industries Ltd',
      prescription_required: true,
      description: 'Pharmaceutical equivalent enteric coated pantoprazole 40mg for erosive esophagitis and hyperacidity relief.',
      created_at: new Date(Date.now() - 50 * 86400000).toISOString()
    },
    {
      id: 'med-10',
      name: 'Glycomet 500mg',
      generic_name: 'Metformin Hydrochloride',
      category: 'Diabetes Care',
      dosage_form: 'Tablet',
      strength: '500 mg',
      manufacturer: 'USV Pvt Ltd',
      prescription_required: true,
      description: 'First-line biguanide oral antihyperglycemic agent for managing type 2 diabetes mellitus by lowering glucose production.',
      created_at: new Date(Date.now() - 48 * 86400000).toISOString()
    },
    {
      id: 'med-11',
      name: 'Omez 20mg',
      generic_name: 'Omeprazole',
      category: 'Gastrointestinal & Antacids',
      dosage_form: 'Capsule',
      strength: '20 mg',
      manufacturer: 'Dr. Reddy’s Laboratories Ltd',
      prescription_required: false,
      description: 'Proton pump inhibitor used to treat frequent heartburn, gastroesophageal reflux disease, and peptic ulcers.',
      created_at: new Date(Date.now() - 45 * 86400000).toISOString()
    },
    {
      id: 'med-12',
      name: 'Ocid 20mg',
      generic_name: 'Omeprazole',
      category: 'Gastrointestinal & Antacids',
      dosage_form: 'Capsule',
      strength: '20 mg',
      manufacturer: 'Zydus Cadila Healthcare Ltd',
      prescription_required: false,
      description: 'Bioequivalent 20mg enteric coated omeprazole capsules for acid suppression and stomach wall protection.',
      created_at: new Date(Date.now() - 45 * 86400000).toISOString()
    },
    {
      id: 'med-13',
      name: 'Ecosprin 75mg',
      generic_name: 'Aspirin (Acetylsalicylic Acid)',
      category: 'Cardiovascular Care',
      dosage_form: 'Gastro-resistant Tablet',
      strength: '75 mg',
      manufacturer: 'USV Pvt Ltd',
      prescription_required: true,
      description: 'Antiplatelet medication that prevents clot formation, reducing the risk of heart attacks and stroke in high-risk patients.',
      created_at: new Date(Date.now() - 42 * 86400000).toISOString()
    },
    {
      id: 'med-14',
      name: 'Calcirol 60000 IU',
      generic_name: 'Cholecalciferol (Vitamin D3)',
      category: 'Vitamins & Supplements',
      dosage_form: 'Granules Sachet',
      strength: '60,000 IU',
      manufacturer: 'Cadila Healthcare Ltd',
      prescription_required: false,
      description: 'High-potency vitamin D3 supplement for calcium absorption, bone mineralization, and immune support.',
      created_at: new Date(Date.now() - 40 * 86400000).toISOString()
    },
    {
      id: 'med-15',
      name: 'Montair LC',
      generic_name: 'Montelukast Sodium + Levocetirizine',
      category: 'Respiratory Care',
      dosage_form: 'Tablet',
      strength: '10mg + 5mg',
      manufacturer: 'Cipla Ltd',
      prescription_required: true,
      description: 'Combination medication treating allergic rhinitis, asthma prophylaxis, and chronic bronchial allergies.',
      created_at: new Date(Date.now() - 38 * 86400000).toISOString()
    },
    {
      id: 'med-16',
      name: 'Telma 40mg',
      generic_name: 'Telmisartan',
      category: 'Cardiovascular Care',
      dosage_form: 'Tablet',
      strength: '40 mg',
      manufacturer: 'Glenmark Pharmaceuticals Ltd',
      prescription_required: true,
      description: 'Angiotensin II receptor blocker (ARB) used for management of hypertension and cardiovascular risk reduction.',
      created_at: new Date(Date.now() - 35 * 86400000).toISOString()
    }
  ],
  inventory: [
    // ph-1 Apollo
    { id: 'inv-1', pharmacy_id: 'ph-1', medicine_id: 'med-1', quantity: 85, price: 32.50, status: 'in_stock', last_updated: new Date(Date.now() - 15 * 60000).toISOString() },
    { id: 'inv-2', pharmacy_id: 'ph-1', medicine_id: 'med-2', quantity: 60, price: 31.00, status: 'in_stock', last_updated: new Date(Date.now() - 25 * 60000).toISOString() },
    { id: 'inv-3', pharmacy_id: 'ph-1', medicine_id: 'med-3', quantity: 42, price: 46.00, status: 'in_stock', last_updated: new Date(Date.now() - 45 * 60000).toISOString() },
    { id: 'inv-4', pharmacy_id: 'ph-1', medicine_id: 'med-5', quantity: 18, price: 108.00, status: 'in_stock', last_updated: new Date(Date.now() - 80 * 60000).toISOString() },
    { id: 'inv-5', pharmacy_id: 'ph-1', medicine_id: 'med-6', quantity: 0, price: 125.00, status: 'out_of_stock', last_updated: new Date(Date.now() - 120 * 60000).toISOString() },
    { id: 'inv-6', pharmacy_id: 'ph-1', medicine_id: 'med-8', quantity: 4, price: 145.00, status: 'low_stock', last_updated: new Date(Date.now() - 30 * 60000).toISOString() },
    { id: 'inv-7', pharmacy_id: 'ph-1', medicine_id: 'med-9', quantity: 35, price: 139.00, status: 'in_stock', last_updated: new Date(Date.now() - 35 * 60000).toISOString() },
    { id: 'inv-8', pharmacy_id: 'ph-1', medicine_id: 'med-10', quantity: 90, price: 48.00, status: 'in_stock', last_updated: new Date(Date.now() - 50 * 60000).toISOString() },
    { id: 'inv-9', pharmacy_id: 'ph-1', medicine_id: 'med-14', quantity: 28, price: 54.00, status: 'in_stock', last_updated: new Date(Date.now() - 60 * 60000).toISOString() },

    // ph-2 MedPlus
    { id: 'inv-10', pharmacy_id: 'ph-2', medicine_id: 'med-1', quantity: 110, price: 30.00, status: 'in_stock', last_updated: new Date(Date.now() - 10 * 60000).toISOString() },
    { id: 'inv-11', pharmacy_id: 'ph-2', medicine_id: 'med-3', quantity: 3, price: 44.50, status: 'low_stock', last_updated: new Date(Date.now() - 18 * 60000).toISOString() },
    { id: 'inv-12', pharmacy_id: 'ph-2', medicine_id: 'med-4', quantity: 50, price: 41.00, status: 'in_stock', last_updated: new Date(Date.now() - 22 * 60000).toISOString() },
    { id: 'inv-13', pharmacy_id: 'ph-2', medicine_id: 'med-6', quantity: 24, price: 119.00, status: 'in_stock', last_updated: new Date(Date.now() - 40 * 60000).toISOString() },
    { id: 'inv-14', pharmacy_id: 'ph-2', medicine_id: 'med-7', quantity: 65, price: 28.00, status: 'in_stock', last_updated: new Date(Date.now() - 75 * 60000).toISOString() },
    { id: 'inv-15', pharmacy_id: 'ph-2', medicine_id: 'med-8', quantity: 40, price: 142.00, status: 'in_stock', last_updated: new Date(Date.now() - 15 * 60000).toISOString() },
    { id: 'inv-16', pharmacy_id: 'ph-2', medicine_id: 'med-11', quantity: 30, price: 55.00, status: 'in_stock', last_updated: new Date(Date.now() - 35 * 60000).toISOString() },
    { id: 'inv-17', pharmacy_id: 'ph-2', medicine_id: 'med-15', quantity: 19, price: 185.00, status: 'in_stock', last_updated: new Date(Date.now() - 90 * 60000).toISOString() },

    // ph-3 HealthCare Koramangala
    { id: 'inv-18', pharmacy_id: 'ph-3', medicine_id: 'med-1', quantity: 5, price: 33.00, status: 'low_stock', last_updated: new Date(Date.now() - 5 * 60000).toISOString() },
    { id: 'inv-19', pharmacy_id: 'ph-3', medicine_id: 'med-2', quantity: 45, price: 30.50, status: 'in_stock', last_updated: new Date(Date.now() - 12 * 60000).toISOString() },
    { id: 'inv-20', pharmacy_id: 'ph-3', medicine_id: 'med-5', quantity: 32, price: 105.00, status: 'in_stock', last_updated: new Date(Date.now() - 65 * 60000).toISOString() },
    { id: 'inv-21', pharmacy_id: 'ph-3', medicine_id: 'med-8', quantity: 0, price: 148.00, status: 'out_of_stock', last_updated: new Date(Date.now() - 200 * 60000).toISOString() },
    { id: 'inv-22', pharmacy_id: 'ph-3', medicine_id: 'med-9', quantity: 22, price: 140.00, status: 'in_stock', last_updated: new Date(Date.now() - 40 * 60000).toISOString() },
    { id: 'inv-23', pharmacy_id: 'ph-3', medicine_id: 'med-13', quantity: 70, price: 21.00, status: 'in_stock', last_updated: new Date(Date.now() - 55 * 60000).toISOString() },

    // ph-4 Guardian HSR
    { id: 'inv-24', pharmacy_id: 'ph-4', medicine_id: 'med-1', quantity: 140, price: 31.00, status: 'in_stock', last_updated: new Date(Date.now() - 8 * 60000).toISOString() },
    { id: 'inv-25', pharmacy_id: 'ph-4', medicine_id: 'med-6', quantity: 38, price: 118.00, status: 'in_stock', last_updated: new Date(Date.now() - 30 * 60000).toISOString() },
    { id: 'inv-26', pharmacy_id: 'ph-4', medicine_id: 'med-7', quantity: 80, price: 27.50, status: 'in_stock', last_updated: new Date(Date.now() - 40 * 60000).toISOString() },
    { id: 'inv-27', pharmacy_id: 'ph-4', medicine_id: 'med-10', quantity: 120, price: 47.00, status: 'in_stock', last_updated: new Date(Date.now() - 20 * 60000).toISOString() },
    { id: 'inv-28', pharmacy_id: 'ph-4', medicine_id: 'med-16', quantity: 45, price: 160.00, status: 'in_stock', last_updated: new Date(Date.now() - 70 * 60000).toISOString() },

    // ph-5 Noble Whitefield
    { id: 'inv-29', pharmacy_id: 'ph-5', medicine_id: 'med-3', quantity: 20, price: 47.00, status: 'in_stock', last_updated: new Date(Date.now() - 110 * 60000).toISOString() },
    { id: 'inv-30', pharmacy_id: 'ph-5', medicine_id: 'med-5', quantity: 2, price: 112.00, status: 'low_stock', last_updated: new Date(Date.now() - 50 * 60000).toISOString() },
    { id: 'inv-31', pharmacy_id: 'ph-5', medicine_id: 'med-11', quantity: 15, price: 58.00, status: 'in_stock', last_updated: new Date(Date.now() - 95 * 60000).toISOString() },
    { id: 'inv-32', pharmacy_id: 'ph-5', medicine_id: 'med-12', quantity: 28, price: 51.00, status: 'in_stock', last_updated: new Date(Date.now() - 95 * 60000).toISOString() },

    // ph-6 Sanjeevani Marathahalli
    { id: 'inv-33', pharmacy_id: 'ph-6', medicine_id: 'med-1', quantity: 95, price: 32.00, status: 'in_stock', last_updated: new Date(Date.now() - 12 * 60000).toISOString() },
    { id: 'inv-34', pharmacy_id: 'ph-6', medicine_id: 'med-6', quantity: 15, price: 122.00, status: 'in_stock', last_updated: new Date(Date.now() - 40 * 60000).toISOString() },
    { id: 'inv-35', pharmacy_id: 'ph-6', medicine_id: 'med-8', quantity: 50, price: 144.00, status: 'in_stock', last_updated: new Date(Date.now() - 18 * 60000).toISOString() },
    { id: 'inv-36', pharmacy_id: 'ph-6', medicine_id: 'med-14', quantity: 3, price: 55.00, status: 'low_stock', last_updated: new Date(Date.now() - 33 * 60000).toISOString() },

    // ph-7 TrustPharma MG Road
    { id: 'inv-37', pharmacy_id: 'ph-7', medicine_id: 'med-2', quantity: 70, price: 31.50, status: 'in_stock', last_updated: new Date(Date.now() - 50 * 60000).toISOString() },
    { id: 'inv-38', pharmacy_id: 'ph-7', medicine_id: 'med-4', quantity: 40, price: 42.00, status: 'in_stock', last_updated: new Date(Date.now() - 30 * 60000).toISOString() },
    { id: 'inv-39', pharmacy_id: 'ph-7', medicine_id: 'med-10', quantity: 55, price: 46.50, status: 'in_stock', last_updated: new Date(Date.now() - 85 * 60000).toISOString() },
    { id: 'inv-40', pharmacy_id: 'ph-7', medicine_id: 'med-13', quantity: 90, price: 20.50, status: 'in_stock', last_updated: new Date(Date.now() - 44 * 60000).toISOString() },

    // ph-8 City Care Jayanagar
    { id: 'inv-41', pharmacy_id: 'ph-8', medicine_id: 'med-1', quantity: 200, price: 29.50, status: 'in_stock', last_updated: new Date(Date.now() - 4 * 60000).toISOString() },
    { id: 'inv-42', pharmacy_id: 'ph-8', medicine_id: 'med-5', quantity: 45, price: 106.00, status: 'in_stock', last_updated: new Date(Date.now() - 28 * 60000).toISOString() },
    { id: 'inv-43', pharmacy_id: 'ph-8', medicine_id: 'med-6', quantity: 30, price: 120.00, status: 'in_stock', last_updated: new Date(Date.now() - 14 * 60000).toISOString() },
    { id: 'inv-44', pharmacy_id: 'ph-8', medicine_id: 'med-15', quantity: 25, price: 182.00, status: 'in_stock', last_updated: new Date(Date.now() - 37 * 60000).toISOString() },
    { id: 'inv-45', pharmacy_id: 'ph-8', medicine_id: 'med-16', quantity: 50, price: 158.00, status: 'in_stock', last_updated: new Date(Date.now() - 45 * 60000).toISOString() }
  ],
  alternatives: [
    {
      id: 'alt-1',
      medicine_id: 'med-1', // Crocin 650
      alternative_medicine_id: 'med-2', // Calpol 650
      pharmacist_name: 'Dr. Arvind Menon, RPh',
      pharmacist_license: 'KA-PHARM-48192',
      verification_status: 'verified',
      verification_date: '2026-08-12',
      notes: 'Pharmacist Note: Both contain 650mg of active Paracetamol with identical oral bioavailability and antipyretic efficacy. Suitable equivalent option upon patient/physician agreement.'
    },
    {
      id: 'alt-2',
      medicine_id: 'med-2', // Calpol 650
      alternative_medicine_id: 'med-1', // Crocin 650
      pharmacist_name: 'Dr. Arvind Menon, RPh',
      pharmacist_license: 'KA-PHARM-48192',
      verification_status: 'verified',
      verification_date: '2026-08-12',
      notes: 'Pharmacist Note: Bioequivalent brand substitute containing 650mg Paracetamol. Identical indication profile and safety parameters.'
    },
    {
      id: 'alt-3',
      medicine_id: 'med-3', // Cetzine 10mg
      alternative_medicine_id: 'med-4', // Alerid 10mg
      pharmacist_name: 'Dr. Ramesh Gupta, RPh',
      pharmacist_license: 'MH-PHARM-88231',
      verification_status: 'verified',
      verification_date: '2026-09-02',
      notes: 'Pharmacist Note: Both products formulate 10mg Cetirizine Dihydrochloride. Direct therapeutic equivalent for rhinitis and allergic pruritus.'
    },
    {
      id: 'alt-4',
      medicine_id: 'med-4', // Alerid 10mg
      alternative_medicine_id: 'med-3', // Cetzine 10mg
      pharmacist_name: 'Dr. Ramesh Gupta, RPh',
      pharmacist_license: 'MH-PHARM-88231',
      verification_status: 'verified',
      verification_date: '2026-09-02',
      notes: 'Pharmacist Note: Equivalent active pharmaceutical ingredient (Cetirizine 10mg) with comparable pharmacokinetic absorption profile.'
    },
    {
      id: 'alt-5',
      medicine_id: 'med-8', // Pan 40
      alternative_medicine_id: 'med-9', // Pantocid 40
      pharmacist_name: 'Dr. Ananya Sharma, RPh',
      pharmacist_license: 'DL-PHARM-19402',
      verification_status: 'verified',
      verification_date: '2026-07-20',
      notes: 'Pharmacist Note: Both are enteric-coated 40mg Pantoprazole tablets. Identical mechanism of gastric acid suppression. Requires same prescription protocol.'
    },
    {
      id: 'alt-6',
      medicine_id: 'med-9', // Pantocid 40
      alternative_medicine_id: 'med-8', // Pan 40
      pharmacist_name: 'Dr. Ananya Sharma, RPh',
      pharmacist_license: 'DL-PHARM-19402',
      verification_status: 'verified',
      verification_date: '2026-07-20',
      notes: 'Pharmacist Note: Bioequivalent proton pump inhibitor (Pantoprazole 40mg). Verified for gastro-esophageal reflux management.'
    },
    {
      id: 'alt-7',
      medicine_id: 'med-11', // Omez 20mg
      alternative_medicine_id: 'med-12', // Ocid 20mg
      pharmacist_name: 'Dr. Sunita Patil, RPh',
      pharmacist_license: 'KA-PHARM-33109',
      verification_status: 'verified',
      verification_date: '2026-06-18',
      notes: 'Pharmacist Note: Delayed-release capsules both delivering 20mg Omeprazole. Equivalent gastric ulcer and acid reflux management.'
    }
  ],
  restock_alerts: [
    {
      id: 'alert-1',
      user_id: 'usr-1',
      medicine_id: 'med-6', // Azithral
      pharmacy_id: 'ph-1',
      status: 'active',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    }
  ],
  reservations: [
    {
      id: 'res-101',
      user_id: 'usr-1',
      pharmacy_id: 'ph-1',
      medicine_id: 'med-1',
      quantity: 2,
      total_price: 65.00,
      status: 'confirmed',
      pickup_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      customer_phone: '+91 98765 43210',
      notes: 'Please keep aside before 5 PM',
      created_at: new Date(Date.now() - 12 * 3600000).toISOString()
    },
    {
      id: 'res-102',
      user_id: 'usr-1',
      pharmacy_id: 'ph-2',
      medicine_id: 'med-7',
      quantity: 1,
      total_price: 28.00,
      status: 'ready_for_pickup',
      pickup_date: new Date().toISOString().split('T')[0],
      customer_phone: '+91 98765 43210',
      notes: 'Prescription will be shown at counter',
      created_at: new Date(Date.now() - 4 * 3600000).toISOString()
    }
  ],
  search_history: [
    { id: 'sh-1', user_id: 'usr-1', medicine_id: 'med-1', query: 'Crocin', searched_at: new Date(Date.now() - 2 * 3600000).toISOString() },
    { id: 'sh-2', user_id: 'usr-1', medicine_id: 'med-6', query: 'Azithral', searched_at: new Date(Date.now() - 10 * 3600000).toISOString() },
    { id: 'sh-3', user_id: 'usr-1', medicine_id: 'med-8', query: 'Pan 40', searched_at: new Date(Date.now() - 24 * 3600000).toISOString() },
    { id: 'sh-4', query: 'Paracetamol', searched_at: new Date(Date.now() - 5 * 3600000).toISOString() },
    { id: 'sh-5', query: 'Amoxicillin', searched_at: new Date(Date.now() - 8 * 3600000).toISOString() },
    { id: 'sh-6', query: 'Metformin', searched_at: new Date(Date.now() - 14 * 3600000).toISOString() },
    { id: 'sh-7', query: 'Cetirizine', searched_at: new Date(Date.now() - 18 * 3600000).toISOString() },
    { id: 'sh-8', query: 'Vitamin D3', searched_at: new Date(Date.now() - 22 * 3600000).toISOString() }
  ],
  notifications: [
    {
      id: 'notif-1',
      user_id: 'usr-1',
      title: 'Reservation Confirmed',
      message: 'Apollo Pharmacy has confirmed your reservation for Crocin 650 (2 strips). Pickup ready by tomorrow.',
      read: false,
      link: '/reservations',
      created_at: new Date(Date.now() - 12 * 3600000).toISOString()
    },
    {
      id: 'notif-2',
      user_id: 'usr-1',
      title: 'Ready for Pickup',
      message: 'MedPlus Wellness Store has prepared your Brufen 400mg reservation #res-102. Counter collection is now open.',
      read: false,
      link: '/reservations',
      created_at: new Date(Date.now() - 3 * 3600000).toISOString()
    }
  ]
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDir();
    this.data = this.load();
  }

  private ensureDir() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(content);
      }
    } catch (err) {
      console.warn('Failed to parse database file, falling back to seed data:', err);
    }
    this.saveData(SEED_DATA);
    return JSON.parse(JSON.stringify(SEED_DATA));
  }

  private saveData(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing DB file:', err);
    }
  }

  private persist() {
    this.saveData(this.data);
  }

  // --- Users ---
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData: Omit<User, 'id' | 'created_at'>): User {
    const user: User = {
      ...userData,
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString()
    };
    this.data.users.push(user);
    this.persist();
    return user;
  }

  // --- Pharmacies ---
  getPharmacies(): Pharmacy[] {
    return this.data.pharmacies;
  }

  getPharmacyById(id: string): Pharmacy | undefined {
    return this.data.pharmacies.find(p => p.id === id);
  }

  getPharmacyByOwnerId(ownerId: string): Pharmacy | undefined {
    return this.data.pharmacies.find(p => p.owner_id === ownerId);
  }

  createPharmacy(pharmacyData: Omit<Pharmacy, 'id' | 'created_at'>): Pharmacy {
    const pharmacy: Pharmacy = {
      ...pharmacyData,
      id: `ph-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString()
    };
    this.data.pharmacies.push(pharmacy);
    this.persist();
    return pharmacy;
  }

  updatePharmacy(id: string, updates: Partial<Pharmacy>): Pharmacy | undefined {
    const idx = this.data.pharmacies.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    this.data.pharmacies[idx] = { ...this.data.pharmacies[idx], ...updates };
    this.persist();
    return this.data.pharmacies[idx];
  }

  // --- Medicines ---
  getMedicines(): Medicine[] {
    return this.data.medicines;
  }

  getMedicineById(id: string): Medicine | undefined {
    return this.data.medicines.find(m => m.id === id);
  }

  createMedicine(medData: Omit<Medicine, 'id' | 'created_at'>): Medicine {
    const med: Medicine = {
      ...medData,
      id: `med-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString()
    };
    this.data.medicines.push(med);
    this.persist();
    return med;
  }

  updateMedicine(id: string, updates: Partial<Medicine>): Medicine | undefined {
    const idx = this.data.medicines.findIndex(m => m.id === id);
    if (idx === -1) return undefined;
    this.data.medicines[idx] = { ...this.data.medicines[idx], ...updates };
    this.persist();
    return this.data.medicines[idx];
  }

  // --- Inventory ---
  getInventory(): InventoryItem[] {
    return this.data.inventory;
  }

  getInventoryByMedicine(medicineId: string): (InventoryItem & { pharmacy: Pharmacy })[] {
    return this.data.inventory
      .filter(inv => inv.medicine_id === medicineId)
      .map(inv => ({
        ...inv,
        pharmacy: this.data.pharmacies.find(p => p.id === inv.pharmacy_id)!
      }))
      .filter(item => item.pharmacy !== undefined);
  }

  getInventoryByPharmacy(pharmacyId: string): (InventoryItem & { medicine: Medicine })[] {
    return this.data.inventory
      .filter(inv => inv.pharmacy_id === pharmacyId)
      .map(inv => ({
        ...inv,
        medicine: this.data.medicines.find(m => m.id === inv.medicine_id)!
      }))
      .filter(item => item.medicine !== undefined);
  }

  upsertInventoryItem(data: {
    pharmacy_id: string;
    medicine_id: string;
    quantity: number;
    price: number;
    status: StockStatus;
  }): InventoryItem {
    const existingIdx = this.data.inventory.findIndex(
      inv => inv.pharmacy_id === data.pharmacy_id && inv.medicine_id === data.medicine_id
    );

    const oldStatus = existingIdx !== -1 ? this.data.inventory[existingIdx].status : 'out_of_stock';
    const now = new Date().toISOString();

    let savedItem: InventoryItem;
    if (existingIdx !== -1) {
      this.data.inventory[existingIdx] = {
        ...this.data.inventory[existingIdx],
        quantity: data.quantity,
        price: data.price,
        status: data.status,
        last_updated: now
      };
      savedItem = this.data.inventory[existingIdx];
    } else {
      savedItem = {
        id: `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        pharmacy_id: data.pharmacy_id,
        medicine_id: data.medicine_id,
        quantity: data.quantity,
        price: data.price,
        status: data.status,
        last_updated: now
      };
      this.data.inventory.push(savedItem);
    }

    this.persist();

    // Trigger restock alerts if newly back in stock!
    if (oldStatus === 'out_of_stock' && data.status === 'in_stock') {
      this.triggerRestockAlerts(data.medicine_id, data.pharmacy_id, data.price);
    }

    return savedItem;
  }

  deleteInventoryItem(id: string): boolean {
    const initialLen = this.data.inventory.length;
    this.data.inventory = this.data.inventory.filter(i => i.id !== id);
    if (this.data.inventory.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Alternatives ---
  getAlternativesForMedicine(medicineId: string): (Alternative & { alternative_medicine: Medicine })[] {
    return this.data.alternatives
      .filter(alt => alt.medicine_id === medicineId && alt.verification_status === 'verified')
      .map(alt => ({
        ...alt,
        alternative_medicine: this.data.medicines.find(m => m.id === alt.alternative_medicine_id)!
      }))
      .filter(alt => alt.alternative_medicine !== undefined);
  }

  getAllAlternatives(): (Alternative & { medicine: Medicine; alternative_medicine: Medicine })[] {
    return this.data.alternatives.map(alt => ({
      ...alt,
      medicine: this.data.medicines.find(m => m.id === alt.medicine_id)!,
      alternative_medicine: this.data.medicines.find(m => m.id === alt.alternative_medicine_id)!
    }));
  }

  createAlternative(altData: Omit<Alternative, 'id'>): Alternative {
    const alt: Alternative = {
      ...altData,
      id: `alt-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    this.data.alternatives.push(alt);
    this.persist();
    return alt;
  }

  updateAlternativeStatus(id: string, status: 'verified' | 'pending' | 'rejected', notes?: string): Alternative | undefined {
    const idx = this.data.alternatives.findIndex(a => a.id === id);
    if (idx === -1) return undefined;
    this.data.alternatives[idx].verification_status = status;
    if (notes) this.data.alternatives[idx].notes = notes;
    this.persist();
    return this.data.alternatives[idx];
  }

  // --- Restock Alerts ---
  createRestockAlert(userId: string, medicineId: string, pharmacyId?: string): RestockAlert {
    const existing = this.data.restock_alerts.find(
      a => a.user_id === userId && a.medicine_id === medicineId && a.status === 'active'
    );
    if (existing) return existing;

    const alert: RestockAlert = {
      id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: userId,
      medicine_id: medicineId,
      pharmacy_id: pharmacyId,
      status: 'active',
      created_at: new Date().toISOString()
    };
    this.data.restock_alerts.push(alert);
    this.persist();
    return alert;
  }

  getRestockAlertsByUser(userId: string): (RestockAlert & { medicine: Medicine; pharmacy?: Pharmacy })[] {
    return this.data.restock_alerts
      .filter(a => a.user_id === userId)
      .map(a => ({
        ...a,
        medicine: this.data.medicines.find(m => m.id === a.medicine_id)!,
        pharmacy: a.pharmacy_id ? this.data.pharmacies.find(p => p.id === a.pharmacy_id) : undefined
      }))
      .filter(a => a.medicine !== undefined);
  }

  getAllRestockAlerts(): (RestockAlert & { user: User; medicine: Medicine; pharmacy?: Pharmacy })[] {
    return this.data.restock_alerts.map(a => ({
      ...a,
      user: this.data.users.find(u => u.id === a.user_id)!,
      medicine: this.data.medicines.find(m => m.id === a.medicine_id)!,
      pharmacy: a.pharmacy_id ? this.data.pharmacies.find(p => p.id === a.pharmacy_id) : undefined
    }));
  }

  deleteRestockAlert(id: string, userId: string): boolean {
    const initialLen = this.data.restock_alerts.length;
    this.data.restock_alerts = this.data.restock_alerts.filter(
      a => !(a.id === id && a.user_id === userId)
    );
    if (this.data.restock_alerts.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  triggerRestockAlerts(medicineId: string, pharmacyId: string, price: number) {
    const medicine = this.data.medicines.find(m => m.id === medicineId);
    const pharmacy = this.data.pharmacies.find(p => p.id === pharmacyId);
    if (!medicine || !pharmacy) return;

    const matchingAlerts = this.data.restock_alerts.filter(
      a => a.medicine_id === medicineId && a.status === 'active' && (!a.pharmacy_id || a.pharmacy_id === pharmacyId)
    );

    matchingAlerts.forEach(alert => {
      alert.status = 'notified';
      this.createNotification({
        user_id: alert.user_id,
        title: `${medicine.name} Restocked!`,
        message: `Great news! ${medicine.name} is now back in stock at ${pharmacy.name} for ₹${price.toFixed(2)}. Reserve your pickup now.`,
        link: `/medicines/${medicine.id}`
      });
    });

    if (matchingAlerts.length > 0) {
      this.persist();
    }
  }

  // --- Reservations ---
  createReservation(data: {
    user_id: string;
    pharmacy_id: string;
    medicine_id: string;
    quantity: number;
    total_price: number;
    pickup_date: string;
    customer_phone: string;
    notes?: string;
  }): Reservation {
    const res: Reservation = {
      ...data,
      id: `res-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    this.data.reservations.unshift(res);

    // Notify user
    const med = this.data.medicines.find(m => m.id === data.medicine_id);
    const ph = this.data.pharmacies.find(p => p.id === data.pharmacy_id);

    this.createNotification({
      user_id: data.user_id,
      title: 'Reservation Requested',
      message: `Your reservation #${res.id} for ${data.quantity}x ${med?.name || 'Medicine'} at ${ph?.name || 'Pharmacy'} has been submitted and is pending confirmation.`,
      link: '/reservations'
    });

    this.persist();
    return res;
  }

  getReservationsByUser(userId: string): (Reservation & { medicine: Medicine; pharmacy: Pharmacy })[] {
    return this.data.reservations
      .filter(r => r.user_id === userId)
      .map(r => ({
        ...r,
        medicine: this.data.medicines.find(m => m.id === r.medicine_id)!,
        pharmacy: this.data.pharmacies.find(p => p.id === r.pharmacy_id)!
      }));
  }

  getReservationsByPharmacy(pharmacyId: string): (Reservation & { medicine: Medicine; user: User })[] {
    return this.data.reservations
      .filter(r => r.pharmacy_id === pharmacyId)
      .map(r => ({
        ...r,
        medicine: this.data.medicines.find(m => m.id === r.medicine_id)!,
        user: this.data.users.find(u => u.id === r.user_id)!
      }));
  }

  getAllReservations(): (Reservation & { medicine: Medicine; pharmacy: Pharmacy; user: User })[] {
    return this.data.reservations.map(r => ({
      ...r,
      medicine: this.data.medicines.find(m => m.id === r.medicine_id)!,
      pharmacy: this.data.pharmacies.find(p => p.id === r.pharmacy_id)!,
      user: this.data.users.find(u => u.id === r.user_id)!
    }));
  }

  updateReservationStatus(id: string, status: ReservationStatus): Reservation | undefined {
    const res = this.data.reservations.find(r => r.id === id);
    if (!res) return undefined;

    res.status = status;
    const med = this.data.medicines.find(m => m.id === res.medicine_id);
    const ph = this.data.pharmacies.find(p => p.id === res.pharmacy_id);

    let statusText = 'updated';
    if (status === 'confirmed') statusText = 'confirmed';
    else if (status === 'ready_for_pickup') statusText = 'ready for pickup';
    else if (status === 'completed') statusText = 'marked completed';
    else if (status === 'cancelled') statusText = 'cancelled';

    this.createNotification({
      user_id: res.user_id,
      title: `Reservation ${statusText.toUpperCase()}`,
      message: `Your reservation #${res.id} for ${med?.name} at ${ph?.name} is now ${statusText}.`,
      link: '/reservations'
    });

    this.persist();
    return res;
  }

  // --- Search History ---
  recordSearch(query: string, userId?: string, medicineId?: string) {
    if (!query || query.trim().length === 0) return;
    const item: SearchHistoryItem = {
      id: `sh-${Date.now()}`,
      user_id: userId,
      medicine_id: medicineId,
      query: query.trim(),
      searched_at: new Date().toISOString()
    };
    this.data.search_history.unshift(item);
    if (this.data.search_history.length > 500) {
      this.data.search_history = this.data.search_history.slice(0, 500);
    }
    this.persist();
  }

  getRecentSearches(userId?: string): SearchHistoryItem[] {
    if (userId) {
      return this.data.search_history.filter(s => s.user_id === userId).slice(0, 10);
    }
    return this.data.search_history.slice(0, 10);
  }

  // --- Notifications ---
  createNotification(notifData: { user_id: string; title: string; message: string; link?: string }): Notification {
    const notif: Notification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: notifData.user_id,
      title: notifData.title,
      message: notifData.message,
      read: false,
      link: notifData.link,
      created_at: new Date().toISOString()
    };
    this.data.notifications.unshift(notif);
    if (this.data.notifications.length > 300) {
      this.data.notifications = this.data.notifications.slice(0, 300);
    }
    this.persist();
    return notif;
  }

  getNotifications(userId: string): Notification[] {
    return this.data.notifications.filter(n => n.user_id === userId);
  }

  markNotificationRead(id: string, userId: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id && n.user_id === userId);
    if (notif) {
      notif.read = true;
      this.persist();
      return true;
    }
    return false;
  }

  markAllNotificationsRead(userId: string): boolean {
    let changed = false;
    this.data.notifications.forEach(n => {
      if (n.user_id === userId && !n.read) {
        n.read = true;
        changed = true;
      }
    });
    if (changed) this.persist();
    return true;
  }

  // --- Admin Analytics ---
  getAdminAnalytics() {
    const totalUsers = this.data.users.length;
    const totalPharmacies = this.data.pharmacies.length;
    const totalMedicines = this.data.medicines.length;
    const totalSearches = this.data.search_history.length;
    const totalReservations = this.data.reservations.length;
    const outOfStockCount = this.data.inventory.filter(i => i.status === 'out_of_stock').length;
    const restockRequestsCount = this.data.restock_alerts.filter(a => a.status === 'active').length;

    // Search counts by medicine
    const searchCounts: { [key: string]: number } = {};
    this.data.search_history.forEach(sh => {
      const q = sh.query.toLowerCase();
      searchCounts[q] = (searchCounts[q] || 0) + 1;
    });

    const topSearches = Object.entries(searchCounts)
      .map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        searches: count
      }))
      .sort((a, b) => b.searches - a.searches)
      .slice(0, 6);

    // Most requested medicines (restock alerts)
    const alertCounts: { [medId: string]: number } = {};
    this.data.restock_alerts.forEach(a => {
      alertCounts[a.medicine_id] = (alertCounts[a.medicine_id] || 0) + 1;
    });

    const topRequested = Object.entries(alertCounts).map(([medId, count]) => {
      const med = this.data.medicines.find(m => m.id === medId);
      return {
        name: med ? med.name : medId,
        alerts: count
      };
    });

    // Pharmacy availability status counts
    const inStock = this.data.inventory.filter(i => i.status === 'in_stock').length;
    const lowStock = this.data.inventory.filter(i => i.status === 'low_stock').length;
    const outOfStock = this.data.inventory.filter(i => i.status === 'out_of_stock').length;

    // Reservation breakdown
    const reservationBreakdown = [
      { status: 'Pending', count: this.data.reservations.filter(r => r.status === 'pending').length },
      { status: 'Confirmed', count: this.data.reservations.filter(r => r.status === 'confirmed').length },
      { status: 'Ready', count: this.data.reservations.filter(r => r.status === 'ready_for_pickup').length },
      { status: 'Completed', count: this.data.reservations.filter(r => r.status === 'completed').length },
      { status: 'Cancelled', count: this.data.reservations.filter(r => r.status === 'cancelled').length }
    ];

    return {
      totalUsers,
      totalPharmacies,
      totalMedicines,
      totalSearches,
      totalReservations,
      outOfStockCount,
      restockRequestsCount,
      topSearches,
      topRequested,
      inventoryDistribution: [
        { name: 'In Stock', value: inStock, fill: '#16a34a' },
        { name: 'Low Stock', value: lowStock, fill: '#d97706' },
        { name: 'Out of Stock', value: outOfStock, fill: '#dc2626' }
      ],
      reservationBreakdown
    };
  }
}

export const db = new Database();
