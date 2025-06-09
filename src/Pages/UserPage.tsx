import UserProfile from "../components/UserProfile";
import UserShedule from "../components/UserShedule";

function UserPage() {
  return (
    <div className="bg-[#070707] lg:p-10 w-full ">
      <div className="lg:max-w-1/2 sm:max-w-full sm:mx-10 flex flex-col gap-10">
        <div className="">
          <UserShedule />
        </div>
        <UserProfile />
      </div>
    </div>
  );
}

export default UserPage;
