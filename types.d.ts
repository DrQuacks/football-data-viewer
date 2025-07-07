declare global {
    type StatType = "receiving" | "rushing" | "passing"
    type ChartType = "bar" | "line" | "scatter"
    type AggregateType = "total" | "average"
    type AppState = {
        statType:StatType|null,
        chartType:ChartType|null,
        players:string[],
        startYear:number|null,
        endYear:number|null,
        availableYears:number[],
        primaryStat:string|null,
        secondaryStat:string|null,
        aggregate:AggregateType|null,
        numberOfPoints:number|null,
        lastChange:ActionPayload|null,
        stateID:number
    }

    type ActionPayload = {
        statType?:StatType,
        chartType?:ChartType,
        players?:string[],
        year?:number|null,
        availableYears?:number[]|null,
        primaryStat?:string|null,
        secondaryStat?:string|null,
        aggregate?:AggregateType|null,
        numberOfPoints?:number|null
    }

    type StateAction = {
        type:string,
        payload:ActionPayload
    }
}

export {}