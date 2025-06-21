"use client"

import {useState,use} from 'react'
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { AppContext } from './AppState';

const set:StatType[] = ["receiving","rushing","passing"]
const name = "Stat Type"

export const StatTypeDropdown = () => {

    const {dispatch,appState} = use(AppContext)!

    const [value,setValue] = useState<StatType | null>(appState.statType)
    const handleChange = (event: SelectChangeEvent) => {
        const statType = event.target.value as StatType | null
        setValue(statType);
        if (statType) {
            dispatch({type:"update_stat_type",payload:{statType}})
        }
      };
    return (
        <div className='my-2'>
        <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">{name}</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={value || ""}
                label={name}
                onChange={handleChange}
            >
                {set.map(item => {
                    return (<MenuItem key={`menu-${item}`} value={item}>{item}</MenuItem>)
                })}
            </Select>
        </FormControl>
        </div>
    )
}