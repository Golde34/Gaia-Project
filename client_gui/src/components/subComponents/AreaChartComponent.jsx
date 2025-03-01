import React, { useEffect, useRef, useState } from "react";
import { Card, Title, AreaChart } from "@tremor/react";
import { ContributionCalendar, createTheme } from 'react-contribution-calendar';
import { useDispatch, useSelector } from "react-redux";
import MessageBox from "./MessageBox";
import { getUserContributions } from "../../api/store/actions/contribution_tracker/contribution.actions";

const chartdata = [
  {
    date: "Jan 22",
    SemiAnalysis: 2890,
    "The Pragmatic Engineer": 2338,
  },
  {
    date: "Feb 22",
    SemiAnalysis: 2756,
    "The Pragmatic Engineer": 2103,
  },
  {
    date: "Mar 22",
    SemiAnalysis: 3322,
    "The Pragmatic Engineer": 2194,
  },
  {
    date: "Apr 22",
    SemiAnalysis: 3470,
    "The Pragmatic Engineer": 2108,
  },
  {
    date: "May 22",
    SemiAnalysis: 3475,
    "The Pragmatic Engineer": 1812,
  },
  {
    date: "Jun 22",
    SemiAnalysis: 3129,
    "The Pragmatic Engineer": 1726,
  },
];

const dataFormatter = (number) => {
  return "$ " + Intl.NumberFormat("us").format(number).toString();
};

const customTheme = createTheme({
  level0: '#20263c',
  level1: '#23525D',
  level2: '#277D7E',
  level3: '#2AA99E',
  level4: '#2dd4bf',
});

const AreaChartComponent = () => {
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

  const userId = "1";
  const dispatch = useDispatch();

  const userContributionList = useSelector((state) => state.userContributions);
  const { loading, error, contributions } = userContributionList;

  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch(getUserContributions(userId));
    }, 200);
  }, [])

  return (
    <>
      <Card className="mb-4">
        <Title>Newsletter revenue over time (USD)</Title>
        <AreaChart
          className="h-72 mt-4"
          data={chartdata}
          index="date"
          categories={["SemiAnalysis", "The Pragmatic Engineer"]}
          colors={["indigo", "cyan"]}
          valueFormatter={dataFormatter}
        />
      </Card>
      <div>
        {loading ? (
          <p> Loading... </p>
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Card>
            <Title>Total {contributions.totalUserCommits} contributions</Title>
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
          </Card>
        )}

      </div>
    </>
  );
};

export default AreaChartComponent;