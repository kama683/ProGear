
export interface User {
  ID: number;
  Name: string;
  Email: string;
  Role: 'admin' | 'manager' | 'customer';
}

export interface RegisterRequest {
  Name: string;
  Email: string;
  Password: string;
  ConfirmPassword: string;
}

export interface RegisterResponse {
  User: User;
}

export interface LoginRequest {
  Email: string;
  Password: string;
}

export interface LoginResponse {
  AccessToken: string;
  RefreshToken: string;
  User: User;
}


export interface Equipment {
  ID: number;
  Name: string;
  Category: string;
  Description: string;
  Type: string;
  DailyRate: string;
  SalePrice: string;
  Quantity: number;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface EquipmentDetail extends Equipment {
  AvailableUnits: number;
  Serials: string[];
}

export interface CreateEquipmentRequest {
  Name: string;
  Category: string;
  Description: string;
  Type: string;
  DailyRate: number;
  SalePrice: number;
  Quantity: number;
  Serials?: string[];
}

export interface UpdateEquipmentRequest {
  Name?: string;
  Category?: string;
  Description?: string;
  Type?: string;
  DailyRate?: number;
  SalePrice?: number;
  Quantity?: number;
}


export interface AvailabilityResponse {
  EquipmentID: number;
  StartAt: string;
  EndAt: string;
  Available: boolean;
  AvailableUnits: number;
}

export interface CalculateRequest {
  EquipmentId: number;
  StartAt: string;
  EndAt: string;
  Mode: 'day' | 'hour';
}

export interface CalculateResponse {
  EquipmentId: number;
  StartAt: string;
  EndAt: string;
  Mode: string;
  Amount: number;
}

export interface BookingRequest {
  EquipmentID: number;
  StartAt: string;
  EndAt: string;
}

export interface BookingResponse {
  ReservationID: number;
  EquipmentId: number;
  EquipmentUnit: number;
  Status: string;
  StartAt: string;
  EndAt: string;
  EstimatedCost: number;
}


export interface OrderItem {
  ID: number;
  ItemType: 'sale' | 'rental';
  EquipmentID: number;
  EquipmentUnitID: number | null;
  Quantity: number;
  UnitPrice: number;
  LineTotal: number;
  StartAt: string | null;
  EndAt: string | null;
}

export interface Order {
  ID: number;
  UserId: number;
  OrderType: string;
  Status: string;
  TotalAmount: number;
  CreatedAt: string;
  Items: OrderItem[] | null;
}

export interface CreateOrderItemRequest {
  ItemType: 'sale' | 'rental';
  EquipmentID: number;
  Quantity: number;
  StartAt?: string | null;
  EndAt?: string | null;
  ReservationID?: number | null;
}

export interface CreateOrderRequest {
  Items: CreateOrderItemRequest[];
}

export interface Invoice {
  OrderID: number;
  InvoiceNumber: string;
  Amount: number;
  InvoiceStatus: string;
  IssuedAt: string;
}

export interface ApiErrorBody {
  error: string;
}