"use client"

import { Dropdown } from "./Dropdown"
import { StatTypeDropdown } from "./StatTypeDropdown"
import { PlayerDropdown } from "./PlayerDropdown"
import {use} from 'react'
import { AppContext } from "./AppState"
import { ChartTypeDropdown } from "./ChartTypeDropdown"

export const Sidebar = () => {
    const {appState} = use(AppContext)!
    return (
        <div className="mx-6">
            <ChartTypeDropdown/>
            <StatTypeDropdown/>
            <PlayerDropdown/>
            <Dropdown
                name='Start Year'
                set={appState.availableYears}
            />
            <Dropdown
                name='End Year'
                set={appState.availableYears}
            />
        </div>
    )
}