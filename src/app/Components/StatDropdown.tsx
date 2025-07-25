"use client"

import { useEffect, useState, use } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { AppContext } from "./AppState";
import { NumberOfPointsDropdown } from "./NumberOfPointsDropdown";

const name = "Stat";

export const StatDropdown = () => {
  const { dispatch, appState } = use(AppContext)!;
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    if (!appState.statType) return;
    
    fetch(`/api/${appState.statType}/numeric-columns`)
      .then((res) => res.json())
      .then((cols) => setOptions(cols));
  }, [appState.statType]);

  const handlePrimaryStatChange = (event: SelectChangeEvent) => {
    const stat = event.target.value as string;
    dispatch({ type: "update_primary_stat", payload: { primaryStat: stat } });
  };

  const handleSecondaryStatChange = (event: SelectChangeEvent) => {
    const stat = event.target.value as string;
    dispatch({ type: "update_secondary_stat", payload: { secondaryStat: stat } });
  };

  // Show two dropdowns for scatter plot, one for other chart types
  if (appState.chartType === "scatter") {
    return (
      <div className="my-2 sm:my-3 space-y-2 sm:space-y-3">
        <FormControl fullWidth size="medium">
          <InputLabel id="primary-stat-dropdown-label">Primary Stat (X-axis)</InputLabel>
          <Select
            labelId="primary-stat-dropdown-label"
            id="primary-stat-dropdown"
            value={appState.primaryStat || ""}
            label="Primary Stat (X-axis)"
            onChange={handlePrimaryStatChange}
          >
            {options.map((col) => (
              <MenuItem key={col} value={col}>
                {col.replaceAll('_',' ')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <div className="mt-2 sm:mt-3">
          <FormControl fullWidth size="medium">
            <InputLabel id="secondary-stat-dropdown-label">Secondary Stat (Y-axis)</InputLabel>
            <Select
              labelId="secondary-stat-dropdown-label"
              id="secondary-stat-dropdown"
              value={appState.secondaryStat || ""}
              label="Secondary Stat (Y-axis)"
              onChange={handleSecondaryStatChange}
            >
              {options.map((col) => (
                <MenuItem key={col} value={col}>
                  {col.replaceAll('_',' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        
        <NumberOfPointsDropdown />
      </div>
    );
  }

  // Single dropdown for other chart types
  return (
    <div className="my-2 sm:my-3">
      <FormControl fullWidth size="medium">
        <InputLabel id="stat-dropdown-label">{name}</InputLabel>
        <Select
          labelId="stat-dropdown-label"
          id="stat-dropdown"
          value={appState.primaryStat || ""}
          label={name}
          onChange={handlePrimaryStatChange}
        >
          {options.map((col) => (
            <MenuItem key={col} value={col}>
              {col.replaceAll('_',' ')}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};