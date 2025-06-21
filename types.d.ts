declare global {
    type StatType = "receiving" | "rushing" | "passing"
    type ChartType = "bar" | "line" | "scatter"
    type AppState = {
        statType:StatType|null,
        chartType:ChartType|null,
        player:string|null,
        startYear:number|null,
        endYear:number|null,
        availableYears:number[],
        stat:string|null,
        lastChange:ActionPayload|null,
        stateID:number
    }

    type ActionPayload = {
        statType?:StatType,
        chartType?:ChartType,
        player?:string|null,
        year?:number|null,
        availableYears?:number[]|null,
        stat?:string|null
    }

    type StateAction = {
        type:string,
        payload:ActionPayload
    }
}

export {}