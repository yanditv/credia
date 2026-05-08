import { Injectable } from '@nestjs/common';

// STUB — reemplazar por PrismaClient real cuando feat/db/prisma-schema (Cesar) mergee a develop.
// Mantenemos la misma firma que Prisma (.user.findUnique, .create, .update) para que los services
// no cambien al hacer el swap. Tipos espejo de los modelos definidos en CLAUDE.md.

export type Role = 'USER' | 'ADMIN' | 'RISK_ANALYST';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
export type BusinessType =
  | 'VENDOR'
  | 'MERCHANT'
  | 'DELIVERY'
  | 'TAXI'
  | 'STORE'
  | 'SERVICES'
  | 'AGRICULTURE'
  | 'OTHER';

export interface UserRecord {
  id: string;
  fullName: string;
  documentNumber: string;
  phone: string;
  email: string;
  walletAddress: string | null;
  role: Role;
  status: UserStatus;
  createdAt: Date;
}

export interface BusinessProfileRecord {
  id: string;
  userId: string;
  businessName: string;
  businessType: BusinessType;
  city: string;
  monthlyEstimatedIncome: string;
  yearsActive: number;
  createdAt: Date;
}

@Injectable()
export class PrismaService {
  private usersStore: UserRecord[] = [
    {
      id: 'demo-user-1',
      fullName: 'Junior Demo',
      documentNumber: '0123456789',
      phone: '+593990000000',
      email: 'demo@credia.io',
      walletAddress: null,
      role: 'USER',
      status: 'ACTIVE',
      createdAt: new Date('2026-05-01T00:00:00Z'),
    },
  ];

  private businessProfilesStore: BusinessProfileRecord[] = [];

  user = {
    findUnique: async (args: {
      where: { id?: string; email?: string };
    }): Promise<UserRecord | null> => {
      const { id, email } = args.where;
      return (
        this.usersStore.find(
          (u) => (id !== undefined && u.id === id) || (email !== undefined && u.email === email),
        ) ?? null
      );
    },

    update: async (args: {
      where: { id: string };
      data: Partial<UserRecord>;
    }): Promise<UserRecord | null> => {
      const idx = this.usersStore.findIndex((u) => u.id === args.where.id);
      if (idx === -1) return null;
      this.usersStore[idx] = { ...this.usersStore[idx], ...args.data };
      return this.usersStore[idx];
    },
  };

  businessProfile = {
    findUnique: async (args: {
      where: { userId: string };
    }): Promise<BusinessProfileRecord | null> => {
      return this.businessProfilesStore.find((b) => b.userId === args.where.userId) ?? null;
    },

    create: async (args: {
      data: Omit<BusinessProfileRecord, 'id' | 'createdAt'>;
    }): Promise<BusinessProfileRecord> => {
      const record: BusinessProfileRecord = {
        ...args.data,
        id: `bp-${Date.now()}`,
        createdAt: new Date(),
      };
      this.businessProfilesStore.push(record);
      return record;
    },

    update: async (args: {
      where: { userId: string };
      data: Partial<BusinessProfileRecord>;
    }): Promise<BusinessProfileRecord | null> => {
      const idx = this.businessProfilesStore.findIndex((b) => b.userId === args.where.userId);
      if (idx === -1) return null;
      this.businessProfilesStore[idx] = { ...this.businessProfilesStore[idx], ...args.data };
      return this.businessProfilesStore[idx];
    },
  };
}