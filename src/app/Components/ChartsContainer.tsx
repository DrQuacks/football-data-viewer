"use client";

import { use, useEffect, useState } from "react";
import { AppContext } from "./AppState";
import { RecYardsBarChart } from "./charts/RecYardsBarChart";
import { constants } from "../constants";

export const ChartsContainer = () => {
  const { appState , dispatch } = use(AppContext)!;
  const [data, setData] = useState<{ season: number; yards: number }[]>([]);
  const [years, setYears] = useState<number[]>(appState.availableYears);

  useEffect(() => {
    if (!appState.player) return;

    fetch(`/api/receiving/player-stats?player=${encodeURIComponent(appState.player)}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        // Generate the set of years dynamically
        const uniqueYears:number[] = Array.from(new Set<number>(d.map((row: { season: number; yards?: number }) => row.season))).sort((a, b) => a - b);        
        setYears(uniqueYears);
        dispatch({ type: "update_available_years", payload: { availableYears: uniqueYears } });
        console.log('unique years are: ',uniqueYears)
      });  
},[appState.player]);

useEffect(() => {
    const safeStart:number = appState.startYear || constants.START_YEAR
    const safeEnd:number = appState.endYear || constants.END_YEAR
    const selectedYears = years.filter((year) => year >= safeStart && year <= safeEnd)
    console.log('selected years',{selectedYears,safeStart,safeEnd})
    setYears(selectedYears)
},[appState.startYear,appState.endYear])

  if (!appState.player) return null;
  if (!data.length) return <p>Loading stats...</p>;

  return (
    <div>
      <h2>{appState.player} Receiving Yards by Season</h2>
      <RecYardsBarChart data={data} years={years} />
    </div>
  );
};