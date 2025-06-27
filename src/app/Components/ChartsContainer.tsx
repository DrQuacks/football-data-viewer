"use client";

import { use, useEffect, useState } from "react";
import { AppContext } from "./AppState";
import { RecYardsBarChart } from "./charts/RecYardsBarChart";
import { constants } from "../constants";

export const ChartsContainer = () => {
  const { appState , dispatch } = use(AppContext)!;
  const [data, setData] = useState<{ season: number; yards: number }[]>([]);
  const [availableData, setAvailableData] = useState<{ season: number; yards: number }[]>([]);
  const [years, setYears] = useState<number[]>(appState.availableYears);

useEffect(() => {
  if (!appState.player) return;

  fetch(`/api/receiving/player-stats?player=${encodeURIComponent(appState.player)}&stat=${encodeURIComponent(appState.stat || "yards")}`)
    .then((res) => res.json())
    .then((d) => {
      setData(d);
      setAvailableData(d);
      const uniqueYears: number[] = Array.from(new Set<number>(d.map((row: { season: number }) => row.season))).sort((a, b) => a - b);
      setYears(uniqueYears);
      dispatch({ type: "update_available_years", payload: { availableYears: uniqueYears } });
    });
}, [appState.player, appState.stat, dispatch]);

useEffect(() => {
    const safeStart:number = appState.startYear || constants.START_YEAR
    const safeEnd:number = appState.endYear || constants.END_YEAR
    const selectedYears = appState.availableYears.filter((year) => year >= safeStart && year <= safeEnd)
    const newAvailableData = data.filter(row => selectedYears.includes(row.season))
    console.log('selected years',{selectedYears,safeStart,safeEnd})
    setYears(selectedYears)
    setAvailableData(newAvailableData)
},[appState.startYear,appState.endYear,appState.availableYears,data])

  if (!appState.player) return null;
  if (!data.length) return <p>Loading stats...</p>;

  return (
    <div>
      <h2>{appState.player} Receiving Yards by Season</h2>
      <RecYardsBarChart data={availableData} years={years} stat={appState.stat || "yards"} />    
    </div>
  );
};