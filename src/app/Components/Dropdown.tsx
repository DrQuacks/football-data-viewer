"use client"

import {useState,use, useEffect} from 'react'
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { AppContext } from './AppState';


export const Dropdown = ({name,set}:{name:string,set:number[]}) => {
    const {dispatch,appState} = use(AppContext)!
    const type = name === "Start Year" ? "update_start_year" : "update_end_year"
    const initVal = name === "Start Year" ? appState.startYear : appState.endYear
    const [value,setValue] = useState<number | null>(initVal)
    
    // Keep local state in sync with appState
    useEffect(() => {
        const newVal = name === "Start Year" ? appState.startYear : appState.endYear;
        setValue(newVal);
    }, [appState.startYear, appState.endYear, name]);
    
    const handleChange = (event: SelectChangeEvent<number | null>) => {
        const year = event.target.value as number | null
        setValue(year as number | null);
        dispatch({type,payload:{year}})
    };
    
    return (
        <div className='my-2 sm:my-3'>
            <FormControl fullWidth size="medium">
                <InputLabel id="demo-simple-select-label">{name}</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={value || ""}
                    label={name}
                    onChange={handleChange}
                    MenuProps={{
                        PaperProps: {
                            style: { maxHeight: 300, overflowY: "auto" }
                        },
                    }}
                >
                    {set.map(item => {
                        return (<MenuItem key={`menu-${item}`} value={item}>{item}</MenuItem>)
                    })}
                </Select>
            </FormControl>
        </div>
    )
}