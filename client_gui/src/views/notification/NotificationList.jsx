import Template from "../../components/template/Template";
import { Card, Flex, Text, Title } from "@tremor/react";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useRef } from "react";
import { getNotificationList } from "../../api/store/actions/middleware_loader/notification.actions";
import MessageBox from "../../components/subComponents/MessageBox";

function ContentArea() {
    const dispatch = useDispatch();

    const notificationList = useSelector((state) => state.notificationList);
    const { loading, error, notifications } = notificationList;

    const fetchNotifications = useCallback(() => {
        dispatch(getNotificationList());
    }, [dispatch]);

    const debounceRef = useRef(null);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchNotifications();
        }, 200);
        return () => clearTimeout(debounceRef.current);
    }, [fetchNotifications]);

    return (
        <div>
            {loading ? (
                <Text>Loading...</Text>
            ) : error ? (
                <MessageBox message={error} />
            ) : (
                <>
                    <Flex className="mt-10" justifyContent="center">
                        <Title className="text-2xl font-bold text-gray-800">Notifications</Title>
                    </Flex>
                    {notifications.length === 0 ? (
                        <Text className="mt-5">No Notifications</Text>
                    ) : (
                        notifications.map((noti) => (
                            <div className="ms-20 me-20">
                                <Card key={noti.id || noti.notification_flow_id} className="mt-5">
                                    <Text>{noti.content}</Text>
                                </Card>
                            </div>
                        ))
                    )}
                </>
            )}
        </div>
    );
}

const NotificationList = () => {
    return (
        <Template>
            <ContentArea />
        </Template>
    );
};

export default NotificationList;
