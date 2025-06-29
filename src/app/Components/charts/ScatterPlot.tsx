"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export function ScatterPlot({
  data,
  primaryStat,
  secondaryStat
}: {
  data: { player: string; [key: string]: number | string }[],
  primaryStat: string,
  secondaryStat: string
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    function draw() {
      if (!svgRef.current) return;
      if (!data.length || !primaryStat || !secondaryStat) return;

      const svg = d3.select(svgRef.current);
      const rawWidth = svgRef.current.parentElement?.clientWidth || 800;
      const containerWidth = rawWidth;
      const height = 600;
      const margin = { top: 20, right: 20, bottom: 80, left: 80 };

      // Clear previous contents
      svg.selectAll('*').remove();

      // Set up scales
      const xMin = d3.min(data, (d) => Number(d[primaryStat])) || 0;
      const xMax = d3.max(data, (d) => Number(d[primaryStat])) || 0;
      const yMin = d3.min(data, (d) => Number(d[secondaryStat])) || 0;
      const yMax = d3.max(data, (d) => Number(d[secondaryStat])) || 0;

      const x = d3
        .scaleLinear()
        .domain([Math.max(0, xMin - (xMax - xMin) * 0.1), xMax * 1.05])
        .nice()
        .range([margin.left, containerWidth - margin.right]);

      const y = d3
        .scaleLinear()
        .domain([Math.max(0, yMin - (yMax - yMin) * 0.1), yMax * 1.05])
        .nice()
        .range([height - margin.bottom, margin.top]);

      svg.attr('width', containerWidth).attr('height', height);

      // Add dots
      svg
        .selectAll('circle')
        .data(data)
        .join('circle')
        .attr('cx', (d) => x(Number(d[primaryStat])))
        .attr('cy', (d) => y(Number(d[secondaryStat])))
        .attr('r', 6)
        .attr('fill', 'steelblue')
        .attr('opacity', 0.7)
        .on('mouseover', function() {
          d3.select(this).attr('r', 8).attr('opacity', 1);
        })
        .on('mouseout', function() {
          d3.select(this).attr('r', 6).attr('opacity', 0.7);
        });

      // Add player labels
      svg
        .selectAll('text')
        .data(data)
        .join('text')
        .attr('x', (d) => x(Number(d[primaryStat])))
        .attr('y', (d) => y(Number(d[secondaryStat])) - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', 'black')
        .text((d) => d.player)
        .style('pointer-events', 'none');

      // Add axes
      svg
        .append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

      // Add axis labels
      svg
        .append('text')
        .attr('x', containerWidth / 2)
        .attr('y', height - margin.bottom / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .text(primaryStat.replaceAll('_', ' '));

      svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', margin.left / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .text(secondaryStat.replaceAll('_', ' '));
    }

    draw();
    window.addEventListener("resize", draw);
    return () => {
      window.removeEventListener('resize', draw);
    };
  }, [data, primaryStat, secondaryStat]);

  return <svg ref={svgRef} width="100%" height="100%"></svg>;
} 