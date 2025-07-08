"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

type PlayerData = {
  player: string;
  yards: number;
};

type Props = {
  data: PlayerData[];
};

export function Chart({ data }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    function draw() {
        svg.selectAll('*').remove(); // Clear previous contents

        const rawWidth = svgRef.current ? svgRef.current.parentElement?.clientWidth || 800 : 800; // Default to 800 if no parent width
        const containerWidth = rawWidth
        console.log('container width: ',containerWidth)
        
        // Responsive height based on screen size
        const isMobile = window.innerWidth < 768;
        const height = isMobile ? 400 : 600;
        
        // Responsive margins based on screen size
        const margin = isMobile 
          ? { top: 15, right: 15, bottom: 50, left: 50 }
          : { top: 20, right: 20, bottom: 60, left: 60 };

        const x = d3
        .scaleBand()
        .domain(data.map(d => d.player))
        .range([margin.left, containerWidth - margin.right])
        .padding(0.1);

        const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, d => d.yards) || 0])
        .nice()
        .range([height - margin.bottom, margin.top]);

        svg
        .attr('width', containerWidth)
        .attr('height', height);

        svg
        .append('g')
        .selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', d => x(d.player)!)
        .attr('y', d => y(d.yards))
        .attr('height', d => y(0) - y(d.yards))
        .attr('width', x.bandwidth())
        .attr('fill', 'steelblue');

        // Responsive axis styling
        const axisFontSize = isMobile ? '12px' : '14px';
        
        svg
        .append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d => d.split(' ')[0]))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .style('font-size', axisFontSize);

        svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('font-size', axisFontSize);
    }
    draw()
    window.addEventListener("resize",draw)
    return () => {
        window.removeEventListener('resize', draw); // Cleanup on unmount
    };

  }, [data]);

  return <svg ref={svgRef} width="100%" height="100%" className="chart-container"></svg>;
}