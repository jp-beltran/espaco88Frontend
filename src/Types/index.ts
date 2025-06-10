// src/types/index.ts

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: 'barber' | 'client';
  avatar_url?: string | null;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  barber_id?: number;
  barber_name?: string;
}

export interface Appointment {
  id: number;
  client_name: string;
  barber_name: string;
  service_name: string;
  service_price: number;
  appointment_date: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  avatar_url?: string | null;
}