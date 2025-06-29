"use client"

import { Dropdown } from "./Dropdown"
import { StatTypeDropdown } from "./StatTypeDropdown"
import { MultiPlayerDropdown } from "./MultiPlayerDropdown"
import {use} from 'react'
import { AppContext } from "./AppState"
import { ChartTypeDropdown } from "./ChartTypeDropdown"
import { StatDropdown } from "./StatDropdown"
import { AggregateDropdown } from "./AggregateDropdown"

export const Sidebar = () => {
    const {appState} = use(AppContext)!
    return (
        <div className="mx-6">
            <ChartTypeDropdown/>
            {appState.chartType && (
                <>
                    <StatTypeDropdown/>
                    <StatDropdown/>
                    {appState.chartType !== "scatter" && <MultiPlayerDropdown/>}
                    {appState.chartType === "scatter" && <AggregateDropdown/>}
                    <Dropdown
                        name='Start Year'
                        set={appState.availableYears}
                    />
                    <Dropdown
                        name='End Year'
                        set={appState.availableYears}
                    />
                </>
            )}
        </div>
    )
}