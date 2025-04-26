import React, { useCallback, useEffect, useRef, useState } from 'react';
import Template from '../../components/template/Template';
import CardItem from '../../components/subComponents/CardItem';
import dayjs from 'dayjs';
import { Button, Card, Col, Dialog, DialogPanel, Flex, Grid, Metric, Subtitle, Text } from '@tremor/react';
import { useDispatch, useSelector } from 'react-redux';
import { getScheduleTaskBatchList, getScheduleTaskList } from '../../api/store/actions/schedule_plan/schedule-task.action';
import MessageBox from '../../components/subComponents/MessageBox';
import TaskBatchScreen from '../../screens/scheduleTaskScreen/TaskBatchScreen';
import CalendarChart from '../../screens/scheduleTaskScreen/CalendarChart';
import { ScheduleGroups } from '../../screens/scheduleTaskScreen/ScheduleGroups';
import { useNavigate } from 'react-router-dom';
import { isAccessTokenCookieValid } from '../../kernels/utils/cookie-utils';

function ContentArea() {
    const userId = "1";
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isUserValid = isAccessTokenCookieValid();
    useEffect(() => {
        if (isUserValid) {
            navigate('/signin');
        }
    }, [isUserValid, navigate]);

    const currentDate = dayjs();
    const [selectDate, setSelectDate] = useState(currentDate);

    const listScheduleTasks = useSelector(state => state.scheduleTaskList);
    const { loading, error, scheduleTasks } = listScheduleTasks;

    const getListScheduleTasks = useCallback(() => {
        dispatch(getScheduleTaskList(userId));
    }, [dispatch, userId]);

    const debounceRef = useRef(null);
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            getListScheduleTasks();
        }, 200);
    }, [])

    let [isOpen, setIsOpen] = useState(false);
    function closeModal() {
        setIsOpen(false);
    }
    function openModal() {
        setIsOpen(true);
    }
    const checkEmptyTaskListAndOpenModal = () => {
        if (scheduleTasks.length === 0) {
            setIsOpen(true);
            dispatch(getScheduleTaskBatchList(userId))
                .then((batchList) => {
                    setTaskBatchList(batchList);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    };
    useEffect(() => {
        if (!loading && !error && scheduleTasks.length === 0) {
            setIsOpen(true);
            dispatch(getScheduleTaskBatchList(userId))
                .then((batchList) => {
                    setTaskBatchList(batchList);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }, [loading, error, scheduleTasks]);

    const [taskBatchList, setTaskBatchList] = useState({});

    const chooseTaskBatch = () => {
        return () => {
            openModal();
            dispatch(getScheduleTaskBatchList(userId))
                .then((batchList) => {
                    setTaskBatchList(batchList);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }

    return (
        <>
            {loading ? (
                <Text>Loading...</Text>
            ) : error ? (
                <MessageBox message={error} />
            ) : (
                <>
                    <Metric style={{ marginBottom: '30px', marginTop: '30px' }}
                        className="text-2xl font-bold text-gray-800"> Schedule Calendar
                    </Metric>
                    <Card className='mb-4'>
                        <div className="flex gap-10 sm:divide-x justify-center mt-10">
                            <CalendarChart currentDate={currentDate} selectDate={selectDate}
                                checkEmptyScheduleTaskList={checkEmptyTaskListAndOpenModal}
                            />
                            <div className="w-full sm:px-5">
                                <Grid numItems={2}>
                                    <Col numColSpan={1}>
                                        <Flex justifyContent="start">
                                            <h1 className=" font-semibold text-white mt-2 mb-10">
                                                Schedule for {selectDate.toDate().toDateString()}
                                            </h1>
                                        </Flex>
                                    </Col>
                                    <Col numColSpan={1}>
                                        <Flex justifyContent='end'>
                                            <Button type='button' className="col-span-5 mb-10"
                                                color='indigo' onClick={chooseTaskBatch()}>
                                                Choose the Task Batch
                                            </Button>
                                        </Flex>
                                    </Col>
                                </Grid>
                                {
                                    scheduleTasks.length === 0 && (
                                        <Text className="text-center text-white">No task found</Text>
                                    )
                                }
                                {scheduleTasks.map((task, index) => (
                                    <CardItem key={index} task={task} taskId={task.taskId} />
                                ))}

                            </div>
                        </div>
                    </Card>
                    <ScheduleGroups />    

                    <Dialog
                        open={isOpen}
                        onClose={() => closeModal()}
                        static={true}
                        className="z-[100]"
                    >
                        <DialogPanel className="w-full max-w-7xl">
                            <div className="absolute right-0 top-0 pr-3 pt-3">
                                <button
                                    type="button"
                                    className="rounded-tremor-small p-2 text-tremor-content-subtle hover:bg-tremor-background-subtle hover:text-tremor-content dark:text-dark-tremor-content-subtle hover:dark:bg-dark-tremor-background-subtle hover:dark:text-tremor-content"
                                    onClick={() => closeModal()}
                                    aria-label="Close"
                                >
                                </button>
                            </div>
                            <TaskBatchScreen taskBatchList={taskBatchList} />
                        </DialogPanel>
                    </Dialog>
                </>
            )}
        </>
    );
};

const SchedulingTable = () => {
    return (
        <Template>
            <ContentArea />
        </Template>
    )
}

export default SchedulingTable;
