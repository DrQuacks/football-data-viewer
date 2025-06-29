"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const colors = ['steelblue', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

type PlayerData = {
  player: string;
  value: number;
};

type LineData = {
  player: string;
  data: { year: number; value: number }[];
};

export function LineChart({
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
        .scaleLinear()
        .domain([Math.min(...years), Math.max(...years)])
        .range([margin.left, containerWidth - margin.right]);

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
          .call(d3.axisBottom(x).tickFormat(d => d.toString()));

        svg.append('g')
          .attr('class', 'y-axis')
          .attr('transform', `translate(${margin.left},0)`)
          .call(d3.axisLeft(y));
      } else {
        // Update axes with transitions
        svg.select('.x-axis')
          .transition()
          .duration(750)
          .call(d3.axisBottom(x).tickFormat(d => d.toString()) as any);

        svg.select('.y-axis')
          .transition()
          .duration(750)
          .call(d3.axisLeft(y) as any);
      }

      // Create line generator
      const line = d3.line<{ year: number; value: number }>()
        .x(d => x(d.year))
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);

      // Create data for each player's line
      const lineData: LineData[] = players.map(player => ({
        player,
        data: years.map(year => ({
          year,
          value: data[player]?.find(d => d.season === year)?.[stat] || 0
        })).filter(d => d.value > 0) // Only include points with data
      }));

      // Add or update lines
      const lines = svg.selectAll('path.line')
        .data(lineData, (d: unknown) => (d as LineData).player)
        .join(
          (enter) => enter.append('path')
            .classed('line', true)
            .attr('fill', 'none')
            .attr('stroke', (d, i) => colors[i % colors.length])
            .attr('stroke-width', 3)
            .attr('d', d => line(d.data) || '')
            .style('opacity', 0),
          (update) => update,
          (exit) => exit.remove()
        );

      // Animate lines
      lines.transition()
        .duration(750)
        .attr('d', d => line(d.data) || '')
        .attr('stroke', (d, i) => colors[i % colors.length])
        .style('opacity', 1);

      // Add or update data points
      const points = svg.selectAll('g.points')
        .data(lineData, (d: unknown) => (d as LineData).player)
        .join(
          (enter) => enter.append('g')
            .classed('points', true),
          (update) => update,
          (exit) => exit.remove()
        );

      // Add circles for each point
      points.each(function(d) {
        const pointGroup = d3.select(this);
        const playerIndex = lineData.findIndex(line => line.player === d.player);
        
        const circles = pointGroup.selectAll('circle')
          .data(d.data, (point: unknown) => (point as { year: number; value: number }).year)
          .join(
            (enter) => enter.append('circle')
              .attr('r', 4)
              .attr('fill', colors[playerIndex % colors.length])
              .attr('stroke', 'white')
              .attr('stroke-width', 2)
              .style('opacity', 0),
            (update) => update,
            (exit) => exit.remove()
          );

        circles.transition()
          .duration(750)
          .attr('cx', d => x(d.year))
          .attr('cy', d => y(d.value))
          .attr('fill', colors[playerIndex % colors.length])
          .style('opacity', 1);
      });

      // Always show legend
      const legend = svg.select('.legend');
      if (legend.empty()) {
        // Create new legend
        const newLegend = svg.append('g').attr('class', 'legend');
        players.forEach((player, i) => {
          const legendItem = newLegend.append('g')
            .attr('transform', `translate(${containerWidth - margin.right - 100}, ${margin.top + i * 20})`);

          legendItem.append('line')
            .attr('x1', 0)
            .attr('y1', 7.5)
            .attr('x2', 15)
            .attr('y2', 7.5)
            .attr('stroke', colors[i % colors.length])
            .attr('stroke-width', 3);

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
              
              g.append('line')
                .attr('x1', 0)
                .attr('y1', 7.5)
                .attr('x2', 15)
                .attr('y2', 7.5)
                .attr('stroke', (d, i) => colors[i % colors.length])
                .attr('stroke-width', 3);

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