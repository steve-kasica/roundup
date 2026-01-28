export const state = {
  ui: {
    hoveredColumnIds: [],
    selectedColumnIds: [],
    focusedColumnIds: [],
    visibleColumnIds: [],
    hiddenColumnIds: [],
    draggingColumnIds: [],
    dropTargetColumnIds: [],
    focusedObjectId: "o3",
    selectedTableIds: [],
    loadingOperations: [],
    selectedMatches: [],
    tableSearchString: "",
  },
  operations: {
    allIds: ["o1", "o2", "o3"],
    byId: {
      o1: {
        id: "o1",
        name: null,
        databaseName: "o__eh4mf9_mkxyxef4",
        operationType: "stack",
        parentId: "o2",
        childIds: ["t1", "t2"],
        columnIds: ["c66", "c67", "c68", "c69", "c70"],
        hiddenColumnIds: [],
        rowCount: 150149,
        isMaterialized: true,
        isInSync: true,
        columnCount: 5,
      },
      o2: {
        id: "o2",
        name: null,
        databaseName: "o__t13lao_mkxyxnt0",
        operationType: "stack",
        parentId: "o3",
        childIds: ["o1", "t3", "t4", "t5", "t6"],
        columnIds: ["c76", "c77", "c78", "c79", "c80"],
        hiddenColumnIds: [],
        rowCount: 544091,
        isMaterialized: true,
        isInSync: true,
        columnCount: 5,
      },
      o3: {
        id: "o3",
        name: null,
        databaseName: "o__rf4tek_mkxyy5bk",
        operationType: "stack",
        parentId: null,
        childIds: ["o2", "t7", "t8"],
        columnIds: ["c81", "c82", "c83", "c84", "c85"],
        hiddenColumnIds: [],
        rowCount: 1006842,
        isMaterialized: true,
        isInSync: true,
        columnCount: 5,
      },
    },
    rootOperationId: "o3",
  },
  tables: {
    allIds: [
      "t1",
      "t2",
      "t3",
      "t4",
      "t5",
      "t6",
      "t7",
      "t8",
      "t9",
      "t10",
      "t11",
      "t12",
      "t13",
    ],
    byId: {
      t1: {
        id: "t1",
        parentId: "o1",
        source: "file upload",
        databaseName: "t_fqgw3u_mkxyxagt",
        name: "WY",
        fileName: "WY.csv",
        extension: "csv",
        size: 551969,
        mimeType: "text/csv",
        dateLastModified: 1734979618885,
        columnIds: ["c1", "c2", "c3", "c4", "c5"],
        rowCount: 28751,
        hiddenColumnIds: [],
      },
      t2: {
        id: "t2",
        parentId: "o1",
        source: "file upload",
        databaseName: "t_gm932f_mkxyxalq",
        name: "WI",
        fileName: "WI.csv",
        extension: "csv",
        size: 2375527,
        mimeType: "text/csv",
        dateLastModified: 1734979618788,
        columnIds: ["c6", "c7", "c8", "c9", "c10"],
        rowCount: 121398,
        hiddenColumnIds: [],
      },
      t3: {
        id: "t3",
        parentId: "o2",
        source: "file upload",
        databaseName: "t_vvgxvx_mkxyxap4",
        name: "WV",
        fileName: "WV.csv",
        extension: "csv",
        size: 1541998,
        mimeType: "text/csv",
        dateLastModified: 1734979618629,
        columnIds: ["c11", "c12", "c13", "c14", "c15"],
        rowCount: 79250,
        hiddenColumnIds: [],
      },
      t4: {
        id: "t4",
        parentId: "o2",
        source: "file upload",
        databaseName: "t_iabbal_mkxyxari",
        name: "WA",
        fileName: "WA.csv",
        extension: "csv",
        size: 2548066,
        mimeType: "text/csv",
        dateLastModified: 1734979618509,
        columnIds: ["c16", "c17", "c18", "c19", "c20"],
        rowCount: 130809,
        hiddenColumnIds: [],
      },
      t5: {
        id: "t5",
        parentId: "o2",
        source: "file upload",
        databaseName: "t_sacb9s_mkxyxaun",
        name: "VA",
        fileName: "VA.csv",
        extension: "csv",
        size: 3026560,
        mimeType: "text/csv",
        dateLastModified: 1734979618365,
        columnIds: ["c21", "c22", "c23", "c24", "c25"],
        rowCount: 154400,
        hiddenColumnIds: [],
      },
      t6: {
        id: "t6",
        parentId: "o2",
        source: "file upload",
        databaseName: "t_pct9vu_mkxyxay6",
        name: "VT",
        fileName: "VT.csv",
        extension: "csv",
        size: 573634,
        mimeType: "text/csv",
        dateLastModified: 1734979618227,
        columnIds: ["c26", "c27", "c28", "c29", "c30"],
        rowCount: 29483,
        hiddenColumnIds: [],
      },
      t7: {
        id: "t7",
        parentId: "o3",
        source: "file upload",
        databaseName: "t_nn1ejy_mkxyxazo",
        name: "UT",
        fileName: "UT.csv",
        extension: "csv",
        size: 1813197,
        mimeType: "text/csv",
        dateLastModified: 1734979618120,
        columnIds: ["c31", "c32", "c33", "c34", "c35"],
        rowCount: 93764,
        hiddenColumnIds: [],
      },
      t8: {
        id: "t8",
        parentId: "o3",
        source: "file upload",
        databaseName: "t_xwt9hd_mkxyxb2l",
        name: "TX",
        fileName: "TX.csv",
        extension: "csv",
        size: 7290537,
        mimeType: "text/csv",
        dateLastModified: 1734979617999,
        columnIds: ["c36", "c37", "c38", "c39", "c40"],
        rowCount: 368987,
        hiddenColumnIds: [],
      },
      t9: {
        id: "t9",
        parentId: null,
        source: "file upload",
        databaseName: "t_9q0v9f_mkxyxb9n",
        name: "TN",
        fileName: "TN.csv",
        extension: "csv",
        size: 2878655,
        mimeType: "text/csv",
        dateLastModified: 1734979617745,
        columnIds: ["c41", "c42", "c43", "c44", "c45"],
        rowCount: 147212,
        hiddenColumnIds: [],
      },
      t10: {
        id: "t10",
        parentId: null,
        source: "file upload",
        databaseName: "t_5yj0wm_mkxyxbdg",
        name: "SD",
        fileName: "SD.csv",
        extension: "csv",
        size: 943811,
        mimeType: "text/csv",
        dateLastModified: 1734979617610,
        columnIds: ["c46", "c47", "c48", "c49", "c50"],
        rowCount: 48865,
        hiddenColumnIds: [],
      },
      t11: {
        id: "t11",
        parentId: null,
        source: "file upload",
        databaseName: "t_swiovt_mkxyxbf8",
        name: "SC",
        fileName: "SC.csv",
        extension: "csv",
        size: 2403108,
        mimeType: "text/csv",
        dateLastModified: 1734979617495,
        columnIds: ["c51", "c52", "c53", "c54", "c55"],
        rowCount: 122527,
        hiddenColumnIds: [],
      },
      t12: {
        id: "t12",
        parentId: null,
        source: "file upload",
        databaseName: "t_l5vmqx_mkxyxbi8",
        name: "RI",
        fileName: "RI.csv",
        extension: "csv",
        size: 815198,
        mimeType: "text/csv",
        dateLastModified: 1734979617366,
        columnIds: ["c56", "c57", "c58", "c59", "c60"],
        rowCount: 41540,
        hiddenColumnIds: [],
      },
      t13: {
        id: "t13",
        parentId: null,
        source: "file upload",
        databaseName: "t_kaquie_mkxyxbjx",
        name: "PA",
        fileName: "PA.csv",
        extension: "csv",
        size: 4071780,
        mimeType: "text/csv",
        dateLastModified: 1734979617256,
        columnIds: ["c61", "c62", "c63", "c64", "c65"],
        rowCount: 206944,
        hiddenColumnIds: [],
      },
    },
  },
  columns: {
    allIds: [
      "c1",
      "c2",
      "c3",
      "c4",
      "c5",
      "c6",
      "c7",
      "c8",
      "c9",
      "c10",
      "c11",
      "c12",
      "c13",
      "c14",
      "c15",
      "c16",
      "c17",
      "c18",
      "c19",
      "c20",
      "c21",
      "c22",
      "c23",
      "c24",
      "c25",
      "c26",
      "c27",
      "c28",
      "c29",
      "c30",
      "c31",
      "c32",
      "c33",
      "c34",
      "c35",
      "c36",
      "c37",
      "c38",
      "c39",
      "c40",
      "c41",
      "c42",
      "c43",
      "c44",
      "c45",
      "c46",
      "c47",
      "c48",
      "c49",
      "c50",
      "c51",
      "c52",
      "c53",
      "c54",
      "c55",
      "c56",
      "c57",
      "c58",
      "c59",
      "c60",
      "c61",
      "c62",
      "c63",
      "c64",
      "c65",
      "c66",
      "c67",
      "c68",
      "c69",
      "c70",
      "c71",
      "c72",
      "c73",
      "c74",
      "c75",
      "c76",
      "c77",
      "c78",
      "c79",
      "c80",
      "c81",
      "c82",
      "c83",
      "c84",
      "c85",
    ],
    byId: {
      c1: {
        id: "c1",
        parentId: "t1",
        name: null,
        databaseName: "ABBR",
        columnType: "VARCHAR",
        approxUnique: 1,
        avg: null,
        count: 28751,
        max: "WY",
        min: "WY",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "WY",
            count: 28751,
          },
        ],
      },
      c2: {
        id: "c2",
        parentId: "t1",
        name: null,
        databaseName: "GENDER",
        columnType: "VARCHAR",
        approxUnique: 2,
        avg: null,
        count: 28751,
        max: "M",
        min: "F",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "F",
            count: 14421,
          },
          {
            value: "M",
            count: 14330,
          },
        ],
      },
      c3: {
        id: "c3",
        parentId: "t1",
        name: null,
        databaseName: "YEAR",
        columnType: "DOUBLE",
        approxUnique: 145,
        avg: 1970.535285729192,
        count: 28751,
        max: 2021,
        min: 1910,
        nullPercentage: 0,
        std: 29.788559200163768,
        topValues: [
          {
            value: "1981.0",
            count: 358,
          },
          {
            value: "1980.0",
            count: 357,
          },
          {
            value: "1961.0",
            count: 355,
          },
          {
            value: "1982.0",
            count: 355,
          },
          {
            value: "1962.0",
            count: 349,
          },
          {
            value: "1960.0",
            count: 349,
          },
          {
            value: "1955.0",
            count: 345,
          },
          {
            value: "1959.0",
            count: 344,
          },
          {
            value: "1956.0",
            count: 341,
          },
          {
            value: "1954.0",
            count: 340,
          },
          {
            value: "1957.0",
            count: 337,
          },
          {
            value: "1983.0",
            count: 333,
          },
          {
            value: "1979.0",
            count: 332,
          },
          {
            value: "2007.0",
            count: 330,
          },
          {
            value: "1963.0",
            count: 329,
          },
          {
            value: "1958.0",
            count: 328,
          },
          {
            value: "1964.0",
            count: 325,
          },
          {
            value: "2008.0",
            count: 324,
          },
          {
            value: "1984.0",
            count: 323,
          },
          {
            value: "1953.0",
            count: 322,
          },
        ],
      },
      c4: {
        id: "c4",
        parentId: "t1",
        name: null,
        databaseName: "NAME",
        columnType: "VARCHAR",
        approxUnique: 1638,
        avg: null,
        count: 28751,
        max: "Zoey",
        min: "Aaliyah",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "Charles",
            count: 112,
          },
          {
            value: "Joseph",
            count: 112,
          },
          {
            value: "James",
            count: 112,
          },
          {
            value: "William",
            count: 112,
          },
          {
            value: "John",
            count: 112,
          },
          {
            value: "Elizabeth",
            count: 112,
          },
          {
            value: "Robert",
            count: 111,
          },
          {
            value: "Thomas",
            count: 111,
          },
          {
            value: "David",
            count: 109,
          },
          {
            value: "Richard",
            count: 101,
          },
          {
            value: "Daniel",
            count: 101,
          },
          {
            value: "Mary",
            count: 99,
          },
          {
            value: "Jack",
            count: 98,
          },
          {
            value: "Kenneth",
            count: 98,
          },
          {
            value: "Anna",
            count: 98,
          },
          {
            value: "Michael",
            count: 93,
          },
          {
            value: "Katherine",
            count: 92,
          },
          {
            value: "Paul",
            count: 92,
          },
          {
            value: "Andrew",
            count: 88,
          },
          {
            value: "Donald",
            count: 85,
          },
        ],
      },
      c5: {
        id: "c5",
        parentId: "t1",
        name: null,
        databaseName: "VALUE",
        columnType: "DOUBLE",
        approxUnique: 201,
        avg: 15.446732287572607,
        count: 28751,
        max: 229,
        min: 5,
        nullPercentage: 0,
        std: 18.36631526368751,
        topValues: [
          {
            value: "5.0",
            count: 4672,
          },
          {
            value: "6.0",
            count: 3563,
          },
          {
            value: "7.0",
            count: 2796,
          },
          {
            value: "8.0",
            count: 2231,
          },
          {
            value: "9.0",
            count: 1723,
          },
          {
            value: "10.0",
            count: 1465,
          },
          {
            value: "11.0",
            count: 1257,
          },
          {
            value: "12.0",
            count: 996,
          },
          {
            value: "13.0",
            count: 882,
          },
          {
            value: "14.0",
            count: 751,
          },
          {
            value: "15.0",
            count: 691,
          },
          {
            value: "16.0",
            count: 567,
          },
          {
            value: "17.0",
            count: 550,
          },
          {
            value: "18.0",
            count: 453,
          },
          {
            value: "19.0",
            count: 424,
          },
          {
            value: "20.0",
            count: 399,
          },
          {
            value: "21.0",
            count: 368,
          },
          {
            value: "22.0",
            count: 316,
          },
          {
            value: "23.0",
            count: 303,
          },
          {
            value: "24.0",
            count: 228,
          },
        ],
      },
      c6: {
        id: "c6",
        parentId: "t2",
        name: null,
        databaseName: "ABBR",
        columnType: "VARCHAR",
        approxUnique: 1,
        avg: null,
        count: 121398,
        max: "WI",
        min: "WI",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "WI",
            count: 121398,
          },
        ],
      },
      c7: {
        id: "c7",
        parentId: "t2",
        name: null,
        databaseName: "GENDER",
        columnType: "VARCHAR",
        approxUnique: 2,
        avg: null,
        count: 121398,
        max: "M",
        min: "F",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "F",
            count: 67189,
          },
          {
            value: "M",
            count: 54209,
          },
        ],
      },
      c8: {
        id: "c8",
        parentId: "t2",
        name: null,
        databaseName: "YEAR",
        columnType: "DOUBLE",
        approxUnique: 145,
        avg: 1976.3914479645464,
        count: 121398,
        max: 2021,
        min: 1910,
        nullPercentage: 0,
        std: 31.94269065155028,
        topValues: [
          {
            value: "2019.0",
            count: 1866,
          },
          {
            value: "2016.0",
            count: 1859,
          },
          {
            value: "2017.0",
            count: 1853,
          },
          {
            value: "2018.0",
            count: 1852,
          },
          {
            value: "2021.0",
            count: 1849,
          },
          {
            value: "2009.0",
            count: 1846,
          },
          {
            value: "2008.0",
            count: 1842,
          },
          {
            value: "2011.0",
            count: 1831,
          },
          {
            value: "2015.0",
            count: 1829,
          },
          {
            value: "2010.0",
            count: 1828,
          },
          {
            value: "2012.0",
            count: 1820,
          },
          {
            value: "2013.0",
            count: 1813,
          },
          {
            value: "2020.0",
            count: 1804,
          },
          {
            value: "2014.0",
            count: 1794,
          },
          {
            value: "2007.0",
            count: 1788,
          },
          {
            value: "2006.0",
            count: 1730,
          },
          {
            value: "2005.0",
            count: 1653,
          },
          {
            value: "2004.0",
            count: 1611,
          },
          {
            value: "2003.0",
            count: 1547,
          },
          {
            value: "2001.0",
            count: 1525,
          },
        ],
      },
      c9: {
        id: "c9",
        parentId: "t2",
        name: null,
        databaseName: "NAME",
        columnType: "VARCHAR",
        approxUnique: 6050,
        avg: null,
        count: 121398,
        max: "Zyon",
        min: "Aaden",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "Lee",
            count: 162,
          },
          {
            value: "Leslie",
            count: 153,
          },
          {
            value: "James",
            count: 147,
          },
          {
            value: "John",
            count: 146,
          },
          {
            value: "Robert",
            count: 145,
          },
          {
            value: "Michael",
            count: 142,
          },
          {
            value: "Claire",
            count: 133,
          },
          {
            value: "William",
            count: 129,
          },
          {
            value: "Terry",
            count: 129,
          },
          {
            value: "Richard",
            count: 128,
          },
          {
            value: "Jamie",
            count: 127,
          },
          {
            value: "Dale",
            count: 127,
          },
          {
            value: "George",
            count: 127,
          },
          {
            value: "Mary",
            count: 127,
          },
          {
            value: "Donald",
            count: 126,
          },
          {
            value: "Lynn",
            count: 125,
          },
          {
            value: "Charles",
            count: 124,
          },
          {
            value: "Jesse",
            count: 124,
          },
          {
            value: "Joseph",
            count: 123,
          },
          {
            value: "Robin",
            count: 123,
          },
        ],
      },
      c10: {
        id: "c10",
        parentId: "t2",
        name: null,
        databaseName: "VALUE",
        columnType: "DOUBLE",
        approxUnique: 1524,
        avg: 53.35082126558922,
        count: 121398,
        max: 2403,
        min: 5,
        nullPercentage: 0,
        std: 139.73622793666541,
        topValues: [
          {
            value: "5.0",
            count: 14680,
          },
          {
            value: "6.0",
            count: 10851,
          },
          {
            value: "7.0",
            count: 8394,
          },
          {
            value: "8.0",
            count: 6780,
          },
          {
            value: "9.0",
            count: 5652,
          },
          {
            value: "10.0",
            count: 4669,
          },
          {
            value: "11.0",
            count: 4032,
          },
          {
            value: "12.0",
            count: 3493,
          },
          {
            value: "13.0",
            count: 3120,
          },
          {
            value: "14.0",
            count: 2671,
          },
          {
            value: "15.0",
            count: 2455,
          },
          {
            value: "16.0",
            count: 2235,
          },
          {
            value: "17.0",
            count: 2037,
          },
          {
            value: "18.0",
            count: 1807,
          },
          {
            value: "19.0",
            count: 1707,
          },
          {
            value: "20.0",
            count: 1506,
          },
          {
            value: "21.0",
            count: 1415,
          },
          {
            value: "23.0",
            count: 1321,
          },
          {
            value: "22.0",
            count: 1262,
          },
          {
            value: "24.0",
            count: 1139,
          },
        ],
      },
      c11: {
        id: "c11",
        parentId: "t3",
        name: null,
        databaseName: "ABBR",
        columnType: "VARCHAR",
        approxUnique: 1,
        avg: null,
        count: 79250,
        max: "WV",
        min: "WV",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "WV",
            count: 79250,
          },
        ],
      },
      c12: {
        id: "c12",
        parentId: "t3",
        name: null,
        databaseName: "GENDER",
        columnType: "VARCHAR",
        approxUnique: 2,
        avg: null,
        count: 79250,
        max: "M",
        min: "F",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "F",
            count: 43274,
          },
          {
            value: "M",
            count: 35976,
          },
        ],
      },
      c13: {
        id: "c13",
        parentId: "t3",
        name: null,
        databaseName: "YEAR",
        columnType: "DOUBLE",
        approxUnique: 145,
        avg: 1964.5034700315457,
        count: 79250,
        max: 2021,
        min: 1910,
        nullPercentage: 0,
        std: 32.32500305850698,
        topValues: [
          {
            value: "1927.0",
            count: 854,
          },
          {
            value: "1924.0",
            count: 850,
          },
          {
            value: "1947.0",
            count: 848,
          },
          {
            value: "1923.0",
            count: 838,
          },
          {
            value: "1925.0",
            count: 838,
          },
          {
            value: "1921.0",
            count: 836,
          },
          {
            value: "1922.0",
            count: 830,
          },
          {
            value: "1926.0",
            count: 828,
          },
          {
            value: "1949.0",
            count: 821,
          },
          {
            value: "1948.0",
            count: 820,
          },
          {
            value: "1956.0",
            count: 818,
          },
          {
            value: "1950.0",
            count: 817,
          },
          {
            value: "1952.0",
            count: 813,
          },
          {
            value: "1920.0",
            count: 810,
          },
          {
            value: "1958.0",
            count: 809,
          },
          {
            value: "1951.0",
            count: 809,
          },
          {
            value: "1930.0",
            count: 807,
          },
          {
            value: "1928.0",
            count: 804,
          },
          {
            value: "1942.0",
            count: 803,
          },
          {
            value: "1929.0",
            count: 799,
          },
        ],
      },
      c14: {
        id: "c14",
        parentId: "t3",
        name: null,
        databaseName: "NAME",
        columnType: "VARCHAR",
        approxUnique: 3580,
        avg: null,
        count: 79250,
        max: "Zuri",
        min: "Aaden",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "Jessie",
            count: 161,
          },
          {
            value: "Dana",
            count: 150,
          },
          {
            value: "Lee",
            count: 141,
          },
          {
            value: "Leslie",
            count: 134,
          },
          {
            value: "Jackie",
            count: 132,
          },
          {
            value: "James",
            count: 132,
          },
          {
            value: "Billie",
            count: 129,
          },
          {
            value: "Mary",
            count: 129,
          },
          {
            value: "Jerry",
            count: 122,
          },
          {
            value: "William",
            count: 121,
          },
          {
            value: "Michael",
            count: 120,
          },
          {
            value: "John",
            count: 120,
          },
          {
            value: "Terry",
            count: 119,
          },
          {
            value: "Robert",
            count: 118,
          },
          {
            value: "Jesse",
            count: 117,
          },
          {
            value: "Charles",
            count: 116,
          },
          {
            value: "Kelly",
            count: 114,
          },
          {
            value: "Paul",
            count: 114,
          },
          {
            value: "George",
            count: 114,
          },
          {
            value: "David",
            count: 113,
          },
        ],
      },
      c15: {
        id: "c15",
        parentId: "t3",
        name: null,
        databaseName: "VALUE",
        columnType: "DOUBLE",
        approxUnique: 956,
        avg: 38.74188012618296,
        count: 79250,
        max: 1796,
        min: 5,
        nullPercentage: 0,
        std: 89.43347457941438,
        topValues: [
          {
            value: "5.0",
            count: 9398,
          },
          {
            value: "6.0",
            count: 7098,
          },
          {
            value: "7.0",
            count: 5432,
          },
          {
            value: "8.0",
            count: 4533,
          },
          {
            value: "9.0",
            count: 3686,
          },
          {
            value: "10.0",
            count: 3138,
          },
          {
            value: "11.0",
            count: 2667,
          },
          {
            value: "12.0",
            count: 2426,
          },
          {
            value: "13.0",
            count: 2173,
          },
          {
            value: "14.0",
            count: 1854,
          },
          {
            value: "15.0",
            count: 1704,
          },
          {
            value: "16.0",
            count: 1527,
          },
          {
            value: "17.0",
            count: 1426,
          },
          {
            value: "18.0",
            count: 1317,
          },
          {
            value: "19.0",
            count: 1178,
          },
          {
            value: "20.0",
            count: 1103,
          },
          {
            value: "21.0",
            count: 1052,
          },
          {
            value: "22.0",
            count: 965,
          },
          {
            value: "23.0",
            count: 850,
          },
          {
            value: "24.0",
            count: 814,
          },
        ],
      },
      c16: {
        id: "c16",
        parentId: "t4",
        name: null,
        databaseName: "ABBR",
        columnType: "VARCHAR",
        approxUnique: 1,
        avg: null,
        count: 130809,
        max: "WA",
        min: "WA",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "WA",
            count: 130809,
          },
        ],
      },
      c17: {
        id: "c17",
        parentId: "t4",
        name: null,
        databaseName: "GENDER",
        columnType: "VARCHAR",
        approxUnique: 2,
        avg: null,
        count: 130809,
        max: "M",
        min: "F",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "F",
            count: 73549,
          },
          {
            value: "M",
            count: 57260,
          },
        ],
      },
      c18: {
        id: "c18",
        parentId: "t4",
        name: null,
        databaseName: "YEAR",
        columnType: "DOUBLE",
        approxUnique: 145,
        avg: 1982.3494254982456,
        count: 130809,
        max: 2021,
        min: 1910,
        nullPercentage: 0,
        std: 29.472196452488255,
        topValues: [
          {
            value: "2016.0",
            count: 2417,
          },
          {
            value: "2015.0",
            count: 2393,
          },
          {
            value: "2017.0",
            count: 2392,
          },
          {
            value: "2021.0",
            count: 2381,
          },
          {
            value: "2014.0",
            count: 2344,
          },
          {
            value: "2020.0",
            count: 2339,
          },
          {
            value: "2018.0",
            count: 2321,
          },
          {
            value: "2009.0",
            count: 2317,
          },
          {
            value: "2010.0",
            count: 2315,
          },
          {
            value: "2008.0",
            count: 2313,
          },
          {
            value: "2012.0",
            count: 2302,
          },
          {
            value: "2011.0",
            count: 2291,
          },
          {
            value: "2019.0",
            count: 2291,
          },
          {
            value: "2013.0",
            count: 2234,
          },
          {
            value: "2007.0",
            count: 2210,
          },
          {
            value: "2006.0",
            count: 2096,
          },
          {
            value: "2005.0",
            count: 2047,
          },
          {
            value: "2004.0",
            count: 1941,
          },
          {
            value: "2002.0",
            count: 1905,
          },
          {
            value: "2003.0",
            count: 1894,
          },
        ],
      },
      c19: {
        id: "c19",
        parentId: "t4",
        name: null,
        databaseName: "NAME",
        columnType: "VARCHAR",
        approxUnique: 7116,
        avg: null,
        count: 130809,
        max: "Zyla",
        min: "Aaden",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "Leslie",
            count: 167,
          },
          {
            value: "Lee",
            count: 149,
          },
          {
            value: "Robin",
            count: 149,
          },
          {
            value: "Jessie",
            count: 148,
          },
          {
            value: "Michael",
            count: 145,
          },
          {
            value: "Jamie",
            count: 141,
          },
          {
            value: "Kelly",
            count: 136,
          },
          {
            value: "Jesse",
            count: 136,
          },
          {
            value: "Dana",
            count: 131,
          },
          {
            value: "David",
            count: 131,
          },
          {
            value: "Robert",
            count: 129,
          },
          {
            value: "Terry",
            count: 127,
          },
          {
            value: "Casey",
            count: 126,
          },
          {
            value: "Dale",
            count: 123,
          },
          {
            value: "Jerry",
            count: 123,
          },
          {
            value: "James",
            count: 122,
          },
          {
            value: "Alex",
            count: 121,
          },
          {
            value: "Francis",
            count: 121,
          },
          {
            value: "Daniel",
            count: 120,
          },
          {
            value: "Noel",
            count: 119,
          },
        ],
      },
      c20: {
        id: "c20",
        parentId: "t4",
        name: null,
        databaseName: "VALUE",
        columnType: "DOUBLE",
        approxUnique: 960,
        avg: 39.440573660833735,
        count: 130809,
        max: 1750,
        min: 5,
        nullPercentage: 0,
        std: 86.96838577670161,
        topValues: [
          {
            value: "5.0",
            count: 16713,
          },
          {
            value: "6.0",
            count: 12131,
          },
          {
            value: "7.0",
            count: 9199,
          },
          {
            value: "8.0",
            count: 7573,
          },
          {
            value: "9.0",
            count: 6156,
          },
          {
            value: "10.0",
            count: 5196,
          },
          {
            value: "11.0",
            count: 4394,
          },
          {
            value: "12.0",
            count: 3780,
          },
          {
            value: "13.0",
            count: 3364,
          },
          {
            value: "14.0",
            count: 3052,
          },
          {
            value: "15.0",
            count: 2703,
          },
          {
            value: "16.0",
            count: 2480,
          },
          {
            value: "17.0",
            count: 2207,
          },
          {
            value: "18.0",
            count: 2011,
          },
          {
            value: "19.0",
            count: 1821,
          },
          {
            value: "20.0",
            count: 1659,
          },
          {
            value: "21.0",
            count: 1601,
          },
          {
            value: "22.0",
            count: 1470,
          },
          {
            value: "23.0",
            count: 1444,
          },
          {
            value: "24.0",
            count: 1274,
          },
        ],
      },
      c21: {
        id: "c21",
        parentId: "t5",
        name: null,
        databaseName: "ABBR",
        columnType: "VARCHAR",
        approxUnique: 1,
        avg: null,
        count: 154400,
        max: "VA",
        min: "VA",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "VA",
            count: 154400,
          },
        ],
      },
      c22: {
        id: "c22",
        parentId: "t5",
        name: null,
        databaseName: "GENDER",
        columnType: "VARCHAR",
        approxUnique: 2,
        avg: null,
        count: 154400,
        max: "M",
        min: "F",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "F",
            count: 84366,
          },
          {
            value: "M",
            count: 70034,
          },
        ],
      },
      c23: {
        id: "c23",
        parentId: "t5",
        name: null,
        databaseName: "YEAR",
        columnType: "DOUBLE",
        approxUnique: 145,
        avg: 1977.9645790155441,
        count: 154400,
        max: 2021,
        min: 1910,
        nullPercentage: 0,
        std: 31.857164842840152,
        topValues: [
          {
            value: "2018.0",
            count: 2565,
          },
          {
            value: "2015.0",
            count: 2538,
          },
          {
            value: "2021.0",
            count: 2538,
          },
          {
            value: "2017.0",
            count: 2529,
          },
          {
            value: "2020.0",
            count: 2523,
          },
          {
            value: "2016.0",
            count: 2523,
          },
          {
            value: "2019.0",
            count: 2520,
          },
          {
            value: "2014.0",
            count: 2502,
          },
          {
            value: "2007.0",
            count: 2489,
          },
          {
            value: "2008.0",
            count: 2486,
          },
          {
            value: "2012.0",
            count: 2477,
          },
          {
            value: "2009.0",
            count: 2475,
          },
          {
            value: "2013.0",
            count: 2460,
          },
          {
            value: "2010.0",
            count: 2455,
          },
          {
            value: "2006.0",
            count: 2429,
          },
          {
            value: "2011.0",
            count: 2424,
          },
          {
            value: "2005.0",
            count: 2338,
          },
          {
            value: "2004.0",
            count: 2249,
          },
          {
            value: "2003.0",
            count: 2148,
          },
          {
            value: "2002.0",
            count: 2066,
          },
        ],
      },
      c24: {
        id: "c24",
        parentId: "t5",
        name: null,
        databaseName: "NAME",
        columnType: "VARCHAR",
        approxUnique: 7785,
        avg: null,
        count: 154400,
        max: "Zyquan",
        min: "Aaden",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "Jessie",
            count: 211,
          },
          {
            value: "Lee",
            count: 190,
          },
          {
            value: "Leslie",
            count: 178,
          },
          {
            value: "James",
            count: 178,
          },
          {
            value: "Francis",
            count: 164,
          },
          {
            value: "William",
            count: 162,
          },
          {
            value: "Willie",
            count: 162,
          },
          {
            value: "John",
            count: 160,
          },
          {
            value: "Kelly",
            count: 156,
          },
          {
            value: "Robert",
            count: 155,
          },
          {
            value: "Marion",
            count: 153,
          },
          {
            value: "Aubrey",
            count: 151,
          },
          {
            value: "Mary",
            count: 147,
          },
          {
            value: "Beverly",
            count: 146,
          },
          {
            value: "Dana",
            count: 145,
          },
          {
            value: "Michael",
            count: 145,
          },
          {
            value: "Carter",
            count: 144,
          },
          {
            value: "Jamie",
            count: 143,
          },
          {
            value: "Shirley",
            count: 140,
          },
          {
            value: "Sidney",
            count: 140,
          },
        ],
      },
      c25: {
        id: "c25",
        parentId: "t5",
        name: null,
        databaseName: "VALUE",
        columnType: "DOUBLE",
        approxUnique: 1564,
        avg: 47.32459196891192,
        count: 154400,
        max: 2679,
        min: 5,
        nullPercentage: 0,
        std: 122.09269852866319,
        topValues: [
          {
            value: "5.0",
            count: 19781,
          },
          {
            value: "6.0",
            count: 14182,
          },
          {
            value: "7.0",
            count: 10800,
          },
          {
            value: "8.0",
            count: 8695,
          },
          {
            value: "9.0",
            count: 7166,
          },
          {
            value: "10.0",
            count: 5995,
          },
          {
            value: "11.0",
            count: 5051,
          },
          {
            value: "12.0",
            count: 4401,
          },
          {
            value: "13.0",
            count: 3774,
          },
          {
            value: "14.0",
            count: 3366,
          },
          {
            value: "15.0",
            count: 2959,
          },
          {
            value: "16.0",
            count: 2717,
          },
          {
            value: "17.0",
            count: 2535,
          },
          {
            value: "18.0",
            count: 2235,
          },
          {
            value: "19.0",
            count: 2067,
          },
          {
            value: "20.0",
            count: 1935,
          },
          {
            value: "21.0",
            count: 1847,
          },
          {
            value: "22.0",
            count: 1692,
          },
          {
            value: "24.0",
            count: 1529,
          },
          {
            value: "23.0",
            count: 1524,
          },
        ],
      },
      c26: {
        id: "c26",
        parentId: "t6",
        name: null,
        databaseName: "ABBR",
        columnType: "VARCHAR",
        approxUnique: 1,
        avg: null,
        count: 29483,
        max: "VT",
        min: "VT",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "VT",
            count: 29483,
          },
        ],
      },
      c27: {
        id: "c27",
        parentId: "t6",
        name: null,
        databaseName: "GENDER",
        columnType: "VARCHAR",
        approxUnique: 2,
        avg: null,
        count: 29483,
        max: "M",
        min: "F",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "F",
            count: 15523,
          },
          {
            value: "M",
            count: 13960,
          },
        ],
      },
      c28: {
        id: "c28",
        parentId: "t6",
        name: null,
        databaseName: "YEAR",
        columnType: "DOUBLE",
        approxUnique: 145,
        avg: 1967.3860868975341,
        count: 29483,
        max: 2021,
        min: 1910,
        nullPercentage: 0,
        std: 31.148998326838562,
        topValues: [
          {
            value: "1959.0",
            count: 320,
          },
          {
            value: "1958.0",
            count: 318,
          },
          {
            value: "1960.0",
            count: 315,
          },
          {
            value: "1961.0",
            count: 314,
          },
          {
            value: "1964.0",
            count: 312,
          },
          {
            value: "1957.0",
            count: 311,
          },
          {
            value: "1970.0",
            count: 308,
          },
          {
            value: "1955.0",
            count: 308,
          },
          {
            value: "1954.0",
            count: 303,
          },
          {
            value: "1962.0",
            count: 299,
          },
          {
            value: "1971.0",
            count: 295,
          },
          {
            value: "1963.0",
            count: 295,
          },
          {
            value: "2005.0",
            count: 293,
          },
          {
            value: "1994.0",
            count: 292,
          },
          {
            value: "1969.0",
            count: 290,
          },
          {
            value: "1956.0",
            count: 290,
          },
          {
            value: "1998.0",
            count: 289,
          },
          {
            value: "1989.0",
            count: 289,
          },
          {
            value: "1966.0",
            count: 287,
          },
          {
            value: "1965.0",
            count: 287,
          },
        ],
      },
      c29: {
        id: "c29",
        parentId: "t6",
        name: null,
        databaseName: "NAME",
        columnType: "VARCHAR",
        approxUnique: 1676,
        avg: null,
        count: 29483,
        max: "Zoey",
        min: "Aaliyah",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "Joseph",
            count: 112,
          },
          {
            value: "Charles",
            count: 112,
          },
          {
            value: "Elizabeth",
            count: 112,
          },
          {
            value: "James",
            count: 112,
          },
          {
            value: "Thomas",
            count: 112,
          },
          {
            value: "John",
            count: 112,
          },
          {
            value: "William",
            count: 112,
          },
          {
            value: "David",
            count: 111,
          },
          {
            value: "Robert",
            count: 110,
          },
          {
            value: "Daniel",
            count: 108,
          },
          {
            value: "Andrew",
            count: 106,
          },
          {
            value: "Margaret",
            count: 105,
          },
          {
            value: "Anthony",
            count: 103,
          },
          {
            value: "Richard",
            count: 102,
          },
          {
            value: "Katherine",
            count: 102,
          },
          {
            value: "Anna",
            count: 102,
          },
          {
            value: "Michael",
            count: 101,
          },
          {
            value: "George",
            count: 99,
          },
          {
            value: "Paul",
            count: 98,
          },
          {
            value: "Mary",
            count: 98,
          },
        ],
      },
      c30: {
        id: "c30",
        parentId: "t6",
        name: null,
        databaseName: "VALUE",
        columnType: "DOUBLE",
        approxUnique: 247,
        avg: 19.242444798697555,
        count: 29483,
        max: 325,
        min: 5,
        nullPercentage: 0,
        std: 23.828353166878983,
        topValues: [
          {
            value: "5.0",
            count: 4132,
          },
          {
            value: "6.0",
            count: 3062,
          },
          {
            value: "7.0",
            count: 2431,
          },
          {
            value: "8.0",
            count: 1991,
          },
          {
            value: "9.0",
            count: 1595,
          },
          {
            value: "10.0",
            count: 1399,
          },
          {
            value: "11.0",
            count: 1176,
          },
          {
            value: "12.0",
            count: 1068,
          },
          {
            value: "13.0",
            count: 876,
          },
          {
            value: "14.0",
            count: 749,
          },
          {
            value: "15.0",
            count: 704,
          },
          {
            value: "16.0",
            count: 648,
          },
          {
            value: "17.0",
            count: 559,
          },
          {
            value: "18.0",
            count: 536,
          },
          {
            value: "19.0",
            count: 461,
          },
          {
            value: "20.0",
            count: 430,
          },
          {
            value: "21.0",
            count: 402,
          },
          {
            value: "22.0",
            count: 363,
          },
          {
            value: "24.0",
            count: 360,
          },
          {
            value: "23.0",
            count: 353,
          },
        ],
      },
      c31: {
        id: "c31",
        parentId: "t7",
        name: null,
        databaseName: "ABBR",
        columnType: "VARCHAR",
        approxUnique: 1,
        avg: null,
        count: 93764,
        max: "UT",
        min: "UT",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "UT",
            count: 93764,
          },
        ],
      },
      c32: {
        id: "c32",
        parentId: "t7",
        name: null,
        databaseName: "GENDER",
        columnType: "VARCHAR",
        approxUnique: 2,
        avg: null,
        count: 93764,
        max: "M",
        min: "F",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "F",
            count: 50701,
          },
          {
            value: "M",
            count: 43063,
          },
        ],
      },
      c33: {
        id: "c33",
        parentId: "t7",
        name: null,
        databaseName: "YEAR",
        columnType: "DOUBLE",
        approxUnique: 145,
        avg: 1981.2298216799625,
        count: 93764,
        max: 2021,
        min: 1910,
        nullPercentage: 0,
        std: 30.198448219919232,
        topValues: [
          {
            value: "2009.0",
            count: 1692,
          },
          {
            value: "2008.0",
            count: 1690,
          },
          {
            value: "2014.0",
            count: 1677,
          },
          {
            value: "2007.0",
            count: 1655,
          },
          {
            value: "2012.0",
            count: 1640,
          },
          {
            value: "2010.0",
            count: 1631,
          },
          {
            value: "2016.0",
            count: 1622,
          },
          {
            value: "2013.0",
            count: 1621,
          },
          {
            value: "2015.0",
            count: 1618,
          },
          {
            value: "2011.0",
            count: 1611,
          },
          {
            value: "2019.0",
            count: 1595,
          },
          {
            value: "2021.0",
            count: 1593,
          },
          {
            value: "2017.0",
            count: 1593,
          },
          {
            value: "2006.0",
            count: 1587,
          },
          {
            value: "2018.0",
            count: 1561,
          },
          {
            value: "2020.0",
            count: 1551,
          },
          {
            value: "2005.0",
            count: 1507,
          },
          {
            value: "2004.0",
            count: 1489,
          },
          {
            value: "2003.0",
            count: 1430,
          },
          {
            value: "2001.0",
            count: 1402,
          },
        ],
      },
      c34: {
        id: "c34",
        parentId: "t7",
        name: null,
        databaseName: "NAME",
        columnType: "VARCHAR",
        approxUnique: 4587,
        avg: null,
        count: 93764,
        max: "Zyler",
        min: "Aaden",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "Leslie",
            count: 145,
          },
          {
            value: "Kelly",
            count: 122,
          },
          {
            value: "Lee",
            count: 122,
          },
          {
            value: "David",
            count: 118,
          },
          {
            value: "Jesse",
            count: 117,
          },
          {
            value: "James",
            count: 116,
          },
          {
            value: "John",
            count: 115,
          },
          {
            value: "Robert",
            count: 115,
          },
          {
            value: "Joseph",
            count: 113,
          },
          {
            value: "Richard",
            count: 113,
          },
          {
            value: "Mary",
            count: 113,
          },
          {
            value: "Margaret",
            count: 112,
          },
          {
            value: "George",
            count: 112,
          },
          {
            value: "William",
            count: 112,
          },
          {
            value: "Edward",
            count: 112,
          },
          {
            value: "Thomas",
            count: 112,
          },
          {
            value: "Kenneth",
            count: 112,
          },
          {
            value: "Charles",
            count: 112,
          },
          {
            value: "Elizabeth",
            count: 112,
          },
          {
            value: "Anna",
            count: 112,
          },
        ],
      },
      c35: {
        id: "c35",
        parentId: "t7",
        name: null,
        databaseName: "VALUE",
        columnType: "DOUBLE",
        approxUnique: 534,
        avg: 27.79588114841517,
        count: 93764,
        max: 702,
        min: 5,
        nullPercentage: 0,
        std: 46.56639186300035,
        topValues: [
          {
            value: "5.0",
            count: 12561,
          },
          {
            value: "6.0",
            count: 8937,
          },
          {
            value: "7.0",
            count: 7141,
          },
          {
            value: "8.0",
            count: 5917,
          },
          {
            value: "9.0",
            count: 4705,
          },
          {
            value: "10.0",
            count: 4042,
          },
          {
            value: "11.0",
            count: 3337,
          },
          {
            value: "12.0",
            count: 2886,
          },
          {
            value: "13.0",
            count: 2640,
          },
          {
            value: "14.0",
            count: 2361,
          },
          {
            value: "15.0",
            count: 2104,
          },
          {
            value: "16.0",
            count: 1942,
          },
          {
            value: "17.0",
            count: 1663,
          },
          {
            value: "18.0",
            count: 1526,
          },
          {
            value: "19.0",
            count: 1387,
          },
          {
            value: "20.0",
            count: 1291,
          },
          {
            value: "21.0",
            count: 1259,
          },
          {
            value: "22.0",
            count: 1108,
          },
          {
            value: "23.0",
            count: 1094,
          },
          {
            value: "24.0",
            count: 940,
          },
        ],
      },
      c36: {
        id: "c36",
        parentId: "t8",
        name: null,
        databaseName: "ABBR",
        columnType: "VARCHAR",
        approxUnique: 1,
        avg: null,
        count: 368987,
        max: "TX",
        min: "TX",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "TX",
            count: 368987,
          },
        ],
      },
      c37: {
        id: "c37",
        parentId: "t8",
        name: null,
        databaseName: "GENDER",
        columnType: "VARCHAR",
        approxUnique: 2,
        avg: null,
        count: 368987,
        max: "M",
        min: "F",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "F",
            count: 210514,
          },
          {
            value: "M",
            count: 158473,
          },
        ],
      },
      c38: {
        id: "c38",
        parentId: "t8",
        name: null,
        databaseName: "YEAR",
        columnType: "DOUBLE",
        approxUnique: 145,
        avg: 1979.9503641049685,
        count: 368987,
        max: 2021,
        min: 1910,
        nullPercentage: 0,
        std: 31.322870404515847,
        topValues: [
          {
            value: "2015.0",
            count: 6528,
          },
          {
            value: "2016.0",
            count: 6488,
          },
          {
            value: "2021.0",
            count: 6475,
          },
          {
            value: "2014.0",
            count: 6407,
          },
          {
            value: "2009.0",
            count: 6385,
          },
          {
            value: "2019.0",
            count: 6343,
          },
          {
            value: "2020.0",
            count: 6314,
          },
          {
            value: "2013.0",
            count: 6296,
          },
          {
            value: "2018.0",
            count: 6295,
          },
          {
            value: "2012.0",
            count: 6285,
          },
          {
            value: "2017.0",
            count: 6283,
          },
          {
            value: "2008.0",
            count: 6273,
          },
          {
            value: "2010.0",
            count: 6231,
          },
          {
            value: "2007.0",
            count: 6221,
          },
          {
            value: "2011.0",
            count: 6181,
          },
          {
            value: "2006.0",
            count: 5945,
          },
          {
            value: "2005.0",
            count: 5801,
          },
          {
            value: "2004.0",
            count: 5635,
          },
          {
            value: "2003.0",
            count: 5515,
          },
          {
            value: "2002.0",
            count: 5388,
          },
        ],
      },
      c39: {
        id: "c39",
        parentId: "t8",
        name: null,
        databaseName: "NAME",
        columnType: "VARCHAR",
        approxUnique: 17830,
        avg: null,
        count: 368987,
        max: "Zyron",
        min: "Aadan",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "Jessie",
            count: 224,
          },
          {
            value: "Guadalupe",
            count: 224,
          },
          {
            value: "Francis",
            count: 224,
          },
          {
            value: "Marion",
            count: 217,
          },
          {
            value: "Frankie",
            count: 217,
          },
          {
            value: "Leslie",
            count: 212,
          },
          {
            value: "Jackie",
            count: 210,
          },
          {
            value: "Charlie",
            count: 206,
          },
          {
            value: "Lee",
            count: 205,
          },
          {
            value: "Johnnie",
            count: 202,
          },
          {
            value: "Sidney",
            count: 202,
          },
          {
            value: "Jose",
            count: 201,
          },
          {
            value: "Jamie",
            count: 199,
          },
          {
            value: "James",
            count: 199,
          },
          {
            value: "Cruz",
            count: 199,
          },
          {
            value: "Jean",
            count: 198,
          },
          {
            value: "Maria",
            count: 197,
          },
          {
            value: "John",
            count: 193,
          },
          {
            value: "Robbie",
            count: 193,
          },
          {
            value: "Robert",
            count: 192,
          },
        ],
      },
      c40: {
        id: "c40",
        parentId: "t8",
        name: null,
        databaseName: "VALUE",
        columnType: "DOUBLE",
        approxUnique: 2817,
        avg: 65.54732822565565,
        count: 368987,
        max: 5059,
        min: 5,
        nullPercentage: 0,
        std: 205.2550084280603,
        topValues: [
          {
            value: "5.0",
            count: 46787,
          },
          {
            value: "6.0",
            count: 33894,
          },
          {
            value: "7.0",
            count: 25654,
          },
          {
            value: "8.0",
            count: 20631,
          },
          {
            value: "9.0",
            count: 16650,
          },
          {
            value: "10.0",
            count: 13703,
          },
          {
            value: "11.0",
            count: 11867,
          },
          {
            value: "12.0",
            count: 10087,
          },
          {
            value: "13.0",
            count: 9132,
          },
          {
            value: "14.0",
            count: 7831,
          },
          {
            value: "15.0",
            count: 7110,
          },
          {
            value: "16.0",
            count: 6424,
          },
          {
            value: "17.0",
            count: 5748,
          },
          {
            value: "18.0",
            count: 5111,
          },
          {
            value: "19.0",
            count: 4734,
          },
          {
            value: "20.0",
            count: 4339,
          },
          {
            value: "21.0",
            count: 4040,
          },
          {
            value: "22.0",
            count: 3878,
          },
          {
            value: "23.0",
            count: 3546,
          },
          {
            value: "24.0",
            count: 3355,
          },
        ],
      },
      c41: {
        id: "c41",
        parentId: "t9",
        name: null,
        databaseName: "ABBR",
        columnType: "VARCHAR",
        approxUnique: 1,
        avg: null,
        count: 147212,
        max: "TN",
        min: "TN",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "TN",
            count: 147212,
          },
        ],
      },
      c42: {
        id: "c42",
        parentId: "t9",
        name: null,
        databaseName: "GENDER",
        columnType: "VARCHAR",
        approxUnique: 2,
        avg: null,
        count: 147212,
        max: "M",
        min: "F",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "F",
            count: 81197,
          },
          {
            value: "M",
            count: 66015,
          },
        ],
      },
      c43: {
        id: "c43",
        parentId: "t9",
        name: null,
        databaseName: "YEAR",
        columnType: "DOUBLE",
        approxUnique: 145,
        avg: 1975.7376912208244,
        count: 147212,
        max: 2021,
        min: 1910,
        nullPercentage: 0,
        std: 32.65137580232002,
        topValues: [
          {
            value: "2021.0",
            count: 2505,
          },
          {
            value: "2020.0",
            count: 2389,
          },
          {
            value: "2019.0",
            count: 2375,
          },
          {
            value: "2016.0",
            count: 2359,
          },
          {
            value: "2018.0",
            count: 2359,
          },
          {
            value: "2017.0",
            count: 2320,
          },
          {
            value: "2015.0",
            count: 2294,
          },
          {
            value: "2014.0",
            count: 2279,
          },
          {
            value: "2012.0",
            count: 2267,
          },
          {
            value: "2008.0",
            count: 2224,
          },
          {
            value: "2009.0",
            count: 2204,
          },
          {
            value: "2013.0",
            count: 2198,
          },
          {
            value: "2011.0",
            count: 2182,
          },
          {
            value: "2007.0",
            count: 2182,
          },
          {
            value: "2010.0",
            count: 2145,
          },
          {
            value: "2006.0",
            count: 2106,
          },
          {
            value: "2005.0",
            count: 2022,
          },
          {
            value: "2004.0",
            count: 1905,
          },
          {
            value: "2003.0",
            count: 1832,
          },
          {
            value: "2002.0",
            count: 1814,
          },
        ],
      },
      c44: {
        id: "c44",
        parentId: "t9",
        name: null,
        databaseName: "NAME",
        columnType: "VARCHAR",
        approxUnique: 7785,
        avg: null,
        count: 147212,
        max: "Zyon",
        min: "Aaden",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "Jessie",
            count: 222,
          },
          {
            value: "Lee",
            count: 198,
          },
          {
            value: "James",
            count: 186,
          },
          {
            value: "Willie",
            count: 180,
          },
          {
            value: "Leslie",
            count: 180,
          },
          {
            value: "Marion",
            count: 175,
          },
          {
            value: "Jackie",
            count: 171,
          },
          {
            value: "Jamie",
            count: 168,
          },
          {
            value: "Charlie",
            count: 167,
          },
          {
            value: "Robert",
            count: 163,
          },
          {
            value: "John",
            count: 161,
          },
          {
            value: "William",
            count: 160,
          },
          {
            value: "Eddie",
            count: 160,
          },
          {
            value: "Johnnie",
            count: 158,
          },
          {
            value: "Joe",
            count: 157,
          },
          {
            value: "Jerry",
            count: 155,
          },
          {
            value: "Charles",
            count: 155,
          },
          {
            value: "Terry",
            count: 151,
          },
          {
            value: "Aubrey",
            count: 149,
          },
          {
            value: "Billie",
            count: 149,
          },
        ],
      },
      c45: {
        id: "c45",
        parentId: "t9",
        name: null,
        databaseName: "VALUE",
        columnType: "DOUBLE",
        approxUnique: 1344,
        avg: 46.521112409314455,
        count: 147212,
        max: 3281,
        min: 5,
        nullPercentage: 0,
        std: 122.7713403082785,
        topValues: [
          {
            value: "5.0",
            count: 18893,
          },
          {
            value: "6.0",
            count: 13471,
          },
          {
            value: "7.0",
            count: 10281,
          },
          {
            value: "8.0",
            count: 8310,
          },
          {
            value: "9.0",
            count: 6820,
          },
          {
            value: "10.0",
            count: 5679,
          },
          {
            value: "11.0",
            count: 4841,
          },
          {
            value: "12.0",
            count: 4191,
          },
          {
            value: "13.0",
            count: 3714,
          },
          {
            value: "14.0",
            count: 3288,
          },
          {
            value: "15.0",
            count: 2910,
          },
          {
            value: "16.0",
            count: 2730,
          },
          {
            value: "17.0",
            count: 2354,
          },
          {
            value: "18.0",
            count: 2256,
          },
          {
            value: "19.0",
            count: 2016,
          },
          {
            value: "20.0",
            count: 1788,
          },
          {
            value: "21.0",
            count: 1740,
          },
          {
            value: "22.0",
            count: 1606,
          },
          {
            value: "23.0",
            count: 1547,
          },
          {
            value: "24.0",
            count: 1408,
          },
        ],
      },
      c46: {
        id: "c46",
        parentId: "t10",
        name: null,
        databaseName: "ABBR",
        columnType: "VARCHAR",
        approxUnique: 1,
        avg: null,
        count: 48865,
        max: "SD",
        min: "SD",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "SD",
            count: 48865,
          },
        ],
      },
      c47: {
        id: "c47",
        parentId: "t10",
        name: null,
        databaseName: "GENDER",
        columnType: "VARCHAR",
        approxUnique: 2,
        avg: null,
        count: 48865,
        max: "M",
        min: "F",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "F",
            count: 25473,
          },
          {
            value: "M",
            count: 23392,
          },
        ],
      },
      c48: {
        id: "c48",
        parentId: "t10",
        name: null,
        databaseName: "YEAR",
        columnType: "DOUBLE",
        approxUnique: 145,
        avg: 1967.9735598076334,
        count: 48865,
        max: 2021,
        min: 1910,
        nullPercentage: 0,
        std: 32.47353080583542,
        topValues: [
          {
            value: "2014.0",
            count: 568,
          },
          {
            value: "2021.0",
            count: 566,
          },
          {
            value: "2018.0",
            count: 556,
          },
          {
            value: "2019.0",
            count: 554,
          },
          {
            value: "2016.0",
            count: 553,
          },
          {
            value: "2015.0",
            count: 552,
          },
          {
            value: "2017.0",
            count: 548,
          },
          {
            value: "2013.0",
            count: 540,
          },
          {
            value: "2010.0",
            count: 540,
          },
          {
            value: "2012.0",
            count: 538,
          },
          {
            value: "1959.0",
            count: 530,
          },
          {
            value: "2007.0",
            count: 529,
          },
          {
            value: "1962.0",
            count: 527,
          },
          {
            value: "1960.0",
            count: 524,
          },
          {
            value: "1961.0",
            count: 524,
          },
          {
            value: "2008.0",
            count: 521,
          },
          {
            value: "2011.0",
            count: 521,
          },
          {
            value: "2020.0",
            count: 519,
          },
          {
            value: "2009.0",
            count: 513,
          },
          {
            value: "2006.0",
            count: 508,
          },
        ],
      },
      c49: {
        id: "c49",
        parentId: "t10",
        name: null,
        databaseName: "NAME",
        columnType: "VARCHAR",
        approxUnique: 2486,
        avg: null,
        count: 48865,
        max: "Zona",
        min: "Aaden",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "William",
            count: 113,
          },
          {
            value: "Robert",
            count: 113,
          },
          {
            value: "John",
            count: 112,
          },
          {
            value: "James",
            count: 112,
          },
          {
            value: "Thomas",
            count: 112,
          },
          {
            value: "Charles",
            count: 112,
          },
          {
            value: "David",
            count: 112,
          },
          {
            value: "Joseph",
            count: 112,
          },
          {
            value: "Elizabeth",
            count: 112,
          },
          {
            value: "Leslie",
            count: 110,
          },
          {
            value: "Daniel",
            count: 110,
          },
          {
            value: "Katherine",
            count: 109,
          },
          {
            value: "Anna",
            count: 108,
          },
          {
            value: "Mary",
            count: 108,
          },
          {
            value: "Andrew",
            count: 107,
          },
          {
            value: "Michael",
            count: 105,
          },
          {
            value: "Richard",
            count: 105,
          },
          {
            value: "Kenneth",
            count: 104,
          },
          {
            value: "Paul",
            count: 104,
          },
          {
            value: "Laura",
            count: 102,
          },
        ],
      },
      c50: {
        id: "c50",
        parentId: "t10",
        name: null,
        databaseName: "VALUE",
        columnType: "DOUBLE",
        approxUnique: 353,
        avg: 22.597830758211398,
        count: 48865,
        max: 507,
        min: 5,
        nullPercentage: 0,
        std: 33.42793424705058,
        topValues: [
          {
            value: "5.0",
            count: 6660,
          },
          {
            value: "6.0",
            count: 4832,
          },
          {
            value: "7.0",
            count: 3792,
          },
          {
            value: "8.0",
            count: 3191,
          },
          {
            value: "9.0",
            count: 2556,
          },
          {
            value: "10.0",
            count: 2170,
          },
          {
            value: "11.0",
            count: 1869,
          },
          {
            value: "12.0",
            count: 1629,
          },
          {
            value: "13.0",
            count: 1445,
          },
          {
            value: "14.0",
            count: 1256,
          },
          {
            value: "15.0",
            count: 1173,
          },
          {
            value: "16.0",
            count: 1055,
          },
          {
            value: "17.0",
            count: 952,
          },
          {
            value: "18.0",
            count: 829,
          },
          {
            value: "19.0",
            count: 749,
          },
          {
            value: "20.0",
            count: 721,
          },
          {
            value: "21.0",
            count: 641,
          },
          {
            value: "22.0",
            count: 617,
          },
          {
            value: "23.0",
            count: 563,
          },
          {
            value: "24.0",
            count: 559,
          },
        ],
      },
      c51: {
        id: "c51",
        parentId: "t11",
        name: null,
        databaseName: "ABBR",
        columnType: "VARCHAR",
        approxUnique: 1,
        avg: null,
        count: 122527,
        max: "SC",
        min: "SC",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "SC",
            count: 122527,
          },
        ],
      },
      c52: {
        id: "c52",
        parentId: "t11",
        name: null,
        databaseName: "GENDER",
        columnType: "VARCHAR",
        approxUnique: 2,
        avg: null,
        count: 122527,
        max: "M",
        min: "F",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "F",
            count: 65601,
          },
          {
            value: "M",
            count: 56926,
          },
        ],
      },
      c53: {
        id: "c53",
        parentId: "t11",
        name: null,
        databaseName: "YEAR",
        columnType: "DOUBLE",
        approxUnique: 145,
        avg: 1973.0593093767088,
        count: 122527,
        max: 2021,
        min: 1910,
        nullPercentage: 0,
        std: 32.388953375980286,
        topValues: [
          {
            value: "2021.0",
            count: 1712,
          },
          {
            value: "2008.0",
            count: 1700,
          },
          {
            value: "2020.0",
            count: 1682,
          },
          {
            value: "2018.0",
            count: 1668,
          },
          {
            value: "2019.0",
            count: 1660,
          },
          {
            value: "2007.0",
            count: 1656,
          },
          {
            value: "2009.0",
            count: 1644,
          },
          {
            value: "2017.0",
            count: 1644,
          },
          {
            value: "2014.0",
            count: 1644,
          },
          {
            value: "2015.0",
            count: 1636,
          },
          {
            value: "2006.0",
            count: 1627,
          },
          {
            value: "2010.0",
            count: 1626,
          },
          {
            value: "2013.0",
            count: 1608,
          },
          {
            value: "2012.0",
            count: 1602,
          },
          {
            value: "2011.0",
            count: 1597,
          },
          {
            value: "2016.0",
            count: 1596,
          },
          {
            value: "2005.0",
            count: 1511,
          },
          {
            value: "2004.0",
            count: 1464,
          },
          {
            value: "2003.0",
            count: 1429,
          },
          {
            value: "2002.0",
            count: 1367,
          },
        ],
      },
      c54: {
        id: "c54",
        parentId: "t11",
        name: null,
        databaseName: "NAME",
        columnType: "VARCHAR",
        approxUnique: 7096,
        avg: null,
        count: 122527,
        max: "Zyquan",
        min: "Aaden",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "Jessie",
            count: 204,
          },
          {
            value: "Lee",
            count: 182,
          },
          {
            value: "James",
            count: 181,
          },
          {
            value: "Marion",
            count: 179,
          },
          {
            value: "Willie",
            count: 176,
          },
          {
            value: "John",
            count: 163,
          },
          {
            value: "Johnnie",
            count: 159,
          },
          {
            value: "Robert",
            count: 156,
          },
          {
            value: "Eddie",
            count: 155,
          },
          {
            value: "Leslie",
            count: 154,
          },
          {
            value: "Mary",
            count: 152,
          },
          {
            value: "Joe",
            count: 150,
          },
          {
            value: "Francis",
            count: 149,
          },
          {
            value: "William",
            count: 145,
          },
          {
            value: "Jamie",
            count: 145,
          },
          {
            value: "Jerry",
            count: 140,
          },
          {
            value: "Charlie",
            count: 139,
          },
          {
            value: "Charles",
            count: 139,
          },
          {
            value: "Kelly",
            count: 137,
          },
          {
            value: "George",
            count: 136,
          },
        ],
      },
      c55: {
        id: "c55",
        parentId: "t11",
        name: null,
        databaseName: "VALUE",
        columnType: "DOUBLE",
        approxUnique: 1082,
        avg: 38.37772082887853,
        count: 122527,
        max: 2316,
        min: 5,
        nullPercentage: 0,
        std: 91.34683468496748,
        topValues: [
          {
            value: "5.0",
            count: 15883,
          },
          {
            value: "6.0",
            count: 11522,
          },
          {
            value: "7.0",
            count: 8737,
          },
          {
            value: "8.0",
            count: 7081,
          },
          {
            value: "9.0",
            count: 5845,
          },
          {
            value: "10.0",
            count: 4776,
          },
          {
            value: "11.0",
            count: 4112,
          },
          {
            value: "12.0",
            count: 3575,
          },
          {
            value: "13.0",
            count: 3107,
          },
          {
            value: "14.0",
            count: 2825,
          },
          {
            value: "15.0",
            count: 2498,
          },
          {
            value: "16.0",
            count: 2295,
          },
          {
            value: "17.0",
            count: 2087,
          },
          {
            value: "18.0",
            count: 1822,
          },
          {
            value: "19.0",
            count: 1780,
          },
          {
            value: "20.0",
            count: 1600,
          },
          {
            value: "21.0",
            count: 1555,
          },
          {
            value: "22.0",
            count: 1386,
          },
          {
            value: "23.0",
            count: 1330,
          },
          {
            value: "24.0",
            count: 1177,
          },
        ],
      },
      c56: {
        id: "c56",
        parentId: "t12",
        name: null,
        databaseName: "ABBR",
        columnType: "VARCHAR",
        approxUnique: 1,
        avg: null,
        count: 41540,
        max: "RI",
        min: "RI",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "RI",
            count: 41540,
          },
        ],
      },
      c57: {
        id: "c57",
        parentId: "t12",
        name: null,
        databaseName: "GENDER",
        columnType: "VARCHAR",
        approxUnique: 2,
        avg: null,
        count: 41540,
        max: "M",
        min: "F",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "F",
            count: 23211,
          },
          {
            value: "M",
            count: 18329,
          },
        ],
      },
      c58: {
        id: "c58",
        parentId: "t12",
        name: null,
        databaseName: "YEAR",
        columnType: "DOUBLE",
        approxUnique: 145,
        avg: 1970.7432595089072,
        count: 41540,
        max: 2021,
        min: 1910,
        nullPercentage: 0,
        std: 31.73804604622907,
        topValues: [
          {
            value: "2021.0",
            count: 477,
          },
          {
            value: "2006.0",
            count: 473,
          },
          {
            value: "2004.0",
            count: 471,
          },
          {
            value: "2003.0",
            count: 469,
          },
          {
            value: "2007.0",
            count: 468,
          },
          {
            value: "2005.0",
            count: 467,
          },
          {
            value: "2016.0",
            count: 466,
          },
          {
            value: "2008.0",
            count: 464,
          },
          {
            value: "2015.0",
            count: 463,
          },
          {
            value: "2001.0",
            count: 457,
          },
          {
            value: "2009.0",
            count: 456,
          },
          {
            value: "2013.0",
            count: 451,
          },
          {
            value: "2010.0",
            count: 451,
          },
          {
            value: "2018.0",
            count: 451,
          },
          {
            value: "2011.0",
            count: 450,
          },
          {
            value: "1961.0",
            count: 449,
          },
          {
            value: "2002.0",
            count: 448,
          },
          {
            value: "2019.0",
            count: 448,
          },
          {
            value: "2017.0",
            count: 448,
          },
          {
            value: "2014.0",
            count: 447,
          },
        ],
      },
      c59: {
        id: "c59",
        parentId: "t12",
        name: null,
        databaseName: "NAME",
        columnType: "VARCHAR",
        approxUnique: 1905,
        avg: null,
        count: 41540,
        max: "Zuri",
        min: "Aaden",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "John",
            count: 117,
          },
          {
            value: "Charles",
            count: 113,
          },
          {
            value: "Anna",
            count: 112,
          },
          {
            value: "Michael",
            count: 112,
          },
          {
            value: "James",
            count: 112,
          },
          {
            value: "Richard",
            count: 112,
          },
          {
            value: "Edward",
            count: 112,
          },
          {
            value: "Thomas",
            count: 112,
          },
          {
            value: "Elizabeth",
            count: 112,
          },
          {
            value: "Daniel",
            count: 112,
          },
          {
            value: "William",
            count: 112,
          },
          {
            value: "Anthony",
            count: 112,
          },
          {
            value: "Robert",
            count: 112,
          },
          {
            value: "Joseph",
            count: 112,
          },
          {
            value: "George",
            count: 111,
          },
          {
            value: "Andrew",
            count: 111,
          },
          {
            value: "David",
            count: 111,
          },
          {
            value: "Vincent",
            count: 111,
          },
          {
            value: "Peter",
            count: 110,
          },
          {
            value: "Katherine",
            count: 110,
          },
        ],
      },
      c60: {
        id: "c60",
        parentId: "t12",
        name: null,
        databaseName: "VALUE",
        columnType: "DOUBLE",
        approxUnique: 458,
        avg: 28.880717380837748,
        count: 41540,
        max: 682,
        min: 5,
        nullPercentage: 0,
        std: 49.625846766493645,
        topValues: [
          {
            value: "5.0",
            count: 5341,
          },
          {
            value: "6.0",
            count: 3963,
          },
          {
            value: "7.0",
            count: 3023,
          },
          {
            value: "8.0",
            count: 2556,
          },
          {
            value: "9.0",
            count: 1987,
          },
          {
            value: "10.0",
            count: 1762,
          },
          {
            value: "11.0",
            count: 1460,
          },
          {
            value: "12.0",
            count: 1266,
          },
          {
            value: "13.0",
            count: 1191,
          },
          {
            value: "14.0",
            count: 968,
          },
          {
            value: "15.0",
            count: 907,
          },
          {
            value: "16.0",
            count: 874,
          },
          {
            value: "17.0",
            count: 756,
          },
          {
            value: "18.0",
            count: 691,
          },
          {
            value: "19.0",
            count: 598,
          },
          {
            value: "20.0",
            count: 574,
          },
          {
            value: "21.0",
            count: 519,
          },
          {
            value: "22.0",
            count: 485,
          },
          {
            value: "24.0",
            count: 442,
          },
          {
            value: "23.0",
            count: 442,
          },
        ],
      },
      c61: {
        id: "c61",
        parentId: "t13",
        name: null,
        databaseName: "ABBR",
        columnType: "VARCHAR",
        approxUnique: 1,
        avg: null,
        count: 206944,
        max: "PA",
        min: "PA",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "PA",
            count: 206944,
          },
        ],
      },
      c62: {
        id: "c62",
        parentId: "t13",
        name: null,
        databaseName: "GENDER",
        columnType: "VARCHAR",
        approxUnique: 2,
        avg: null,
        count: 206944,
        max: "M",
        min: "F",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "F",
            count: 118653,
          },
          {
            value: "M",
            count: 88291,
          },
        ],
      },
      c63: {
        id: "c63",
        parentId: "t13",
        name: null,
        databaseName: "YEAR",
        columnType: "DOUBLE",
        approxUnique: 145,
        avg: 1975.6905587985154,
        count: 206944,
        max: 2021,
        min: 1910,
        nullPercentage: 0,
        std: 31.818140070643647,
        topValues: [
          {
            value: "2017.0",
            count: 3048,
          },
          {
            value: "2021.0",
            count: 3047,
          },
          {
            value: "2019.0",
            count: 3038,
          },
          {
            value: "2018.0",
            count: 3011,
          },
          {
            value: "2016.0",
            count: 3002,
          },
          {
            value: "2020.0",
            count: 3002,
          },
          {
            value: "2014.0",
            count: 2988,
          },
          {
            value: "2009.0",
            count: 2957,
          },
          {
            value: "2015.0",
            count: 2954,
          },
          {
            value: "2012.0",
            count: 2942,
          },
          {
            value: "2008.0",
            count: 2940,
          },
          {
            value: "2013.0",
            count: 2934,
          },
          {
            value: "2010.0",
            count: 2933,
          },
          {
            value: "2011.0",
            count: 2929,
          },
          {
            value: "2007.0",
            count: 2872,
          },
          {
            value: "2006.0",
            count: 2794,
          },
          {
            value: "2005.0",
            count: 2755,
          },
          {
            value: "2004.0",
            count: 2680,
          },
          {
            value: "2003.0",
            count: 2621,
          },
          {
            value: "2002.0",
            count: 2487,
          },
        ],
      },
      c64: {
        id: "c64",
        parentId: "t13",
        name: null,
        databaseName: "NAME",
        columnType: "VARCHAR",
        approxUnique: 9770,
        avg: null,
        count: 206944,
        max: "Zyon",
        min: "Aaden",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "Carmen",
            count: 219,
          },
          {
            value: "Lee",
            count: 199,
          },
          {
            value: "James",
            count: 193,
          },
          {
            value: "John",
            count: 192,
          },
          {
            value: "Joseph",
            count: 191,
          },
          {
            value: "Robert",
            count: 188,
          },
          {
            value: "William",
            count: 186,
          },
          {
            value: "Michael",
            count: 180,
          },
          {
            value: "Leslie",
            count: 177,
          },
          {
            value: "Jessie",
            count: 175,
          },
          {
            value: "Mary",
            count: 172,
          },
          {
            value: "Richard",
            count: 170,
          },
          {
            value: "David",
            count: 170,
          },
          {
            value: "Jean",
            count: 169,
          },
          {
            value: "Marion",
            count: 167,
          },
          {
            value: "Dana",
            count: 166,
          },
          {
            value: "Thomas",
            count: 166,
          },
          {
            value: "Charles",
            count: 165,
          },
          {
            value: "Lynn",
            count: 164,
          },
          {
            value: "Terry",
            count: 163,
          },
        ],
      },
      c65: {
        id: "c65",
        parentId: "t13",
        name: null,
        databaseName: "VALUE",
        columnType: "DOUBLE",
        approxUnique: 3676,
        avg: 84.72731270295345,
        count: 206944,
        max: 8184,
        min: 5,
        nullPercentage: 0,
        std: 316.1155003751574,
        topValues: [
          {
            value: "5.0",
            count: 25003,
          },
          {
            value: "6.0",
            count: 18306,
          },
          {
            value: "7.0",
            count: 14132,
          },
          {
            value: "8.0",
            count: 11156,
          },
          {
            value: "9.0",
            count: 9103,
          },
          {
            value: "10.0",
            count: 7662,
          },
          {
            value: "11.0",
            count: 6623,
          },
          {
            value: "12.0",
            count: 5825,
          },
          {
            value: "13.0",
            count: 5061,
          },
          {
            value: "14.0",
            count: 4376,
          },
          {
            value: "15.0",
            count: 3908,
          },
          {
            value: "16.0",
            count: 3715,
          },
          {
            value: "17.0",
            count: 3288,
          },
          {
            value: "18.0",
            count: 3063,
          },
          {
            value: "19.0",
            count: 2769,
          },
          {
            value: "20.0",
            count: 2575,
          },
          {
            value: "21.0",
            count: 2268,
          },
          {
            value: "22.0",
            count: 2219,
          },
          {
            value: "23.0",
            count: 2015,
          },
          {
            value: "24.0",
            count: 1901,
          },
        ],
      },
      c66: {
        id: "c66",
        parentId: "o1",
        name: null,
        databaseName: "ABBR",
        columnType: "VARCHAR",
        approxUnique: 2,
        avg: null,
        count: 150149,
        max: "WY",
        min: "WI",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "WI",
            count: 121398,
          },
          {
            value: "WY",
            count: 28751,
          },
        ],
      },
      c67: {
        id: "c67",
        parentId: "o1",
        name: null,
        databaseName: "GENDER",
        columnType: "VARCHAR",
        approxUnique: 2,
        avg: null,
        count: 150149,
        max: "M",
        min: "F",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "F",
            count: 81610,
          },
          {
            value: "M",
            count: 68539,
          },
        ],
      },
      c68: {
        id: "c68",
        parentId: "o1",
        name: null,
        databaseName: "YEAR",
        columnType: "DOUBLE",
        approxUnique: 145,
        avg: 1975.2700917089026,
        count: 150149,
        max: 2021,
        min: 1910,
        nullPercentage: 0,
        std: 31.625558509964012,
        topValues: [
          {
            value: "2008.0",
            count: 2166,
          },
          {
            value: "2009.0",
            count: 2163,
          },
          {
            value: "2015.0",
            count: 2149,
          },
          {
            value: "2016.0",
            count: 2141,
          },
          {
            value: "2010.0",
            count: 2138,
          },
          {
            value: "2013.0",
            count: 2131,
          },
          {
            value: "2019.0",
            count: 2119,
          },
          {
            value: "2011.0",
            count: 2119,
          },
          {
            value: "2007.0",
            count: 2118,
          },
          {
            value: "2014.0",
            count: 2110,
          },
          {
            value: "2017.0",
            count: 2109,
          },
          {
            value: "2012.0",
            count: 2100,
          },
          {
            value: "2018.0",
            count: 2098,
          },
          {
            value: "2021.0",
            count: 2090,
          },
          {
            value: "2006.0",
            count: 2037,
          },
          {
            value: "2020.0",
            count: 2030,
          },
          {
            value: "2005.0",
            count: 1955,
          },
          {
            value: "2004.0",
            count: 1889,
          },
          {
            value: "2003.0",
            count: 1830,
          },
          {
            value: "2002.0",
            count: 1782,
          },
        ],
      },
      c69: {
        id: "c69",
        parentId: "o1",
        name: null,
        databaseName: "NAME",
        columnType: "VARCHAR",
        approxUnique: 6050,
        avg: null,
        count: 150149,
        max: "Zyon",
        min: "Aaden",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "James",
            count: 259,
          },
          {
            value: "John",
            count: 258,
          },
          {
            value: "Robert",
            count: 256,
          },
          {
            value: "William",
            count: 241,
          },
          {
            value: "Charles",
            count: 236,
          },
          {
            value: "Michael",
            count: 235,
          },
          {
            value: "Joseph",
            count: 235,
          },
          {
            value: "David",
            count: 232,
          },
          {
            value: "Leslie",
            count: 230,
          },
          {
            value: "Richard",
            count: 229,
          },
          {
            value: "Thomas",
            count: 228,
          },
          {
            value: "Mary",
            count: 226,
          },
          {
            value: "Elizabeth",
            count: 224,
          },
          {
            value: "Lee",
            count: 223,
          },
          {
            value: "Daniel",
            count: 220,
          },
          {
            value: "Kenneth",
            count: 217,
          },
          {
            value: "Paul",
            count: 212,
          },
          {
            value: "Donald",
            count: 211,
          },
          {
            value: "Jack",
            count: 211,
          },
          {
            value: "George",
            count: 211,
          },
        ],
      },
      c70: {
        id: "c70",
        parentId: "o1",
        name: null,
        databaseName: "VALUE",
        columnType: "DOUBLE",
        approxUnique: 1524,
        avg: 46.09282779106088,
        count: 150149,
        max: 2403,
        min: 5,
        nullPercentage: 0,
        std: 126.78433779339467,
        topValues: [
          {
            value: "5.0",
            count: 19352,
          },
          {
            value: "6.0",
            count: 14414,
          },
          {
            value: "7.0",
            count: 11190,
          },
          {
            value: "8.0",
            count: 9011,
          },
          {
            value: "9.0",
            count: 7375,
          },
          {
            value: "10.0",
            count: 6134,
          },
          {
            value: "11.0",
            count: 5289,
          },
          {
            value: "12.0",
            count: 4489,
          },
          {
            value: "13.0",
            count: 4002,
          },
          {
            value: "14.0",
            count: 3422,
          },
          {
            value: "15.0",
            count: 3146,
          },
          {
            value: "16.0",
            count: 2802,
          },
          {
            value: "17.0",
            count: 2587,
          },
          {
            value: "18.0",
            count: 2260,
          },
          {
            value: "19.0",
            count: 2131,
          },
          {
            value: "20.0",
            count: 1905,
          },
          {
            value: "21.0",
            count: 1783,
          },
          {
            value: "23.0",
            count: 1624,
          },
          {
            value: "22.0",
            count: 1578,
          },
          {
            value: "24.0",
            count: 1367,
          },
        ],
      },
      c71: {
        id: "c71",
        parentId: "o2",
        name: null,
        databaseName: "ABBR",
        columnType: "VARCHAR",
        approxUnique: 4,
        avg: null,
        count: 360208,
        max: "WY",
        min: "WA",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "WA",
            count: 130809,
          },
          {
            value: "WI",
            count: 121398,
          },
          {
            value: "WV",
            count: 79250,
          },
          {
            value: "WY",
            count: 28751,
          },
        ],
      },
      c72: {
        id: "c72",
        parentId: "o2",
        name: null,
        databaseName: "GENDER",
        columnType: "VARCHAR",
        approxUnique: 2,
        avg: null,
        count: 360208,
        max: "M",
        min: "F",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "F",
            count: 198433,
          },
          {
            value: "M",
            count: 161775,
          },
        ],
      },
      c73: {
        id: "c73",
        parentId: "o2",
        name: null,
        databaseName: "YEAR",
        columnType: "DOUBLE",
        approxUnique: 145,
        avg: 1975.472157753298,
        count: 360208,
        max: 2021,
        min: 1910,
        nullPercentage: 0,
        std: 31.715875718726487,
        topValues: [
          {
            value: "2016.0",
            count: 5346,
          },
          {
            value: "2015.0",
            count: 5326,
          },
          {
            value: "2017.0",
            count: 5278,
          },
          {
            value: "2021.0",
            count: 5240,
          },
          {
            value: "2009.0",
            count: 5223,
          },
          {
            value: "2008.0",
            count: 5214,
          },
          {
            value: "2014.0",
            count: 5212,
          },
          {
            value: "2018.0",
            count: 5191,
          },
          {
            value: "2019.0",
            count: 5183,
          },
          {
            value: "2010.0",
            count: 5180,
          },
          {
            value: "2012.0",
            count: 5157,
          },
          {
            value: "2011.0",
            count: 5157,
          },
          {
            value: "2013.0",
            count: 5137,
          },
          {
            value: "2020.0",
            count: 5128,
          },
          {
            value: "2007.0",
            count: 5054,
          },
          {
            value: "2006.0",
            count: 4846,
          },
          {
            value: "2005.0",
            count: 4712,
          },
          {
            value: "2004.0",
            count: 4515,
          },
          {
            value: "2003.0",
            count: 4387,
          },
          {
            value: "2002.0",
            count: 4326,
          },
        ],
      },
      c74: {
        id: "c74",
        parentId: "o2",
        name: null,
        databaseName: "NAME",
        columnType: "VARCHAR",
        approxUnique: 9192,
        avg: null,
        count: 360208,
        max: "Zyon",
        min: "Aaden",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "Leslie",
            count: 531,
          },
          {
            value: "James",
            count: 513,
          },
          {
            value: "Lee",
            count: 513,
          },
          {
            value: "Robert",
            count: 503,
          },
          {
            value: "Michael",
            count: 500,
          },
          {
            value: "John",
            count: 495,
          },
          {
            value: "William",
            count: 477,
          },
          {
            value: "David",
            count: 476,
          },
          {
            value: "Mary",
            count: 469,
          },
          {
            value: "Joseph",
            count: 464,
          },
          {
            value: "Charles",
            count: 464,
          },
          {
            value: "Jessie",
            count: 459,
          },
          {
            value: "Thomas",
            count: 455,
          },
          {
            value: "Richard",
            count: 453,
          },
          {
            value: "Daniel",
            count: 452,
          },
          {
            value: "Jesse",
            count: 452,
          },
          {
            value: "Elizabeth",
            count: 448,
          },
          {
            value: "Kelly",
            count: 447,
          },
          {
            value: "Terry",
            count: 443,
          },
          {
            value: "Kenneth",
            count: 441,
          },
        ],
      },
      c75: {
        id: "c75",
        parentId: "o2",
        name: null,
        databaseName: "VALUE",
        columnType: "DOUBLE",
        approxUnique: 1628,
        avg: 42.05977657353529,
        count: 360208,
        max: 2403,
        min: 5,
        nullPercentage: 0,
        std: 105.9171104762865,
        topValues: [
          {
            value: "5.0",
            count: 45463,
          },
          {
            value: "6.0",
            count: 33643,
          },
          {
            value: "7.0",
            count: 25821,
          },
          {
            value: "8.0",
            count: 21117,
          },
          {
            value: "9.0",
            count: 17217,
          },
          {
            value: "10.0",
            count: 14468,
          },
          {
            value: "11.0",
            count: 12350,
          },
          {
            value: "12.0",
            count: 10695,
          },
          {
            value: "13.0",
            count: 9539,
          },
          {
            value: "14.0",
            count: 8328,
          },
          {
            value: "15.0",
            count: 7553,
          },
          {
            value: "16.0",
            count: 6809,
          },
          {
            value: "17.0",
            count: 6220,
          },
          {
            value: "18.0",
            count: 5588,
          },
          {
            value: "19.0",
            count: 5130,
          },
          {
            value: "20.0",
            count: 4667,
          },
          {
            value: "21.0",
            count: 4436,
          },
          {
            value: "22.0",
            count: 4013,
          },
          {
            value: "23.0",
            count: 3918,
          },
          {
            value: "24.0",
            count: 3455,
          },
        ],
      },
      c76: {
        id: "c76",
        parentId: "o2",
        name: null,
        databaseName: "ABBR",
        columnType: "VARCHAR",
        approxUnique: 5,
        avg: null,
        count: 544091,
        max: "WY",
        min: "VA",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "VA",
            count: 154400,
          },
          {
            value: "WA",
            count: 130809,
          },
          {
            value: "WI",
            count: 121398,
          },
          {
            value: "WV",
            count: 79250,
          },
          {
            value: "VT",
            count: 29483,
          },
          {
            value: "WY",
            count: 28751,
          },
        ],
      },
      c77: {
        id: "c77",
        parentId: "o2",
        name: null,
        databaseName: "GENDER",
        columnType: "VARCHAR",
        approxUnique: 2,
        avg: null,
        count: 544091,
        max: "M",
        min: "F",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "F",
            count: 298322,
          },
          {
            value: "M",
            count: 245769,
          },
        ],
      },
      c78: {
        id: "c78",
        parentId: "o2",
        name: null,
        databaseName: "YEAR",
        columnType: "DOUBLE",
        approxUnique: 145,
        avg: 1975.7412822487415,
        count: 544091,
        max: 2021,
        min: 1910,
        nullPercentage: 0,
        std: 31.80793083260013,
        topValues: [
          {
            value: "2016.0",
            count: 8135,
          },
          {
            value: "2015.0",
            count: 8132,
          },
          {
            value: "2017.0",
            count: 8061,
          },
          {
            value: "2021.0",
            count: 8008,
          },
          {
            value: "2018.0",
            count: 8007,
          },
          {
            value: "2014.0",
            count: 7994,
          },
          {
            value: "2008.0",
            count: 7972,
          },
          {
            value: "2009.0",
            count: 7964,
          },
          {
            value: "2019.0",
            count: 7946,
          },
          {
            value: "2010.0",
            count: 7908,
          },
          {
            value: "2012.0",
            count: 7893,
          },
          {
            value: "2013.0",
            count: 7877,
          },
          {
            value: "2020.0",
            count: 7876,
          },
          {
            value: "2011.0",
            count: 7844,
          },
          {
            value: "2007.0",
            count: 7824,
          },
          {
            value: "2006.0",
            count: 7548,
          },
          {
            value: "2005.0",
            count: 7343,
          },
          {
            value: "2004.0",
            count: 7050,
          },
          {
            value: "2003.0",
            count: 6804,
          },
          {
            value: "2002.0",
            count: 6664,
          },
        ],
      },
      c79: {
        id: "c79",
        parentId: "o2",
        name: null,
        databaseName: "NAME",
        columnType: "VARCHAR",
        approxUnique: 10610,
        avg: null,
        count: 544091,
        max: "Zyquan",
        min: "Aaden",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "James",
            count: 803,
          },
          {
            value: "Leslie",
            count: 784,
          },
          {
            value: "Robert",
            count: 768,
          },
          {
            value: "John",
            count: 767,
          },
          {
            value: "Lee",
            count: 759,
          },
          {
            value: "William",
            count: 751,
          },
          {
            value: "Michael",
            count: 746,
          },
          {
            value: "David",
            count: 721,
          },
          {
            value: "Mary",
            count: 714,
          },
          {
            value: "Charles",
            count: 711,
          },
          {
            value: "Joseph",
            count: 697,
          },
          {
            value: "Jessie",
            count: 697,
          },
          {
            value: "Thomas",
            count: 688,
          },
          {
            value: "Daniel",
            count: 682,
          },
          {
            value: "Elizabeth",
            count: 674,
          },
          {
            value: "Richard",
            count: 670,
          },
          {
            value: "George",
            count: 667,
          },
          {
            value: "Andrew",
            count: 655,
          },
          {
            value: "Kelly",
            count: 652,
          },
          {
            value: "Paul",
            count: 651,
          },
        ],
      },
      c80: {
        id: "c80",
        parentId: "o2",
        name: null,
        databaseName: "VALUE",
        columnType: "DOUBLE",
        approxUnique: 2029,
        avg: 42.3173880839786,
        count: 544091,
        max: 2679,
        min: 5,
        nullPercentage: 0,
        std: 108.2769856781066,
        topValues: [
          {
            value: "5.0",
            count: 69376,
          },
          {
            value: "6.0",
            count: 50887,
          },
          {
            value: "7.0",
            count: 39052,
          },
          {
            value: "8.0",
            count: 31803,
          },
          {
            value: "9.0",
            count: 25978,
          },
          {
            value: "10.0",
            count: 21862,
          },
          {
            value: "11.0",
            count: 18577,
          },
          {
            value: "12.0",
            count: 16164,
          },
          {
            value: "13.0",
            count: 14189,
          },
          {
            value: "14.0",
            count: 12443,
          },
          {
            value: "15.0",
            count: 11216,
          },
          {
            value: "16.0",
            count: 10174,
          },
          {
            value: "17.0",
            count: 9314,
          },
          {
            value: "18.0",
            count: 8359,
          },
          {
            value: "19.0",
            count: 7658,
          },
          {
            value: "20.0",
            count: 7032,
          },
          {
            value: "21.0",
            count: 6685,
          },
          {
            value: "22.0",
            count: 6068,
          },
          {
            value: "23.0",
            count: 5795,
          },
          {
            value: "24.0",
            count: 5344,
          },
        ],
      },
      c81: {
        id: "c81",
        parentId: "o3",
        name: null,
        databaseName: "ABBR",
        columnType: "VARCHAR",
        approxUnique: 7,
        avg: null,
        count: 1006842,
        max: "WY",
        min: "TX",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "TX",
            count: 368987,
          },
          {
            value: "VA",
            count: 154400,
          },
          {
            value: "WA",
            count: 130809,
          },
          {
            value: "WI",
            count: 121398,
          },
          {
            value: "UT",
            count: 93764,
          },
          {
            value: "WV",
            count: 79250,
          },
          {
            value: "VT",
            count: 29483,
          },
          {
            value: "WY",
            count: 28751,
          },
        ],
      },
      c82: {
        id: "c82",
        parentId: "o3",
        name: null,
        databaseName: "GENDER",
        columnType: "VARCHAR",
        approxUnique: 2,
        avg: null,
        count: 1006842,
        max: "M",
        min: "F",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "F",
            count: 559537,
          },
          {
            value: "M",
            count: 447305,
          },
        ],
      },
      c83: {
        id: "c83",
        parentId: "o3",
        name: null,
        databaseName: "YEAR",
        columnType: "DOUBLE",
        approxUnique: 145,
        avg: 1977.794954918448,
        count: 1006842,
        max: 2021,
        min: 1910,
        nullPercentage: 0,
        std: 31.564326771700852,
        topValues: [
          {
            value: "2015.0",
            count: 16278,
          },
          {
            value: "2016.0",
            count: 16245,
          },
          {
            value: "2014.0",
            count: 16078,
          },
          {
            value: "2021.0",
            count: 16076,
          },
          {
            value: "2009.0",
            count: 16041,
          },
          {
            value: "2017.0",
            count: 15937,
          },
          {
            value: "2008.0",
            count: 15935,
          },
          {
            value: "2019.0",
            count: 15884,
          },
          {
            value: "2018.0",
            count: 15863,
          },
          {
            value: "2012.0",
            count: 15818,
          },
          {
            value: "2013.0",
            count: 15794,
          },
          {
            value: "2010.0",
            count: 15770,
          },
          {
            value: "2020.0",
            count: 15741,
          },
          {
            value: "2007.0",
            count: 15700,
          },
          {
            value: "2011.0",
            count: 15636,
          },
          {
            value: "2006.0",
            count: 15080,
          },
          {
            value: "2005.0",
            count: 14651,
          },
          {
            value: "2004.0",
            count: 14174,
          },
          {
            value: "2003.0",
            count: 13749,
          },
          {
            value: "2002.0",
            count: 13453,
          },
        ],
      },
      c84: {
        id: "c84",
        parentId: "o3",
        name: null,
        databaseName: "NAME",
        columnType: "VARCHAR",
        approxUnique: 20141,
        avg: null,
        count: 1006842,
        max: "Zyron",
        min: "Aadan",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "Leslie",
            count: 1141,
          },
          {
            value: "James",
            count: 1118,
          },
          {
            value: "Lee",
            count: 1086,
          },
          {
            value: "Robert",
            count: 1075,
          },
          {
            value: "John",
            count: 1075,
          },
          {
            value: "William",
            count: 1036,
          },
          {
            value: "Michael",
            count: 1031,
          },
          {
            value: "Jessie",
            count: 1023,
          },
          {
            value: "David",
            count: 1015,
          },
          {
            value: "Charles",
            count: 1012,
          },
          {
            value: "Mary",
            count: 1009,
          },
          {
            value: "Kelly",
            count: 956,
          },
          {
            value: "Daniel",
            count: 953,
          },
          {
            value: "George",
            count: 949,
          },
          {
            value: "Thomas",
            count: 949,
          },
          {
            value: "Joseph",
            count: 948,
          },
          {
            value: "Richard",
            count: 947,
          },
          {
            value: "Jesse",
            count: 931,
          },
          {
            value: "Elizabeth",
            count: 929,
          },
          {
            value: "Jamie",
            count: 918,
          },
        ],
      },
      c85: {
        id: "c85",
        parentId: "o3",
        name: null,
        databaseName: "VALUE",
        columnType: "DOUBLE",
        approxUnique: 2972,
        avg: 49.47834416919437,
        count: 1006842,
        max: 5059,
        min: 5,
        nullPercentage: 0,
        std: 148.80589631075557,
        topValues: [
          {
            value: "5.0",
            count: 128724,
          },
          {
            value: "6.0",
            count: 93718,
          },
          {
            value: "7.0",
            count: 71847,
          },
          {
            value: "8.0",
            count: 58351,
          },
          {
            value: "9.0",
            count: 47333,
          },
          {
            value: "10.0",
            count: 39607,
          },
          {
            value: "11.0",
            count: 33781,
          },
          {
            value: "12.0",
            count: 29137,
          },
          {
            value: "13.0",
            count: 25961,
          },
          {
            value: "14.0",
            count: 22635,
          },
          {
            value: "15.0",
            count: 20430,
          },
          {
            value: "16.0",
            count: 18540,
          },
          {
            value: "17.0",
            count: 16725,
          },
          {
            value: "18.0",
            count: 14996,
          },
          {
            value: "19.0",
            count: 13779,
          },
          {
            value: "20.0",
            count: 12662,
          },
          {
            value: "21.0",
            count: 11984,
          },
          {
            value: "22.0",
            count: 11054,
          },
          {
            value: "23.0",
            count: 10435,
          },
          {
            value: "24.0",
            count: 9639,
          },
        ],
      },
    },
  },
  alerts: {
    allIds: [],
    byId: {},
  },
};
