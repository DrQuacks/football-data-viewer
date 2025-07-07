"use client";

import { useEffect, useState, use } from "react";
import {
  Autocomplete,
  TextField,
  Button
} from "@mui/material";
import { AppContext } from "./AppState";

export const MultiPlayerDropdown = () => {
  const { dispatch, appState } = use(AppContext)!;
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load all available players once when component mounts or filters change
  useEffect(() => {
    const loadAllPlayers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          query: "",
          limit: "1000", // Get a large number to ensure we have all players
          offset: "0",
        });
        if (appState.startYear) params.append("startYear", appState.startYear.toString());
        if (appState.endYear) params.append("endYear", appState.endYear.toString());
        if (appState.primaryStat) params.append("stat", appState.primaryStat);

        if (!appState.statType) return;
        
        const res = await fetch(`/api/${appState.statType}/players?${params.toString()}`);
        const data = await res.json();
        const names = data.map((row: { player: string }) => row.player);
        setOptions(names);
      } catch (e) {
        console.error("Failed to fetch players:", e);
      } finally {
        setLoading(false);
      }
    };

    loadAllPlayers();
  }, [appState.startYear, appState.endYear, appState.primaryStat, appState.statType]);

  const handlePlayerChange = (playerIndex: number, newValue: string | null) => {
    const newPlayers = [...appState.players];
    if (newValue) {
      newPlayers[playerIndex] = newValue;
    } else {
      newPlayers.splice(playerIndex, 1);
    }
    dispatch({ type: "update_players", payload: { players: newPlayers } });
  };

  const handleAddPlayer = () => {
    dispatch({ type: "add_player", payload: { players: [""] } });
  };

  const handleRemovePlayer = (playerIndex: number) => {
    const playerToRemove = appState.players[playerIndex];
    dispatch({ type: "remove_player", payload: { players: [playerToRemove] } });
  };

  return (
    <div className="my-2 space-y-2">
      {appState.players.map((player, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Autocomplete
            fullWidth
            options={options}
            value={player || null}
            onChange={(e, newValue) => handlePlayerChange(index, newValue)}
            filterOptions={(options, { inputValue }) => {
              // Filter out already selected players (except the current one being edited)
              const otherSelectedPlayers = appState.players.filter((p, i) => i !== index && p.trim());
              const availableOptions = options.filter(option => !otherSelectedPlayers.includes(option));
              
              // Then filter by search input
              const filtered = availableOptions.filter(option =>
                option.toLowerCase().includes(inputValue.toLowerCase())
              );
              return filtered;
            }}
            loading={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label={`Player ${index + 1}`}
              />
            )}
          />
          {appState.players.length > 1 && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handleRemovePlayer(index)}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              −
            </Button>
          )}
        </div>
      ))}
      
      <Button
        variant="outlined"
        onClick={handleAddPlayer}
        fullWidth
      >
        Add Player
      </Button>
    </div>
  );
}; 