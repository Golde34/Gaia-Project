import React, { useEffect, useState } from "react";
import { Card, Title, AreaChart } from "@tremor/react";
import { ContributionCalendar, createTheme } from 'react-contribution-calendar';
import { generateDataInRange } from "../../kernels/utils/date";

const data = [
  {
    '2025-04-20': { level: 2 }
  },
  {
    '2025-07-08': { level: 1 },
  },
  {
    '2025-07-09': { level: 4, data: {} },
  },
  {
    '2025-03-31': {
      level: 3,
      data: {
        myKey: 'my data',
      },
    },
  },
]

const data2 = {
  "userCommits": [
    {
      "2025-02-24": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2025-02-23": {
        "level": 2,
        "commitCount": 7
      }
    },
    {
      "2025-02-22": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2025-02-21": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2025-02-19": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2025-02-18": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2025-02-17": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2025-02-16": {
        "level": 2,
        "commitCount": 9
      }
    },
    {
      "2025-02-15": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2025-02-14": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2025-02-13": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2025-02-11": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2025-02-09": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2025-02-08": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2025-02-07": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2025-02-06": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2025-02-05": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2025-02-04": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2025-02-03": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2025-02-02": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2025-02-01": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2025-01-31": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2025-01-30": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2025-01-29": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2025-01-28": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2025-01-27": {
        "level": 2,
        "commitCount": 8
      }
    },
    {
      "2025-01-25": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2025-01-24": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2025-01-23": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2025-01-22": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2025-01-21": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2025-01-20": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2025-01-19": {
        "level": 2,
        "commitCount": 8
      }
    },
    {
      "2025-01-18": {
        "level": 3,
        "commitCount": 10
      }
    },
    {
      "2025-01-17": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2025-01-15": {
        "level": 4,
        "commitCount": 15
      }
    },
    {
      "2025-01-14": {
        "level": 2,
        "commitCount": 7
      }
    },
    {
      "2025-01-13": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2025-01-12": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2025-01-11": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2025-01-10": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2025-01-09": {
        "level": 2,
        "commitCount": 7
      }
    },
    {
      "2025-01-08": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2025-01-07": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2025-01-06": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2025-01-05": {
        "level": 4,
        "commitCount": 16
      }
    },
    {
      "2025-01-04": {
        "level": 4,
        "commitCount": 23
      }
    },
    {
      "2025-01-03": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2025-01-02": {
        "level": 2,
        "commitCount": 7
      }
    },
    {
      "2025-01-01": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2024-12-31": {
        "level": 2,
        "commitCount": 9
      }
    },
    {
      "2024-12-30": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-12-29": {
        "level": 4,
        "commitCount": 16
      }
    },
    {
      "2024-12-28": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2024-12-26": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-12-25": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-12-24": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-12-23": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-12-18": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-12-17": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-12-16": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-12-15": {
        "level": 2,
        "commitCount": 8
      }
    },
    {
      "2024-12-14": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-12-13": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2024-12-12": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2024-12-11": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2024-12-10": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-12-09": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2024-12-08": {
        "level": 4,
        "commitCount": 14
      }
    },
    {
      "2024-12-07": {
        "level": 2,
        "commitCount": 9
      }
    },
    {
      "2024-12-06": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2024-12-05": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-12-04": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-12-03": {
        "level": 3,
        "commitCount": 10
      }
    },
    {
      "2024-12-02": {
        "level": 2,
        "commitCount": 9
      }
    },
    {
      "2024-12-01": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-11-30": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-11-29": {
        "level": 2,
        "commitCount": 7
      }
    },
    {
      "2024-11-28": {
        "level": 3,
        "commitCount": 12
      }
    },
    {
      "2024-11-27": {
        "level": 2,
        "commitCount": 9
      }
    },
    {
      "2024-11-26": {
        "level": 2,
        "commitCount": 9
      }
    },
    {
      "2024-11-25": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2024-11-24": {
        "level": 2,
        "commitCount": 9
      }
    },
    {
      "2024-11-23": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2024-11-22": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-11-21": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-11-20": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-11-18": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-11-17": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-11-16": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2024-11-15": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-11-14": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-11-13": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2024-11-12": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-11-11": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2024-11-10": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-11-09": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-11-08": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-11-07": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-11-06": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-11-05": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-11-04": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2024-11-03": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2024-11-02": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-11-01": {
        "level": 3,
        "commitCount": 12
      }
    },
    {
      "2024-10-31": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-10-30": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-10-29": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2024-10-28": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-10-27": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-10-26": {
        "level": 4,
        "commitCount": 28
      }
    },
    {
      "2024-10-25": {
        "level": 4,
        "commitCount": 15
      }
    },
    {
      "2024-10-24": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2024-10-23": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2024-10-22": {
        "level": 3,
        "commitCount": 11
      }
    },
    {
      "2024-10-21": {
        "level": 2,
        "commitCount": 7
      }
    },
    {
      "2024-10-20": {
        "level": 3,
        "commitCount": 12
      }
    },
    {
      "2024-10-19": {
        "level": 4,
        "commitCount": 21
      }
    },
    {
      "2024-10-18": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-10-17": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-10-16": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-10-15": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-10-14": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-10-13": {
        "level": 2,
        "commitCount": 9
      }
    },
    {
      "2024-10-12": {
        "level": 4,
        "commitCount": 17
      }
    },
    {
      "2024-10-11": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-10-10": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-10-09": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-10-08": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2024-10-07": {
        "level": 2,
        "commitCount": 9
      }
    },
    {
      "2024-10-06": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-10-05": {
        "level": 2,
        "commitCount": 7
      }
    },
    {
      "2024-10-04": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-10-03": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2024-10-02": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2024-10-01": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-09-30": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-09-29": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-09-28": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-09-27": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-09-26": {
        "level": 2,
        "commitCount": 7
      }
    },
    {
      "2024-09-25": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-09-24": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2024-09-23": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2024-09-22": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-09-21": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-09-20": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-09-19": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-09-18": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2024-09-17": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2024-09-16": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-09-15": {
        "level": 4,
        "commitCount": 16
      }
    },
    {
      "2024-09-14": {
        "level": 4,
        "commitCount": 14
      }
    },
    {
      "2024-09-12": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2024-09-11": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-09-10": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-09-09": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2024-09-08": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-09-07": {
        "level": 2,
        "commitCount": 7
      }
    },
    {
      "2024-09-06": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2024-09-05": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2024-09-04": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-09-03": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2024-09-02": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-09-01": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-08-31": {
        "level": 2,
        "commitCount": 7
      }
    },
    {
      "2024-08-30": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2024-08-29": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-08-28": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-08-27": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-08-25": {
        "level": 2,
        "commitCount": 7
      }
    },
    {
      "2024-08-24": {
        "level": 2,
        "commitCount": 7
      }
    },
    {
      "2024-08-23": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-08-22": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-08-21": {
        "level": 3,
        "commitCount": 13
      }
    },
    {
      "2024-08-20": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-08-19": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2024-08-18": {
        "level": 2,
        "commitCount": 9
      }
    },
    {
      "2024-08-17": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-08-16": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-08-15": {
        "level": 2,
        "commitCount": 7
      }
    },
    {
      "2024-08-14": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-08-13": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2024-08-12": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-08-11": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-08-10": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-08-09": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2024-08-08": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2024-08-07": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-08-06": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-08-05": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2024-08-04": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2024-08-03": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2024-08-02": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-08-01": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-07-31": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-07-30": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-07-29": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2024-07-28": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-07-27": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-07-26": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-07-25": {
        "level": 2,
        "commitCount": 7
      }
    },
    {
      "2024-07-24": {
        "level": 3,
        "commitCount": 11
      }
    },
    {
      "2024-07-23": {
        "level": 2,
        "commitCount": 7
      }
    },
    {
      "2024-07-22": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2024-07-21": {
        "level": 4,
        "commitCount": 14
      }
    },
    {
      "2024-07-20": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-07-19": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-07-18": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-07-17": {
        "level": 2,
        "commitCount": 9
      }
    },
    {
      "2024-07-16": {
        "level": 2,
        "commitCount": 9
      }
    },
    {
      "2024-07-15": {
        "level": 2,
        "commitCount": 7
      }
    },
    {
      "2024-07-14": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2024-07-13": {
        "level": 2,
        "commitCount": 7
      }
    },
    {
      "2024-07-12": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-07-11": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-07-10": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-07-09": {
        "level": 2,
        "commitCount": 8
      }
    },
    {
      "2024-07-08": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-07-07": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2024-07-06": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2024-07-05": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-07-04": {
        "level": 3,
        "commitCount": 10
      }
    },
    {
      "2024-07-03": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2024-07-02": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2024-07-01": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-06-30": {
        "level": 2,
        "commitCount": 7
      }
    },
    {
      "2024-06-29": {
        "level": 4,
        "commitCount": 14
      }
    },
    {
      "2024-06-28": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-06-26": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-06-24": {
        "level": 3,
        "commitCount": 13
      }
    },
    {
      "2024-06-23": {
        "level": 3,
        "commitCount": 10
      }
    },
    {
      "2024-06-22": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-06-21": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-06-20": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-06-19": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2024-06-18": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-06-17": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-06-16": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-06-14": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-06-13": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-06-12": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-06-11": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-06-10": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-06-09": {
        "level": 2,
        "commitCount": 9
      }
    },
    {
      "2024-06-07": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-06-05": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-06-04": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-06-03": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2024-06-02": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-06-01": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-05-29": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-05-28": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-05-27": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2024-05-26": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-05-25": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2024-05-24": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-05-22": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-05-21": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-05-20": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-05-19": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-05-18": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-05-17": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-05-16": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-05-15": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-05-14": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2024-05-13": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-05-12": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-05-11": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2024-05-10": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2024-05-09": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-05-07": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-05-06": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2024-05-05": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-05-04": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2024-05-03": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2024-05-02": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-05-01": {
        "level": 2,
        "commitCount": 9
      }
    },
    {
      "2024-04-30": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-04-29": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-04-28": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-04-27": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-04-26": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2024-04-25": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-04-24": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-04-23": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2024-04-21": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-04-20": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-04-19": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-04-18": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2024-04-17": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-04-15": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-04-14": {
        "level": 2,
        "commitCount": 7
      }
    },
    {
      "2024-04-13": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-04-12": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-04-11": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-04-10": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-04-09": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-04-08": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-04-07": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-04-06": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2024-04-05": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-04-04": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-04-01": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2024-03-31": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-03-30": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-03-29": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-03-28": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2024-03-27": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-03-25": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-03-24": {
        "level": 3,
        "commitCount": 12
      }
    },
    {
      "2024-03-23": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-03-20": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2024-03-19": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-03-18": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-03-17": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-03-16": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-03-15": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-03-14": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-03-13": {
        "level": 4,
        "commitCount": 15
      }
    },
    {
      "2024-03-12": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-03-11": {
        "level": 2,
        "commitCount": 6
      }
    },
    {
      "2024-03-10": {
        "level": 2,
        "commitCount": 5
      }
    },
    {
      "2024-03-09": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-03-08": {
        "level": 0,
        "commitCount": 0
      }
    },
    {
      "2024-03-07": {
        "level": 1,
        "commitCount": 3
      }
    },
    {
      "2024-03-06": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-03-05": {
        "level": 1,
        "commitCount": 4
      }
    },
    {
      "2024-03-04": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-03-03": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-03-02": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-03-01": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-02-29": {
        "level": 1,
        "commitCount": 2
      }
    },
    {
      "2024-02-28": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-02-26": {
        "level": 1,
        "commitCount": 1
      }
    },
    {
      "2024-02-25": {
        "level": 1,
        "commitCount": 1
      }
    }
  ],
  "userTotalCommits": null,
  "startDate": "2024-02-25",
  "endDate": "2025-02-24"
}

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
    // Gọi 1 lần khi mount để thiết lập ngay từ đầu
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };

  }, []);
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

      <Card>
        <Title>Total 4669 contributions</Title>
        <div className="dark">
          <ContributionCalendar
            start={data2.startDate}
            end={data2.endDate}
            theme={customTheme}
            textColor="#4b5364"
            data={data2.userCommits}
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
    </>
  );
};

export default AreaChartComponent;