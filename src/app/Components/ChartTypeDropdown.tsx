"use client"

import { useState , use } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { AppContext } from './AppState';

const set:ChartType[] = ["bar","line","scatter"]
const name = "Chart Type"

export const ChartTypeDropdown = () => {

    const {dispatch,appState} = use(AppContext)!
    
    const [value,setValue] = useState<ChartType | null>(appState.chartType)
    const handleChange = (event: SelectChangeEvent) => {
        const chartType = event.target.value as ChartType | null
        setValue(chartType);
        if (chartType) {
            dispatch({type:"update_chart_type",payload:{chartType}})
        }
      };

  return (
    <div className='my-2'>
        <FormControl fullWidth>
        <InputLabel id="chart-type-select-label">Chart Type</InputLabel>
        <Select
            labelId="chart-type-select-label"
            id="chart-type-select"
            value={value || ""}
            label={name}
            onChange={handleChange}
        >
            {set.map((item) => (
            <MenuItem key={item} value={item}>{item}</MenuItem>
            ))}
        </Select>
        </FormControl>
    </div>
  );
};