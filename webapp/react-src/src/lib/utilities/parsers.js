import { utcParse } from "d3";

/**
 * OpenRefine stores Parse date string in ISO 8601 extended format 
 * with UTC designator and microsecond precision
 */
export const parseOpenRefineDate = utcParse("%Y-%m-%dT%H:%M:%S.%fZ");