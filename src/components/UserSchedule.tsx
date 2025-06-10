import { useEffect, useState } from "react";
import { Card, Tag, Button, Empty, Spin, message, Modal, Avatar, Divider } from "antd";
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  DollarOutlined, 
  UserOutlined, 
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ScheduleOutlined,
  CommentOutlined
} from "@ant-design/icons";
import { getUserAppointments, cancelAppointment, updateAppointmentStatus } from "../Services/api";
import { Appointment } from "../Types";

function UserSchedule() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    appointmentId: number | null;
    action: 'cancel' | 'complete' | null;
  }>({
    visible: false,
    appointmentId: null,
    action: null
  });

  const userType = localStorage.getItem('userType') || 'client';

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        message.error("Usuário não encontrado");
        return;
      }

      const data = await getUserAppointments(parseInt(userId));
      
      // Ordenar por data mais próxima primeiro
      const sortedData = data.sort((a, b) => 
        new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
      );
      
      setAppointments(sortedData);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      message.error("Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!confirmModal.appointmentId) return;
    
    try {
      setCancellingId(confirmModal.appointmentId);
      await cancelAppointment(confirmModal.appointmentId);
      message.success("Agendamento cancelado com sucesso!");
      
      // Atualizar lista localmente
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === confirmModal.appointmentId 
            ? { ...apt, status: 'cancelled' } 
            : apt
        )
      );
      
      setConfirmModal({ visible: false, appointmentId: null, action: null });
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);
      message.error("Erro ao cancelar agendamento");
    } finally {
      setCancellingId(null);
    }
  };

  const handleCompleteAppointment = async () => {
    if (!confirmModal.appointmentId) return;
    
    try {
      setCompletingId(confirmModal.appointmentId);
      await updateAppointmentStatus(confirmModal.appointmentId, 'completed');
      message.success("Agendamento marcado como concluído!");
      
      // Atualizar lista localmente
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === confirmModal.appointmentId 
            ? { ...apt, status: 'completed' } 
            : apt
        )
      );
      
      setConfirmModal({ visible: false, appointmentId: null, action: null });
    } catch (error) {
      console.error("Erro ao atualizar agendamento:", error);
      message.error("Erro ao atualizar agendamento");
    } finally {
      setCompletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'blue';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <ScheduleOutlined />;
      case 'completed': return <CheckCircleOutlined />;
      case 'cancelled': return <CloseCircleOutlined />;
      default: return <ScheduleOutlined />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const appointmentDate = new Date(dateString);
    return today.toDateString() === appointmentDate.toDateString();
  };

  const isUpcoming = (dateString: string) => {
    const now = new Date();
    const appointmentDate = new Date(dateString);
    return appointmentDate > now;
  };

  // Separar agendamentos por status e data
  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'scheduled' && isUpcoming(apt.appointment_date)
  );
  const pastAppointments = appointments.filter(apt => 
    apt.status !== 'scheduled' || !isUpcoming(apt.appointment_date)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-[#070707] rounded-3xl border border-gray-800">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#F6DA5E' }} spin />} />
      </div>
    );
  }

  return (
    <div 
      className="p-6 lg:p-8 rounded-3xl border border-gray-800"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-bold text-3xl lg:text-4xl text-yellow-400 mb-3">
          Meus Agendamentos
        </h1>
        <p className="text-gray-500 text-lg">
          {userType === 'barber' 
            ? 'Gerencie seus atendimentos agendados' 
            : 'Consulte seus cortes de cabelo agendados'}
        </p>
      </div>

      {appointments.length === 0 ? (
        <Empty
          description={
            <div className="text-center">
              <p className="text-gray-400 text-lg mb-2">
                Você ainda não possui agendamentos
              </p>
              <p className="text-gray-500 text-sm">
                {userType === 'client' 
                  ? 'Que tal agendar seu primeiro corte?' 
                  : 'Aguardando novos clientes agendarem'}
              </p>
            </div>
          }
          className="py-16"
        />
      ) : (
        <>
          {/* Agendamentos Próximos */}
          {upcomingAppointments.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full"></div>
                <h2 className="text-gray-200 text-2xl font-bold">Próximos Agendamentos</h2>
                <div className="px-3 py-1 bg-yellow-400/10 text-yellow-400 text-sm font-medium rounded-full border border-yellow-400/20">
                  {upcomingAppointments.length}
                </div>
              </div>
              
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <Card
                    key={appointment.id}
                    className="border-l-4 border-l-yellow-400 border-gray-800 hover:border-yellow-400/50 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/10"
                    bodyStyle={{ 
                      padding: '0',
                      backgroundColor: '#070707',
                      borderRadius: '0.5rem'
                    }}
                    style={{
                      backgroundColor: '#070707',
                      borderColor: '#374151'
                    }}
                  >
                    <div className="p-6" style={{ backgroundColor: '#070707' }}>
                      {/* Header do Card */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar
                              size={48}
                              src={`https://ui-avatars.com/api/?name=${userType === 'barber' ? appointment.client_name : appointment.barber_name}&background=F6DA5E&color=232225&size=100`}
                              className="ring-2 ring-yellow-400/30"
                            />
                            {isToday(appointment.appointment_date) && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-gray-200 font-bold text-xl mb-1">
                              {appointment.service_name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Tag 
                                color={getStatusColor(appointment.status)} 
                                icon={getStatusIcon(appointment.status)}
                                className="font-medium"
                              >
                                {getStatusText(appointment.status)}
                              </Tag>
                              {isToday(appointment.appointment_date) && (
                                <Tag color="red" className="animate-pulse font-medium">
                                  HOJE
                                </Tag>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400 mb-1">
                            R$ {appointment.service_price.toFixed(2)}
                          </div>
                          <div className="text-gray-500 text-sm">
                            Valor do serviço
                          </div>
                        </div>
                      </div>

                      <Divider className="my-4 border-gray-800" />

                      {/* Informações do Agendamento */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-gray-400">
                            <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                              <CalendarOutlined className="text-blue-400" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Data</div>
                              <div className="font-medium text-gray-300">{formatDate(appointment.appointment_date)}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-gray-400">
                            <div className="w-8 h-8 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center">
                              <ClockCircleOutlined className="text-purple-400" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Horário</div>
                              <div className="font-medium text-gray-300">
                                {formatTime(appointment.appointment_date)} - {formatTime(appointment.end_time)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-gray-400">
                            <div className="w-8 h-8 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-center">
                              <UserOutlined className="text-green-400" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">
                                {userType === 'barber' ? 'Cliente' : 'Barbeiro'}
                              </div>
                              <div className="font-medium text-gray-300">
                                {userType === 'barber' ? appointment.client_name : appointment.barber_name}
                              </div>
                            </div>
                          </div>

                          {appointment.notes && (
                            <div className="flex items-start gap-3 text-gray-400">
                              <div className="w-8 h-8 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center justify-center mt-1">
                                <CommentOutlined className="text-orange-400" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm text-gray-500">Observações</div>
                                <div className="font-medium text-gray-300 text-sm leading-relaxed">
                                  {appointment.notes}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex gap-3 pt-4 border-t border-gray-800">
                        {userType === 'barber' && (
                          <Button
                            type="primary"
                            size="large"
                            icon={<CheckCircleOutlined />}
                            onClick={() => setConfirmModal({
                              visible: true,
                              appointmentId: appointment.id,
                              action: 'complete'
                            })}
                            loading={completingId === appointment.id}
                            className="bg-green-600 hover:bg-green-700 border-green-600 font-medium flex-1"
                          >
                            Marcar como Concluído
                          </Button>
                        )}
                        
                        <Button
                          danger
                          size="large"
                          icon={<CloseCircleOutlined />}
                          loading={cancellingId === appointment.id}
                          onClick={() => setConfirmModal({
                            visible: true,
                            appointmentId: appointment.id,
                            action: 'cancel'
                          })}
                          className="font-medium flex-1"
                        >
                          Cancelar Agendamento
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Histórico */}
          {pastAppointments.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full"></div>
                <h2 className="text-gray-200 text-2xl font-bold">Histórico</h2>
                <div className="px-3 py-1 bg-gray-700/10 text-gray-400 text-sm font-medium rounded-full border border-gray-700/20">
                  {pastAppointments.length}
                </div>
              </div>
              
              <div className="space-y-3">
                {pastAppointments.map((appointment) => (
                  <Card
                    key={appointment.id}
                    className="border-gray-800 hover:border-gray-700 transition-all duration-300"
                    bodyStyle={{ 
                      padding: '20px',
                      backgroundColor: '#070707',
                      borderRadius: '0.5rem'
                    }}
                    style={{
                      backgroundColor: '#070707',
                      borderColor: '#374151'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar
                          size={40}
                          src={`https://ui-avatars.com/api/?name=${userType === 'barber' ? appointment.client_name : appointment.barber_name}&background=666&color=fff&size=80`}
                          className="opacity-80"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Tag 
                              color={getStatusColor(appointment.status)} 
                              icon={getStatusIcon(appointment.status)}
                              className="font-medium"
                            >
                              {getStatusText(appointment.status)}
                            </Tag>
                            <span className="text-gray-200 font-semibold text-lg">
                              {appointment.service_name}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-6 text-gray-500 text-sm">
                            <span className="flex items-center gap-1">
                              <UserOutlined />
                              {userType === 'barber' ? appointment.client_name : appointment.barber_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarOutlined />
                              {formatDate(appointment.appointment_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <ClockCircleOutlined />
                              {formatTime(appointment.appointment_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarOutlined />
                              R$ {appointment.service_price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Confirmação */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            {confirmModal.action === 'cancel' ? (
              <CloseCircleOutlined className="text-red-500" />
            ) : (
              <CheckCircleOutlined className="text-green-500" />
            )}
            <span>
              {confirmModal.action === 'cancel' 
                ? "Confirmar Cancelamento" 
                : "Confirmar Conclusão"}
            </span>
          </div>
        }
        open={confirmModal.visible}
        onOk={confirmModal.action === 'cancel' ? handleCancelAppointment : handleCompleteAppointment}
        onCancel={() => setConfirmModal({ visible: false, appointmentId: null, action: null })}
        okText="Confirmar"
        cancelText="Voltar"
        okButtonProps={{
          danger: confirmModal.action === 'cancel',
          className: confirmModal.action === 'complete' ? 'bg-green-600 hover:bg-green-700' : '',
          size: 'large'
        }}
        cancelButtonProps={{
          size: 'large'
        }}
        style={{
          '--ant-modal-content-bg': '#0a0a0a',
          '--ant-modal-header-bg': '#0a0a0a'
        } as React.CSSProperties}
      >
        <div className="py-4" style={{ backgroundColor: '#0a0a0a' }}>
          <p className="text-base mb-2 text-white">
            {confirmModal.action === 'cancel' 
              ? "Tem certeza que deseja cancelar este agendamento?" 
              : "Tem certeza que deseja marcar este agendamento como concluído?"}
          </p>
          {confirmModal.action === 'cancel' && (
            <p className="text-gray-500 text-sm">
              Esta ação não pode ser desfeita.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default UserSchedule;

// CSS para forçar o tema escuro e sobrescrever o Ant Design
const darkStyles = `
  .ant-card {
    background-color: #070707 !important;
    border-color: #374151 !important;
  }
  
  .ant-card-body {
    background-color: #070707 !important;
  }
  
  .ant-modal-content {
    background-color: #0a0a0a !important;
  }
  
  .ant-modal-header {
    background-color: #0a0a0a !important;
    border-bottom: 1px solid #374151 !important;
  }
  
  .ant-modal-title {
    color: #ffffff !important;
  }
  
  .ant-empty {
    color: #9ca3af !important;
  }
  
  .ant-divider {
    border-color: #374151 !important;
  }
`;

// Injetar estilos no head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = darkStyles;
  document.head.appendChild(styleElement);
}