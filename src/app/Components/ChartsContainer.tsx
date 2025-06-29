"use client";

import { use, useEffect, useState } from "react";
import { AppContext } from "./AppState";
import { BarChart } from "./charts/BarChart";
import { ScatterPlot } from "./charts/ScatterPlot";
import { constants } from "../constants";

export const ChartsContainer = () => {
  const { appState, dispatch } = use(AppContext)!;
  const [originalChartData, setOriginalChartData] = useState<{ [player: string]: { season: number; [key: string]: number }[] }>({});
  const [chartData, setChartData] = useState<{ [player: string]: { season: number; [key: string]: number }[] }>({});
  const [scatterData, setScatterData] = useState<{ player: string; [key: string]: number | string }[]>([]);
  const [years, setYears] = useState<number[]>(appState.availableYears);

  // Fetch data for all players (single or multiple)
  useEffect(() => {
    const validPlayers = appState.players.filter(p => p.trim());
    if (validPlayers.length === 0 || appState.chartType === "scatter") return;

    const fetchPromises = validPlayers.map(player =>
      fetch(`/api/receiving/player-stats?player=${encodeURIComponent(player)}&stat=${encodeURIComponent(appState.primaryStat || "yards")}`)
        .then(res => res.json())
        .then(data => ({ player, data }))
    );

    Promise.all(fetchPromises)
      .then(results => {
        const newData: { [player: string]: { season: number; [key: string]: number }[] } = {};
        results.forEach(({ player, data }) => {
          newData[player] = data;
        });
        setOriginalChartData(newData); // Store original data
        setChartData(newData); // Also set as current data initially
        
        // Get all unique years from all players
        const allYears = new Set<number>();
        results.forEach(({ data }) => {
          data.forEach((row: { season: number }) => allYears.add(row.season));
        });
        const uniqueYears = Array.from(allYears).sort((a, b) => a - b);
        setYears(uniqueYears);
        dispatch({ type: "update_available_years", payload: { availableYears: uniqueYears } });
      });
  }, [appState.players, appState.primaryStat, appState.chartType, dispatch]);

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

  // Filter data based on selected years
  useEffect(() => {
    if (appState.chartType === "scatter") return;
    
    const safeStart: number = appState.startYear || constants.START_YEAR;
    const safeEnd: number = appState.endYear || constants.END_YEAR;
    const selectedYears = appState.availableYears.filter((year) => year >= safeStart && year <= safeEnd);
    
    const validPlayers = appState.players.filter(p => p.trim());
    
    if (validPlayers.length > 0 && Object.keys(originalChartData).length > 0) {
      // Filter the originalChartData for all players
      const filteredData: { [player: string]: { season: number; [key: string]: number }[] } = {};
      Object.keys(originalChartData).forEach(player => {
        filteredData[player] = originalChartData[player].filter(row => selectedYears.includes(row.season));
      });
      setChartData(filteredData);
    }
    
    setYears(selectedYears);
  }, [appState.startYear, appState.endYear, appState.availableYears, appState.chartType, originalChartData]);

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

  // For bar/line charts, require at least one player
  const validPlayers = appState.players.filter(p => p.trim());
  if (!validPlayers.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-center text-lg text-gray-600">
          Please select at least one player to view their stats.
        </p>
      </div>
    );
  }
  
  if (!appState.primaryStat) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-center text-lg text-gray-600">
          Please select a stat to view for {validPlayers.length === 1 ? validPlayers[0] : 'the selected players'}.
        </p>
      </div>
    );
  }

  // Check if all player data is loaded
  if (!Object.keys(chartData).length || validPlayers.some(player => !chartData[player] || !chartData[player].length)) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-center text-lg text-gray-600">
          Loading stats for {validPlayers.join(', ')}...
        </p>
      </div>
    );
  }

  const toTitleCase = (str: string) =>
    str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1));

  const title: string = appState.primaryStat
    ? toTitleCase(appState.primaryStat.replaceAll('_', ' '))
    : "";

  // Single unified chart for any number of players
  return (
    <div>
      <h1 className="text-center text-3xl">
        {validPlayers.length === 1 
          ? `${validPlayers[0]} ${title} by Season`
          : `Grouped ${title} by Season`
        }
      </h1>
      <BarChart 
        data={chartData} 
        years={years} 
        stat={appState.primaryStat || "yards"} 
        players={validPlayers}
      />    
    </div>
  );
};