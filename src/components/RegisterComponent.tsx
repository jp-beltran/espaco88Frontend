// src/components/RegisterComponent.tsx
import { Input, Form, Checkbox, Button, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useState } from "react";
import { registerUser } from "../Services/api";

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  isBarber?: boolean;
}

function RegisterComponent() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: FormValues) => {
    setLoading(true);
    const userType = values.isBarber ? "barber" : "client";
    const payload = { ...values, type: userType };
    delete payload.isBarber;

    try {
      const data = await registerUser(payload);
      console.log("API response:", data);
      message.success("Usuário cadastrado com sucesso!");
    } catch (error: any) {
      console.error("Erro:", error);
      message.error(
        "Erro ao cadastrar: " +
          (error.response?.data?.error ||
            error.response?.data?.errors?.[0] ||
            error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Erro no formulário:", errorInfo);
    message.error("Verifique os campos e tente novamente.");
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-start justify-center px-32 gap-4 h-full">
        <h1 className="font-titanOne text-white text-4xl font-extrabold">
          Acesse a Plataforma
        </h1>
        <h2 className="text-white text-base">
          Faça login ou registre-se para experimentar um <br /> corte impecável
          que realça sua personalidade.
        </h2>
        <Form
          className="flex flex-col w-96"
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          {/* Nome */}
          <Form.Item
            label={<span className="text-white">Nome</span>}
            name="name"
            rules={[
              { required: true, message: "Digite seu nome!" },
              { max: 50 },
              {
                validator: (_, value) => {
                  const regex = /^[A-Za-zÀ-ÿ\s]+$/;
                  if (!value || value.trim().length < 3) {
                    return Promise.reject(
                      new Error("O nome deve ter no mínimo 3 caracteres")
                    );
                  }
                  if (!regex.test(value)) {
                    return Promise.reject(
                      new Error("Use apenas letras e espaços")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input size="large" placeholder="Digite seu Nome" maxLength={50} />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label={<span className="text-white">Email</span>}
            name="email"
            rules={[
              { required: true, message: "Digite seu email!" },
              { type: "email" },
              { max: 100 },
            ]}
          >
            <Input size="large" placeholder="example@xxx.com" />
          </Form.Item>

          {/* Senha */}
          <Form.Item
            label={<span className="text-white">Senha</span>}
            name="password"
            rules={[
              { required: true },
              { max: 20 },
              {
                validator: (_, value) => {
                  if (!value || value.length < 8) {
                    return Promise.reject(new Error("Mínimo de 8 caracteres"));
                  }
                  if (!/(?=.*[A-Z])/.test(value)) {
                    return Promise.reject(
                      new Error("Inclua ao menos uma letra maiúscula")
                    );
                  }
                  if (!/(?=.*\d)/.test(value)) {
                    return Promise.reject(
                      new Error("Inclua ao menos um número")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Password placeholder="Digite sua senha" />
          </Form.Item>

          {/* Confirmação de senha */}
          <Form.Item
            label={<span className="text-white">Confirme sua senha</span>}
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Confirme sua senha!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  return !value || getFieldValue("password") === value
                    ? Promise.resolve()
                    : Promise.reject(new Error("As senhas não coincidem!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirme sua senha" />
          </Form.Item>

          {/* Telefone */}
          <Form.Item
            label={<span className="text-white">Telefone</span>}
            name="phone"
            rules={[
              { required: true },
              { max: 15, message: "Máximo de 15 caracteres" },
            ]}
          >
            <Input placeholder="(xx)xxxxx-xxxx" />
          </Form.Item>

          {/* Checkbox de barbeiro */}
          <Form.Item name="isBarber" valuePropName="checked">
            <Checkbox>
              <span className="text-white">Sou Barbeiro</span>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-yellow-400 font-bold text-black hover:bg-yellow-300 w-full"
            >
              {loading ? <LoadingOutlined /> : "Criar"}
            </Button>
          </Form.Item>

          <p className="text-white">
            Já possui uma conta?{" "}
            <a href="#" className="!text-[#F6DA5E] no-underline font-extrabold">
              Entrar
            </a>
          </p>
        </Form>
      </div>
    </div>
  );
}

export default RegisterComponent;
