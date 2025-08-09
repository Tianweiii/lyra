"use client";

import React, { useState } from "react";
import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { AnimatePresence, motion } from "motion/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export type MultiSelectViewProps = {
  data: string[];
  callback?: (data: string[]) => void;
};

export const MultiSelectView: React.FC<MultiSelectViewProps> = ({ data, callback }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleChange = (event: SelectChangeEvent<typeof selected>) => {
    const {
      target: { value },
    } = event;
    callback?.(typeof value === "string" ? value.split(",") : value);
    setSelected(typeof value === "string" ? value.split(",") : value);
  };

  // const handleSelectAll = () => {
  //   const isAllSelected = selected.length === data.length;
  //   const newSelected = isAllSelected ? [] : [...data];
  //   setSelected(newSelected);
  //   callback?.(newSelected);
  // };

  const handleDelete = (id: string) => {
    const newSelected = selected.filter(i => i !== id);
    setSelected(newSelected);
    callback?.(newSelected);
  };

  // const isAllSelected = selected.length === data.length;
  // const isIndeterminate = selected.length > 0 && selected.length < data.length;

  return (
    <div>
      <FormControl>
        <InputLabel
          sx={{
            color: "white",
            "&.Mui-focused": {
              color: "white",
            },
            "&.MuiInputLabel-shrink": {
              color: "white",
            },
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
            fieldset: {
              borderColor: "#8c8c8c",
              borderRadius: 2,
            },
            "&:hover fieldset": {
              borderColor: "#fff !important",
            },
          }}
        >
          {/* <MenuItem value="1" onClick={handleSelectAll}>
            <Checkbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
            />
            <ListItemText primary="Select All" />
          </MenuItem> */}
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
          {selected.map((address, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.2 }}
              className="flex gap-[2px] items-center border border-[#8c8c8c] text-white rounded-full px-4 py-2"
            >
              <p className="text-sm text-[#8c8c8c]">{address}</p>
              <XMarkIcon
                color="#8c8c8c"
                width={15}
                height={15}
                onClick={() => handleDelete(address)}
                className="cursor-pointer"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MultiSelectView;
