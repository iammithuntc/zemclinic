// Load environment variables from .env.local BEFORE any other imports
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local'), override: true });

import mongoose from 'mongoose';
import User from '../models/User';
import Patient from '../models/Patient';
import Appointment from '../models/Appointment';
import Report from '../models/Report';
import dbConnect from '../lib/mongodb';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  try {
    await dbConnect();
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Report.deleteMany({});
    console.log('Cleared existing data');

    // Create demo doctor user with hashed password
    const existingDoctor = await User.findOne({ email: 'doctor@zemclinic.com' });
    if (!existingDoctor) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      const doctor = new User({
        email: 'doctor@zemclinic.com',
        name: 'Dr. Demo User',
        role: 'doctor',
        password: hashedPassword,
      });
      await doctor.save();
      console.log('Created demo doctor user with hashed password');
    } else if (!existingDoctor.password) {
      // Update existing user without password
      const hashedPassword = await bcrypt.hash('password123', 12);
      existingDoctor.password = hashedPassword;
      await existingDoctor.save();
      console.log('Updated demo doctor user with hashed password');
    }

    // Create admin user with hashed password
    const existingAdmin = await User.findOne({ email: 'admin@zemclinic.com' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      const admin = new User({
        email: 'admin@zemclinic.com',
        name: 'Admin User',
        role: 'admin',
        password: hashedPassword,
      });
      await admin.save();
      console.log('Created admin user with hashed password');
    } else if (!existingAdmin.password) {
      // Update existing user without password
      const hashedPassword = await bcrypt.hash('password123', 12);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('Updated admin user with hashed password');
    }

    // Create sample patients
    const patients = [
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0101',
        dateOfBirth: new Date('1985-03-15'),
        gender: 'female' as const,
        address: '123 Main St, Anytown, USA',
        emergencyContact: {
          name: 'John Johnson',
          phone: '+1-555-0102',
          relationship: 'Spouse'
        },
        medicalHistory: ['Hypertension', 'Diabetes Type 2'],
        allergies: ['Penicillin', 'Peanuts'],
        currentMedications: ['Metformin', 'Lisinopril'],
        bloodType: 'A+' as const,
        insuranceProvider: 'Blue Cross Blue Shield',
        insuranceNumber: 'BCBS123456',
        assignedDoctor: 'Dr. Demo User'
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        phone: '+1-555-0201',
        dateOfBirth: new Date('1990-07-22'),
        gender: 'male' as const,
        address: '456 Oak Ave, Somewhere, USA',
        emergencyContact: {
          name: 'Lisa Chen',
          phone: '+1-555-0202',
          relationship: 'Sister'
        },
        medicalHistory: ['Asthma'],
        allergies: ['Dust', 'Pollen'],
        currentMedications: ['Albuterol'],
        bloodType: 'O+' as const,
        insuranceProvider: 'Aetna',
        insuranceNumber: 'AET789012',
        assignedDoctor: 'Dr. Demo User'
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@email.com',
        phone: '+1-555-0301',
        dateOfBirth: new Date('1988-11-08'),
        gender: 'female' as const,
        address: '789 Pine Rd, Elsewhere, USA',
        emergencyContact: {
          name: 'Robert Davis',
          phone: '+1-555-0302',
          relationship: 'Father'
        },
        medicalHistory: ['Migraine', 'Anxiety'],
        allergies: ['Sulfa drugs'],
        currentMedications: ['Sumatriptan', 'Sertraline'],
        bloodType: 'B-' as const,
        insuranceProvider: 'Cigna',
        insuranceNumber: 'CIG345678',
        assignedDoctor: 'Dr. Demo User'
      }
    ];

    // Create patients one by one to trigger pre-save hook for patientId generation
    const createdPatients = [];
    for (const patientData of patients) {
      const patient = new Patient(patientData);
      await patient.save();
      createdPatients.push(patient);
    }
    console.log(`Created ${createdPatients.length} patients`);

    // Create sample appointments
    const appointments = [
      {
        patientName: 'Sarah Johnson',
        patientEmail: 'sarah.johnson@email.com',
        patientPhone: '+1-555-0101',
        doctorName: 'Dr. Demo User',
        doctorEmail: 'doctor@aidoc.com',
        appointmentDate: new Date(),
        appointmentTime: '09:00 AM',
        appointmentType: 'consultation' as const,
        status: 'confirmed' as const,
        notes: 'Follow-up for diabetes management',
        symptoms: ['Fatigue', 'Increased thirst'],
        diagnosis: 'Diabetes Type 2',
        treatment: 'Continue Metformin, monitor blood sugar'
      },
      {
        patientName: 'Michael Chen',
        patientEmail: 'michael.chen@email.com',
        patientPhone: '+1-555-0201',
        doctorName: 'Dr. Demo User',
        doctorEmail: 'doctor@aidoc.com',
        appointmentDate: new Date(),
        appointmentTime: '10:30 AM',
        appointmentType: 'follow-up' as const,
        status: 'confirmed' as const,
        notes: 'Asthma control check',
        symptoms: ['Wheezing', 'Shortness of breath'],
        diagnosis: 'Asthma',
        treatment: 'Continue Albuterol, avoid triggers'
      },
      {
        patientName: 'Emily Davis',
        patientEmail: 'emily.davis@email.com',
        patientPhone: '+1-555-0301',
        doctorName: 'Dr. Demo User',
        doctorEmail: 'doctor@aidoc.com',
        appointmentDate: new Date(),
        appointmentTime: '02:00 PM',
        appointmentType: 'consultation' as const,
        status: 'scheduled' as const,
        notes: 'New patient consultation',
        symptoms: ['Headaches', 'Nausea'],
        diagnosis: 'Migraine',
        treatment: 'Prescribe Sumatriptan, lifestyle modifications'
      }
    ];

    const createdAppointments = await Appointment.insertMany(appointments);
    console.log(`Created ${createdAppointments.length} appointments`);

    // Create sample reports
    const reports = [
      {
        patientId: createdPatients[0]._id.toString(),
        patientName: 'Sarah Johnson',
        doctorId: 'demo-user',
        doctorName: 'Dr. Demo User',
        reportType: 'lab' as const,
        reportDate: new Date(),
        status: 'completed' as const,
        findings: 'Blood glucose levels elevated, HbA1c at 8.2%',
        diagnosis: 'Poorly controlled diabetes',
        recommendations: 'Increase Metformin dosage, strict diet control, regular exercise',
        priority: 'high' as const,
        notes: 'Patient needs immediate intervention'
      },
      {
        patientId: createdPatients[1]._id.toString(),
        patientName: 'Michael Chen',
        doctorId: 'demo-user',
        doctorName: 'Dr. Demo User',
        reportType: 'diagnostic' as const,
        reportDate: new Date(),
        status: 'pending' as const,
        findings: 'Lung function test shows mild obstruction',
        diagnosis: 'Mild asthma exacerbation',
        recommendations: 'Increase Albuterol frequency, consider steroid inhaler',
        priority: 'medium' as const,
        notes: 'Schedule follow-up in 2 weeks'
      },
      {
        patientId: createdPatients[2]._id.toString(),
        patientName: 'Emily Davis',
        doctorId: 'demo-user',
        doctorName: 'Dr. Demo User',
        reportType: 'diagnostic' as const,
        reportDate: new Date(),
        status: 'in-progress' as const,
        findings: 'Neurological examination normal, MRI scheduled',
        diagnosis: 'Suspected migraine with aura',
        recommendations: 'Complete MRI, start preventive medication',
        priority: 'medium' as const,
        notes: 'Awaiting MRI results'
      }
    ];

    const createdReports = await Report.insertMany(reports);
    console.log(`Created ${createdReports.length} reports`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
