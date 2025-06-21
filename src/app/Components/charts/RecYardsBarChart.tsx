"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export function RecYardsBarChart({
  data,
  years,
  stat
}: {
  data: { season: number; [key: string]: number }[],
  years: number[],
  stat: string
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    function draw() {
      if (!svgRef.current) return;
      if (!data.length || !stat) return;

      const svg = d3.select(svgRef.current);
      const rawWidth = svgRef.current.parentElement?.clientWidth || 800;
      const containerWidth = rawWidth;
      const height = 600;
      const margin = { top: 20, right: 20, bottom: 60, left: 60 };

      // Set up scales
      const x = d3
        .scaleBand()
        .domain(years.map(y => y.toString()))
        .range([margin.left, containerWidth - margin.right])
        .padding(0.1);

      const maxValue = d3.max(data, (d) => d[stat]) || 0;
      const y = d3
        .scaleLinear()
        .domain([0, maxValue * 1.1]) // 10% headroom for label
        .nice()
        .range([height - margin.bottom, margin.top]);

      svg.attr('width', containerWidth).attr('height', height);

      // --- BARS ---
      let barsG = svg.select<SVGGElement>('g.bars');
      if (barsG.empty()) {
        barsG = svg.append('g').classed('bars', true);
      }
      barsG.raise(); // Make sure bars are below labels

      const bars = barsG.selectAll<SVGRectElement, typeof data[0]>("rect")
        .data(data, (d: any) => d.season);

      bars.exit()
        .transition()
        .duration(500)
        .attr("y", y(0))
        .attr("height", 0)
        .remove();

      bars.transition()
        .duration(700)
        .attr("x", (d) => x(d.season.toString())!)
        .attr("width", x.bandwidth())
        .attr("y", (d) => y(d[stat] ?? 0))
        .attr("height", d => y(0) - y(d[stat] ?? 0));

      bars.enter()
        .append("rect")
        .attr("x", (d) => x(d.season.toString())!)
        .attr("width", x.bandwidth())
        .attr("y", y(0))
        .attr("height", 0)
        .attr("fill", "steelblue")
        .transition()
        .duration(700)
        .attr("y", (d) => y(d[stat] ?? 0))
        .attr("height", d => y(0) - y(d[stat] ?? 0));

      // --- LABELS ---
      let labelsG = svg.select<SVGGElement>('g.labels');
      if (labelsG.empty()) {
        labelsG = svg.append('g').classed('labels', true);
      }
      labelsG.raise(); // Make sure labels are above bars

      const minLabelY = margin.top + 12;

      const labels = labelsG.selectAll<SVGTextElement, typeof data[0]>("text")
        .data(data, (d: any) => d.season);

      labels.exit()
        .transition()
        .duration(500)
        .attr("y", y(0) - 5)
        .style("opacity", 0)
        .remove();

      labels.transition()
        .duration(700)
        .attr('x', (d) => x(d.season.toString())! + x.bandwidth() / 2)
        .attr('y', (d) => Math.max(y(d[stat] ?? 0) - 5, minLabelY))
        .text((d) => d[stat] ?? 0)
        .style("opacity", 1);

      labels.enter()
        .append('text')
        .attr('x', (d) => x(d.season.toString())! + x.bandwidth() / 2)
        .attr('y', y(0) - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'black')
        .style("opacity", 0)
        .text((d) => d[stat])
        .transition()
        .duration(700)
        .attr('y', (d) => Math.max(y(d[stat] ?? 0) - 5, minLabelY))
        .style("opacity", 1);

      // --- AXES ---
      let xAxisG = svg.select<SVGGElement>('g.x-axis');
      if (xAxisG.empty()) {
        xAxisG = svg.append('g').classed('x-axis', true);
      }
      xAxisG
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .transition()
        .duration(700)
        .call(d3.axisBottom(x).tickFormat(d => d.split(' ')[0]) as any);

      xAxisG.selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

      let yAxisG = svg.select<SVGGElement>('g.y-axis');
      if (yAxisG.empty()) {
        yAxisG = svg.append('g').classed('y-axis', true);
      }
      yAxisG
        .attr('transform', `translate(${margin.left},0)`)
        .transition()
        .duration(700)
        .call(d3.axisLeft(y) as any);
    }

    draw();
    window.addEventListener("resize", draw);
    return () => {
      window.removeEventListener('resize', draw);
    };
  }, [data, years,stat]);

  return <svg ref={svgRef} width="100%" height="100%"></svg>;
}