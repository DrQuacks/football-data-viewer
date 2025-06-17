"use client"

import { Dropdown } from "./Dropdown"
import { StatTypeDropdown } from "./StatTypeDropdown"
import { PlayerDropdown } from "./PlayerDropdown"
import {use} from 'react'
import { AppContext } from "./AppState"

export const Sidebar = () => {
    const {appState} = use(AppContext)!
    return (
        <div className="mx-6">
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