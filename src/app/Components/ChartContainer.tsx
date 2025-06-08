"use client";

import { useEffect, useState } from 'react';
import {Chart} from './Chart';

interface ReceivingRow {
    player: string;
    yards: number;
    // optionally add more fields if needed
  }

export function ChartContainer() {
  const [data, setData] = useState<ReceivingRow[]>([]);

  useEffect(() => {
    fetch('/api/stats?season=2024')
      .then(res => res.json())
      .then((json:ReceivingRow[]) => {
        const sliced = json.slice(0, 10).map((d:ReceivingRow) => ({
          player: d.player,
          yards: d.yards,
        }));
        setData(sliced);
      });
  }, []);

  return (
    <div className='mx-6'>
      <h1>Top 10 Receiving Yards - 2024</h1>
      <Chart data={data} />
    </div>
  );
}