import { constants } from "./constants"

export const initialAppState:AppState = {
    statType:null,
    chartType:null,
    players:[""],
    startYear:null,
    endYear:null,
    availableYears:constants.FULL_YEARS,
    primaryStat:null,
    secondaryStat:null,
    aggregate:"total",
    numberOfPoints:50,
    lastChange:null,
    stateID:1
}