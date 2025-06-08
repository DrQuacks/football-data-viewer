"use client"

import { useReducer , createContext , ReactNode} from 'react'
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
    switch (type) {
        case "update_chart_type":{
            if (payload.chartType) {
                return {...appState,chartType:payload.chartType}
            }
            return appState
        }
        case "update_stat_type":{
            if (payload.statType) {
                return {...appState,statType:payload.statType}
            }
            return appState
        }
    }
    return appState
}

const AppContext = createContext<ContextValues | null>(null)

const AppContextProvider = (props:AppContextProviderProps) => {
    const [appState,dispatch] = useReducer(reducer,initialAppState)
    return (
        <AppContext.Provider
            value={{dispatch,appState}}
        >
            {props.children}
        </AppContext.Provider>
    )
}

export { AppContext , AppContextProvider}