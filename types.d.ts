declare global {
    type StatType = "receiving" | "rushing" | "passing"
    type ChartType = "bar" | "line" | "scatter"
    type AppState = {
        statType:StatType|null,
        chartType:ChartType|null,
        player:string|null,
        startYear:number,
        endYear:number,
        stateID:number
    }

    type ActionPayload = {
        statType?:StatType,
        chartType?:ChartType,
        player?:string
    }

    type StateAction = {
        type:string,
        payload:ActionPayload
    }
}

export {}