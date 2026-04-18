export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(num);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr));
  } catch { return '—'; }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateStr));
  } catch { return '—'; }
}

export function toLocalDatetimeInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function initials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function getOrderStatusLabel(status: string): string {
  const map: Record<string, string> = {
    reserved: 'Забронирован', checked_out: 'Выдан',
    returned: 'Возвращён', completed: 'Завершён', cancelled: 'Отменён',
  };
  return map[status] ?? status;
}

export function getOrderStatusColor(status: string): string {
  const map: Record<string, string> = {
    reserved: 'badge-blue', checked_out: 'badge-yellow',
    returned: 'badge-purple', completed: 'badge-green', cancelled: 'badge-red',
  };
  return map[status] ?? 'badge-gray';
}

export function getEquipmentTypeLabel(type: string): string {
  const map: Record<string, string> = { rental: 'Аренда', sale: 'Продажа', both: 'Аренда + Продажа' };
  return map[type] ?? type;
}

export function getEquipmentTypeColor(type: string): string {
  const map: Record<string, string> = { rental: 'badge-blue', sale: 'badge-green', both: 'badge-purple' };
  return map[type] ?? 'badge-gray';
}

export function getRoleLabel(role: string): string {
  const map: Record<string, string> = { admin: 'Администратор', manager: 'Менеджер', customer: 'Клиент' };
  return map[role] ?? role;
}

export function getRoleColor(role: string): string {
  const map: Record<string, string> = { admin: 'badge-red', manager: 'badge-yellow', customer: 'badge-blue' };
  return map[role] ?? 'badge-gray';
}
