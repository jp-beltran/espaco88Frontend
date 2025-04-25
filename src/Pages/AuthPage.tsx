import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoginComponent from "../components/LoginComponent";
import RegisterComponent from "../components/RegisterComponent";
import backgroundAuth from "../assets/bg.gif";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleAuth = () => setIsLogin((prev) => !prev);

  const imageVariants = {
    login: { x: "100%" },
    register: { x: "0%" },
  };

  const formVariants = {
    initialLeft: { x: "-100%", opacity: 0 },
    animateCenter: { x: "0%", opacity: 1 },
    exitLeft: { x: "-100%", opacity: 0 },
    initialRight: { x: "100%", opacity: 0 },
    exitRight: { x: "100%", opacity: 0 },
  };

  return (
    <div className="relative w-full h-screen bg-[#232225] overflow-hidden flex items-center justify-center">
      {/* Imagem animada - apenas visível em telas grandes */}
      <motion.div
        className="hidden lg:block absolute top-0 left-0 w-1/2 h-full z-0"
        variants={imageVariants}
        animate={isLogin ? "login" : "register"}
        transition={{ duration: 0.5 }}
      >
        <img
          src={backgroundAuth}
          alt="Background"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Formulários */}
      <div className="relative z-10 flex w-full h-full flex-col lg:flex-row">
        {/* Login */}
        <div className="w-full lg:w-1/2  flex items-center justify-center ">
          <AnimatePresence mode="wait">
            {isLogin && (
              <motion.div
                key="login"
                variants={formVariants}
                initial="initialLeft"
                animate="animateCenter"
                exit="exitLeft"
                transition={{ duration: 0.5 }}
                className="w-full h-full flex items-center justify-center"
              >
                <LoginComponent onSwitchToRegister={toggleAuth} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Register */}
        <div className="w-full lg:w-1/2  flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                key="register"
                variants={formVariants}
                initial="initialRight"
                animate="animateCenter"
                exit="exitRight"
                transition={{ duration: 0.5 }}
                className="w-full h-full flex items-center justify-center"
              >
                <RegisterComponent onSwitchToLogin={toggleAuth} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
