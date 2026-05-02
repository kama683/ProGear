export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '—';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return '—';
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '—';
  }
}

// converts a Date to format that datetime-local input understands (2024-01-15T14:30)
export function toLocalDatetimeInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// takes "John Doe" and returns "JD"
export function initials(name: string): string {
  const words = name.split(' ');
  const firstLetters = words.map(word => word[0] || '');
  return firstLetters.join('').toUpperCase().slice(0, 2);
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    reserved: 'Reserved',
    checked_out: 'Checked Out',
    returned: 'Returned',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return labels[status] ?? status;
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    reserved: 'badge-blue',
    checked_out: 'badge-yellow',
    returned: 'badge-purple',
    completed: 'badge-green',
    cancelled: 'badge-red',
  };
  return colors[status] ?? 'badge-gray';
}

export function getEquipmentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    rental: 'Rental',
    sale: 'Sale',
    both: 'Rental + Sale',
  };
  return labels[type] ?? type;
}

export function getEquipmentTypeColor(type: string): string {
  const colors: Record<string, string> = {
    rental: 'badge-blue',
    sale: 'badge-green',
    both: 'badge-purple',
  };
  return colors[type] ?? 'badge-gray';
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Administrator',
    manager: 'Manager',
    customer: 'Customer',
  };
  return labels[role] ?? role;
}

export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    admin: 'badge-red',
    manager: 'badge-yellow',
    customer: 'badge-blue',
  };
  return colors[role] ?? 'badge-gray';
}
