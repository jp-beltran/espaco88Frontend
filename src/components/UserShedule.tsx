import { useEffect, useState } from "react";
import { Card, Tag, Button, Empty, Spin, message, Modal, List } from "antd";
import { CalendarOutlined, ClockCircleOutlined, DollarOutlined, UserOutlined, LoadingOutlined } from "@ant-design/icons";
import { getUserAppointments, cancelAppointment, updateAppointmentStatus } from "../Services/api";
import { Appointment } from "../Types";

function UserSchedule() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  // Separar agendamentos por status
  const upcomingAppointments = appointments.filter(apt => apt.status === 'scheduled');
  const pastAppointments = appointments.filter(apt => apt.status !== 'scheduled');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-[#232225] rounded-3xl">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 bg-[#232225] rounded-3xl">
      <div className="mb-6">
        <h1 className="font-bold text-2xl lg:text-3xl text-yellow-400 mb-2">
          Meus Agendamentos
        </h1>
        <p className="text-[#98959D]">
          {userType === 'barber' 
            ? 'Gerencie seus atendimentos agendados' 
            : 'Consulte seus cortes de cabelo agendados'}
        </p>
      </div>

      {appointments.length === 0 ? (
        <Empty
          description={
            <span className="text-gray-400">
              Você ainda não possui agendamentos
            </span>
          }
          className="py-12"
        />
      ) : (
        <>
          {/* Agendamentos Próximos */}
          {upcomingAppointments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-white text-xl font-semibold mb-4">Próximos Agendamentos</h2>
              <div className="grid gap-4">
                {upcomingAppointments.map((appointment) => (
                  <Card
                    key={appointment.id}
                    className="bg-[#1a1a1a] border-gray-700 hover:border-yellow-400 transition-colors"
                    bodyStyle={{ padding: '16px' }}
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag color={getStatusColor(appointment.status)}>
                            {getStatusText(appointment.status)}
                          </Tag>
                          <span className="text-white font-semibold text-lg">
                            {appointment.service_name}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300">
                          <div className="flex items-center gap-2">
                            <CalendarOutlined />
                            <span className="text-sm">{formatDate(appointment.appointment_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ClockCircleOutlined />
                            <span className="text-sm">
                              {formatTime(appointment.appointment_date)} - {formatTime(appointment.end_time)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <UserOutlined />
                            <span className="text-sm">
                              {userType === 'barber' ? appointment.client_name : appointment.barber_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarOutlined />
                            <span className="text-sm">R$ {appointment.service_price.toFixed(2)}</span>
                          </div>
                        </div>

                        {appointment.notes && (
                          <p className="text-gray-400 text-sm mt-2">
                            Observações: {appointment.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {userType === 'barber' ? (
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => setConfirmModal({
                              visible: true,
                              appointmentId: appointment.id,
                              action: 'complete'
                            })}
                            className="bg-green-600 border-green-600 hover:bg-green-700"
                          >
                            Concluir
                          </Button>
                        ) : null}
                        <Button
                          danger
                          size="small"
                          loading={cancellingId === appointment.id}
                          onClick={() => setConfirmModal({
                            visible: true,
                            appointmentId: appointment.id,
                            action: 'cancel'
                          })}
                        >
                          Cancelar
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
              <h2 className="text-white text-xl font-semibold mb-4">Histórico</h2>
              <List
                dataSource={pastAppointments}
                renderItem={(appointment) => (
                  <List.Item className="bg-[#1a1a1a] px-4 py-3 mb-2 rounded-lg border border-gray-700">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Tag color={getStatusColor(appointment.status)}>
                            {getStatusText(appointment.status)}
                          </Tag>
                          <span className="text-white font-medium">
                            {appointment.service_name}
                          </span>
                        </div>
                        <span className="text-gray-400 text-sm">
                          {formatDate(appointment.appointment_date)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-gray-400 text-sm">
                        <span>
                          <UserOutlined className="mr-1" />
                          {userType === 'barber' ? appointment.client_name : appointment.barber_name}
                        </span>
                        <span>
                          <ClockCircleOutlined className="mr-1" />
                          {formatTime(appointment.appointment_date)}
                        </span>
                        <span>
                          <DollarOutlined className="mr-1" />
                          R$ {appointment.service_price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          )}
        </>
      )}

      {/* Modal de Confirmação */}
      <Modal
        title={
          confirmModal.action === 'cancel' 
            ? "Confirmar Cancelamento" 
            : "Confirmar Conclusão"
        }
        open={confirmModal.visible}
        onOk={confirmModal.action === 'cancel' ? handleCancelAppointment : handleCompleteAppointment}
        onCancel={() => setConfirmModal({ visible: false, appointmentId: null, action: null })}
        okText="Confirmar"
        cancelText="Voltar"
        okButtonProps={{
          danger: confirmModal.action === 'cancel',
          className: confirmModal.action === 'complete' ? 'bg-green-600' : ''
        }}
      >
        <p>
          {confirmModal.action === 'cancel' 
            ? "Tem certeza que deseja cancelar este agendamento?" 
            : "Tem certeza que deseja marcar este agendamento como concluído?"}
        </p>
      </Modal>
    </div>
  );
}

export default UserSchedule;