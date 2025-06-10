// src/Services/api.ts
import axios from "axios";
import { User, Appointment, UpdateUserData, Service } from "../Types";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL não está definida no ambiente.");
}

console.log("API_URL definida como:", API_URL);

// Criar instância do axios com configurações melhoradas
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 segundos de timeout
  headers: {
    "Content-Type": "application/json",
  },
  // Permitir cookies e headers de autenticação
  withCredentials: false,
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (userId) {
      config.headers["X-User-Id"] = userId;
    }

    return config;
  },
  (error) => {
    console.error("❌ Erro no interceptor de request:", error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { config } = error;

    // Log detalhado do erro
    console.error("❌ Erro na resposta da API:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: config?.url,
      method: config?.method,
    });

    // Retry automático para erros de rede (máximo 3 tentativas)
    if (
      !config ||
      config.retry >= 3 ||
      error.response?.status < 500 // Não retry para erros 4xx
    ) {
      return Promise.reject(error);
    }

    config.retry = (config.retry || 0) + 1;

    console.log(`🔄 Tentativa ${config.retry} de 3 para ${config.url}`);

    // Delay progressivo (1s, 2s, 3s)
    await new Promise((resolve) => setTimeout(resolve, 1000 * config.retry));

    return api(config);
  }
);

interface UserData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  type: "barber" | "client";
}

// Função auxiliar para testar conectividade
export const testApiConnection = async (): Promise<any> => {
  try {
    console.log("🧪 Testando conectividade com a API...");
    const response = await api.get("/health", { timeout: 5000 });
    console.log("✅ API está online:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ API não está respondendo:", error);
    return { success: false, error };
  }
};

export const registerUser = async (userData: UserData): Promise<any> => {
  try {
    console.log("📝 Registrando usuário...");
    const response = await api.post("/users", userData);
    console.log("✅ Usuário registrado:", response.data);
    return response.data;
  } catch (error: unknown) {
    console.error("❌ Erro no registro:", error);

    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      return errorData || { error: "Erro na requisição de registro" };
    }
    return { error: "Erro desconhecido no registro" };
  }
};

export const loginUser = async (
  email: string,
  password: string
): Promise<any> => {
  try {
    console.log("🔐 === INÍCIO DO LOGIN FRONTEND ===");
    console.log(`📧 Email: ${email}`);
    console.log(`🔒 Senha: ${"*".repeat(password.length)}`);
    console.log(`🌐 API_URL: ${API_URL}`);

    // Testar conectividade primeiro
    const connectionTest = await testApiConnection();
    if (!connectionTest.success) {
      throw new Error(
        "Servidor indisponível. Tente novamente em alguns instantes."
      );
    }

    const requestData = {
      email: email.trim(),
      password: password,
    };

    console.log("📤 Dados sendo enviados:", {
      email: requestData.email,
      password: "***",
    });

    const response = await api.post("/auth/login", requestData, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000, // 10 segundos
    });

    console.log("✅ Resposta recebida:", response.data);
    console.log("📊 Status da resposta:", response.status);

    // Salvar o userId no localStorage quando o login for bem-sucedido
    if (response.data.user && response.data.user.id) {
      localStorage.setItem("userId", response.data.user.id.toString());
      localStorage.setItem("token", response.data.token || "FAKE-TOKEN");
      console.log("💾 Dados salvos no localStorage");
    }

    return response.data;
  } catch (error: unknown) {
    console.error("❌ === ERRO NO LOGIN ===", error);

    if (axios.isAxiosError(error)) {
      console.error("📊 Status do erro:", error.response?.status);
      console.error("📝 Dados do erro:", error.response?.data);
      console.error("🌐 URL da requisição:", error.config?.url);
      console.error("📋 Headers da resposta:", error.response?.headers);

      const errorData = error.response?.data;

      // Tratamento específico de erros de rede
      if (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") {
        return {
          error: "Erro de conexão. Verifique sua internet e tente novamente.",
        };
      }

      if (error.code === "ETIMEDOUT" || error.message.includes("timeout")) {
        return {
          error: "Tempo limite excedido. O servidor pode estar sobrecarregado.",
        };
      }

      if (error.response?.status === 503) {
        return {
          error:
            "Servidor temporariamente indisponível. Tente novamente em alguns instantes.",
        };
      }

      return errorData || { error: "Erro na requisição de login" };
    }

    return {
      error:
        error instanceof Error ? error.message : "Erro desconhecido no login",
    };
  }
};

// Buscar dados do usuário atual
export const getCurrentUser = async (): Promise<User> => {
  try {
    console.log("🔍 Buscando dados do usuário atual...");

    const response = await api.get("/users/me");

    console.log("✅ Dados do usuário carregados:", response.data);
    return response.data;
  } catch (error: unknown) {
    console.error("❌ Erro ao buscar usuário:", error);

    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      const errorMessage =
        errorData?.error || "Erro ao carregar dados do usuário";

      throw {
        error: errorMessage,
        status: error.response?.status,
        details: errorData,
      };
    }
    throw { error: "Erro desconhecido" };
  }
};

// Buscar dados de um usuário específico
export const getUser = async (userId: number): Promise<User> => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao buscar usuário específico:", error);
    throw error;
  }
};

