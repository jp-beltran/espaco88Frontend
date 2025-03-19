import { ConfigProvider } from "antd";
import { RouterProvider } from "react-router-dom";
import router from "./Routes/routes";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#F6DA5E", // Define a cor primária globalmente
        },
        components: {
          Input: {
            controlHeightLG: 56, // altura (3.5rem)
            controlPaddingHorizontal: 16,
          },
          Button: {
            controlHeightLG: 56, // altura (3.5rem)
            controlPaddingHorizontal: 16,
          },
        },
      }}
    >
      <div>
        <RouterProvider router={router} />
      </div>
    </ConfigProvider>
  );
}

export default App;
