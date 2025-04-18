import { Chip } from "@mui/material";

export const getStatusColor = (status) => {
    const normalized = status?.trim().toUpperCase();
  
    const statusColors = {
      SCHEDULED: { bg: '#EDF4FF', text: '#1E40AF' },
      COMPLETED: { bg: '#E9FBE5', text: '#2E7D32' },
      CANCELLED: { bg: '#FAEDED', text: '#B91C1C' },
      RESCHEDULED: { bg: '#FFF4E5', text: '#C2410C' },
      PLACED: { bg: '#F3E8FF', text: '#7E22CE' },
      SELECTED: { bg: '#E0F2F1', text: '#00695C' },
    };
  
    return statusColors[normalized] || { bg: '#F3F4F6', text: '#374151' };
  };
  

  export const getStatusChip = (status, row) => {
    const normalized = status?.trim().toUpperCase();
    const { bg, text } = getStatusColor(status);
    const label = normalized || 'SCHEDULED';
    const isPlaced = normalized === 'PLACED';
  
    return (
      <Chip
        label={label}
        size="small"
        sx={{
          bgcolor: bg,
          color: text,
          fontWeight: 500,
          borderRadius: '999px',
          px: 1.5,
          height: 24,
          textTransform: 'uppercase', 
          letterSpacing: '0.5px',
          fontSize: '0.75rem',
          cursor: isPlaced ? 'pointer' : 'default',
          '&:hover': isPlaced ? { opacity: 0.9 } : {},
        }}
      />
    );
  };