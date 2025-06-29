import { constants } from "./constants"

export const initialAppState:AppState = {
    statType:null,
    chartType:null,
    player:null,
    startYear:null,
    endYear:null,
    availableYears:constants.FULL_YEARS,
    primaryStat:null,
    secondaryStat:null,
    aggregate:null,
    lastChange:null,
    stateID:1
}