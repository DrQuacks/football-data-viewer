declare global {
    type StatType = "receiving" | "rushing" | "passing"
    type ChartType = "bar" | "line" | "scatter"
    type AppState = {
        statType:StatType|null,
        chartType:ChartType|null
    }

    type ActionPayload = {
        statType?:StatType,
        chartType?:ChartType
    }

    type StateAction = {
        type:string,
        payload:ActionPayload
    }
}

export {}