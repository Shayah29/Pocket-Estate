export interface Property {
  id: number;
  landlord_id: number;
  name: string;
  address: string;
  type: string;
  sqft: number;
  rooms: number;
  rent_price: number;
  deposit_amount: number;
  lease_terms: string;
}

export interface Unit {
  id: number;
  property_id: number;
  unit_number: string;
  rent_price: number;
  status: 'vacant' | 'occupied';
}

export interface Tenant {
  id: number;
  unit_id: number;
  name: string;
  email: string;
  phone: string;
  lease_start: string;
  lease_end: string;
  rent_due_day: number;
}

export interface Payment {
  id: number;
  tenant_id: number;
  amount: number;
  payment_date: string;
  status: 'paid' | 'pending' | 'late';
  period_month: number;
  period_year: number;
  late_fee: number;
  receipt_url?: string;
}

export interface Message {
  id: number;
  sender_type: 'landlord' | 'tenant';
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  is_read: number;
}

export interface LateFeeRule {
  id: number;
  property_id: number;
  grace_period_days: number;
  flat_fee: number;
  daily_fee: number;
}

export interface Document {
  id: number;
  entity_type: 'property' | 'tenant';
  entity_id: number;
  file_name: string;
  file_path: string;
  mime_type: string;
  summary: string;
  created_at: string;
}

export interface Expense {
  id: number;
  property_id: number;
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface Vendor {
  id: number;
  name: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

export interface MaintenanceRequest {
  id: number;
  property_id: number;
  unit_id: number;
  tenant_id: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  status: 'Pending' | 'Approved' | 'In Progress' | 'Completed' | 'Cancelled';
  vendor_id?: number;
  images: string; // JSON string
  created_at: string;
  updated_at: string;
  property_name?: string;
  unit_number?: string;
  tenant_name?: string;
  vendor_name?: string;
}

export interface ScheduledMaintenance {
  id: number;
  property_id: number;
  title: string;
  description: string;
  scheduled_date: string;
  frequency: 'One-time' | 'Monthly' | 'Quarterly' | 'Annually';
  vendor_id?: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  property_name?: string;
  vendor_name?: string;
}

export interface Communication {
  id: number;
  tenant_id: number;
  tenant_name?: string;
  type: 'rent_reminder' | 'maintenance_update' | 'general';
  content: string;
  sent_at: string;
  status: string;
}
