"use client"

import { useReducer , useEffect , createContext , ReactNode } from 'react'
import { initialAppState } from '../initialAppState'

type ContextValues = {
    dispatch:(action:StateAction) => void,
    appState:AppState
}
type AppContextProviderProps = {
    children: ReactNode
};

const reducer = (appState:AppState, action:StateAction) => {
    const {type,payload} = action
    const newID = appState.stateID ++
    switch (type) {
        case "update_chart_type":{
            if (payload.chartType) {
                return {...appState,chartType:payload.chartType,stateID:newID}
            }
            return appState
        }
        case "update_stat_type":{
            if (payload.statType) {
                return {...appState,statType:payload.statType,stateID:newID}
            }
            return appState
        }
        case "update_start_year":{
            if (payload.year) {
                return {...appState,startYear:payload.year,stateID:newID}
            }
            return appState
        }
        case "update_end_year":{
            if (payload.year) {
                return {...appState,endYear:payload.year,stateID:newID}
            }
            return appState
        }
        case "update_available_years":{
            if (payload.availableYears) {
                return {...appState,availableYears:payload.availableYears,stateID:newID}
            }
            return appState
        }
        case "update_player":{
            if (payload.player) {
                return {...appState,player:payload.player,stateID:newID}
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