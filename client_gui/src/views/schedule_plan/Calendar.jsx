import Template from "../../components/template/Template";
import { useState } from "react";
import '@fullcalendar/react/dist/vdom';
import FullCalendar, { formatDate } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
    Box,
    List,
    ListItem,
    ListItemText,
    Typography,
} from "@mui/material";
import { tokens } from "../../kernels/utils/theme";
import "./calendar-custom-color.css";
import { Card, Metric } from "@tremor/react";

function ContentArea() {
    const colors = tokens("dark");
    const [currentEvents, setCurrentEvents] = useState([]);

    const handleDateClick = (selected) => {
        const title = prompt("Please enter a new title for your event");
        const calendarApi = selected.view.calendar;
        calendarApi.unselect();

        if (title) {
            calendarApi.addEvent({
                id: `${selected.dateStr}-${title}`,
                title,
                start: selected.startStr,
                end: selected.endStr,
                allDay: selected.allDay,
            });
        }
    };

    const handleEventClick = (selected) => {
        if (
            window.confirm(
                `Are you sure you want to delete the event '${selected.event.title}'`
            )
        ) {
            selected.event.remove();
        }
    };

    return (
        <>
            <Metric style={{ marginBottom: '30px', marginTop: '30px' }}
                className="text-2xl font-bold text-gray-800"> Calendar
            </Metric>
            <Card>
                <Box m="20px">
                    <Box display="flex" justifyContent="space-between">
                        {/* CALENDAR SIDEBAR */}
                        <Box
                            flex="1 1 20%"
                            backgroundColor={colors.primary[400]}
                            p="15px"
                            borderRadius="4px"
                        >
                            <Typography variant="h5" className="text-white">Today Events</Typography>
                            <List>
                                {currentEvents
                                    .filter((event) => new Date(event.start) >= new Date())
                                    .map((event) => (
                                        <ListItem
                                            key={event.id}
                                            sx={{
                                                backgroundColor: colors.greenAccent[500],
                                                margin: "10px 0",
                                                borderRadius: "2px",
                                            }}
                                        >
                                            <ListItemText
                                                primary={event.title}
                                                secondary={
                                                    <Typography>
                                                        {formatDate(event.start, {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        })}
                                                    </Typography>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                            </List>
                        </Box>

                        {/* CALENDAR */}
                        <Box flex="1 1 100%" ml="15px" className="text-white">
                            <FullCalendar
                                height="75vh"
                                plugins={[
                                    dayGridPlugin,
                                    timeGridPlugin,
                                    interactionPlugin,
                                    listPlugin,
                                ]}
                                headerToolbar={{
                                    left: "prev,next today",
                                    center: "title",
                                    right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
                                }}
                                initialView="dayGridMonth"
                                editable={true}
                                selectable={true}
                                selectMirror={true}
                                dayMaxEvents={true}
                                select={handleDateClick}
                                eventClick={handleEventClick}
                                eventsSet={(events) => setCurrentEvents(events)}
                            // initialEvents={[
                            //     {
                            //         id: "12315",
                            //         title: "All-day event",
                            //         date: "2022-09-14",
                            //     },
                            //     {
                            //         id: "5123",
                            //         title: "Timed event",
                            //         date: "2022-09-28",
                            //     },
                            // ]}
                            />
                        </Box>
                    </Box>
                </Box>
            </Card >
        </>
    );
};

const Calendar = () => {
    return (
        <Template>
            <ContentArea />
        </Template>
    )
}

export default Calendar;
