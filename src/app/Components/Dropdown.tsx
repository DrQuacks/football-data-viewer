"use client"

import {useState} from 'react'
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';


export const Dropdown = ({name,set,stateAction}:{name:string,set:number[],stateAction:StateAction}) => {

    const [value,setValue] = useState<string>("")
    const handleChange = (event: SelectChangeEvent) => {
        setValue(event.target.value as string);
      };
    return (
        <div className='my-2'>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">{name}</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={value}
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