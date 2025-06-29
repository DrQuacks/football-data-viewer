"use client"

import { use } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { AppContext } from "./AppState";

export const AggregateDropdown = () => {
  const { dispatch, appState } = use(AppContext)!;

  const handleChange = (event: SelectChangeEvent) => {
    const aggregate = event.target.value as "total" | "average";
    dispatch({ type: "update_aggregate", payload: { aggregate } });
  };

  return (
    <div className="my-2">
      <FormControl fullWidth>
        <InputLabel id="aggregate-dropdown-label">Aggregate</InputLabel>
        <Select
          labelId="aggregate-dropdown-label"
          id="aggregate-dropdown"
          value={appState.aggregate || ""}
          label="Aggregate"
          onChange={handleChange}
        >
          <MenuItem value="total">Total</MenuItem>
          <MenuItem value="average">Average</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
}; 