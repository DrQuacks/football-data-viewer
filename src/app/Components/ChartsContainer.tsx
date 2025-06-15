"use client";

import { use, useEffect, useState } from "react";
import { AppContext } from "./AppState";
import { RecYardsBarChart } from "./charts/RecYardsBarChart";
//import { ReceivingYardsBar } from "./charts/ReceivingYardsBar";

export const ChartsContainer = () => {
  const { appState } = use(AppContext)!;
  const [data, setData] = useState<{ season: number; yards: number }[]>([]);

  useEffect(() => {
    if (!appState.player) return;

    fetch(`/api/receiving/player-stats?player=${encodeURIComponent(appState.player)}`)
      .then((res) => res.json())
      .then((d) => setData(d));
  }, [appState.player]);

  if (!appState.player) return null;
  if (!data.length) return <p>Loading stats...</p>;

  return (
    <div>
      <h2>{appState.player} Receiving Yards by Season</h2>
      <RecYardsBarChart data={data} />
      {/* <ReceivingYardsBar data={data} /> */}
    </div>
  );
};