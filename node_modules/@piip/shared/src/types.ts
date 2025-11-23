export interface User {
  id: string;
  email: string;
  role: 'admin' | 'detective' | 'client';
  createdAt: Date;
  updatedAt: Date;
}

export interface Case {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assignedToId: string;
  clientId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Person {
  id: string;
  name: string;
  birthDate?: Date;
  contactInfo?: Record<string, any>;
  caseId: string;
  relationship?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Evidence {
  id: string;
  caseId: string;
  type: 'document' | 'photo' | 'video' | 'audio' | 'physical';
  title: string;
  description?: string;
  fileUrls: string[];
  metadata?: Record<string, any>;
  collectedById: string;
  collectedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  caseId: string;
  clientId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  transactionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLog {
  id: string;
  caseId: string;
  userId: string;
  activityType: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}