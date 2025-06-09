"use client";

import { useEffect, useRef, useState, use } from "react";
import {
  Autocomplete,
  TextField
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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

  useEffect(() => {
    fetchOptions();
  }, [query, offset]);

  const fetchOptions = async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/receiving/players?query=${query}&limit=${PAGE_SIZE}&offset=${offset}`
      );
      const data = await res.json();
      const names = data.map((row: { player: string }) => row.player);
      setOptions((prev) => [...prev, ...names]);
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

  return (
    <Autocomplete
      fullWidth
      freeSolo
      options={options}
      value={value}
      popupIcon={<ExpandMoreIcon />} // ✅ Forces the dropdown arrow
      onChange={(e, newValue) => {
        setValue(newValue);
        if (newValue) {
          dispatch({ type: "update_player", payload: { player: newValue } });
        }
      }}
      onInputChange={(e, inputValue) => {
        setQuery(inputValue.toLowerCase());
        setOptions([]);
        setOffset(0);
        setHasMore(true);
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
  );
};