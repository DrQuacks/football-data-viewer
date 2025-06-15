"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

export const ReceivingYardsBar = ({
  data
}: {
  data: { season: number; yards: number }[]
}) => {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // clear previous renders

    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = ref.current ? ref.current.parentElement?.clientWidth || 800 : 800; // Default to 800 if no parent width
    //const containerWidth = rawWidth
    console.log('container width: ',width)
    const height = 600;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.season.toString()))
      .range([0, innerWidth])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.yards)!])
      .nice()
      .range([innerHeight, 0]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .call(d3.axisLeft(y));

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    g.selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => x(d.season.toString())!)
      .attr("y", (d) => y(d.yards))
      .attr("width", x.bandwidth())
      .attr("height", (d) => innerHeight - y(d.yards))
      .attr("fill", "steelblue");
  }, [data]);

  return <svg ref={ref} width="100%" height="100%" />;
};