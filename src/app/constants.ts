const START_YEAR = 2007
const END_YEAR = 2024
let yearArray:number[] = []
for (let year = START_YEAR; year <= END_YEAR; year++) {
    yearArray = [...yearArray,year]
}

export const constants = {
    START_YEAR,
    END_YEAR,
    FULL_YEARS:yearArray
}