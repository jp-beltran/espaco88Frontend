import { motion } from "framer-motion";
import { Input, Form, Checkbox, Button, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useState } from "react";
import { registerUser } from "../Services/api";

interface RegisterComponentProps {
  onSwitchToLogin: () => void;
}

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  isBarber?: boolean;
}

function RegisterComponent({ onSwitchToLogin }: RegisterComponentProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: FormValues) => {
    setLoading(true);

    const userType: "barber" | "client" = values.isBarber ? "barber" : "client";

    const payload = {
      name: values.name,
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
      phone: values.phone,
      type: userType,
    };

    const data = await registerUser(payload);
    console.log("API response:", data);

    if (data.error || data.errors) {
      const errorMsg = data.error || data.errors?.[0] || "Erro ao cadastrar.";
      message.error(errorMsg);
    } else {
      message.success("Usuário cadastrado com sucesso!");
      form.resetFields();
    }

    setLoading(false);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Erro no formulário:", errorInfo);
    message.error("Verifique os campos e tente novamente.");
  };

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center h-full"
    >
      <div className="flex flex-col items-end justify-center px-32 gap-2">
        <img src="" alt="Logo" />
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
          <Form.Item
            label={
              <span className="text-white text-base font-bold items-end">
                Nome
              </span>
            }
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

          <Form.Item
            label={
              <span className="text-white text-base font-bold">Email</span>
            }
            name="email"
            rules={[
              { required: true, message: "Digite seu email!" },
              { type: "email" },
              { max: 100 },
            ]}
          >
            <Input size="large" placeholder="example@xxx.com" />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-white text-base font-bold">Senha</span>
            }
            name="password"
            rules={[
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
            <Input.Password size="large" placeholder="Digite sua senha" />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-white text-base font-bold">
                Confirme sua senha
              </span>
            }
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
            <Input.Password size="large" placeholder="Confirme sua senha" />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-white text-base font-bold">Telefone</span>
            }
            name="phone"
            rules={[
              { required: true },
              { max: 15, message: "Máximo de 15 caracteres" },
            ]}
          >
            <Input size="large" placeholder="(xx)xxxxx-xxxx" />
          </Form.Item>

          <Form.Item name="isBarber" valuePropName="checked">
            <Checkbox>
              <span className="text-white text-base font-bold">
                Sou Barbeiro
              </span>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-yellow-400 font-bold text-black hover:bg-yellow-300 w-full"
              size="large"
            >
              {loading ? <LoadingOutlined /> : "Criar"}
            </Button>
          </Form.Item>

          <p className="text-white text-base font-bold">
            Já possui uma conta?{" "}
            <button
              onClick={onSwitchToLogin}
              className="!text-[#F6DA5E] no-underline font-extrabold bg-transparent border-none cursor-pointer"
            >
              Entrar
            </button>
          </p>
        </Form>
      </div>
    </motion.div>
  );
}

export default RegisterComponent;
