import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Steps, 
  Card, 
  Button, 
  Avatar, 
  Tag, 
  DatePicker, 
  Input, 
  message, 
  Spin,
  Empty,
  Row,
  Col,
  ConfigProvider,
  theme
} from "antd";
import { 
  UserOutlined, 
  ScissorOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined,
  ArrowLeftOutlined,
  DollarOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { User, Service } from "../Types";
import { 
  getBarbers, 
  getServicesByBarber, 
  getAvailableTimes, 
  createAppointment 
} from "../Services/api";

dayjs.extend(customParseFormat);
dayjs.locale('pt-br');

const { TextArea } = Input;

interface AppointmentData {
  barberId: number | null;
  serviceId: number | null;
  date: string | null;
  time: string | null;
  notes: string;
}

function NewAppointmentPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Dados
  const [barbers, setBarbers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  
  // Seleções
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    barberId: null,
    serviceId: null,
    date: null,
    time: null,
    notes: ""
  });

  // Carregar barbeiros ao montar componente
  useEffect(() => {
    fetchBarbers();
  }, []);

  // Carregar serviços quando barbeiro for selecionado
  useEffect(() => {
    if (appointmentData.barberId) {
      fetchServices(appointmentData.barberId);
    }
  }, [appointmentData.barberId]);

  // Carregar horários quando data for selecionada
  useEffect(() => {
    if (appointmentData.barberId && appointmentData.date) {
      fetchAvailableTimes(appointmentData.barberId, appointmentData.date);
    }
  }, [appointmentData.barberId, appointmentData.date]);

  const fetchBarbers = async () => {
    try {
      setLoading(true);
      const data = await getBarbers();
      setBarbers(data);
    } catch (error) {
      console.error("Erro ao buscar barbeiros:", error);
      message.error("Erro ao carregar barbeiros");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async (barberId: number) => {
    try {
      setLoading(true);
      const data = await getServicesByBarber(barberId);
      setServices(data);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
      message.error("Erro ao carregar serviços");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTimes = async (barberId: number, date: string) => {
    try {
      setLoading(true);
      const data = await getAvailableTimes(barberId, date);
      setAvailableTimes(data);
    } catch (error) {
      console.error("Erro ao buscar horários:", error);
      message.error("Erro ao carregar horários disponíveis");
    } finally {
      setLoading(false);
    }
  };

  const handleBarberSelect = (barberId: number) => {
    setAppointmentData({
      ...appointmentData,
      barberId,
      serviceId: null, // Resetar serviço ao trocar barbeiro
      time: null // Resetar horário
    });
    setCurrentStep(1);
  };

  const handleServiceSelect = (serviceId: number) => {
    setAppointmentData({
      ...appointmentData,
      serviceId
    });
    setCurrentStep(2);
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setAppointmentData({
        ...appointmentData,
        date: date.format('YYYY-MM-DD'),
        time: null // Resetar horário ao trocar data
      });
    }
  };

  const handleTimeSelect = (time: string) => {
    setAppointmentData({
      ...appointmentData,
      time
    });
  };

  const handleSubmit = async () => {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      message.error("Usuário não encontrado. Faça login novamente.");
      navigate('/');
      return;
    }

    if (!appointmentData.barberId || !appointmentData.serviceId || 
        !appointmentData.date || !appointmentData.time) {
      message.error("Por favor, complete todos os campos obrigatórios");
      return;
    }

    try {
      setSubmitting(true);
      
      // Combinar data e hora
      const appointmentDateTime = `${appointmentData.date}T${appointmentData.time}:00`;
      
      await createAppointment({
        client_id: parseInt(userId),
        barber_id: appointmentData.barberId,
        service_id: appointmentData.serviceId,
        appointment_date: appointmentDateTime,
        notes: appointmentData.notes
      });

      message.success("Agendamento realizado com sucesso!");
      navigate('/user');
    } catch (error: any) {
      console.error("Erro ao criar agendamento:", error);
      message.error(error.response?.data?.error || "Erro ao criar agendamento");
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedBarber = () => barbers.find(b => b.id === appointmentData.barberId);
  const getSelectedService = () => services.find(s => s.id === appointmentData.serviceId);

  // Desabilitar datas passadas
  const disabledDate = (current: dayjs.Dayjs) => {
    return current && current < dayjs().startOf('day');
  };

  const steps = [
    {
      title: 'Barbeiro',
      icon: <UserOutlined />,
    },
    {
      title: 'Serviço',
      icon: <ScissorOutlined />,
    },
    {
      title: 'Data e Hora',
      icon: <CalendarOutlined />,
    },
    {
      title: 'Confirmação',
      icon: <ClockCircleOutlined />,
    },
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
        <div className="max-w-5xl mx-auto mb-8">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/user')}
            className="mb-4 border-gray-600 text-gray-300 hover:text-white hover:border-white"
          >
            Voltar
          </Button>
          
          <h1 className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-2">
            Novo Agendamento
          </h1>
          <p className="text-gray-400">
            Siga os passos abaixo para agendar seu atendimento
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto mb-8">
          <Steps
            current={currentStep}
            items={steps}
            className="custom-steps"
          />
        </div>

        {/* Conteúdo */}
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spin 
                indicator={<LoadingOutlined style={{ fontSize: 48, color: '#F6DA5E' }} spin />} 
              />
            </div>
          ) : (
            <>
              {/* Step 1: Escolher Barbeiro */}
              {currentStep === 0 && (
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-6">
                    Escolha o Barbeiro
                  </h2>
                  {barbers.length === 0 ? (
                    <Card className="bg-[#232225] border-gray-700">
                      <Empty 
                        description={
                          <span className="text-gray-400">Nenhum barbeiro disponível</span>
                        } 
                      />
                    </Card>
                  ) : (
                    <Row gutter={[16, 16]}>
                      {barbers.map((barber) => (
                        <Col xs={24} sm={12} md={8} key={barber.id}>
                          <Card
                            hoverable
                            className="bg-[#232225] border-gray-700 hover:border-yellow-400 transition-all cursor-pointer h-full"
                            onClick={() => handleBarberSelect(barber.id)}
                            bodyStyle={{ padding: '24px' }}
                          >
                            <div className="text-center">
                              <Avatar
                                size={80}
                                src={`https://ui-avatars.com/api/?name=${barber.name}&background=F6DA5E&color=232225&size=200`}
                                className="mb-4"
                              />
                              <h3 className="text-white font-semibold text-lg mb-2">
                                {barber.name}
                              </h3>
                              <p className="text-gray-400 text-sm">
                                {barber.phone}
                              </p>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              )}

              {/* Step 2: Escolher Serviço */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-6">
                    Escolha o Serviço
                  </h2>
                  {services.length === 0 ? (
                    <Card className="bg-[#232225] border-gray-700">
                      <Empty 
                        description={
                          <span className="text-gray-400">Nenhum serviço disponível</span>
                        } 
                      />
                    </Card>
                  ) : (
                    <Row gutter={[16, 16]}>
                      {services.map((service) => (
                        <Col xs={24} sm={12} key={service.id}>
                          <Card
                            hoverable
                            className="bg-[#232225] border-gray-700 hover:border-yellow-400 transition-all cursor-pointer h-full"
                            onClick={() => handleServiceSelect(service.id)}
                            bodyStyle={{ padding: '24px' }}
                          >
                            <div>
                              <h3 className="text-white font-semibold text-lg mb-2">
                                {service.name}
                              </h3>
                              {service.description && (
                                <p className="text-gray-400 text-sm mb-3">
                                  {service.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4">
                                <Tag color="blue" icon={<ClockCircleOutlined />}>
                                  {service.duration} min
                                </Tag>
                                <Tag color="green" icon={<DollarOutlined />}>
                                  R$ {service.price.toFixed(2)}
                                </Tag>
                              </div>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                  <Button 
                    className="mt-4 border-gray-600 text-gray-300 hover:text-white hover:border-white"
                    onClick={() => setCurrentStep(0)}
                  >
                    Voltar
                  </Button>
                </div>
              )}

              {/* Step 3: Escolher Data e Hora */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-6">
                    Escolha a Data e Hora
                  </h2>
                  <Card className="bg-[#232225] border-gray-700 max-w-2xl">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-white font-semibold mb-2">
                          Data do Agendamento
                        </label>
                        <DatePicker
                          className="w-full"
                          size="large"
                          format="DD/MM/YYYY"
                          disabledDate={disabledDate}
                          placeholder="Selecione a data"
                          onChange={handleDateChange}
                          value={appointmentData.date ? dayjs(appointmentData.date) : null}
                        />
                      </div>

                      {appointmentData.date && (
                        <div>
                          <label className="block text-white font-semibold mb-2">
                            Horários Disponíveis
                          </label>
                          {availableTimes.length === 0 ? (
                            <Empty 
                              description={
                                <span className="text-gray-400">
                                  Nenhum horário disponível nesta data
                                </span>
                              } 
                              className="py-4"
                            />
                          ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                              {availableTimes.map((time) => (
                                <Button
                                  key={time}
                                  type={appointmentData.time === time ? "primary" : "default"}
                                  onClick={() => handleTimeSelect(time)}
                                  className={
                                    appointmentData.time === time 
                                      ? "bg-yellow-400 border-yellow-400 text-black hover:bg-yellow-500" 
                                      : "border-gray-600 text-gray-300 hover:text-white hover:border-white"
                                  }
                                >
                                  {time}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="block text-white font-semibold mb-2">
                          Observações (opcional)
                        </label>
                        <TextArea
                          rows={4}
                          placeholder="Adicione observações sobre seu atendimento..."
                          value={appointmentData.notes}
                          onChange={(e) => setAppointmentData({
                            ...appointmentData,
                            notes: e.target.value
                          })}
                          className="bg-[#1a1a1a] text-white border-gray-600"
                          style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}
                        />
                      </div>
                    </div>
                  </Card>
                  
                  <div className="flex gap-3 mt-4">
                    <Button 
                      onClick={() => setCurrentStep(1)}
                      className="border-gray-600 text-gray-300 hover:text-white hover:border-white"
                    >
                      Voltar
                    </Button>
                    <Button 
                      type="primary"
                      disabled={!appointmentData.date || !appointmentData.time}
                      onClick={() => setCurrentStep(3)}
                      className="bg-yellow-400 border-yellow-400 text-black hover:bg-yellow-500"
                    >
                      Continuar
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Confirmação */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-6">
                    Confirme seu Agendamento
                  </h2>
                  <Card className="bg-[#232225] border-gray-700 max-w-2xl">
                    <div className="space-y-4">
                      <div className="border-b border-gray-700 pb-4">
                        <h3 className="text-gray-400 text-sm mb-1">Barbeiro</h3>
                        <p className="text-white text-lg font-semibold">
                          {getSelectedBarber()?.name}
                        </p>
                      </div>

                      <div className="border-b border-gray-700 pb-4">
                        <h3 className="text-gray-400 text-sm mb-1">Serviço</h3>
                        <p className="text-white text-lg font-semibold">
                          {getSelectedService()?.name}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <Tag color="blue" icon={<ClockCircleOutlined />}>
                            {getSelectedService()?.duration} min
                          </Tag>
                          <Tag color="green" icon={<DollarOutlined />}>
                            R$ {getSelectedService()?.price.toFixed(2)}
                          </Tag>
                        </div>
                      </div>

                      <div className="border-b border-gray-700 pb-4">
                        <h3 className="text-gray-400 text-sm mb-1">Data e Hora</h3>
                        <p className="text-white text-lg font-semibold">
                          {appointmentData.date && dayjs(appointmentData.date).format('DD/MM/YYYY')}
                          {' às '}
                          {appointmentData.time}
                        </p>
                      </div>

                      {appointmentData.notes && (
                        <div>
                          <h3 className="text-gray-400 text-sm mb-1">Observações</h3>
                          <p className="text-white">{appointmentData.notes}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                  
                  <div className="flex gap-3 mt-6">
                    <Button 
                      onClick={() => setCurrentStep(2)}
                      className="border-gray-600 text-gray-300 hover:text-white hover:border-white"
                    >
                      Voltar
                    </Button>
                    <Button 
                      type="primary"
                      loading={submitting}
                      onClick={handleSubmit}
                      className="bg-green-600 border-green-600 hover:bg-green-700"
                    >
                      Confirmar Agendamento
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <style >{`
          .custom-steps .ant-steps-item-process .ant-steps-item-icon {
            background-color: #F6DA5E;
            border-color: #F6DA5E;
          }
          
          .custom-steps .ant-steps-item-process .ant-steps-item-icon .ant-steps-icon {
            color: #232225;
          }
          
          .custom-steps .ant-steps-item-finish .ant-steps-item-icon {
            background-color: transparent;
            border-color: #F6DA5E;
          }
          
          .custom-steps .ant-steps-item-finish .ant-steps-item-icon .ant-steps-icon {
            color: #F6DA5E;
          }
          
          .custom-steps .ant-steps-item-title {
            color: #ffffff !important;
          }
          
          .custom-steps .ant-steps-item-wait .ant-steps-item-title {
            color: #8c8c8c !important;
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
}

export default NewAppointmentPage;