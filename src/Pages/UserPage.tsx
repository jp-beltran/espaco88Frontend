import UserProfile from "../components/UserProfile";
import UserShedule from "../components/UserShedule";

function UserPage() {
  return (
    <div className="bg-[#070707] lg:p-10 w-full ">
      <div className="max-w-1/2 flex flex-col gap-10">
        <div className="bg-red-500 w-full h-50">
          <UserShedule />
        </div>
        <UserProfile />
      </div>
    </div>
  );
}

export default UserPage;
