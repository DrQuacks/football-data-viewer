"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const colors = ['steelblue', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

type PlayerData = {
  player: string;
  value: number;
};

type GroupedDataItem = {
  year: number;
  players: PlayerData[];
};

export function BarChart({
  data,
  years,
  stat,
  players
}: {
  data: { [player: string]: { season: number; [key: string]: number }[] },
  years: number[],
  stat: string,
  players: string[]
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    function draw() {
      if (!svgRef.current) return;
      if (!data || !stat || !players.length) return;

      const svg = d3.select(svgRef.current);
      const containerWidth = svgRef.current.parentElement?.clientWidth || 800;
      const height = 600;
      const margin = { top: 20, right: 20, bottom: 60, left: 60 };

      // Set up scales
      const x = d3
        .scaleBand()
        .domain(years.map(y => y.toString()))
        .range([margin.left, containerWidth - margin.right])
        .padding(0.1);

      const maxValue = d3.max(Object.values(data).flat(), (d) => d[stat]) || 0;
      const y = d3
        .scaleLinear()
        .domain([0, maxValue * 1.1])
        .nice()
        .range([height - margin.bottom, margin.top]);

      svg.attr('width', containerWidth).attr('height', height);

      // Check if this is the first render
      const isFirstRender = svg.select('.x-axis').empty();
      
      if (isFirstRender) {
        // Add axes only on first render
        svg.append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(0,${height - margin.bottom})`)
          .call(d3.axisBottom(x));

        svg.selectAll('g.x-axis text')
          .attr('transform', 'rotate(-45)')
          .style('text-anchor', 'end');

        svg.append('g')
          .attr('class', 'y-axis')
          .attr('transform', `translate(${margin.left},0)`)
          .call(d3.axisLeft(y));
      } else {
        // Update axes with transitions
        svg.select('.x-axis')
          .transition()
          .duration(750)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .call(d3.axisBottom(x) as any);

        svg.select('.y-axis')
          .transition()
          .duration(750)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .call(d3.axisLeft(y) as any);
      }

      // Always use grouped bar approach
      const xInner = d3.scaleBand()
        .domain(players)
        .range([0, x.bandwidth()])
        .padding(0.05);

      // Create data for grouped bars
      const groupedData: GroupedDataItem[] = years.map(year => ({
        year,
        players: players.map(player => ({
          player,
          value: data[player]?.find(d => d.season === year)?.[stat] || 0
        }))
      }));

      // Add or update year groups
      const yearGroups = svg.selectAll('g.year-group')
        .data(groupedData, (d: unknown) => (d as GroupedDataItem).year)
        .join(
          (enter) => enter.append('g')
            .classed('year-group', true)
            .attr('transform', (d: GroupedDataItem) => `translate(${x(d.year.toString())}, 0)`)
            .style('opacity', 0),
          (update) => update,
          (exit) => exit.remove()
        )
        .transition()
        .duration(750)
        .attr('transform', (d: GroupedDataItem) => `translate(${x(d.year.toString())}, 0)`)
        .style('opacity', 1);

      // Add or update bars for each player within each year group
      yearGroups.each(function(d: GroupedDataItem) {
        const yearGroup = d3.select(this);
        
        const bars = yearGroup.selectAll('rect')
          .data(d.players, (playerData: unknown) => (playerData as PlayerData).player)
          .join(
            (enter) => enter.append('rect')
              .attr('x', (playerData: PlayerData) => xInner(playerData.player)!)
              .attr('width', xInner.bandwidth())
              .attr('y', y(0))
              .attr('height', 0)
              .attr('fill', (playerData: PlayerData, i: number) => colors[i % colors.length]),
            (update) => update,
            (exit) => exit.remove()
          );

        // Animate bars with proper transitions
        bars.transition()
          .duration(750)
          .attr('x', (playerData: PlayerData) => xInner(playerData.player)!)
          .attr('width', xInner.bandwidth())
          .attr('y', (playerData: PlayerData) => y(playerData.value))
          .attr('height', (playerData: PlayerData) => y(0) - y(playerData.value))
          .attr('fill', (playerData: PlayerData, i: number) => colors[i % colors.length]);

        // Add or update labels
        const labels = yearGroup.selectAll('text')
          .data(d.players, (playerData: unknown) => (playerData as PlayerData).player)
          .join(
            (enter) => enter.append('text')
              .attr('x', (playerData: PlayerData) => xInner(playerData.player)! + xInner.bandwidth() / 2)
              .attr('y', y(0))
              .attr('text-anchor', 'middle')
              .attr('font-size', '10px')
              .attr('fill', 'black')
              .text((playerData: PlayerData) => playerData.value),
            (update) => update,
            (exit) => exit.remove()
          );

        // Animate labels
        labels.transition()
          .duration(750)
          .attr('x', (playerData: PlayerData) => xInner(playerData.player)! + xInner.bandwidth() / 2)
          .attr('y', (playerData: PlayerData) => Math.max(y(playerData.value) - 5, margin.top + 12))
          .text((playerData: PlayerData) => playerData.value);
      });

      // Always show legend
      const legend = svg.select('.legend');
      if (legend.empty()) {
        // Create new legend
        const newLegend = svg.append('g').attr('class', 'legend');
        players.forEach((player, i) => {
          const legendItem = newLegend.append('g')
            .attr('transform', `translate(${containerWidth - margin.right - 100}, ${margin.top + i * 20})`);

          legendItem.append('rect')
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', colors[i % colors.length]);

          legendItem.append('text')
            .attr('x', 20)
            .attr('y', 12)
            .attr('font-size', '12px')
            .text(player);
        });
      } else {
        // Update existing legend
        const legendItems = legend.selectAll('g')
          .data(players, (d: unknown) => d as string)
          .join(
            (enter) => {
              const g = enter.append('g')
                .attr('transform', (d, i) => `translate(${containerWidth - margin.right - 100}, ${margin.top + i * 20})`);
              
              g.append('rect')
                .attr('width', 15)
                .attr('height', 15)
                .attr('fill', (d, i) => colors[i % colors.length]);

              g.append('text')
                .attr('x', 20)
                .attr('y', 12)
                .attr('font-size', '12px')
                .text((d) => d);
              
              return g;
            },
            (update) => update,
            (exit) => exit.remove()
          );

        // Animate legend updates
        legendItems.transition()
          .duration(750)
          .attr('transform', (d, i) => `translate(${containerWidth - margin.right - 100}, ${margin.top + i * 20})`);

        // Update colors of existing legend items
        legendItems.select('rect')
          .transition()
          .duration(750)
          .attr('fill', (d, i) => colors[i % colors.length]);
      }
    }

    draw();
    window.addEventListener("resize", draw);
    return () => {
      window.removeEventListener('resize', draw);
    };
  }, [data, years, stat, players]);

  return <svg ref={svgRef} width="100%" height="100%"></svg>;
} 