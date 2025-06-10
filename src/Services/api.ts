// src/Services/api.ts
import axios from "axios";
import { User, Appointment, UpdateUserData, Service } from "../Types";

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
  try {
    console.log('🔍 Buscando dados do usuário atual...');
    
    const response = await api.get('/users/me');
    
    console.log('✅ Dados do usuário carregados:', response.data);
    return response.data;
  } catch (error: unknown) {
    console.error('❌ Erro ao buscar usuário:', error);
    
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.error || "Erro ao carregar dados do usuário";
      
      throw {
        error: errorMessage,
        status: error.response?.status,
        details: errorData
      };
    }
    throw { error: "Erro desconhecido" };
  }
};

// Buscar dados de um usuário específico
export const getUser = async (userId: number): Promise<User> => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// Atualizar dados do usuário
export const updateUser = async (userId: number, data: UpdateUserData): Promise<any> => {
  try {
    console.log('🔄 Enviando dados para atualização:', data);
    
    const response = await api.put(`/users/${userId}`, data);
    
    console.log('✅ Resposta do servidor:', response.data);
    return response.data;
  } catch (error: unknown) {
    console.error('❌ Erro na atualização:', error);
    
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.error || "Erro na requisição";
      
      throw {
        error: errorMessage,
        status: error.response?.status,
        details: errorData
      };
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

// Buscar todos os barbeiros
export const getBarbers = async (): Promise<User[]> => {
  const response = await api.get('/barbers');
  return response.data;
};

// Buscar serviços de um barbeiro
export const getServicesByBarber = async (barberId: number): Promise<Service[]> => {
  const response = await api.get(`/services/${barberId}`);
  return response.data;
};

// Buscar horários disponíveis
export const getAvailableTimes = async (barberId: number, date: string): Promise<string[]> => {
  const response = await api.get(`/available-times/${barberId}/${date}`);
  return response.data;
};

// Criar novo agendamento
export const createAppointment = async (appointmentData: {
  client_id: number;
  barber_id: number;
  service_id: number;
  appointment_date: string;
  notes?: string;
}): Promise<any> => {
  const response = await api.post('/appointments', appointmentData);
  return response.data;
};

// Criar novo serviço
export const createService = async (serviceData: {
  name: string;
  description?: string;
  price: number;
  duration: number;
  barber_id: number;
}): Promise<any> => {
  const response = await api.post('/services', serviceData);
  return response.data;
};

// Atualizar serviço
export const updateService = async (serviceId: number, data: {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  active?: boolean;
}): Promise<any> => {
  const response = await api.put(`/services/${serviceId}`, data);
  return response.data;
};

// Deletar serviço (soft delete)
export const deleteService = async (serviceId: number): Promise<any> => {
  const response = await api.delete(`/services/${serviceId}`);
  return response.data;
};

// Buscar horários de trabalho do barbeiro
export const getBarberSchedule = async (barberId: number): Promise<any[]> => {
  const response = await api.get(`/schedules/${barberId}`);
  return response.data;
};

// Criar horário de trabalho
export const createSchedule = async (scheduleData: {
  barber_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
}): Promise<any> => {
  const response = await api.post('/schedules', scheduleData);
  return response.data;
};

// Atualizar horário de trabalho
export const updateSchedule = async (scheduleId: number, data: any): Promise<any> => {
  const response = await api.put(`/schedules/${scheduleId}`, data);
  return response.data;
};

// Criar horários padrão para barbeiro
export const createDefaultSchedule = async (barberId: number): Promise<any> => {
  const response = await api.post(`/schedules/${barberId}/default`);
  return response.data;
};