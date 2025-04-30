import { useState } from "react";
import ManagerTemplate from "../../components/template/ManagerTemplate";
import UserListScreen from "../../screens/userScreen/admin/UserListScreen";
import UserSearchScreen from "../../screens/userScreen/admin/UserSearchScreen";
import UserRolesScreen from "../../screens/userScreen/admin/UserRolesScreen";

function ContentArea() {
    const [searchText, setSearchText] = useState("");

    return (
        <>
            <div className="grid md:grid-cols-3 grid-cols-1 w-full">
                <div className="col-span-2">
                    <div className="w-full flex flex-col justify-between p-2">
                        <div className="flex-auto w-full">
                            <UserListScreen searchText={searchText} />
                        </div>
                    </div>
                </div>
                <div className="w-full">
                    <div className="w-full p-2">
                        <UserSearchScreen onSearch={setSearchText} />
                        <UserRolesScreen />
                    </div>
                </div>
            </div>
        </>
    )
}

const AuthManagerDashboard = () => {
    return (
        <ManagerTemplate>
            <ContentArea />
        </ManagerTemplate>
    )
}

export default AuthManagerDashboard;