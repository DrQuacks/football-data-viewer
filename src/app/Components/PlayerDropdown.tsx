"use client";

import { useEffect, useRef, useState, use , SyntheticEvent } from "react";
import {
  Autocomplete,
  TextField
} from "@mui/material";
import { AppContext } from "./AppState";

const PAGE_SIZE = 20;

export const PlayerDropdown = () => {
  const { dispatch, appState } = use(AppContext)!;
  const [value, setValue] = useState<string | null>(appState.player || null);
  const [options, setOptions] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const listboxRef = useRef<HTMLUListElement>(null);

  // Reset options and offset when query or year range changes
  useEffect(() => {
    setOptions([]);
    setOffset(0);
    setHasMore(true);
  }, [query, appState.startYear, appState.endYear]);

  useEffect(() => {
    fetchOptions();
  }, [query, offset]);

  // Fetch when filter changes and offset is 0 (initial load after filter change)
useEffect(() => {
  if (offset === 0) {
    fetchOptions();
  }
}, [query, appState.startYear, appState.endYear]);

const fetchOptions = async () => {
  if (!hasMore || loading) return;
  setLoading(true);
  try {
    const params = new URLSearchParams({
      query,
      limit: PAGE_SIZE.toString(),
      offset: offset.toString(),
    });
    //console.log("Fetching players with params:", params.toString());
    if (appState.startYear) params.append("startYear", appState.startYear.toString());
    if (appState.endYear) params.append("endYear", appState.endYear.toString());
    if (appState.primaryStat) params.append("stat", appState.primaryStat);


    const res = await fetch(`/api/receiving/players?${params.toString()}`);
    const data = await res.json();
    const names = data.map((row: { player: string }) => row.player);

    setOptions((prev) =>
      offset === 0
        ? names // replace options on new search
        : Array.from(new Set([...prev, ...names])) // accumulate on scroll
    );
    //console.log("names are: ",names, "offset is: ",offset, "options is: ",options)
    if (names.length < PAGE_SIZE) setHasMore(false);
  } catch (e) {
    console.error("Failed to fetch players:", e);
  } finally {
    setLoading(false);
  }
};

  const handleScroll = (event: React.UIEvent<HTMLUListElement>) => {
    const listboxNode = event.currentTarget;
    if (
      listboxNode.scrollTop + listboxNode.clientHeight >=
      listboxNode.scrollHeight - 1
    ) {
      setOffset((prev) => prev + PAGE_SIZE);
    }
  };

  const handleChange = (e: SyntheticEvent<Element, Event>, newValue:string|null) => {
    if (newValue === value) return; // Avoid unnecessary updates
    console.log("Selected player:", newValue); 
    setValue(newValue);
    dispatch({ type: "update_player", payload: { player: newValue } });
  }

  return (
    <div className='my-2'>
        <Autocomplete
        fullWidth
        options={options}
        value={value}
        onChange={handleChange}
        onInputChange={(e, inputValue) => {
          setQuery(inputValue.toLowerCase());
          setOptions([]);
          setOffset(0);
          setHasMore(true);
          if (inputValue === "") {
            setValue(null);
            dispatch({ type: "update_player", payload: { player: null } });
          }
        }}
        ListboxProps={{
            onScroll: handleScroll,
            ref: listboxRef,
            style: { maxHeight: 300, overflowY: "auto" },
        }}
        loading={loading}
        renderInput={(params) => (
            <TextField
            {...params}
            label="Player"
            />
        )}
        />
    </div>
  );
};