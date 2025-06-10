import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Tag,
  Space,
  Empty,
  Spin,
  ConfigProvider,
  theme
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import { Service } from "../Types";
import { getServicesByBarber, createService, updateService, deleteService } from "../Services/api";

const { TextArea } = Input;

interface ServiceFormData {
  name: string;
  description?: string;
  price: number;
  duration: number;
}

function ServicesPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const barberId = parseInt(localStorage.getItem('userId') || '0');
  const userType = localStorage.getItem('userType');

  useEffect(() => {
    // Verificar se é barbeiro
    if (userType !== 'barber') {
      message.error("Acesso negado. Apenas barbeiros podem gerenciar serviços.");
      navigate('/user');
      return;
    }

    fetchServices();
  }, [userType, navigate]);

  const fetchServices = async () => {
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

  const handleSubmit = async (values: ServiceFormData) => {
    try {
      setSubmitting(true);
      
      if (editingService) {
        // Atualizar serviço existente
        await updateService(editingService.id, {
          ...values,
          active: true
        });
        message.success("Serviço atualizado com sucesso!");
      } else {
        // Criar novo serviço
        await createService({
          ...values,
          barber_id: barberId
        });
        message.success("Serviço criado com sucesso!");
      }

      setModalVisible(false);
      form.resetFields();
      setEditingService(null);
      fetchServices();
    } catch (error: any) {
      console.error("Erro ao salvar serviço:", error);
      message.error(error.response?.data?.error || "Erro ao salvar serviço");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    form.setFieldsValue({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration
    });
    setModalVisible(true);
  };

  const handleDelete = async (serviceId: number) => {
    try {
      await deleteService(serviceId);
      message.success("Serviço removido com sucesso!");
      fetchServices();
    } catch (error) {
      console.error("Erro ao remover serviço:", error);
      message.error("Erro ao remover serviço");
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setEditingService(null);
  };

  const columns = [
    {
      title: 'Serviço',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Service) => (
        <div>
          <div className="font-semibold text-white">{text}</div>
          {record.description && (
            <div className="text-gray-400 text-sm mt-1">{record.description}</div>
          )}
        </div>
      )
    },
    {
      title: 'Duração',
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
      render: (duration: number) => (
        <Tag icon={<ClockCircleOutlined />} color="blue">
          {duration} min
        </Tag>
      )
    },
    {
      title: 'Preço',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number) => (
        <Tag icon={<DollarOutlined />} color="green">
          R$ {price.toFixed(2)}
        </Tag>
      )
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      render: (_: any, record: Service) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="text-yellow-400 hover:text-yellow-300"
          />
          <Popconfirm
            title="Remover serviço"
            description="Tem certeza que deseja remover este serviço?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
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
                Meus Serviços
              </h1>
              <p className="text-gray-400">
                Gerencie os serviços que você oferece
              </p>
            </div>
            
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
              className="bg-yellow-400 border-yellow-400 text-black hover:bg-yellow-500"
              size="large"
            >
              Novo Serviço
            </Button>
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
            ) : services.length === 0 ? (
              <Empty
                description={
                  <span className="text-gray-400">
                    Você ainda não cadastrou nenhum serviço
                  </span>
                }
                className="py-12"
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setModalVisible(true)}
                  className="bg-yellow-400 border-yellow-400 text-black hover:bg-yellow-500"
                >
                  Cadastrar Primeiro Serviço
                </Button>
              </Empty>
            ) : (
              <Table
                dataSource={services}
                columns={columns}
                rowKey="id"
                pagination={false}
                className="services-table"
              />
            )}
          </Card>
        </div>

        {/* Modal de Cadastro/Edição */}
        <Modal
          title={editingService ? "Editar Serviço" : "Novo Serviço"}
          open={modalVisible}
          onCancel={handleModalCancel}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Form.Item
              label="Nome do Serviço"
              name="name"
              rules={[
                { required: true, message: "Nome é obrigatório" },
                { max: 100, message: "Máximo 100 caracteres" }
              ]}
            >
              <Input 
                placeholder="Ex: Corte de Cabelo" 
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Descrição (opcional)"
              name="description"
            >
              <TextArea
                placeholder="Descreva o serviço..."
                rows={3}
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="Duração (minutos)"
                name="duration"
                rules={[
                  { required: true, message: "Duração é obrigatória" },
                  { type: 'number', min: 15, message: "Mínimo 15 minutos" },
                  { type: 'number', max: 480, message: "Máximo 8 horas" }
                ]}
              >
                <InputNumber
                  placeholder="30"
                  size="large"
                  className="w-full"
                  min={15}
                  max={480}
                  step={15}
                />
              </Form.Item>

              <Form.Item
                label="Preço (R$)"
                name="price"
                rules={[
                  { required: true, message: "Preço é obrigatório" },
                  { type: 'number', min: 0.01, message: "Preço deve ser maior que zero" }
                ]}
              >
                <InputNumber
                  placeholder="50.00"
                  size="large"
                  className="w-full"
                  min={0.01}
                  step={0.50}
                  precision={2}
                  prefix="R$"
                />
              </Form.Item>
            </div>

            <Form.Item className="mb-0 mt-6">
              <Space className="w-full justify-end">
                <Button onClick={handleModalCancel}>
                  Cancelar
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  className="bg-yellow-400 border-yellow-400 text-black hover:bg-yellow-500"
                >
                  {editingService ? "Salvar Alterações" : "Criar Serviço"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

   
      </div>
    </ConfigProvider>
  );
}

export default ServicesPage;