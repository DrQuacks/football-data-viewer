"use client";

import { use, useEffect, useState } from "react";
import { AppContext } from "./AppState";
import { RecYardsBarChart } from "./charts/RecYardsBarChart";
import { ScatterPlot } from "./charts/ScatterPlot";
import { constants } from "../constants";

export const ChartsContainer = () => {
  const { appState , dispatch } = use(AppContext)!;
  const [data, setData] = useState<{ season: number; yards: number }[]>([]);
  const [scatterData, setScatterData] = useState<{ player: string; [key: string]: number | string }[]>([]);
  const [availableData, setAvailableData] = useState<{ season: number; yards: number }[]>([]);
  const [years, setYears] = useState<number[]>(appState.availableYears);

  // Fetch data for bar/line charts (single player, single stat over time)
  useEffect(() => {
    if (!appState.player || appState.chartType === "scatter") return;

    fetch(`/api/receiving/player-stats?player=${encodeURIComponent(appState.player)}&stat=${encodeURIComponent(appState.primaryStat || "yards")}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setAvailableData(d);
        const uniqueYears: number[] = Array.from(new Set<number>(d.map((row: { season: number }) => row.season))).sort((a, b) => a - b);
        setYears(uniqueYears);
        dispatch({ type: "update_available_years", payload: { availableYears: uniqueYears } });
      });
  }, [appState.player, appState.primaryStat, appState.chartType, dispatch]);

  // Fetch data for scatter plots (multiple players, two stats)
  useEffect(() => {
    if (appState.chartType !== "scatter" || !appState.primaryStat || !appState.secondaryStat) return;

    const safeStart: number = appState.startYear || constants.START_YEAR;
    const safeEnd: number = appState.endYear || constants.END_YEAR;
    const aggregate = appState.aggregate || "average";

    fetch(`/api/receiving/scatter-data?primaryStat=${encodeURIComponent(appState.primaryStat)}&secondaryStat=${encodeURIComponent(appState.secondaryStat)}&startYear=${safeStart}&endYear=${safeEnd}&aggregate=${aggregate}`)
      .then((res) => res.json())
      .then((d) => {
        setScatterData(d);
      })
      .catch((error) => {
        console.error('Error fetching scatter data:', error);
      });
  }, [appState.chartType, appState.primaryStat, appState.secondaryStat, appState.startYear, appState.endYear, appState.aggregate]);

  useEffect(() => {
    if (appState.chartType === "scatter") return;
    
    const safeStart:number = appState.startYear || constants.START_YEAR
    const safeEnd:number = appState.endYear || constants.END_YEAR
    const selectedYears = appState.availableYears.filter((year) => year >= safeStart && year <= safeEnd)
    const newAvailableData = data.filter(row => selectedYears.includes(row.season))
    console.log('selected years',{selectedYears,safeStart,safeEnd})
    setYears(selectedYears)
    setAvailableData(newAvailableData)
  },[appState.startYear,appState.endYear,appState.availableYears,data,appState.chartType])

  // Don't render anything if no chart type is selected
  if (!appState.chartType) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-center text-lg text-gray-600">
          Please select a chart type to get started.
        </p>
      </div>
    );
  }

  // For scatter plots, don't require a specific player
  if (appState.chartType === "scatter") {
    if (!appState.primaryStat || !appState.secondaryStat) {
      return (
        <div className="flex items-center justify-center h-96">
          <p className="text-center text-lg text-gray-600">
            Please select both primary and secondary stats for the scatter plot.
          </p>
        </div>
      );
    }
    if (!appState.aggregate) {
      return (
        <div className="flex items-center justify-center h-96">
          <p className="text-center text-lg text-gray-600">
            Please select an aggregate type (Total or Average) for the scatter plot.
          </p>
        </div>
      );
    }
    if (!scatterData.length) {
      return (
        <div className="flex items-center justify-center h-96">
          <p className="text-center text-lg text-gray-600">
            Loading scatter plot data...
          </p>
        </div>
      );
    }

    const toTitleCase = (str: string) =>
      str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1));

    const primaryTitle = toTitleCase(appState.primaryStat.replaceAll('_', ' '));
    const secondaryTitle = toTitleCase(appState.secondaryStat.replaceAll('_', ' '));
    const aggregateTitle = toTitleCase(appState.aggregate || "average");
    const safeStart: number = appState.startYear || constants.START_YEAR;
    const safeEnd: number = appState.endYear || constants.END_YEAR;

    return (
      <div>
        <h1 className="text-center text-3xl mb-4">
          {primaryTitle} vs {secondaryTitle} Scatter Plot ({aggregateTitle}) - {safeStart}-{safeEnd}
        </h1>
        <ScatterPlot 
          data={scatterData} 
          primaryStat={appState.primaryStat} 
          secondaryStat={appState.secondaryStat} 
        />
      </div>
    );
  }

  // For bar/line charts, require a player
  if (!appState.player) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-center text-lg text-gray-600">
          Please select a player to view their stats.
        </p>
      </div>
    );
  }
  
  if (!appState.primaryStat) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-center text-lg text-gray-600">
          Please select a stat to view for {appState.player}.
        </p>
      </div>
    );
  }
  
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-center text-lg text-gray-600">
          Loading stats for {appState.player}...
        </p>
      </div>
    );
  }

  const toTitleCase = (str: string) =>
    str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1));

  const title: string = appState.primaryStat
    ? toTitleCase(appState.primaryStat.replaceAll('_', ' '))
    : "";

  return (
    <div>
      <h1 className="text-center text-3xl">{appState.player} {title} by Season</h1>
      <RecYardsBarChart data={availableData} years={years} stat={appState.primaryStat || "yards"} />    
    </div>
  );
};