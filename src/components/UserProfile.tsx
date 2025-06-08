import { Form, Input, Button, message, Image } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

function UserProfile() {
  const [form] = Form.useForm();
  const [isTouched, setIsTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editEnabled, setEditEnabled] = useState<{
    [key: string]: boolean;
    name: boolean;
    email: boolean;
    phone: boolean;
    password: boolean;
  }>({
    name: false,
    email: false,
    phone: false,
    password: false,
  });

  // Simulando dados carregados da API
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const user = {
        name: "João Beltran",
        email: "joao@example.com",
        phone: "61999999999",
      };
      form.setFieldsValue(user);
      setLoading(false);
    };

    fetchUserData();
  }, [form]);

  // Detectar alterações no formulário
  const onValuesChange = () => {
    setIsTouched(form.isFieldsTouched(true));
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    console.log("Dados a serem enviados:", values);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      message.success("Perfil atualizado com sucesso!");
      setIsTouched(false);
      setEditEnabled({
        name: false,
        email: false,
        phone: false,
        password: false,
      }); // Desabilita os campos após salvar
    } catch (error) {
      console.error("Erro ao atualizar o perfil:", error);
      message.error("Erro ao atualizar o perfil.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (fieldName: string) => {
    setEditEnabled((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  return (
    <div className="flex flex-col lg:p-7 bg-[#232225] rounded-3xl w-full">
      <h1
        className="text-yellow-400 text-3xl font-bold uppeElement implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ name: boolean; email: boolean; phone: boolean; password: boolean; }'.
  No index signature with a parameter of type 'string' was found on type '{ name: boolean; email: boolean; phone: boolean; password: boolean; }'.ts(7053)
(parameter) fieldName: stringrcase lg:mb-10"
      >
        Perfil
      </h1>
      <div className="flex flex-row justify-evenly max-w-[829px] ">
        <div className="flex flex-col items-center justify-center mb-6">
          <Image
            width={200}
            height={200}
            preview={false}
            className=" rounded-full object-cover"
            src="https://images.unsplash.com/photo-1726056652752-58303aafa0c1?q=80&w=1887&auto=format&fit=crop"
            alt="Foto do perfil"
          />
          <h2 className="mt-3 text-lg font-bold uppercase text-white ">
            {form.getFieldValue("name") || "Usuário"}
          </h2>
        </div>

        <Form
          className="max-w-1/2"
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          onValuesChange={onValuesChange}
        >
          <Form.Item
            label={
              <span className="text-white text-base font-extrabold">Nome</span>
            }
            name="name"
          >
            <Input
              disabled={!editEnabled.name}
              variant="filled"
              style={{
                color: "#ffffff",
                backgroundColor: "#232225",
              }}
              addonAfter={
                <EditOutlined
                  style={{ color: "#ffffff", cursor: "pointer" }}
                  onClick={() => handleEditClick("name")}
                />
              }
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-white text-base font-bold">Email</span>
            }
            name="email"
            rules={[{ type: "email", message: "Email inválido" }]}
          >
            <Input
              disabled={!editEnabled.email}
              variant="filled"
              style={{
                color: "#ffffff",
                backgroundColor: "#232225",
              }}
              addonAfter={
                <EditOutlined
                  style={{ color: "#ffffff", cursor: "pointer" }}
                  onClick={() => handleEditClick("email")}
                />
              }
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-white text-base font-bold">Telefone</span>
            }
            name="phone"
          >
            <Input
              disabled={!editEnabled.phone}
              variant="filled"
              style={{
                color: "#ffffff",
                backgroundColor: "#232225",
              }}
              addonAfter={
                <EditOutlined
                  style={{ color: "#ffffff", cursor: "pointer" }}
                  onClick={() => handleEditClick("phone")}
                />
              }
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-white text-base font-bold">Nova Senha</span>
            }
            name="password"
            rules={[{ min: 6, message: "Mínimo 6 caracteres" }]}
          >
            <Input.Password
              disabled={!editEnabled.password}
              variant="filled"
              style={{
                borderRadius: "8px",
                border: "2px solid #B2AFB6",
                color: "#ffffff",
                backgroundColor: "#232225",
              }}
              addonAfter={
                <EditOutlined
                  style={{ color: "#ffffff", cursor: "pointer" }}
                  onClick={() => handleEditClick("password")}
                />
              }
            />
          </Form.Item>

          <Form.Item>
            <Button
              className="w-full"
              type="primary"
              htmlType="submit"
              disabled={!isTouched || loading}
              loading={loading}
              style={{
                backgroundColor: isTouched ? "#fadb14" : "#d9d9d9",
                color: isTouched ? "#ffffff" : "#000000",
                borderColor: isTouched ? "#fadb14" : "#d9d9d9",
              }}
            >
              <p className="font-bold">Confirmar Edição</p>
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default UserProfile;
