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
  Modal
} from "antd";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
  SaveOutlined,
  PlusOutlined
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
      setSchedules(data);
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
    try {
      if (schedule.id) {
        await updateSchedule(schedule.id, { active: !schedule.active });
        message.success("Status atualizado com sucesso!");
        fetchSchedules();
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      message.error("Erro ao atualizar status");
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
      title: 'Ativo',
      dataIndex: 'active',
      key: 'active',
      render: (_: any, record: Schedule) => (
        <Switch
          checked={record.active !== false}
          onChange={() => handleToggleActive(record)}
          checkedChildren="Sim"
          unCheckedChildren="Não"
        />
      )
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: Schedule) => (
        <Button
          type="text"
          onClick={() => handleEdit(record)}
          className="text-yellow-400 hover:text-yellow-300"
        >
          Editar
        </Button>
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
                Informações Importantes
              </h3>
              <ul className="text-gray-400 space-y-1 list-disc list-inside">
                <li>Os horários configurados definem quando você está disponível para atendimentos</li>
                <li>Clientes só poderão agendar nos dias e horários ativos</li>
                <li>Cada agendamento ocupará slots de 30 minutos</li>
                <li>Você pode desativar temporariamente um dia usando o switch "Ativo"</li>
              </ul>
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

        <style >{`
          .schedule-table .ant-table {
            background-color: transparent;
          }
          
          .schedule-table .ant-table-thead > tr > th {
            background-color: #1a1a1a;
            color: #ffffff;
            border-bottom: 1px solid #4a4a4a;
          }
          
          .schedule-table .ant-table-tbody > tr > td {
            border-bottom: 1px solid #2a2a2a;
          }
          
          .schedule-table .ant-table-tbody > tr:hover > td {
            background-color: #2a2a2a;
          }
          
          .ant-switch-checked {
            background-color: #F6DA5E;
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
}

export default ScheduleSettingsPage;