"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import _ from "lodash";
import { AnimatePresence, motion } from "motion/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export type MultiSelectViewProps = {
  data: string[];
  callback?: (data: string[]) => void;
};

type AddressStatus = "safe" | "fraud" | "loading" | null;

export const MultiSelectView: React.FC<MultiSelectViewProps> = ({ data, callback }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, AddressStatus>>({});

  const isFraudulent = (apiData: Record<string, string>) => {
    return Object.entries(apiData).some(([key, value]) => {
      if (key === "contract_address" || key === "data_source") return false;
      return value === "1";
    });
  };

  // Debounced batch checker — runs 2s after last selection change
  const debouncedCheck = useMemo(
    () =>
      _.debounce(async (addresses: string[]) => {
        // Mark all as loading first
        setStatusMap(prev => {
          const updated = { ...prev };
          addresses.forEach(addr => (updated[addr] = "loading"));
          return updated;
        });

        // Check each address
        for (const addr of addresses) {
          try {
            const res = await fetch(`/api/security/address?address=${addr}&chainId=137`);
            const json = await res.json();

            if (json.success && json.data) {
              const fraud = isFraudulent(json.data);
              setStatusMap(prev => ({
                ...prev,
                [addr]: fraud ? "fraud" : "safe",
              }));
            } else {
              setStatusMap(prev => ({ ...prev, [addr]: "fraud" }));
            }
          } catch (err) {
            console.error("Error checking address:", err);
            setStatusMap(prev => ({ ...prev, [addr]: "fraud" }));
          }
        }
      }, 2000),
    [],
  );

  // Whenever selected changes → trigger batch check after 2s
  useEffect(() => {
    if (selected.length > 0) {
      debouncedCheck(selected);
    }
  }, [selected, debouncedCheck]);

  const handleChange = (event: SelectChangeEvent<typeof selected>) => {
    const {
      target: { value },
    } = event;
    const newSelected = typeof value === "string" ? value.split(",") : value;
    setSelected(newSelected);
    callback?.(newSelected);
  };

  const handleDelete = (id: string) => {
    const newSelected = selected.filter(i => i !== id);
    setSelected(newSelected);
    callback?.(newSelected);
  };

  return (
    <div>
      <FormControl>
        <InputLabel
          sx={{
            color: "white",
            "&.Mui-focused": { color: "white" },
            "&.MuiInputLabel-shrink": { color: "white" },
          }}
        >
          Select User
        </InputLabel>
        <Select
          style={{ minWidth: 300 }}
          multiple
          value={selected}
          onChange={handleChange}
          input={<OutlinedInput label="Wallet Address" sx={{ color: "white" }} />}
          renderValue={() => (selected.length === 0 ? "Select" : `${selected.length} selected`)}
          sx={{
            color: "white",
            fieldset: { borderColor: "#8c8c8c", borderRadius: 2 },
            "&:hover fieldset": { borderColor: "#fff !important" },
          }}
        >
          {data.map(address => (
            <MenuItem key={address} value={address}>
              <Checkbox checked={selected.includes(address)} />
              <ListItemText primary={address} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div className="flex gap-2 flex-wrap mt-4">
        <AnimatePresence>
          {selected.map((address, i) => {
            const status = statusMap[address];

            let bgColor = "bg-gray-700 border-[#8c8c8c]";
            if (status === "safe") bgColor = "bg-green-700 border-green-500";
            if (status === "fraud") bgColor = "bg-red-700 border-red-500";

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-[6px] items-center border text-white rounded-full px-4 py-2 ${bgColor}`}
              >
                <p className="text-sm">{status === "loading" ? "Checking..." : address}</p>
                <XMarkIcon
                  color="#fff"
                  width={15}
                  height={15}
                  onClick={() => handleDelete(address)}
                  className="cursor-pointer"
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MultiSelectView;
