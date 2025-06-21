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
                return {...appState,statType:payload.statType,lastChange:payload,stateID:newID}
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
        case "update_player":{
            if (payload.player || payload.player === null) {
                return {...appState,player:payload.player,lastChange:payload,stateID:newID}
            }
            return appState
        }
        case "update_stat":{
            if (payload.stat || payload.stat === null) {
                return {...appState,stat:payload.stat,lastChange:payload,stateID:newID}
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
        if (lastChange && lastChange.player === null) {
            dispatch({ type: "update_available_years", payload: { availableYears: constants.FULL_YEARS } });
        }
    },[appState])
    return (
        <AppContext.Provider
            value={{dispatch,appState}}
        >
            {props.children}
        </AppContext.Provider>
    )
}

export { AppContext , AppContextProvider}