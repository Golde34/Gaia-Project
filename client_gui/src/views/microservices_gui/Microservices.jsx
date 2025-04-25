import { useDispatch, useSelector } from "react-redux";
import ManagerTemplate from "../../components/template/ManagerTemplate";
import { useCallback, useEffect, useRef } from "react";
import { getMicroservices } from "../../api/store/actions/middleware_loader/microservices.actions";
import { Card, Col, Flex, Grid, Metric, Title } from "@tremor/react";
import { useNavigate } from "react-router-dom";
import { isAccessTokenCookieValid } from "../../kernels/utils/cookie-utils";

function ContentArea() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isUserValid = isAccessTokenCookieValid();
    useEffect(() => {
        if (isUserValid) {
            navigate('/signin');
        }
    }, [isUserValid, navigate]);

    const listMicroservices = useSelector((state) => state.microserviceList);
    const { loading, error, microservices } = listMicroservices;

    const getListMicroservice = useCallback(() => {
        dispatch(getMicroservices());
    }, [dispatch]);

    const debounceRef = useRef(null);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            getListMicroservice();
        }, 200);

    }, []);

    return (
        <div>
            {loading ? (
                <p> Loading</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <>
                    <Metric style={{ marginBottom: '30px', marginTop: '30px' }}
                        className="text-2xl font-bold text-gray-800"> Microservices
                    </Metric>
                    <div className="grid md:grid-cols-3 w-full h-full items-center">
                        {microservices === null ? (
                            <p>No microservices available</p>
                        ) : (
                            microservices.map((microservice) => (
                                <div key={microservice.id} className="m-3">
                                    <Card className="w-xs hover:cursor-pointer transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 duration-300"
                                        decoration="top" decorationColor={microservice.status ? "green" : "red"}
                                    >
                                        <Flex justifyContent="between" alignItems="center">
                                            <Grid numItems={1} className="text-white">
                                                <Col numColSpan={1}><Title>{microservice.microserviceName}</Title></Col>
                                                <Col numColSpan={1}>Status: {microservice.status ? "ACTIVE" : "INACTIVE"}</Col>
                                                <Col numColSpan={1}>Instance: 1</Col>
                                                <Col numColSpan={1}>Port: {microservice.port}</Col>
                                                <Col numColSpan={1}>Last edited: {microservice.createdAt}</Col>
                                            </Grid>
                                        </Flex>
                                    </Card>
                                </div>
                            )))}
                    </div>
                </>
            )}
        </div>
    )
}

const Microservices = () => {
    return (
        <ManagerTemplate>
            <ContentArea />
        </ManagerTemplate>
    )
}

export default Microservices;