import React, { useEffect, useRef, useState } from "react";
import { Title } from "@tremor/react";
import { ContributionCalendar, createTheme } from 'react-contribution-calendar';

const customTheme = createTheme({
    level0: '#20263c',
    level1: '#23525D',
    level2: '#277D7E',
    level3: '#2AA99E',
    level4: '#2dd4bf',
});

const AreaChartComponent = (props) => {
    const contributions = props.contributions;
    const [calendarSize, setCalendarSize] = useState({
        cx: 12,
        cy: 12,
        cr: 5,
    });

    useEffect(() => {
        function handleResize() {
            const width = window.innerWidth;
            if (width >= 1920) {
                setCalendarSize({
                    cx: 17,
                    cy: 17,
                    cr: 9,
                });
            } else if (width >= 1600) {
                setCalendarSize({
                    cx: 14,
                    cy: 14,
                    cr: 5,
                });
            } else if (width >= 1366) {
                setCalendarSize({
                    cx: 11,
                    cy: 11,
                    cr: 5,
                });
            } else if (width >= 768) {
                setCalendarSize({
                    cx: 6,
                    cy: 6,
                    cr: 5,
                });
            }
        }

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
        };

    }, []);

    return (
        <>
            <Title>Total {contributions.userTotalCommits} contributions</Title>
            <div className="dark">
                <ContributionCalendar
                    start={contributions.startDate}
                    end={contributions.endDate}
                    theme={customTheme}
                    textColor="#4b5364"
                    data={contributions.userCommits}
                    daysOfTheWeek={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
                    includeBoundary={false}
                    startsOnSunday={true}
                    cx={calendarSize.cx}
                    cy={calendarSize.cy}
                    cr={calendarSize.cr}
                    // theme="purquoise"
                    onCellClick={(_, data) => console.log(data)}
                    scroll={false}
                />
            </div>
        </>
    );
};

export default AreaChartComponent;