import axios from "axios";

const API_URL = "http://127.0.0.1:5000"; // URL da sua API Flask

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users`, userData);
    return response.data; // Retorna a resposta da API
  } catch (error) {
    return error.response?.data || { error: "Erro ao conectar à API" };
  }
};
