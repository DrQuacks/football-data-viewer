"use client"

import { useEffect, useState, use } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { AppContext } from "./AppState";

const name = "Stat";

export const StatDropdown = () => {
  const { dispatch, appState } = use(AppContext)!;
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/receiving/numeric-columns")
      .then((res) => res.json())
      .then((cols) => setOptions(cols));
  }, []);

  const handleChange = (event: SelectChangeEvent) => {
    const stat = event.target.value as string;
    dispatch({ type: "update_stat", payload: { stat } });
  };

  return (
    <div className="my-2">
      <FormControl fullWidth>
        <InputLabel id="stat-dropdown-label">{name}</InputLabel>
        <Select
          labelId="stat-dropdown-label"
          id="stat-dropdown"
          value={appState.stat || ""}
          label={name}
          onChange={handleChange}
        >
          {options.map((col) => (
            <MenuItem key={col} value={col}>
              {col}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};