import RegisterComponent from "../components/RegisterComponent";
import background from "../assets/bg.png";
import logo from "../assets/logo.png";

function RegisterPage() {
  return (
    <div className="bg-[#232225] h-screen flex flex-row-reverse ">
      <div className="w-1/2 h-full overflow-auto py-10">
        <div className="pr-70 flex justify-end">
          <img src={logo} alt="" className="" />
        </div>
        <RegisterComponent />
      </div>

      <div className="w-1/2 h-full">
        <img src={background} alt="" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}

export default RegisterPage;
