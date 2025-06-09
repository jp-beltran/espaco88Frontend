import { Form, Input, Button, message, Image, Spin } from "antd";
import { EditOutlined, LoadingOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getCurrentUser, updateUser } from "../Services/api";
import { User, UpdateUserData } from "../Types";

function UserProfile() {
  const [form] = Form.useForm();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [editEnabled, setEditEnabled] = useState<{
    [key: string]: boolean;
  }>({
    name: false,
    email: false,
    phone: false,
    password: false,
  });

  // Carregar dados do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          message.error("Usuário não encontrado. Faça login novamente.");
          // Redirecionar para login
          window.location.href = '/';
          return;
        }

        const userData = await getCurrentUser();
        setUser(userData);
        form.setFieldsValue({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
        });
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        message.error("Erro ao carregar dados do perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [form]);

  // Detectar alterações no formulário
  const onValuesChange = () => {
    setIsTouched(form.isFieldsTouched(true));
  };

  const onFinish = async (values: any) => {
    if (!user) return;
    
    setUpdating(true);
    try {
      // Preparar dados para envio (apenas campos modificados)
      const updateData: UpdateUserData = {};
      
      if (values.name !== user.name) updateData.name = values.name;
      if (values.email !== user.email) updateData.email = values.email;
      if (values.phone !== user.phone) updateData.phone = values.phone;
      if (values.password) updateData.password = values.password;

      await updateUser(user.id, updateData);
      
      message.success("Perfil atualizado com sucesso!");
      
      // Atualizar estado local com novos dados
      setUser({ ...user, ...updateData });
      
      // Resetar estados
      setIsTouched(false);
      setEditEnabled({
        name: false,
        email: false,
        phone: false,
        password: false,
      });
      
      // Limpar campo de senha
      form.setFieldValue('password', '');
      
    } catch (error: any) {
      console.error("Erro ao atualizar o perfil:", error);
      message.error(error.error || "Erro ao atualizar o perfil");
    } finally {
      setUpdating(false);
    }
  };

  const handleEditClick = (fieldName: string) => {
    setEditEnabled((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 bg-[#232225] rounded-3xl">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-96 bg-[#232225] rounded-3xl">
        <p className="text-white">Erro ao carregar dados do usuário</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 lg:p-7 bg-[#232225] rounded-3xl w-full">
      <h1 className="text-yellow-400 text-2xl lg:text-3xl font-bold uppercase mb-6 lg:mb-10">
        Meu Perfil
      </h1>
      
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Foto e nome */}
        <div className="flex flex-col items-center justify-start">
          <div className="relative">
            <Image
              width={150}
              height={150}
              preview={false}
              className="rounded-full object-cover border-4 border-yellow-400"
              src={`https://ui-avatars.com/api/?name=${user.name}&background=F6DA5E&color=232225&size=200`}
              alt="Foto do perfil"
            />
            {user.type === 'barber' && (
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                BARBEIRO
              </div>
            )}
          </div>
          <h2 className="mt-4 text-lg font-bold uppercase text-white">
            {user.name}
          </h2>
          <p className="text-gray-400 text-sm">{user.type === 'barber' ? 'Profissional' : 'Cliente'}</p>
        </div>

        {/* Formulário */}
        <Form
          className="flex-1 max-w-md"
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          onValuesChange={onValuesChange}
        >
          <Form.Item
            label={<span className="text-white text-base font-bold">Nome</span>}
            name="name"
            rules={[
              { required: true, message: "Nome é obrigatório" },
              { min: 3, message: "Mínimo 3 caracteres" },
              { max: 50, message: "Máximo 50 caracteres" }
            ]}
          >
            <Input
              disabled={!editEnabled.name}
              className="bg-[#1a1a1a] text-white border-gray-600"
              style={{
                backgroundColor: editEnabled.name ? '#1a1a1a' : '#0a0a0a',
                color: '#ffffff',
              }}
              addonAfter={
                <EditOutlined
                  className="cursor-pointer text-yellow-400 hover:text-yellow-300"
                  onClick={() => handleEditClick("name")}
                />
              }
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-white text-base font-bold">Email</span>}
            name="email"
            rules={[
              { required: true, message: "Email é obrigatório" },
              { type: "email", message: "Email inválido" },
              { max: 100, message: "Máximo 100 caracteres" }
            ]}
          >
            <Input
              disabled={!editEnabled.email}
              className="bg-[#1a1a1a] text-white border-gray-600"
              style={{
                backgroundColor: editEnabled.email ? '#1a1a1a' : '#0a0a0a',
                color: '#ffffff',
              }}
              addonAfter={
                <EditOutlined
                  className="cursor-pointer text-yellow-400 hover:text-yellow-300"
                  onClick={() => handleEditClick("email")}
                />
              }
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-white text-base font-bold">Telefone</span>}
            name="phone"
            rules={[
              { required: true, message: "Telefone é obrigatório" },
              { max: 15, message: "Máximo 15 caracteres" }
            ]}
          >
            <Input
              disabled={!editEnabled.phone}
              className="bg-[#1a1a1a] text-white border-gray-600"
              style={{
                backgroundColor: editEnabled.phone ? '#1a1a1a' : '#0a0a0a',
                color: '#ffffff',
              }}
              placeholder="(00) 00000-0000"
              addonAfter={
                <EditOutlined
                  className="cursor-pointer text-yellow-400 hover:text-yellow-300"
                  onClick={() => handleEditClick("phone")}
                />
              }
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-white text-base font-bold">Nova Senha</span>}
            name="password"
            rules={[
              { min: 8, message: "Mínimo 8 caracteres" },
              { max: 20, message: "Máximo 20 caracteres" },
              {
                validator: (_, value) => {
                  if (!value || !editEnabled.password) return Promise.resolve();
                  if (!/(?=.*[A-Z])/.test(value)) {
                    return Promise.reject(new Error("Deve conter ao menos uma letra maiúscula"));
                  }
                  if (!/(?=.*\d)/.test(value)) {
                    return Promise.reject(new Error("Deve conter ao menos um número"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Password
              disabled={!editEnabled.password}
              className="bg-[#1a1a1a] text-white border-gray-600"
              style={{
                backgroundColor: editEnabled.password ? '#1a1a1a' : '#0a0a0a',
                color: '#ffffff',
              }}
              placeholder="Deixe em branco para manter a atual"
              addonAfter={
                <EditOutlined
                  className="cursor-pointer text-yellow-400 hover:text-yellow-300"
                  onClick={() => handleEditClick("password")}
                />
              }
            />
          </Form.Item>

          <Form.Item className="mt-8">
            <Button
              className="w-full h-12 font-bold text-base"
              type="primary"
              htmlType="submit"
              disabled={!isTouched || updating}
              loading={updating}
              style={{
                backgroundColor: isTouched ? "#F6DA5E" : "#4a4a4a",
                borderColor: isTouched ? "#F6DA5E" : "#4a4a4a",
                color: isTouched ? "#232225" : "#8a8a8a",
              }}
            >
              Salvar Alterações
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default UserProfile;