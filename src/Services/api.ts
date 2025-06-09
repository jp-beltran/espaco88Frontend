// src/Services/api.ts
import axios from "axios";
import { User, Appointment, UpdateUserData } from "../Types/index";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL não está definida no ambiente.");
}

console.log("API_URL definida como:", API_URL);

// Criar instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (userId) {
    config.headers['X-User-Id'] = userId;
  }
  
  return config;
});

interface UserData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  type: "barber" | "client";
}

export const registerUser = async (userData: UserData): Promise<any> => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return error.response?.data || { error: "Erro na requisição" };
    }
    return { error: "Erro desconhecido" };
  }
};

export const loginUser = async (
  email: string,
  password: string
): Promise<any> => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    
    // Salvar o userId no localStorage quando o login for bem-sucedido
    if (response.data.user && response.data.user.id) {
      localStorage.setItem('userId', response.data.user.id.toString());
    }
    
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return error.response?.data || { error: "Erro na requisição" };
    }
    return { error: "Erro desconhecido" };
  }
};

// Buscar dados do usuário atual
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/users/me');
  return response.data;
};

// Buscar dados de um usuário específico
export const getUser = async (userId: number): Promise<User> => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// Atualizar dados do usuário
export const updateUser = async (userId: number, data: UpdateUserData): Promise<any> => {
  try {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || { error: "Erro na requisição" };
    }
    throw { error: "Erro desconhecido" };
  }
};

// Buscar agendamentos do usuário
export const getUserAppointments = async (userId: number): Promise<Appointment[]> => {
  const response = await api.get(`/appointments/${userId}`);
  return response.data;
};

// Cancelar agendamento
export const cancelAppointment = async (appointmentId: number): Promise<any> => {
  const response = await api.delete(`/appointments/${appointmentId}`);

  return response.data;
};

// Atualizar status do agendamento
export const updateAppointmentStatus = async (
  appointmentId: number, 
  status: 'scheduled' | 'completed' | 'cancelled'
): Promise<any> => {
  const response = await api.put(`/appointments/${appointmentId}/status`, { status });
  return response.data;
};