export default {
  ui: {
    hoveredColumnIds: [],
    selectedColumnIds: ["c73"],
    focusedColumnIds: [],
    visibleColumnIds: [],
    hiddenColumnIds: [],
    draggingColumnIds: [],
    dropTargetColumnIds: [],
    focusedObjectId: "o2",
    selectedTableIds: [],
    loadingOperations: [],
    selectedMatches: ["matches", "left_unmatched", "right_unmatched"],
    tableSearchString: "",
  },
  operations: {
    allIds: ["o1", "o2"],
    byId: {
      o1: {
        id: "o1",
        name: null,
        databaseName: "o__w2o5oy_mkya6ar3",
        operationType: "stack",
        parentId: "o2",
        childIds: ["t2", "t1"],
        columnIds: ["c71", "c72", "c73"],
        hiddenColumnIds: [],
        rowCount: 3773,
        isMaterialized: true,
        isInSync: true,
        columnCount: 3,
      },
      o2: {
        id: "o2",
        name: "Op.",
        databaseName: "o__p67q4h_mkya73qt",
        operationType: "pack",
        parentId: null,
        childIds: ["t3", "o1"],
        columnIds: [],
        hiddenColumnIds: [],
        rowCount: null,
        isMaterialized: false,
        isInSync: false,
        joinType: "FULL OUTER",
        joinPredicate: "CONTAINS",
        joinKey1: "c67",
        joinKey2: "c71",
        matchStats: {
          matches: 64428,
          left_unmatched: 311,
          right_unmatched: 7,
        },
        columnCount: null,
      },
    },
    rootOperationId: "o2",
  },
  tables: {
    allIds: ["t1", "t2", "t3"],
    byId: {
      t1: {
        id: "t1",
        parentId: "o1",
        source: "file upload",
        databaseName: "t_y6qhbc_mkya66t9",
        name: "lambert_1",
        fileName: "lambert_1.csv",
        extension: "csv",
        size: 607442,
        mimeType: "text/csv",
        dateLastModified: 1730741525092,
        columnIds: ["c3", "c6", "c7"],
        rowCount: 3653,
        hiddenColumnIds: [],
      },
      t2: {
        id: "t2",
        parentId: "o1",
        source: "file upload",
        databaseName: "t_qfj966_mkya66y8",
        name: "lambert_2",
        fileName: "lambert_2.csv",
        extension: "csv",
        size: 16225,
        mimeType: "text/csv",
        dateLastModified: 1730741525092,
        columnIds: ["c48", "c51", "c52"],
        rowCount: 120,
        hiddenColumnIds: [],
      },
      t3: {
        id: "t3",
        parentId: "o2",
        source: "file upload",
        databaseName: "t_8fjued_mkya66yi",
        name: "violent_crimes",
        fileName: "violent_crimes.csv",
        extension: "csv",
        size: 4508437,
        mimeType: "text/csv",
        dateLastModified: 1730741525096,
        columnIds: ["c67", "c68", "c69", "c70"],
        rowCount: 64739,
        hiddenColumnIds: [],
      },
    },
  },
  columns: {
    allIds: [
      "c3",
      "c6",
      "c7",
      "c48",
      "c51",
      "c52",
      "c67",
      "c68",
      "c69",
      "c70",
      "c71",
      "c72",
      "c73",
    ],
    byId: {
      c3: {
        id: "c3",
        parentId: "t1",
        name: null,
        databaseName: "DATE",
        columnType: "VARCHAR",
        approxUnique: 2650,
        avg: null,
        count: 3653,
        max: "2017-12-31",
        min: "2008-01-01",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "2008-01-03",
            count: 1,
          },
          {
            value: "2008-01-05",
            count: 1,
          },
          {
            value: "2008-01-06",
            count: 1,
          },
          {
            value: "2008-01-07",
            count: 1,
          },
          {
            value: "2008-01-09",
            count: 1,
          },
          {
            value: "2008-01-10",
            count: 1,
          },
          {
            value: "2008-01-11",
            count: 1,
          },
          {
            value: "2008-01-12",
            count: 1,
          },
          {
            value: "2008-01-13",
            count: 1,
          },
          {
            value: "2008-01-14",
            count: 1,
          },
          {
            value: "2008-01-15",
            count: 1,
          },
          {
            value: "2008-01-17",
            count: 1,
          },
          {
            value: "2008-01-18",
            count: 1,
          },
          {
            value: "2008-01-19",
            count: 1,
          },
          {
            value: "2008-01-20",
            count: 1,
          },
          {
            value: "2008-01-16",
            count: 1,
          },
          {
            value: "2008-01-08",
            count: 1,
          },
          {
            value: "2008-01-04",
            count: 1,
          },
          {
            value: "2008-01-02",
            count: 1,
          },
          {
            value: "2008-01-01",
            count: 1,
          },
        ],
      },
      c6: {
        id: "c6",
        parentId: "t1",
        name: null,
        databaseName: "TMAX",
        columnType: "DOUBLE",
        approxUnique: 129,
        avg: 67.61127840131398,
        count: 3653,
        max: 108,
        min: 2,
        nullPercentage: 0,
        std: 20.295233412524645,
        topValues: [
          {
            value: "83.0",
            count: 108,
          },
          {
            value: "88.0",
            count: 93,
          },
          {
            value: "87.0",
            count: 87,
          },
          {
            value: "84.0",
            count: 83,
          },
          {
            value: "82.0",
            count: 81,
          },
          {
            value: "81.0",
            count: 78,
          },
          {
            value: "85.0",
            count: 77,
          },
          {
            value: "92.0",
            count: 70,
          },
          {
            value: "93.0",
            count: 69,
          },
          {
            value: "80.0",
            count: 69,
          },
          {
            value: "79.0",
            count: 69,
          },
          {
            value: "77.0",
            count: 68,
          },
          {
            value: "90.0",
            count: 67,
          },
          {
            value: "86.0",
            count: 66,
          },
          {
            value: "91.0",
            count: 66,
          },
          {
            value: "75.0",
            count: 65,
          },
          {
            value: "76.0",
            count: 63,
          },
          {
            value: "89.0",
            count: 62,
          },
          {
            value: "71.0",
            count: 62,
          },
          {
            value: "66.0",
            count: 60,
          },
        ],
      },
      c7: {
        id: "c7",
        parentId: "t1",
        name: null,
        databaseName: "TMAX_ATTRIBUTES",
        columnType: "VARCHAR",
        approxUnique: 4,
        avg: null,
        count: 3653,
        max: ",,Z",
        min: ",,0",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: ",,W",
            count: 1743,
          },
          {
            value: ",,0",
            count: 1089,
          },
          {
            value: ",,X",
            count: 819,
          },
          {
            value: ",,Z",
            count: 2,
          },
        ],
      },
      c48: {
        id: "c48",
        parentId: "t2",
        name: null,
        databaseName: "DATE",
        columnType: "VARCHAR",
        approxUnique: 123,
        avg: null,
        count: 120,
        max: "2018-04-30",
        min: "2018-01-01",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "2018-01-03",
            count: 1,
          },
          {
            value: "2018-01-05",
            count: 1,
          },
          {
            value: "2018-01-06",
            count: 1,
          },
          {
            value: "2018-01-07",
            count: 1,
          },
          {
            value: "2018-01-09",
            count: 1,
          },
          {
            value: "2018-01-10",
            count: 1,
          },
          {
            value: "2018-01-11",
            count: 1,
          },
          {
            value: "2018-01-12",
            count: 1,
          },
          {
            value: "2018-01-13",
            count: 1,
          },
          {
            value: "2018-01-14",
            count: 1,
          },
          {
            value: "2018-01-15",
            count: 1,
          },
          {
            value: "2018-01-17",
            count: 1,
          },
          {
            value: "2018-01-18",
            count: 1,
          },
          {
            value: "2018-01-19",
            count: 1,
          },
          {
            value: "2018-01-20",
            count: 1,
          },
          {
            value: "2018-01-16",
            count: 1,
          },
          {
            value: "2018-01-08",
            count: 1,
          },
          {
            value: "2018-01-04",
            count: 1,
          },
          {
            value: "2018-01-02",
            count: 1,
          },
          {
            value: "2018-01-01",
            count: 1,
          },
        ],
      },
      c51: {
        id: "c51",
        parentId: "t2",
        name: null,
        databaseName: "TMAX",
        columnType: "DOUBLE",
        approxUnique: 59,
        avg: 49.8,
        count: 120,
        max: 85,
        min: 9,
        nullPercentage: 0,
        std: 15.543703634883022,
        topValues: [
          {
            value: "48.0",
            count: 7,
          },
          {
            value: "57.0",
            count: 6,
          },
          {
            value: "50.0",
            count: 5,
          },
          {
            value: "69.0",
            count: 5,
          },
          {
            value: "43.0",
            count: 5,
          },
          {
            value: "53.0",
            count: 4,
          },
          {
            value: "56.0",
            count: 4,
          },
          {
            value: "60.0",
            count: 4,
          },
          {
            value: "62.0",
            count: 4,
          },
          {
            value: "38.0",
            count: 4,
          },
          {
            value: "42.0",
            count: 4,
          },
          {
            value: "34.0",
            count: 3,
          },
          {
            value: "72.0",
            count: 3,
          },
          {
            value: "59.0",
            count: 3,
          },
          {
            value: "66.0",
            count: 3,
          },
          {
            value: "52.0",
            count: 3,
          },
          {
            value: "51.0",
            count: 3,
          },
          {
            value: "45.0",
            count: 3,
          },
          {
            value: "39.0",
            count: 2,
          },
          {
            value: "29.0",
            count: 2,
          },
        ],
      },
      c52: {
        id: "c52",
        parentId: "t2",
        name: null,
        databaseName: "TMAX_ATTRIBUTES",
        columnType: "VARCHAR",
        approxUnique: 1,
        avg: null,
        count: 120,
        max: ",,W",
        min: ",,W",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: ",,W",
            count: 120,
          },
        ],
      },
      c67: {
        id: "c67",
        parentId: "t3",
        name: null,
        databaseName: "Date",
        columnType: "VARCHAR",
        approxUnique: 53765,
        avg: null,
        count: 64739,
        max: "2018-04-30T22:26:00",
        min: "1900-01-01T00:00:00",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "2014-12-07T20:30:00",
            count: 40,
          },
          {
            value: "2015-06-20T23:33:00",
            count: 29,
          },
          {
            value: "2012-02-10T16:11:00",
            count: 24,
          },
          {
            value: "2014-08-12T15:00:00",
            count: 20,
          },
          {
            value: "2012-01-01T00:01:00",
            count: 19,
          },
          {
            value: "2017-09-15T22:30:00",
            count: 17,
          },
          {
            value: "2012-04-15T19:47:00",
            count: 17,
          },
          {
            value: "2010-04-08T15:25:00",
            count: 17,
          },
          {
            value: "2010-01-01T00:01:00",
            count: 16,
          },
          {
            value: "2010-01-22T18:53:00",
            count: 15,
          },
          {
            value: "2017-09-15T09:00:00",
            count: 15,
          },
          {
            value: "2012-03-17T20:32:00",
            count: 15,
          },
          {
            value: "2008-11-29T21:07:00",
            count: 14,
          },
          {
            value: "2009-02-05T20:05:00",
            count: 14,
          },
          {
            value: "2009-03-20T21:40:00",
            count: 14,
          },
          {
            value: "2014-01-01T00:01:00",
            count: 13,
          },
          {
            value: "2010-08-28T21:10:00",
            count: 12,
          },
          {
            value: "2011-05-07T01:14:00",
            count: 12,
          },
          {
            value: "2014-11-24T22:00:00",
            count: 11,
          },
          {
            value: "2018-01-24T18:00:00",
            count: 11,
          },
        ],
      },
      c68: {
        id: "c68",
        parentId: "t3",
        name: null,
        databaseName: "Count",
        columnType: "DOUBLE",
        approxUnique: 2,
        avg: 0.9653068474953274,
        count: 64739,
        max: 1,
        min: -1,
        nullPercentage: 0,
        std: 0.2611201703973508,
        topValues: [
          {
            value: "1.0",
            count: 63616,
          },
          {
            value: "-1.0",
            count: 1123,
          },
        ],
      },
      c69: {
        id: "c69",
        parentId: "t3",
        name: null,
        databaseName: "Crime",
        columnType: "DOUBLE",
        approxUnique: 160,
        avg: 36789.82055638796,
        count: 64739,
        max: 44205,
        min: 10000,
        nullPercentage: 0,
        std: 7437.627729958122,
        topValues: [
          {
            value: "41011.0",
            count: 12573,
          },
          {
            value: "31111.0",
            count: 9612,
          },
          {
            value: "31421.0",
            count: 4551,
          },
          {
            value: "41013.0",
            count: 3810,
          },
          {
            value: "43012.0",
            count: 2589,
          },
          {
            value: "21000.0",
            count: 2581,
          },
          {
            value: "43013.0",
            count: 2368,
          },
          {
            value: "41021.0",
            count: 2185,
          },
          {
            value: "10000.0",
            count: 1778,
          },
          {
            value: "42011.0",
            count: 1309,
          },
          {
            value: "43015.0",
            count: 1277,
          },
          {
            value: "43016.0",
            count: 1247,
          },
          {
            value: "31112.0",
            count: 1125,
          },
          {
            value: "41016.0",
            count: 1001,
          },
          {
            value: "42013.0",
            count: 857,
          },
          {
            value: "32111.0",
            count: 810,
          },
          {
            value: "42014.0",
            count: 796,
          },
          {
            value: "36111.0",
            count: 786,
          },
          {
            value: "44015.0",
            count: 750,
          },
          {
            value: "44013.0",
            count: 662,
          },
        ],
      },
      c70: {
        id: "c70",
        parentId: "t3",
        name: null,
        databaseName: "Description",
        columnType: "VARCHAR",
        approxUnique: 210,
        avg: null,
        count: 64739,
        max: "ROBBERY-RESIDENCE/STRNGARM/NO INJ/SUCCESS",
        min: "AGG.ASSAULT-FIREARM/CITIZEN ADULT 1ST DEGREE",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "AGG.ASSAULT-FIREARM/CITIZEN ADULT 1ST DEGREE",
            count: 12394,
          },
          {
            value: "ROBBERY-HIGHWAY  /FIREARM USED/SUCCESSFUL",
            count: 9533,
          },
          {
            value: "ROBBERY-HIGHWAY  /STRNGARM/NO INJ/SUCCESS",
            count: 4524,
          },
          {
            value: "AGG.ASSAULT-FIREARM/CITIZEN ADULT 3RD DEGREE",
            count: 3774,
          },
          {
            value: "AGG.ASSAULT-OTH DANG WEP/CTZEN ADLT 2ND DEGREE",
            count: 2573,
          },
          {
            value: "RAPE -- FORCIBLE",
            count: 2559,
          },
          {
            value: "AGG.ASSAULT-OTH DANG WEP/CTZEN ADLT 3RD DEGREE",
            count: 2332,
          },
          {
            value: "AGG.ASSAULT-FIREARM/CITIZEN CHILD 1ST DEGREE",
            count: 2164,
          },
          {
            value: "HOMICIDE",
            count: 1762,
          },
          {
            value: "AGG.ASSAULT-KNIFE/CITIZEN ADULT 1ST DEGREE",
            count: 1301,
          },
          {
            value: "ASSLT-AGGRAV-OTH-WPN-2ND-ADULT-DOMESTIC",
            count: 1274,
          },
          {
            value: "ASSLT-AGGRAV-OTH-WPN-3RD-ADULT-DOMESTIC",
            count: 1230,
          },
          {
            value: "ROBBERY-HIGHWAY     /FIREARM USED/ATTEMPT",
            count: 1117,
          },
          {
            value: "ASSLT-AGGRAV-FIREARM-3RD-ADULT-DOMESTIC",
            count: 982,
          },
          {
            value: "AGG.ASSAULT-KNIFE/CITIZEN ADULT 3RD DEGREE",
            count: 851,
          },
          {
            value: "ROBBERY-RESIDENCE/FIREARM USED/SUCCESSFUL",
            count: 805,
          },
          {
            value: "ASSLT-AGGRV-KNIFE/CUT-1ST-ADULT-DOMESTIC",
            count: 791,
          },
          {
            value: "ROBBERY-COMMERCE PL/FIREARM USED/SUCCESS",
            count: 773,
          },
          {
            value: "ASSLT-AGGRV-HND/FST/FT-2ND-ADUL-DOMESTIC",
            count: 743,
          },
          {
            value: "AGG.ASSAULT-HNDS,FST,FEET/CTZEN ADLT 3RD DEGRE",
            count: 651,
          },
        ],
      },
      c71: {
        id: "c71",
        parentId: "o1",
        name: null,
        databaseName: "DATE",
        columnType: "VARCHAR",
        approxUnique: 2650,
        avg: null,
        count: 3773,
        max: "2018-04-30",
        min: "2008-01-01",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: "2018-01-03",
            count: 1,
          },
          {
            value: "2018-01-05",
            count: 1,
          },
          {
            value: "2018-01-06",
            count: 1,
          },
          {
            value: "2018-01-07",
            count: 1,
          },
          {
            value: "2018-01-09",
            count: 1,
          },
          {
            value: "2018-01-10",
            count: 1,
          },
          {
            value: "2018-01-11",
            count: 1,
          },
          {
            value: "2018-01-12",
            count: 1,
          },
          {
            value: "2018-01-13",
            count: 1,
          },
          {
            value: "2018-01-14",
            count: 1,
          },
          {
            value: "2018-01-15",
            count: 1,
          },
          {
            value: "2018-01-17",
            count: 1,
          },
          {
            value: "2018-01-18",
            count: 1,
          },
          {
            value: "2018-01-19",
            count: 1,
          },
          {
            value: "2018-01-20",
            count: 1,
          },
          {
            value: "2018-01-16",
            count: 1,
          },
          {
            value: "2018-01-08",
            count: 1,
          },
          {
            value: "2018-01-04",
            count: 1,
          },
          {
            value: "2018-01-02",
            count: 1,
          },
          {
            value: "2018-01-01",
            count: 1,
          },
        ],
      },
      c72: {
        id: "c72",
        parentId: "o1",
        name: null,
        databaseName: "TMAX",
        columnType: "DOUBLE",
        approxUnique: 135,
        avg: 67.04479194275113,
        count: 3773,
        max: 108,
        min: 2,
        nullPercentage: 0,
        std: 20.400649188629178,
        topValues: [
          {
            value: "83.0",
            count: 108,
          },
          {
            value: "88.0",
            count: 93,
          },
          {
            value: "87.0",
            count: 87,
          },
          {
            value: "84.0",
            count: 83,
          },
          {
            value: "82.0",
            count: 81,
          },
          {
            value: "81.0",
            count: 78,
          },
          {
            value: "85.0",
            count: 78,
          },
          {
            value: "80.0",
            count: 71,
          },
          {
            value: "79.0",
            count: 70,
          },
          {
            value: "92.0",
            count: 70,
          },
          {
            value: "77.0",
            count: 69,
          },
          {
            value: "93.0",
            count: 69,
          },
          {
            value: "90.0",
            count: 67,
          },
          {
            value: "86.0",
            count: 66,
          },
          {
            value: "91.0",
            count: 66,
          },
          {
            value: "57.0",
            count: 66,
          },
          {
            value: "75.0",
            count: 65,
          },
          {
            value: "66.0",
            count: 63,
          },
          {
            value: "76.0",
            count: 63,
          },
          {
            value: "89.0",
            count: 62,
          },
        ],
      },
      c73: {
        id: "c73",
        parentId: "o1",
        name: null,
        databaseName: "TMAX_ATTRIBUTES",
        columnType: "VARCHAR",
        approxUnique: 4,
        avg: null,
        count: 3773,
        max: ",,Z",
        min: ",,0",
        nullPercentage: 0,
        std: null,
        topValues: [
          {
            value: ",,W",
            count: 1863,
          },
          {
            value: ",,0",
            count: 1089,
          },
          {
            value: ",,X",
            count: 819,
          },
          {
            value: ",,Z",
            count: 2,
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
