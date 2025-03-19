import { Input, Form, Checkbox, Button, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import axios from "axios";
import { useState } from "react";

function RegisterComponent() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    console.log("onFinish chamado", values);
    setLoading(true);

    // Define o tipo de usuário com base na checkbox
    const userType = values.isBarber ? "barber" : "client";
    const payload = { ...values, type: userType };
    delete payload.isBarber;

    try {
      const { data } = await axios.post("http://localhost:3000/users", payload);
      console.log("Resposta da API:", data);
      message.success("Usuário cadastrado com sucesso!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        message.error(
          "Erro ao cadastrar: " + (error.response?.data || error.message)
        );
      } else {
        console.error("Erro desconhecido:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Falha no formulário:", errorInfo);
    message.error(
      "Por favor, verifique os campos obrigatórios e tente novamente."
    );
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
          {/* Validação para nome: apenas letras, espaços, mínimo de 3 e máximo de 50 caracteres */}
          <Form.Item
            label={<span className="text-white">Nome</span>}
            name="name"
            rules={[
              { required: true, message: "Digite seu nome!" },
              { max: 50, message: "O nome deve ter no máximo 50 caracteres" },
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.reject(new Error());
                  }
                  const regex = /^[A-Za-zÀ-ÿ\s]+$/;
                  if (!regex.test(value)) {
                    return Promise.reject(
                      new Error("O nome deve conter apenas letras e espaços")
                    );
                  }
                  if (value.trim().length < 3) {
                    return Promise.reject(
                      new Error("O nome deve ter no mínimo 3 caracteres")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input size="large" placeholder="Digite seu Nome" maxLength={50} />
          </Form.Item>

          {/* Validação para email */}
          <Form.Item
            label={<span className="text-white">Email</span>}
            name="email"
            rules={[
              { required: true, message: "Digite seu email!" },
              { type: "email", message: "Digite um email válido!" },
              {
                max: 100,
                message: "O email deve ter no máximo 100 caracteres",
              },
            ]}
          >
            <Input size="large" placeholder="example@xxx.com" maxLength={100} />
          </Form.Item>

          {/* Validação para senha: mínimo 8, máximo 20 caracteres, 1 letra maiúscula e 1 número */}
          <Form.Item
            label={<span className="text-white">Senha</span>}
            name="password"
            rules={[
              { required: true, message: "Digite sua senha!" },
              { max: 20, message: "A senha deve ter no máximo 20 caracteres" },
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.reject(new Error());
                  }
                  if (value.length < 8) {
                    return Promise.reject(
                      new Error("A senha deve ter no mínimo 8 caracteres")
                    );
                  }
                  if (!/(?=.*[A-Z])/.test(value)) {
                    return Promise.reject(
                      new Error(
                        "A senha deve conter pelo menos uma letra maiúscula"
                      )
                    );
                  }
                  if (!/(?=.*\d)/.test(value)) {
                    return Promise.reject(
                      new Error("A senha deve conter pelo menos um número")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Password
              placeholder="Digite sua senha"
              size="large"
              maxLength={20}
            />
          </Form.Item>

          {/* Validação para confirmação da senha */}
          <Form.Item
            label={<span className="text-white">Confirme sua senha</span>}
            name="confirmPassword"
            rules={[
              { required: true, message: "Confirme sua senha!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("As senhas não coincidem!"));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Digite sua senha novamente"
              size="large"
              maxLength={20}
            />
          </Form.Item>

          {/* Validação para telefone: máximo 15 caracteres */}
          <Form.Item
            label={<span className="text-white">Telefone</span>}
            name="phone"
            rules={[
              { required: true, message: "Digite seu telefone!" },
              {
                max: 15,
                message: "O telefone deve ter no máximo 15 caracteres",
              },
            ]}
          >
            <Input placeholder="(xx)xxxxx-xxxx" size="large" maxLength={15} />
          </Form.Item>

          <Form.Item name="isBarber" valuePropName="checked">
            <Checkbox>
              <p className="text-white">Sou Barbeiro</p>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
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
