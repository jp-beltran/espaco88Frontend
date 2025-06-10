import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  TimePicker,
  Switch,
  message,
  Spin,
  Empty,
  Table,
  Space,
  ConfigProvider,
  theme,
  Form,
  Modal,
  Popconfirm,
  Tooltip
} from "antd";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  QuestionCircleOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getBarberSchedule, createSchedule, updateSchedule, createDefaultSchedule } from "../Services/api";

interface Schedule {
  id?: number;
  barber_id?: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  active?: boolean;
}

const DAYS_OF_WEEK = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo'
];

function ScheduleSettingsPage() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [toggleLoadingIds, setToggleLoadingIds] = useState<Set<number>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [form] = Form.useForm();
  
  const barberId = parseInt(localStorage.getItem('userId') || '0');
  const userType = localStorage.getItem('userType');

  useEffect(() => {
    if (userType !== 'barber') {
      message.error("Acesso negado. Apenas barbeiros podem configurar horários.");
      navigate('/user');
      return;
    }

    fetchSchedules();
  }, [userType, navigate]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await getBarberSchedule(barberId);
      // Ordenar por dia da semana para melhor visualização
      const sortedData = data.sort((a, b) => a.day_of_week - b.day_of_week);
      setSchedules(sortedData);
    } catch (error) {
      console.error("Erro ao buscar horários:", error);
      message.error("Erro ao carregar horários");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDefaultSchedule = async () => {
    try {
      setSaving(true);
      await createDefaultSchedule(barberId);
      message.success("Horários padrão criados com sucesso!");
      fetchSchedules();
    } catch (error: any) {
      console.error("Erro ao criar horários:", error);
      message.error(error.response?.data?.error || "Erro ao criar horários");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setSaving(true);
      
      const scheduleData = {
        barber_id: barberId,
        day_of_week: values.day_of_week,
        start_time: values.start_time.format('HH:mm'),
        end_time: values.end_time.format('HH:mm')
      };

      if (editingSchedule?.id) {
        await updateSchedule(editingSchedule.id, scheduleData);
        message.success("Horário atualizado com sucesso!");
      } else {
        await createSchedule(scheduleData);
        message.success("Horário criado com sucesso!");
      }

      setModalVisible(false);
      form.resetFields();
      setEditingSchedule(null);
      fetchSchedules();
    } catch (error: any) {
      console.error("Erro ao salvar horário:", error);
      message.error(error.response?.data?.error || "Erro ao salvar horário");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    form.setFieldsValue({
      day_of_week: schedule.day_of_week,
      start_time: dayjs(schedule.start_time, 'HH:mm'),
      end_time: dayjs(schedule.end_time, 'HH:mm')
    });
    setModalVisible(true);
  };

  const handleToggleActive = async (schedule: Schedule) => {
    if (!schedule.id) return;
    
    const scheduleId = schedule.id;
    // Garantir que temos um valor booleano válido
    const currentValue = schedule.active === true;
    const newActiveValue = !currentValue;
    
    console.log(`Toggling schedule ${scheduleId}: ${currentValue} -> ${newActiveValue}`);
    
    // Adicionar loading para este switch específico
    setToggleLoadingIds(prev => new Set(prev).add(scheduleId));
    
    // Atualização otimista: atualizar UI imediatamente
    setSchedules(prevSchedules => 
      prevSchedules.map(s => 
        s.id === scheduleId 
          ? { ...s, active: newActiveValue }
          : s
      )
    );

    try {
      // Fazer a requisição para o servidor
      await updateSchedule(scheduleId, { active: newActiveValue });
      
      // Buscar dados atualizados do servidor para garantir sincronização
      const updatedData = await getBarberSchedule(barberId);
      const sortedData = updatedData.sort((a, b) => a.day_of_week - b.day_of_week);
      setSchedules(sortedData);
      
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      
      // Reverter a mudança otimista em caso de erro
      setSchedules(prevSchedules => 
        prevSchedules.map(s => 
          s.id === scheduleId 
            ? { ...s, active: currentValue } // Reverter para valor original
            : s
        )
      );
      
      message.error("Erro ao atualizar status");
    } finally {
      // Remover loading após 300ms
      setTimeout(() => {
        setToggleLoadingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(scheduleId);
          return newSet;
        });
      }, 300);
    }
  };

  const handleDeleteSchedule = async (schedule: Schedule) => {
    if (!schedule.id) return;
    
    const scheduleId = schedule.id;
    
    try {
      setDeletingIds(prev => new Set(prev).add(scheduleId));
      
      // Implementar endpoint de exclusão definitiva no backend
      // Por enquanto, vamos usar o update com um flag especial
      await updateSchedule(scheduleId, { deleted: true });
      
      // Remover da lista local
      setSchedules(prevSchedules => 
        prevSchedules.filter(s => s.id !== scheduleId)
      );
      
      message.success("Horário removido com sucesso!");
      
    } catch (error) {
      console.error("Erro ao excluir horário:", error);
      message.error("Erro ao excluir horário");
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(scheduleId);
        return newSet;
      });
    }
  };

  const columns = [
    {
      title: 'Dia da Semana',
      dataIndex: 'day_of_week',
      key: 'day_of_week',
      render: (day: number) => DAYS_OF_WEEK[day]
    },
    {
      title: 'Horário de Início',
      dataIndex: 'start_time',
      key: 'start_time',
      render: (time: string) => (
        <span className="text-yellow-400 font-semibold">{time}</span>
      )
    },
    {
      title: 'Horário de Término',
      dataIndex: 'end_time',
      key: 'end_time',
      render: (time: string) => (
        <span className="text-yellow-400 font-semibold">{time}</span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      width: 120,
      render: (active: boolean, record: Schedule) => {
        const isActive = active === true;
        
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onChange={() => handleToggleActive(record)}
              loading={toggleLoadingIds.has(record.id!)}
              size="small"
            />
            <Tooltip title={isActive ? "Disponível para agendamentos" : "Indisponível (férias/folga)"}>
              <QuestionCircleOutlined className="text-gray-400" />
            </Tooltip>
          </div>
        );
      }
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 150,
      render: (_: any, record: Schedule) => (
        <Space>
          <Tooltip title="Editar horário">
            <Button
              type="text"
              onClick={() => handleEdit(record)}
              className="text-yellow-400 hover:text-yellow-300"
              size="small"
            >
              Editar
            </Button>
          </Tooltip>
          
          <Popconfirm
            title="Excluir horário"
            description={
              <div>
                <p>Tem certeza que deseja <strong>excluir</strong> este horário?</p>
                <p className="text-red-500 text-sm mt-1">
                  ⚠️ Esta ação é irreversível!
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Dica: Use o switch para desativar temporariamente
                </p>
              </div>
            }
            onConfirm={() => handleDeleteSchedule(record)}
            okText="Sim, excluir"
            cancelText="Cancelar"
            okButtonProps={{ 
              danger: true,
              loading: deletingIds.has(record.id!)
            }}
            icon={<DeleteOutlined style={{ color: 'red' }} />}
          >
            <Tooltip title="Excluir permanentemente">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                loading={deletingIds.has(record.id!)}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#F6DA5E",
        },
      }}
    >
      <div className="min-h-screen bg-[#070707] p-4 lg:p-10">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/user')}
            className="mb-4 border-gray-600 text-gray-300 hover:text-white hover:border-white"
          >
            Voltar
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-2">
                Configurar Horários
              </h1>
              <p className="text-gray-400">
                Configure seus dias e horários de trabalho
              </p>
            </div>
            
            {schedules.length > 0 && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
                className="bg-yellow-400 border-yellow-400 text-black hover:bg-yellow-500"
                size="large"
              >
                Adicionar Horário
              </Button>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="max-w-6xl mx-auto">
          <Card className="bg-[#232225] border-gray-700">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spin 
                  indicator={<LoadingOutlined style={{ fontSize: 48, color: '#F6DA5E' }} spin />} 
                />
              </div>
            ) : schedules.length === 0 ? (
              <Empty
                description={
                  <div className="text-center">
                    <p className="text-gray-400 mb-4">
                      Você ainda não configurou seus horários de trabalho
                    </p>
                    <p className="text-gray-500 text-sm mb-6">
                      Clique no botão abaixo para criar horários padrão<br />
                      (Segunda a Sábado, 9h às 19h)
                    </p>
                  </div>
                }
                className="py-12"
              >
                <Button
                  type="primary"
                  icon={<ClockCircleOutlined />}
                  onClick={handleCreateDefaultSchedule}
                  loading={saving}
                  size="large"
                  className="bg-yellow-400 border-yellow-400 text-black hover:bg-yellow-500"
                >
                  Criar Horários Padrão
                </Button>
              </Empty>
            ) : (
              <Table
                dataSource={schedules}
                columns={columns}
                rowKey={(record) => record.id || `${record.day_of_week}`}
                pagination={false}
                className="schedule-table"
              />
            )}
          </Card>

          {/* Informações adicionais */}
          {schedules.length > 0 && (
            <Card className="bg-[#1a1a1a] border-gray-700 mt-4">
              <h3 className="text-white font-semibold mb-2">
                <ClockCircleOutlined className="mr-2" />
                Como funciona o sistema de horários
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-yellow-400 font-medium mb-2">🕒 Configuração de Horários</h4>
                  <ul className="text-gray-400 space-y-1 text-sm">
                    <li>• Configure seus dias e horários de trabalho</li>
                    <li>• Cada agendamento ocupa slots de 30 minutos</li>
                    <li>• Clientes só podem agendar nos horários ativos</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-green-400 font-medium mb-2">🎛️ Controles Disponíveis</h4>
                  <ul className="text-gray-400 space-y-1 text-sm">
                    <li>• <strong>Switch:</strong> Ativar/desativar temporariamente (férias, folgas)</li>
                    <li>• <strong>Editar:</strong> Alterar horários de início e término</li>
                    <li>• <strong>Lixeira:</strong> Excluir permanentemente o horário</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded">
                <p className="text-blue-300 text-sm">
                  💡 <strong>Dica:</strong> Para férias ou folgas temporárias, use o switch para desativar. 
                  Use a exclusão apenas quando não quiser mais trabalhar naquele dia/horário definitivamente.
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Modal de Cadastro/Edição */}
        <Modal
          title={editingSchedule ? "Editar Horário" : "Novo Horário"}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setEditingSchedule(null);
          }}
          footer={null}
          width={500}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Form.Item
              label="Dia da Semana"
              name="day_of_week"
              rules={[{ required: true, message: "Selecione o dia da semana" }]}
            >
              <select 
                className="w-full p-2 bg-[#1a1a1a] border border-gray-600 rounded text-white"
                disabled={!!editingSchedule}
              >
                <option value="">Selecione...</option>
                {DAYS_OF_WEEK.map((day, index) => (
                  <option key={index} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="Horário de Início"
                name="start_time"
                rules={[{ required: true, message: "Selecione o horário de início" }]}
              >
                <TimePicker
                  format="HH:mm"
                  size="large"
                  className="w-full"
                  minuteStep={30}
                  placeholder="00:00"
                />
              </Form.Item>

              <Form.Item
                label="Horário de Término"
                name="end_time"
                rules={[{ required: true, message: "Selecione o horário de término" }]}
              >
                <TimePicker
                  format="HH:mm"
                  size="large"
                  className="w-full"
                  minuteStep={30}
                  placeholder="00:00"
                />
              </Form.Item>
            </div>

            <Form.Item className="mb-0 mt-6">
              <Space className="w-full justify-end">
                <Button 
                  onClick={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingSchedule(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saving}
                  icon={<SaveOutlined />}
                  className="bg-yellow-400 border-yellow-400 text-black hover:bg-yellow-500"
                >
                  {editingSchedule ? "Salvar Alterações" : "Criar Horário"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>


      </div>
    </ConfigProvider>
  );
}

export default ScheduleSettingsPage;