import { useEffect, useState } from "react";
import { Button, message } from "antd";
import {
  LogoutOutlined,
  PlusOutlined,
  ScissorOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import UserProfile from "../components/UserProfile";
import UserSchedule from "../components/UserSchedule";
import { useNavigate } from "react-router-dom";

function UserPage() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"client" | "barber">("client");

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      message.error("Você precisa estar logado para acessar esta página");
      navigate("/");
      return;
    }

    // Obter tipo de usuário do localStorage (seria melhor vir do token JWT decodificado)
    const storedUserType = localStorage.getItem("userType") as
      | "client"
      | "barber";
    if (storedUserType) {
      setUserType(storedUserType);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userType");
    message.success("Logout realizado com sucesso!");
    navigate("/");
  };

  const handleNewAppointment = () => {
    // Navegar para página de novo agendamento
    navigate("/appointment/new");
  };

  const handleManageServices = () => {
    // Navegar para página de gerenciamento de serviços (apenas barbeiros)
    navigate("/services");
  };

  return (
    <div className="min-h-screen bg-[#070707] p-4 lg:p-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-yellow-400">
              Espaço88
            </h1>
            <p className="text-gray-400 mt-1">
              {userType === "barber" ? "Painel do Barbeiro" : "Área do Cliente"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {userType === "client" ? (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleNewAppointment}
                className="bg-yellow-400 border-yellow-400 text-black hover:bg-yellow-300"
              >
                Novo Agendamento
              </Button>
            ) : (
              <>
                <Button
                  icon={<ClockCircleOutlined />}
                  onClick={() => navigate("/schedule-settings")}
                  className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                >
                  Configurar Horários
                </Button>
                <Button
                  icon={<ScissorOutlined />}
                  onClick={handleManageServices}
                  className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                >
                  Gerenciar Serviços
                </Button>
              </>
            )}

            <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Agendamentos */}
        <UserSchedule />

        {/* Perfil */}
        <UserProfile />
      </div>
    </div>
  );
}

export default UserPage;
