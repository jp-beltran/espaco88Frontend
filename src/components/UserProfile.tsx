import {
  Form,
  Input,
  Button,
  message,
  Avatar,
  Spin,
  Card,
  Upload,
  Modal,
  ConfigProvider,
  theme,
} from "antd";
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
  DeleteOutlined,
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
          password: "",
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
        updateData.avatar_url = avatarUrl || undefined;
      }

      if (Object.keys(updateData).length === 0) {
        message.warning("Nenhuma alteração foi feita");
        return;
      }

      await updateUser(user.id, updateData);
      message.success("Perfil atualizado com sucesso!");

      // Atualizar estado local
      const updatedUser: User = {
        ...user,
        ...updateData,
        avatar_url:
          updateData.avatar_url !== undefined
            ? updateData.avatar_url
            : user.avatar_url,
      };
      delete (updatedUser as any).password;
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
      setShowPassword(false);

      // Limpar senha
      form.setFieldValue("password", "");
    } catch (error: any) {
      console.error("Erro ao atualizar o perfil:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.error ||
        "Erro ao atualizar o perfil";
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
      password: "",
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
    setShowPassword(false);
  };

  // Função para lidar com upload de avatar
  const handleAvatarUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Você só pode fazer upload de arquivos de imagem!");
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("A imagem deve ter menos de 2MB!");
      return false;
    }

    // Converter para base64 para preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarUrl(e.target?.result as string);
      setAvatarModalVisible(false);
      setIsTouched(true);
    };
    reader.readAsDataURL(file);

    return false;
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
    return `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=9AA5B1&color=1F2933&size=300`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin indicator={<LoadingOutlined className="loading-spinner" spin />} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-container">
        <p className="error-text">Erro ao carregar dados do usuário</p>
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#9AA5B1",
          colorBgContainer: "#323F4B",
          colorBorder: "#3E4C59",
          colorText: "#F5F7FA",
          colorTextSecondary: "#CBD2D9",
          colorBgBase: "#1F2933",
        },
      }}
    >
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="flex items-center gap-3 mb-2">
            <div className="profile-header-accent"></div>
            <h1 className="profile-title">Meu Perfil</h1>
          </div>
          <p className="profile-subtitle">
            Gerencie suas informações pessoais e configurações da conta
          </p>
        </div>

        {/* Content */}
        <div className="profile-content">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center lg:items-center lg:w-1/2 sm:w-full user-info">
              <div className="avatar-container">
                <Avatar
                  size={300}
                  src={getAvatarUrl()}
                  className="avatar-main"
                />
                {user.type === "barber" && (
                  <div className="avatar-badge">BARBEIRO</div>
                )}
                <div
                  className="avatar-overlay"
                  onClick={() => setAvatarModalVisible(true)}
                >
                  <CameraOutlined />
                </div>
              </div>

              <div className="mt-4 text-center lg:text-left">
                <h2 className="user-name">{user.name}</h2>
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <div
                    className={`user-type-indicator ${
                      user.type === "barber" ? "bg-yellow-400" : "bg-blue-400"
                    }`}
                  ></div>
                  <p className="user-type-text">
                    {user.type === "barber" ? "Profissional" : "Cliente"}
                  </p>
                </div>

        
              </div>
            </div>

            {/* Form Section */}
            <div className="flex-1 max-w-2xl form-section">
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
                onValuesChange={onValuesChange}
                className="space-y-6"
              >
                {/* Name Field */}
                <Card className="form-card">
                  <Form.Item
                    label={
                      <div className="form-label">
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
                      className={`profile-input ${
                        editEnabled.name
                          ? "profile-input-focused"
                          : "profile-input-disabled"
                      }`}
                      suffix={
                        <EditOutlined
                          className={`edit-icon ${
                            editEnabled.name ? "active" : ""
                          }`}
                          onClick={() => handleEditClick("name")}
                        />
                      }
                    />
                  </Form.Item>
                </Card>

                {/* Email Field */}
                <Card className="form-card">
                  <Form.Item
                    label={
                      <div className="form-label">
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
                      className={`profile-input ${
                        editEnabled.email
                          ? "profile-input-focused"
                          : "profile-input-disabled"
                      }`}
                      suffix={
                        <EditOutlined
                          className={`edit-icon ${
                            editEnabled.email ? "active" : ""
                          }`}
                          onClick={() => handleEditClick("email")}
                        />
                      }
                    />
                  </Form.Item>
                </Card>

                {/* Phone Field */}
                <Card className="form-card">
                  <Form.Item
                    label={
                      <div className="form-label">
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
                      className={`profile-input ${
                        editEnabled.phone
                          ? "profile-input-focused"
                          : "profile-input-disabled"
                      }`}
                      suffix={
                        <EditOutlined
                          className={`edit-icon ${
                            editEnabled.phone ? "active" : ""
                          }`}
                          onClick={() => handleEditClick("phone")}
                        />
                      }
                    />
                  </Form.Item>
                </Card>

                {/* Password Field */}
                <Card className="form-card">
                  <Form.Item
                    label={
                      <div className="form-label">
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
                          if (!value || !editEnabled.password)
                            return Promise.resolve();
                          if (!/(?=.*[A-Z])/.test(value)) {
                            return Promise.reject(
                              new Error(
                                "Deve conter ao menos uma letra maiúscula"
                              )
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
                    <div className="password-container">
                      <Input
                        type={showPassword ? "text" : "password"}
                        disabled={!editEnabled.password}
                        size="large"
                        placeholder="Deixe em branco para manter a atual"
                        autoComplete="new-password"
                        className={`profile-input ${
                          editEnabled.password
                            ? "profile-input-focused"
                            : "profile-input-disabled"
                        }`}
                        style={{ paddingRight: "80px" }}
                      />

                      {/* Show/Hide Password Button */}
                      {editEnabled.password && (
                        <div
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeInvisibleOutlined />
                          ) : (
                            <EyeOutlined />
                          )}
                        </div>
                      )}

                      {/* Edit Button */}
                      <div
                        className="password-edit-icon"
                        onClick={() => handleEditClick("password")}
                      >
                        <EditOutlined
                          className={`edit-icon ${
                            editEnabled.password ? "active" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </Form.Item>
                </Card>

                {/* Action Buttons */}
                {isTouched && (
                  <div className="action-buttons">
                    <Button
                      size="large"
                      onClick={handleCancelEdit}
                      className="btn-cancel"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={updating}
                      icon={<SaveOutlined />}
                      className="btn-save"
                    >
                      Salvar Alterações
                    </Button>
                  </div>
                )}
              </Form>

              {/* Help Text */}
              <div className="help-box">
                <p className="help-text">
                  💡 <strong>Dica:</strong> Clique no ícone de edição ao lado de
                  cada campo para habilitá-lo. Suas alterações só serão salvas
                  quando você clicar em "Salvar Alterações".
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
          className="avatar-modal"
        >
          <div className="modal-content">
            {/* Preview atual */}
            <div className="modal-preview">
              <Avatar
                size={100}
                src={getAvatarUrl()}
                className="avatar-main mb-4"
              />
              <p className="modal-preview-text">Foto atual</p>
            </div>

            {/* Opções */}
            <div className="modal-actions">
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
                  className="btn-upload"
                >
                  Escolher Nova Foto
                </Button>
              </Upload>

              {avatarUrl && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="large"
                  className="btn-remove"
                  onClick={handleRemoveAvatar}
                >
                  Remover Foto Personalizada
                </Button>
              )}

              <Button
                size="large"
                className="btn-modal-cancel"
                onClick={() => setAvatarModalVisible(false)}
              >
                Cancelar
              </Button>
            </div>

            <div className="modal-help">
              <p className="modal-help-text">
                📸 <strong>Dicas:</strong> Use imagens quadradas para melhor
                resultado. Tamanho máximo: 2MB. Formatos aceitos: JPG, PNG, GIF.
              </p>
            </div>
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
}

export default UserProfile;