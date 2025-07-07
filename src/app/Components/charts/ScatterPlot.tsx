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
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function draw() {
      if (!svgRef.current) return;
      if (!data.length || !primaryStat || !secondaryStat) return;

      const svg = d3.select(svgRef.current);
      const rawWidth = svgRef.current.parentElement?.clientWidth || 800;
      const containerWidth = rawWidth;
      const height = 600;
      const margin = { top: 20, right: 20, bottom: 80, left: 80 };

      // Filter out data points with invalid values
      const validData = data.filter(d => {
        const primaryValue = Number(d[primaryStat]);
        const secondaryValue = Number(d[secondaryStat]);
        return !isNaN(primaryValue) && !isNaN(secondaryValue) && 
               primaryValue !== null && secondaryValue !== null &&
               primaryValue !== undefined && secondaryValue !== undefined;
      });

      if (validData.length === 0) return;

      // Set up scales
      const xMin = d3.min(validData, (d) => Number(d[primaryStat])) || 0;
      const xMax = d3.max(validData, (d) => Number(d[primaryStat])) || 0;
      const yMin = d3.min(validData, (d) => Number(d[secondaryStat])) || 0;
      const yMax = d3.max(validData, (d) => Number(d[secondaryStat])) || 0;

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

      // --- DOTS ---
      let dotsG = svg.select<SVGGElement>('g.dots');
      if (dotsG.empty()) {
        dotsG = svg.append('g').classed('dots', true);
      }

      const dots = dotsG.selectAll<SVGCircleElement, typeof validData[0]>("circle")
        .data(validData, (d: typeof validData[0]) => d.player);

      // Remove dots that are no longer in the data
      dots.exit()
        .transition()
        .duration(500)
        .attr("r", 0)
        .style("opacity", 0)
        .remove();

      // Update existing dots
      dots.transition()
        .duration(700)
        .attr('cx', (d) => x(Number(d[primaryStat])))
        .attr('cy', (d) => y(Number(d[secondaryStat])))
        .attr('r', 6)
        .attr('opacity', 0.7);

      // Add event handlers to existing dots
      dots
        .on('mouseover', function(event, d) {
          d3.select(this).attr('r', 8).attr('opacity', 1);
          
          // Show tooltip
          if (tooltipRef.current) {
            const tooltip = d3.select(tooltipRef.current);
            const primaryValue = Number(d[primaryStat]).toLocaleString();
            const secondaryValue = Number(d[secondaryStat]).toLocaleString();
            
            tooltip
              .style('opacity', 1)
              .html(`
                <strong>${d.player}</strong><br/>
                ${primaryStat.replaceAll('_', ' ')}: ${primaryValue}<br/>
                ${secondaryStat.replaceAll('_', ' ')}: ${secondaryValue}
              `)
              .style('left', event.clientX + 'px')
              .style('top', event.clientY + 'px');
          }
        })
        .on('mouseout', function() {
          d3.select(this).attr('r', 6).attr('opacity', 0.7);
          
          // Hide tooltip
          if (tooltipRef.current) {
            d3.select(tooltipRef.current).style('opacity', 0);
          }
        });

      // Add new dots
      dots.enter()
        .append('circle')
        .attr('cx', (d) => x(Number(d[primaryStat])))
        .attr('cy', (d) => y(Number(d[secondaryStat])))
        .attr('r', 0)
        .attr('fill', 'steelblue')
        .attr('opacity', 0)
        .on('mouseover', function(event, d) {
          d3.select(this).attr('r', 8).attr('opacity', 1);
          
          // Show tooltip
          if (tooltipRef.current) {
            const tooltip = d3.select(tooltipRef.current);
            const primaryValue = Number(d[primaryStat]).toLocaleString();
            const secondaryValue = Number(d[secondaryStat]).toLocaleString();
            
            tooltip
              .style('opacity', 1)
              .html(`
                <strong>${d.player}</strong><br/>
                ${primaryStat.replaceAll('_', ' ')}: ${primaryValue}<br/>
                ${secondaryStat.replaceAll('_', ' ')}: ${secondaryValue}
              `)
              .style('left', event.clientX + 'px')
              .style('top', event.clientY + 'px');
          }
        })
        .on('mouseout', function() {
          d3.select(this).attr('r', 6).attr('opacity', 0.7);
          
          // Hide tooltip
          if (tooltipRef.current) {
            d3.select(tooltipRef.current).style('opacity', 0);
          }
        })
        .transition()
        .duration(700)
        .attr('r', 6)
        .attr('opacity', 0.7);

      // --- LABELS ---
      let labelsG = svg.select<SVGGElement>('g.labels');
      if (labelsG.empty()) {
        labelsG = svg.append('g').classed('labels', true);
      }

      const labels = labelsG.selectAll<SVGTextElement, typeof validData[0]>("text")
        .data(validData, (d: typeof validData[0]) => d.player);

      // Remove labels that are no longer in the data
      labels.exit()
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();

      // Update existing labels
      labels.transition()
        .duration(700)
        .attr('x', (d) => x(Number(d[primaryStat])))
        .attr('y', (d) => y(Number(d[secondaryStat])) - 10)
        .style("opacity", 1);

      // Add new labels
      labels.enter()
        .append('text')
        .attr('x', (d) => x(Number(d[primaryStat])))
        .attr('y', (d) => y(Number(d[secondaryStat])) - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', 'black')
        .style('pointer-events', 'none')
        .style("opacity", 0)
        .text((d) => d.player)
        .transition()
        .duration(700)
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
        .call(d3.axisBottom(x));

      let yAxisG = svg.select<SVGGElement>('g.y-axis');
      if (yAxisG.empty()) {
        yAxisG = svg.append('g').classed('y-axis', true);
      }
      yAxisG
        .attr('transform', `translate(${margin.left},0)`)
        .transition()
        .duration(700)
        .call(d3.axisLeft(y));

      // --- AXIS LABELS ---
      let xLabelG = svg.select<SVGTextElement>('text.x-label');
      if (xLabelG.empty()) {
        xLabelG = svg.append('text').classed('x-label', true);
      }
      xLabelG
        .attr('x', containerWidth / 2)
        .attr('y', height - margin.bottom / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .text(primaryStat.replaceAll('_', ' '));

      let yLabelG = svg.select<SVGTextElement>('text.y-label');
      if (yLabelG.empty()) {
        yLabelG = svg.append('text').classed('y-label', true);
      }
      yLabelG
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

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width="100%" height="100%"></svg>
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          opacity: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          color: '#333',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          pointerEvents: 'none',
          zIndex: 1000,
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          border: '1px solid rgba(0,0,0,0.1)',
          transform: 'translate(-100%, -100%)'
        }}
      />
    </div>
  );
} 