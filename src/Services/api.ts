// src/Services/api.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL não está definida no ambiente.");
}

console.log("API_URL definida como:", API_URL);

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
    const response = await axios.post(`${API_URL}/users`, userData);
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
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return error.response?.data || { error: "Erro na requisição" };
    }
    return { error: "Erro desconhecido" };
  }
};
