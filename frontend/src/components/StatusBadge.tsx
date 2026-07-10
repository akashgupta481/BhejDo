interface StatusBadgeProps {
  status: string;
}

function getStatusStyles(status: string): string {
  switch (status) {
    case 'CREATED':
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
    case 'MATCHED':
    case 'ACCEPTED':
      return 'bg-orange-50 text-orange-700 ring-1 ring-orange-200';
    case 'PICKED_UP':
      return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200';
    case 'IN_TRANSIT':
      return 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200';
    case 'REACHED':
      return 'bg-teal-50 text-teal-700 ring-1 ring-teal-200';
    case 'DELIVERED':
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
    case 'CANCELLED':
      return 'bg-red-50 text-red-700 ring-1 ring-red-200';
    case 'ACTIVE':
      return 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200';
    default:
      return 'bg-slate-50 text-slate-700 ring-1 ring-slate-200';
  }
}

function getStatusDot(status: string): string {
  switch (status) {
    case 'CREATED':
    case 'PENDING':
      return 'bg-amber-500';
    case 'MATCHED':
    case 'ACCEPTED':
      return 'bg-orange-500';
    case 'PICKED_UP':
      return 'bg-violet-500';
    case 'IN_TRANSIT':
      return 'bg-indigo-500';
    case 'REACHED':
      return 'bg-teal-500';
    case 'DELIVERED':
    case 'COMPLETED':
      return 'bg-emerald-500';
    case 'CANCELLED':
      return 'bg-red-500';
    case 'ACTIVE':
      return 'bg-cyan-500';
    default:
      return 'bg-slate-500';
  }
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ');
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(status)}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(status)}`}></span>
      {formatStatus(status)}
    </span>
  );
}