// Atualizar dados do usuário
export const updateUser = async (
  userId: number,
  data: UpdateUserData
): Promise<any> => {
  try {
    console.log("🔄 Enviando dados para atualização:", data);
    
    // ⭐ IMPORTANTE: Filtrar campos vazios que não devem ser enviados
    const filteredData: Record<string, any> = {};
    
    // Só incluir campos que realmente foram preenchidos
    if (data.name && data.name.trim() !== '') {
      filteredData.name = data.name.trim();
    }
    
    if (data.email && data.email.trim() !== '') {
      filteredData.email = data.email.trim();
    }
    
    if (data.phone && data.phone.trim() !== '') {
      filteredData.phone = data.phone.trim();
    }
    
    if (data.password && data.password.trim() !== '') {
      filteredData.password = data.password;
    }
    
    // ⭐ NOVO: Incluir avatar_url mesmo se for null/vazio (para remoção)
    if ('avatar_url' in data) {
      filteredData.avatar_url = data.avatar_url;
    }
    
    console.log("📤 Dados filtrados sendo enviados:", filteredData);
    
    // Verificar se há pelo menos um campo para atualizar
    if (Object.keys(filteredData).length === 0) {
      throw {
        error: "Nenhum campo válido foi fornecido para atualização",
        status: 400
      };
    }

    const response = await api.put(`/users/${userId}`, filteredData);

    console.log("✅ Resposta do servidor:", response.data);
    return response.data;
  } catch (error: unknown) {
    console.error("❌ Erro na atualização:", error);

    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.error || "Erro na requisição";

      throw {
        error: errorMessage,
        status: error.response?.status,
        details: errorData,
      };
    }
    throw { error: "Erro desconhecido" };
  }
};

export const updateUserAvatar = async (
  userId: number,
  avatarUrl: string | null
): Promise<any> => {
  try {
    console.log("🖼️ Atualizando avatar do usuário...", { userId, avatarUrl });
    
    const response = await api.put(`/users/${userId}`, {
      avatar_url: avatarUrl
    });

    console.log("✅ Avatar atualizado:", response.data);
    return response.data;
  } catch (error: unknown) {
    console.error("❌ Erro ao atualizar avatar:", error);

    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.error || "Erro ao atualizar avatar";

      throw {
        error: errorMessage,
        status: error.response?.status,
        details: errorData,
      };
    }
    throw { error: "Erro desconhecido ao atualizar avatar" };
  }
};

// Buscar agendamentos do usuário
export const getUserAppointments = async (
  userId: number
): Promise<Appointment[]> => {
  try {
    const response = await api.get(`/appointments/${userId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao buscar agendamentos:", error);
    throw error;
  }
};

// Cancelar agendamento
export const cancelAppointment = async (
  appointmentId: number
): Promise<any> => {
  try {
    const response = await api.delete(`/appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao cancelar agendamento:", error);
    throw error;
  }
};

// Atualizar status do agendamento
export const updateAppointmentStatus = async (
  appointmentId: number,
  status: "scheduled" | "completed" | "cancelled"
): Promise<any> => {
  try {
    const response = await api.put(`/appointments/${appointmentId}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao atualizar status do agendamento:", error);
    throw error;
  }
};

// Buscar todos os barbeiros
export const getBarbers = async (): Promise<User[]> => {
  try {
    const response = await api.get("/barbers");
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao buscar barbeiros:", error);
    throw error;
  }
};

// Buscar serviços de um barbeiro
export const getServicesByBarber = async (
  barberId: number
): Promise<Service[]> => {
  try {
    const response = await api.get(`/services/${barberId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao buscar serviços do barbeiro:", error);
    throw error;
  }
};

// Buscar horários disponíveis
export const getAvailableTimes = async (
  barberId: number,
  date: string
): Promise<string[]> => {
  try {
    const response = await api.get(`/available-times/${barberId}/${date}`);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao buscar horários disponíveis:", error);
    throw error;
  }
};

// Criar novo agendamento
export const createAppointment = async (appointmentData: {
  client_id: number;
  barber_id: number;
  service_id: number;
  appointment_date: string;
  notes?: string;
}): Promise<any> => {
  try {
    const response = await api.post("/appointments", appointmentData);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao criar agendamento:", error);
    throw error;
  }
};

// Criar novo serviço
export const createService = async (serviceData: {
  name: string;
  description?: string;
  price: number;
  duration: number;
  barber_id: number;
}): Promise<any> => {
  try {
    const response = await api.post("/services", serviceData);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao criar serviço:", error);
    throw error;
  }
};

// Atualizar serviço
export const updateService = async (
  serviceId: number,
  data: {
    name?: string;
    description?: string;
    price?: number;
    duration?: number;
    active?: boolean;
  }
): Promise<any> => {
  try {
    const response = await api.put(`/services/${serviceId}`, data);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao atualizar serviço:", error);
    throw error;
  }
};

// Deletar serviço (soft delete)
export const deleteService = async (serviceId: number): Promise<any> => {
  try {
    const response = await api.delete(`/services/${serviceId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao deletar serviço:", error);
    throw error;
  }
};

// Buscar horários de trabalho do barbeiro
export const getBarberSchedule = async (barberId: number): Promise<any[]> => {
  try {
    const response = await api.get(`/schedules/${barberId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao buscar horários do barbeiro:", error);
    throw error;
  }
};

// Criar horário de trabalho
export const createSchedule = async (scheduleData: {
  barber_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
}): Promise<any> => {
  try {
    const response = await api.post("/schedules", scheduleData);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao criar horário:", error);
    throw error;
  }
};

// Atualizar horário de trabalho
export const updateSchedule = async (
  scheduleId: number,
  data: any
): Promise<any> => {
  try {
    const response = await api.put(`/schedules/${scheduleId}`, data);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao atualizar horário:", error);
    throw error;
  }
};

// Criar horários padrão para barbeiro
export const createDefaultSchedule = async (barberId: number): Promise<any> => {
  try {
    const response = await api.post(`/schedules/${barberId}/default`);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao criar horários padrão:", error);
    throw error;
  }
};
