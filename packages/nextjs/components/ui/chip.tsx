import Stack, { StackProps } from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";

export type StatusChipProps = {
  stackProps?: StackProps;
  isMobile?: boolean;
  status: "completed" | "pending" | "failed" | "active" | "inactive";
};

export const CustomStatusChip: React.FC<StatusChipProps> = props => {
  const { status, isMobile, stackProps } = props;

  const statusMap = {
    completed: {
      label: "Completed",
      color: "#67CA24",
    },
    pending: {
      label: "Pending",
      color: "#F0AD00",
    },
    failed: {
      label: "Failed",
      color: "#FF4D49",
    },
    active: {
      label: "Active",
      color: "#67CA24",
    },
    inactive: {
      label: "Inactive",
      color: "#FF4D49",
    },
  };

  return (
    <Stack
      sx={{
        width: "fit-content",
        fontWeight: 600,
        padding: "2px 8px 2px 8px",
        borderRadius: "4px",
        color: statusMap[status]?.color,
        backgroundColor:
          statusMap[status] && statusMap[status].color ? alpha(statusMap[status].color, 0.12) : "transparent",
      }}
      {...stackProps}
    >
      <Typography
        fontWeight={600}
        fontSize={isMobile ? "8px" : "12px"}
        padding={"0px !important"}
        color={statusMap[status]?.color}
      >
        {statusMap[status]?.label}
      </Typography>
    </Stack>
  );
};

export default CustomStatusChip;
