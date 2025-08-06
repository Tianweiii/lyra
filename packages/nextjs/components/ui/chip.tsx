import Stack, { StackProps } from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";

export type StatusChipProps = {
  stackProps?: StackProps;
  status: "completed" | "pending" | "failed";
};

export const CustomStatusChip: React.FC<StatusChipProps> = props => {
  const { status, stackProps } = props;

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
      <Typography fontWeight={600} fontSize={"12px"} padding={"0px !important"} color={statusMap[status]?.color}>
        {statusMap[status]?.label}
      </Typography>
    </Stack>
  );
};

export default CustomStatusChip;
