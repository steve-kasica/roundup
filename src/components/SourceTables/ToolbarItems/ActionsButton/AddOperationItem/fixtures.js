export const state = {
  ui: {
    hoveredColumnIds: [],
    selectedColumnIds: [],
    focusedColumnIds: [],
    visibleColumnIds: [],
    hiddenColumnIds: [],
    draggingColumnIds: [],
    dropTargetColumnIds: [],
    focusedObjectId: null,
    selectedTableIds: [],
    loadingOperations: [],
    selectedMatches: [],
  },
  operations: {
    allIds: [],
    byId: {},
    rootOperationId: null,
  },
  tables: {
    allIds: ["t1", "t2", "t3"],
    byId: {
      t1: {
        id: "t1",
        parentId: null,
        source: "file upload",
        databaseName: "t_kyohnb_mkrakc47",
        name: "TX",
        fileName: "TX.csv",
        extension: "csv",
        size: 7290537,
        mimeType: "text/csv",
        dateLastModified: 1734979617999,
        columnIds: ["c1", "c2", "c3", "c4", "c5"],
        rowCount: 368987,
        hiddenColumnIds: [],
      },
      t2: {
        id: "t2",
        parentId: null,
        source: "file upload",
        databaseName: "t_onpu8z_mkrakcdt",
        name: "UT",
        fileName: "UT.csv",
        extension: "csv",
        size: 1813197,
        mimeType: "text/csv",
        dateLastModified: 1734979618120,
        columnIds: ["c6", "c7", "c8", "c9", "c10"],
        rowCount: 93764,
        hiddenColumnIds: [],
      },
      t3: {
        id: "t3",
        parentId: null,
        source: "file upload",
        databaseName: "t_01bxzp_mkrakcgb",
        name: "VT",
        fileName: "VT.csv",
        extension: "csv",
        size: 573634,
        mimeType: "text/csv",
        dateLastModified: 1734979618227,
        columnIds: ["c11", "c12", "c13", "c14", "c15"],
        rowCount: 29483,
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
      c2: {
        id: "c2",
        parentId: "t1",
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
      c3: {
        id: "c3",
        parentId: "t1",
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
      c4: {
        id: "c4",
        parentId: "t1",
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
      c5: {
        id: "c5",
        parentId: "t1",
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
      c6: {
        id: "c6",
        parentId: "t2",
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
      c7: {
        id: "c7",
        parentId: "t2",
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
      c8: {
        id: "c8",
        parentId: "t2",
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
      c9: {
        id: "c9",
        parentId: "t2",
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
      c10: {
        id: "c10",
        parentId: "t2",
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
      c11: {
        id: "c11",
        parentId: "t3",
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
      c12: {
        id: "c12",
        parentId: "t3",
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
      c13: {
        id: "c13",
        parentId: "t3",
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
      c14: {
        id: "c14",
        parentId: "t3",
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
      c15: {
        id: "c15",
        parentId: "t3",
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
    },
  },
  alerts: {
    allIds: [],
    byId: {},
  },
};
