import { Form, Input, Button, message, Avatar, Spin, Card, Divider, Upload, Modal } from "antd";
import { 
  EditOutlined, 
  LoadingOutlined, 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  LockOutlined,
  SaveOutlined,
  CameraOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  UploadOutlined,
  DeleteOutlined
} from "@ant-design/icons";
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
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Carregar dados do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("userId");

        if (!userId) {
          message.error("Usuário não encontrado. Faça login novamente.");
          window.location.href = "/";
          return;
        }

        const userData = await getCurrentUser();
        setUser(userData);
        
        // Se o usuário tem avatar customizado, usar ele
        if (userData.avatar_url) {
          setAvatarUrl(userData.avatar_url);
        }
        
        form.setFieldsValue({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          password: ""
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
  const onValuesChange = (changedValues: any, allValues: any) => {
    if (!user) return;
    console.log("Campos alterados:", changedValues);

    const hasChanges =
      allValues.name !== user.name ||
      allValues.email !== user.email ||
      allValues.phone !== user.phone ||
      (allValues.password && allValues.password.length > 0);

    setIsTouched(hasChanges);
  };

  const onFinish = async (values: any) => {
    if (!user) return;

    setUpdating(true);
    try {
      const updateData: UpdateUserData = {};

      if (values.name !== user.name && values.name?.trim()) {
        updateData.name = values.name.trim();
      }
      if (values.email !== user.email && values.email?.trim()) {
        updateData.email = values.email.trim();
      }
      if (values.phone !== user.phone && values.phone?.trim()) {
        updateData.phone = values.phone.trim();
      }
      if (values.password && values.password.trim()) {
        updateData.password = values.password;
      }
      
      // Se o avatar foi alterado, incluir no update
      if (avatarUrl !== (user.avatar_url || null)) {
        updateData.avatar_url = avatarUrl || undefined; // Convert null to undefined
      }

      if (Object.keys(updateData).length === 0) {
        message.warning("Nenhuma alteração foi feita");
        return;
      }

      await updateUser(user.id, updateData);
      message.success("Perfil atualizado com sucesso!");

      // Atualizar estado local - handle null to undefined conversion
      const updatedUser: User = { 
        ...user, 
        ...updateData,
        // Ensure avatar_url is properly typed
        avatar_url: updateData.avatar_url !== undefined ? updateData.avatar_url : user.avatar_url
      };
      delete (updatedUser as any).password; // Não manter senha no estado
      setUser(updatedUser);
      
      // Atualizar avatar local se foi alterado
      if (updateData.avatar_url !== undefined) {
        setAvatarUrl(updateData.avatar_url || null);
      }

      // Resetar estados
      setIsTouched(false);
      setEditEnabled({
        name: false,
        email: false,
        phone: false,
        password: false,
      });
      setShowPassword(false); // Reset password visibility

      // Limpar senha
      form.setFieldValue("password", "");
    } catch (error: any) {
      console.error("Erro ao atualizar o perfil:", error);
      const errorMessage = error.response?.data?.error || error.error || "Erro ao atualizar o perfil";
      message.error(errorMessage);
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

  const handleCancelEdit = () => {
    if (!user) return;
    
    // Restaurar valores originais
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: ""
    });
    
    // Restaurar avatar original
    setAvatarUrl(user.avatar_url || null);
    
    // Desabilitar todos os campos
    setEditEnabled({
      name: false,
      email: false,
      phone: false,
      password: false,
    });
    
    setIsTouched(false);
    setShowPassword(false); // Reset password visibility
  };

  // Função para lidar com upload de avatar
  const handleAvatarUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Você só pode fazer upload de arquivos de imagem!');
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('A imagem deve ter menos de 2MB!');
      return false;
    }

    // Converter para base64 para preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarUrl(e.target?.result as string);
      setAvatarModalVisible(false);
      setIsTouched(true); // Marcar como alterado
    };
    reader.readAsDataURL(file);

    return false; // Previne upload automático
  };

  // Função para remover avatar
  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    setAvatarModalVisible(false);
    setIsTouched(true);
  };

  // Função para obter URL do avatar
  const getAvatarUrl = () => {
    if (avatarUrl) {
      return avatarUrl;
    }
    return `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=F6DA5E&color=232225&size=300`;
  };

  if (loading) {
    return (
      <div 
        className="flex justify-center items-center h-96 rounded-3xl border border-gray-800"
        style={{ backgroundColor: '#0a0a0a' }}
      >
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#F6DA5E' }} spin />} />
      </div>
    );
  }

  if (!user) {
    return (
      <div 
        className="flex justify-center items-center h-96 rounded-3xl border border-gray-800"
        style={{ backgroundColor: '#0a0a0a' }}
      >
        <p className="text-gray-300">Erro ao carregar dados do usuário</p>
      </div>
    );
  }

  return (
    <div 
      className="rounded-3xl border border-gray-800 overflow-hidden"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      {/* Header */}
      <div 
        className="p-6 border-b border-gray-800"
        style={{ backgroundColor: '#070707' }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full"></div>
          <h1 className="text-yellow-400 text-3xl font-bold">
            Meu Perfil
          </h1>
        </div>
        <p className="text-gray-400">
          Gerencie suas informações pessoais e configurações da conta
        </p>
      </div>

      {/* Content */}
      <div className="p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center lg:items-center lg:w-1/2 sm:w-full">
            <div className="relative group">
              <Avatar
                size={300}
                src={getAvatarUrl()}
                className="ring-4 ring-yellow-400/30 transition-all duration-300 group-hover:ring-yellow-400/50 "
                style={{
                  width: '120px',
                  height: '120px'
                }}
              />
              {user.type === "barber" && (
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  BARBEIRO
                </div>
              )}
              <div 
                className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                onClick={() => setAvatarModalVisible(true)}
              >
                <CameraOutlined className="text-white text-xl" />
              </div>
            </div>
            
            <div className="mt-4 text-center lg:text-left">
              <h2 className="text-2xl font-bold text-gray-200 mb-1">
                {user.name}
              </h2>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <div className={`w-2 h-2 rounded-full ${user.type === 'barber' ? 'bg-yellow-400' : 'bg-blue-400'}`}></div>
                <p className="text-gray-400 font-medium">
                  {user.type === "barber" ? "Profissional" : "Cliente"}
                </p>
              </div>
              
              <Button
                type="link"
                size="small"
                className="mt-2 text-yellow-400 hover:text-yellow-300 p-0"
                onClick={() => setAvatarModalVisible(true)}
              >
                Alterar foto
              </Button>
            </div>
          </div>

          {/* Form Section */}
          <div className="flex-1 max-w-2xl">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
              onValuesChange={onValuesChange}
              className="space-y-6"
            >
              {/* Name Field */}
              <Card
                className="border-gray-800 transition-all duration-300 hover:border-gray-700"
                bodyStyle={{ 
                  padding: '20px',
                  backgroundColor: '#070707'
                }}
                style={{ backgroundColor: '#070707' }}
              >
                <Form.Item
                  label={
                    <div className="flex items-center gap-2 text-gray-300 font-medium">
                      <UserOutlined />
                      <span>Nome Completo</span>
                    </div>
                  }
                  name="name"
                  rules={[
                    { required: true, message: "Nome é obrigatório" },
                    { min: 3, message: "Mínimo 3 caracteres" },
                    { max: 50, message: "Máximo 50 caracteres" },
                  ]}
                  className="mb-0"
                >
                  <Input
                    disabled={!editEnabled.name}
                    size="large"
                    autoComplete="name"
                    style={{
                      backgroundColor: editEnabled.name ? "#0a0a0a" : "#050505",
                      color: "#ffffff",
                      borderColor: editEnabled.name ? "#F6DA5E" : "#374151"
                    }}
                    suffix={
                      <EditOutlined
                        className={`cursor-pointer transition-colors ${
                          editEnabled.name ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'
                        }`}
                        onClick={() => handleEditClick("name")}
                      />
                    }
                  />
                </Form.Item>
              </Card>

              {/* Email Field */}
              <Card
                className="border-gray-800 transition-all duration-300 hover:border-gray-700"
                bodyStyle={{ 
                  padding: '20px',
                  backgroundColor: '#070707'
                }}
                style={{ backgroundColor: '#070707' }}
              >
                <Form.Item
                  label={
                    <div className="flex items-center gap-2 text-gray-300 font-medium">
                      <MailOutlined />
                      <span>Email</span>
                    </div>
                  }
                  name="email"
                  rules={[
                    { required: true, message: "Email é obrigatório" },
                    { type: "email", message: "Email inválido" },
                    { max: 100, message: "Máximo 100 caracteres" },
                  ]}
                  className="mb-0"
                >
                  <Input
                    disabled={!editEnabled.email}
                    size="large"
                    autoComplete="email"
                    style={{
                      backgroundColor: editEnabled.email ? "#0a0a0a" : "#050505",
                      color: "#ffffff",
                      borderColor: editEnabled.email ? "#F6DA5E" : "#374151"
                    }}
                    suffix={
                      <EditOutlined
                        className={`cursor-pointer transition-colors ${
                          editEnabled.email ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'
                        }`}
                        onClick={() => handleEditClick("email")}
                      />
                    }
                  />
                </Form.Item>
              </Card>

              {/* Phone Field */}
              <Card
                className="border-gray-800 transition-all duration-300 hover:border-gray-700"
                bodyStyle={{ 
                  padding: '20px',
                  backgroundColor: '#070707'
                }}
                style={{ backgroundColor: '#070707' }}
              >
                <Form.Item
                  label={
                    <div className="flex items-center gap-2 text-gray-300 font-medium">
                      <PhoneOutlined />
                      <span>Telefone</span>
                    </div>
                  }
                  name="phone"
                  rules={[
                    { required: true, message: "Telefone é obrigatório" },
                    { max: 15, message: "Máximo 15 caracteres" },
                  ]}
                  className="mb-0"
                >
                  <Input
                    disabled={!editEnabled.phone}
                    size="large"
                    placeholder="(00) 00000-0000"
                    autoComplete="tel"
                    style={{
                      backgroundColor: editEnabled.phone ? "#0a0a0a" : "#050505",
                      color: "#ffffff",
                      borderColor: editEnabled.phone ? "#F6DA5E" : "#374151"
                    }}
                    suffix={
                      <EditOutlined
                        className={`cursor-pointer transition-colors ${
                          editEnabled.phone ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'
                        }`}
                        onClick={() => handleEditClick("phone")}
                      />
                    }
                  />
                </Form.Item>
              </Card>

              {/* Password Field */}
              <Card
                className="border-gray-800 transition-all duration-300 hover:border-gray-700"
                bodyStyle={{ 
                  padding: '20px',
                  backgroundColor: '#070707'
                }}
                style={{ backgroundColor: '#070707' }}
              >
                <Form.Item
                  label={
                    <div className="flex items-center gap-2 text-gray-300 font-medium">
                      <LockOutlined />
                      <span>Nova Senha</span>
                    </div>
                  }
                  name="password"
                  rules={[
                    { min: 8, message: "Mínimo 8 caracteres" },
                    { max: 20, message: "Máximo 20 caracteres" },
                    {
                      validator: (_, value) => {
                        if (!value || !editEnabled.password) return Promise.resolve();
                        if (!/(?=.*[A-Z])/.test(value)) {
                          return Promise.reject(
                            new Error("Deve conter ao menos uma letra maiúscula")
                          );
                        }
                        if (!/(?=.*\d)/.test(value)) {
                          return Promise.reject(
                            new Error("Deve conter ao menos um número")
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  className="mb-0"
                >
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      disabled={!editEnabled.password}
                      size="large"
                      placeholder="Deixe em branco para manter a atual"
                      autoComplete="new-password"
                      style={{
                        backgroundColor: editEnabled.password ? "#0a0a0a" : "#050505",
                        color: "#ffffff",
                        borderColor: editEnabled.password ? "#F6DA5E" : "#374151",
                        paddingRight: "80px"
                      }}
                    />
                    
                    {/* Show/Hide Password Button */}
                    {editEnabled.password && (
  <div 
    className="absolute right-12 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer p-1"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? (
      <EyeInvisibleOutlined 
        className="text-gray-400 hover:text-yellow-400 transition-colors text-base"
        style={{ color: '#9CA3AF' }} // ← ADICIONE ESTA LINHA
      />
    ) : (
      <EyeOutlined 
        className="text-gray-400 hover:text-yellow-400 transition-colors text-base"
        style={{ color: '#9CA3AF' }} // ← ADICIONE ESTA LINHA
      />
    )}
  </div>
                    )}
                    
                    {/* Edit Button */}
                    <div 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer p-1"
                      onClick={() => handleEditClick("password")}
                    >
                      <EditOutlined
                        className={`transition-colors text-base ${
                          editEnabled.password ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                        }`}
                        style={{ color: editEnabled.password ? '#F6DA5E' : '#9CA3AF' }}
                      />
                    </div>
                  </div>
                </Form.Item>
              </Card>

              {/* Action Buttons */}
              {isTouched && (
                <div className="flex gap-3 pt-4">
                  <Button
                    size="large"
                    onClick={handleCancelEdit}
                    className="flex-1 h-12 font-medium"
                    style={{
                      backgroundColor: "#374151",
                      borderColor: "#374151",
                      color: "#ffffff"
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={updating}
                    icon={<SaveOutlined />}
                    className="flex-1 h-12 font-medium"
                    style={{
                      backgroundColor: "#F6DA5E",
                      borderColor: "#F6DA5E",
                      color: "#232225"
                    }}
                  >
                    Salvar Alterações
                  </Button>
                </div>
              )}
            </Form>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-blue-900/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-300 text-sm">
                💡 <strong>Dica:</strong> Clique no ícone de edição ao lado de cada campo para habilitá-lo. 
                Suas alterações só serão salvas quando você clicar em "Salvar Alterações".
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Upload de Avatar */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-white">
            <CameraOutlined />
            <span>Alterar Foto de Perfil</span>
          </div>
        }
        open={avatarModalVisible}
        onCancel={() => setAvatarModalVisible(false)}
        footer={null}
        width={400}
        style={{
          '--ant-modal-content-bg': '#0a0a0a',
          '--ant-modal-header-bg': '#0a0a0a'
        } as React.CSSProperties}
      >
        <div className="space-y-4" style={{ backgroundColor: '#0a0a0a' }}>
          {/* Preview atual */}
          <div className="text-center">
            <Avatar
              size={100}
              src={getAvatarUrl()}
              className="ring-4 ring-yellow-400/30 mb-4"
            />
            <p className="text-gray-400 text-sm">Foto atual</p>
          </div>

          {/* Opções */}
          <div className="space-y-3">
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleAvatarUpload}
              className="w-full"
            >
              <Button
                type="primary"
                icon={<UploadOutlined />}
                size="large"
                className="w-full h-12 bg-yellow-400 border-yellow-400 text-black hover:bg-yellow-500"
                loading={uploadingAvatar}
              >
                Escolher Nova Foto
              </Button>
            </Upload>

            {avatarUrl && (
              <Button
                danger
                icon={<DeleteOutlined />}
                size="large"
                className="w-full h-12"
                onClick={handleRemoveAvatar}
              >
                Remover Foto Personalizada
              </Button>
            )}

            <Button
              size="large"
              className="w-full h-12"
              onClick={() => setAvatarModalVisible(false)}
              style={{
                backgroundColor: "#374151",
                borderColor: "#374151",
                color: "#ffffff"
              }}
            >
              Cancelar
            </Button>
          </div>

          <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-blue-300 text-xs">
              📸 <strong>Dicas:</strong> Use imagens quadradas para melhor resultado. 
              Tamanho máximo: 2MB. Formatos aceitos: JPG, PNG, GIF.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default UserProfile;

// CSS global para corrigir autocomplete e outros problemas do Ant Design
if (typeof document !== 'undefined') {
  const globalStyles = `
    /* Corrigir autocomplete do navegador */
    .ant-input:-webkit-autofill,
    .ant-input:-webkit-autofill:hover,
    .ant-input:-webkit-autofill:focus,
    .ant-input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 30px #0a0a0a inset !important;
      -webkit-text-fill-color: #ffffff !important;
      background-color: #0a0a0a !important;
      transition: background-color 5000s ease-in-out 0s;
    }
    
    /* Corrigir inputs desabilitados */
    .ant-input[disabled] {
      background-color: #050505 !important;
      color: #ffffff !important;
      border-color: #374151 !important;
      cursor: not-allowed !important;
    }
    
    /* Corrigir Password input */
    .ant-input-password .ant-input:-webkit-autofill,
    .ant-input-password .ant-input:-webkit-autofill:hover,
    .ant-input-password .ant-input:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0 30px #0a0a0a inset !important;
      -webkit-text-fill-color: #ffffff !important;
    }
    
    /* Cards escuros */
    .ant-card {
      background-color: #070707 !important;
      border-color: #374151 !important;
    }
    
    .ant-card-body {
      background-color: #070707 !important;
    }
    
    /* Form labels */
    .ant-form-item-label > label {
      color: #d1d5db !important;
    }
    
    /* Form validation */
    .ant-form-item-explain-error {
      color: #ef4444 !important;
    }
    
    /* Suffix icons com cor forçada */
    .ant-input-suffix {
      color: #9CA3AF !important;
    }
    
    .ant-input-suffix .anticon {
      color: #9CA3AF !important;
    }
    
    /* Força cor dos ícones customizados */
    .custom-icon-edit {
      color: #9CA3AF !important;
    }
    
    .custom-icon-edit:hover {
      color: #F6DA5E !important;
    }
    
    .custom-icon-edit.active {
      color: #F6DA5E !important;
    }
    
    /* Avatar hover effects */
    .ant-avatar {
      transition: all 0.3s ease !important;
    }
  `;
  
  // Remove estilo anterior se existir
  const existingStyle = document.getElementById('user-profile-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Adicionar novos estilos
  const styleElement = document.createElement('style');
  styleElement.id = 'user-profile-styles';
  styleElement.textContent = globalStyles;
  document.head.appendChild(styleElement);
}