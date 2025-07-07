"use client"

import { useReducer , useEffect , createContext , ReactNode } from 'react'
import { initialAppState } from '../initialAppState'
import { constants } from '../constants'

type ContextValues = {
    dispatch:(action:StateAction) => void,
    appState:AppState
}
type AppContextProviderProps = {
    children: ReactNode
};

const reducer = (appState:AppState, action:StateAction):AppState => {
    const {type,payload} = action
    const newID = appState.stateID ++
    switch (type) {
        case "update_chart_type":{
            if (payload.chartType) {
                return {...appState,chartType:payload.chartType,lastChange:payload,stateID:newID}
            }
            return appState
        }
        case "update_stat_type":{
            if (payload.statType) {
                return {
                    ...appState,
                    statType: payload.statType,
                    players: [""], // Reset players
                    primaryStat: null, // Reset primary stat
                    secondaryStat: null, // Reset secondary stat
                    lastChange: payload,
                    stateID: newID
                }
            }
            return appState
        }
        case "update_start_year":{
            if (payload.year || payload.year === null) {
                return {...appState,startYear:payload.year,lastChange:payload,stateID:newID}
            }
            return appState
        }
        case "update_end_year":{
            if (payload.year || payload.year === null) {
                return {...appState,endYear:payload.year,lastChange:payload,stateID:newID}
            }
            return appState
        }
        case "update_available_years":{
            if (payload.availableYears) {
                return {...appState,availableYears:payload.availableYears,lastChange:payload,stateID:newID}
            }
            return appState
        }
        case "update_players":{
            if (payload.players) {
                return {...appState,players:payload.players,lastChange:payload,stateID:newID}
            }
            return appState
        }
        case "add_player":{
            const newPlayers = [...appState.players, payload.players![0]]
            return {...appState,players:newPlayers,lastChange:payload,stateID:newID}
        }
        case "remove_player":{
            const newPlayers = appState.players.filter(player => player !== payload.players![0])
            return {...appState,players:newPlayers,lastChange:payload,stateID:newID}
        }
        case "update_primary_stat":{
            if (payload.primaryStat || payload.primaryStat === null) {
                return {...appState,primaryStat:payload.primaryStat,lastChange:payload,stateID:newID}
            }
            return appState
        }
        case "update_secondary_stat":{
            if (payload.secondaryStat || payload.secondaryStat === null) {
                return {...appState,secondaryStat:payload.secondaryStat,lastChange:payload,stateID:newID}
            }
            return appState
        }
        case "update_aggregate":{
            if (payload.aggregate || payload.aggregate === null) {
                return {...appState,aggregate:payload.aggregate,lastChange:payload,stateID:newID}
            }
            return appState
        }
    }
    return appState
}


const AppContext = createContext<ContextValues | null>(null)

const AppContextProvider = (props:AppContextProviderProps) => {
    const [appState,dispatch] = useReducer(reducer,initialAppState)
    useEffect(()=>{
        console.log('AppState is ',appState)
        const { lastChange } = appState
        // Only update available years if we have no players AND the last change wasn't already an available years update
        if (lastChange && appState.players.length === 0 && lastChange.availableYears === undefined) {
            dispatch({ type: "update_available_years", payload: { availableYears: constants.FULL_YEARS } });
        }
    },[appState.players.length])
    return (
        <AppContext.Provider
            value={{dispatch,appState}}
        >
            {props.children}
        </AppContext.Provider>
    )
}

export { AppContext , AppContextProvider}