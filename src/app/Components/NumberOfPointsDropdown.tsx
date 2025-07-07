"use client"

import { useEffect, useState, use } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { AppContext } from "./AppState";

export const NumberOfPointsDropdown = () => {
  const { dispatch, appState } = use(AppContext)!;
  const [maxPoints, setMaxPoints] = useState<number>(1000);

  // Fetch the total number of rows in the table to set the maximum
  useEffect(() => {
    if (!appState.statType) return;
    
    // This is a placeholder - you might want to create an API endpoint to get the total count
    // For now, we'll use a reasonable default
    setMaxPoints(1000);
  }, [appState.statType]);

  const handleNumberOfPointsChange = (event: SelectChangeEvent) => {
    const numberOfPoints = parseInt(event.target.value);
    if (numberOfPoints >= 1 && numberOfPoints <= maxPoints) {
      dispatch({ type: "update_number_of_points", payload: { numberOfPoints } });
    }
  };

  // Generate options from 1 to maxPoints
  const options = Array.from({ length: Math.min(maxPoints, 200) }, (_, i) => i + 1);

  return (
    <div className="my-2">
      <FormControl fullWidth>
        <InputLabel id="number-of-points-dropdown-label">Number of Points</InputLabel>
        <Select
          labelId="number-of-points-dropdown-label"
          id="number-of-points-dropdown"
          value={appState.numberOfPoints?.toString() || "50"}
          label="Number of Points"
          onChange={handleNumberOfPointsChange}
        >
          {options.map((num) => (
            <MenuItem key={num} value={num.toString()}>
              {num}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}; 