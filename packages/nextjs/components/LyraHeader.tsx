import React, { memo } from "react";
import { Stack } from "@mui/material";

export const HeaderView = () => {
  return (
    <Stack className="border-1">
      <p>Lyra</p>
    </Stack>
  );
};

export const Header = memo(HeaderView);
export default Header;
