import { motion } from "framer-motion";
import { Input, Form, Button, message, Alert } from "antd";
import { useState } from "react";
import { loginUser } from "../Services/api";
import { useNavigate } from "react-router-dom";

interface LoginComponentProps {
  onSwitchToRegister: () => void;
}

interface LoginFormValues {
  email: string;
  password: string;
}

function LoginComponent({ onSwitchToRegister }: LoginComponentProps) {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [success, setSuccess] = useState(false);

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    setSuccess(false);

    try {
      const response = await loginUser(values.email, values.password);

      if (response.token) {
        message.success("Login realizado com sucesso!");
        setSuccess(true);
        setErrorMessage(null); // limpa erro anterior
        localStorage.setItem("token", response.token);
        
        // Salvar tipo de usuário
        if (response.user && response.user.type) {
          localStorage.setItem("userType", response.user.type);
        }
        
        form.resetFields();
        
        // Redirecionar para página do usuário após 1 segundo
        setTimeout(() => {
          navigate('/user');
        }, 1000);
      } else {
        throw new Error(response.error || "Credenciais inválidas.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao fazer login."); // define mensagem visível
      message.error(err.message || "Erro ao fazer login.");
    }

    setLoading(false);
  };

  const onFinishFailed = () => {
    message.error("Verifique os campos e tente novamente.");
  };

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center lg:mt-0 my-20"
    >
      <div className="flex flex-col items-start justify-center w-full px-6 md:px-20 lg:px-32 gap-2">
        <img src="" alt="Logo" />
        <h1 className="font-titanOne text-white text-4xl font-extrabold">
          Bem-vindo!
        </h1>
        <h2 className="text-white text-base">
          Entre para continuar e aproveitar uma experiência <br /> única no
          nosso espaço.
        </h2>

        {success && (
          <Alert
            message="Login com sucesso!"
            type="success"
            showIcon
            className="w-full"
          />
        )}
        {errorMessage && (
          <Alert
            message={errorMessage}
            type="error"
            showIcon
            className="w-full"
          />
        )}

        <Form
          className="flex flex-col w-full max-w-md px-6 sm:px-10 md:px-20"
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
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
            <Input size="large" placeholder="seu@email.com" />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-white text-base font-bold">Senha</span>
            }
            name="password"
            rules={[
              { required: true, message: "Digite sua senha!" },
              { min: 8, message: "Mínimo de 8 caracteres" },
            ]}
          >
            <Input.Password size="large" placeholder="Sua senha" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-yellow-400 font-bold text-black hover:bg-yellow-300 w-full"
              size="large"
            >
              Entrar
            </Button>
          </Form.Item>

          <p className="text-white text-base font-bold">
            Não tem uma conta?{" "}
            <button
              onClick={onSwitchToRegister}
              className="!text-[#F6DA5E] no-underline font-extrabold bg-transparent border-none cursor-pointer"
            >
              Registre-se
            </button>
          </p>
        </Form>
      </div>
    </motion.div>
  );
}

export default LoginComponent;