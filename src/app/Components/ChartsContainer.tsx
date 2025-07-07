"use client";

import { use, useEffect, useState } from "react";
import { AppContext } from "./AppState";
import { BarChart } from "./charts/BarChart";
import { LineChart } from "./charts/LineChart";
import { ScatterPlot } from "./charts/ScatterPlot";
import { constants } from "../constants";

type PlayerDataPoint = {
  season: number;
  team?: string;
  [key: string]: number | string | undefined;
};

const getNextStepMessage = (appState: AppState): string => {
    if (!appState.chartType) {
        return "Please select a chart type to get started";
    }
    
    if (!appState.statType) {
        return "Please select a stat type";
    }
    
    if (appState.chartType === "scatter") {
        if (!appState.primaryStat) {
            return "Please select a primary stat";
        }
        
        if (!appState.secondaryStat) {
            return "Please select a secondary stat";
        }
        
        if (!appState.aggregate) {
            return "Please select an aggregate type";
        }
        
        return "Chart is ready!";
    }
    
    // For bar and line charts
    const hasPlayers = appState.players && appState.players.length > 0 && appState.players[0] !== "";
    const hasStat = appState.primaryStat;
    
    if (!hasStat && !hasPlayers) {
        return "Please select a stat and a player";
    }
    
    if (!hasStat) {
        return "Please select a stat";
    }
    
    if (!hasPlayers) {
        return "Please select a player";
    }
    
    return "Chart is ready!";
}

export const ChartsContainer = () => {
  const { appState, dispatch } = use(AppContext)!;
  const [originalChartData, setOriginalChartData] = useState<{ [player: string]: PlayerDataPoint[] }>({});
  const [chartData, setChartData] = useState<{ [player: string]: PlayerDataPoint[] }>({});
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
          {getNextStepMessage(appState)}
        </p>
      </div>
    );
  }

  // Check if chart is ready to display
  const isChartReady = appState.chartType && appState.statType && appState.primaryStat && 
                      appState.players && appState.players.length > 0 &&
                      (appState.chartType !== "scatter" || (appState.secondaryStat && appState.aggregate));

  if (!isChartReady) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-center text-lg text-gray-600">
          {getNextStepMessage(appState)}
        </p>
      </div>
    );
  }

  // For scatter plots, don't require a specific player
  if (appState.chartType === "scatter") {
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

    const primaryTitle = toTitleCase((appState.primaryStat || "").replaceAll('_', ' '));
    const secondaryTitle = toTitleCase((appState.secondaryStat || "").replaceAll('_', ' '));
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
          primaryStat={appState.primaryStat || ""} 
          secondaryStat={appState.secondaryStat || ""} 
        />
      </div>
    );
  }

  // For bar/line charts, require at least one player
  const validPlayers = appState.players.filter(p => p.trim());
  
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
      {appState.chartType === "line" ? (
        <LineChart 
          data={chartData} 
          years={years} 
          stat={appState.primaryStat || "yards"} 
          players={validPlayers}
        />
      ) : (
        <BarChart 
          data={chartData} 
          years={years} 
          stat={appState.primaryStat || "yards"} 
          players={validPlayers}
        />
      )}
    </div>
  );
};