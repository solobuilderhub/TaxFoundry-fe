import { createCrudApi } from "@classytic/arc-next/api";

/** A taxpayer corporation (mirrors the server `client` model). */
export interface Client {
  _id: string;
  businessNumber: string;
  name: string;
  jurisdiction?: "AB";
  corpType?: string;
  incorporationDate?: string;
  fiscalYearEndMonth?: number;
  corporateAccountNumber?: string;
  address?: {
    street?: string;
    city?: string;
    province?: string;
    postalCode?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export type ClientInput = Omit<Client, "_id" | "createdAt" | "updatedAt">;

/**
 * Clients CRUD client → the server `client` arc resource, mounted at
 * `/api/clients` (server `resourcePrefix: "/api"`). Host base URL comes from
 * `configureClient({ baseUrl })` in components/providers/Providers.jsx.
 *
 * Methods: getAll({params}), getById({id}), create({data}),
 * update({id,data}), delete({id}).
 */
export const clientsApi = createCrudApi<Client, Partial<ClientInput>, Partial<ClientInput>>(
  "clients",
  { basePath: "/api" },
);
