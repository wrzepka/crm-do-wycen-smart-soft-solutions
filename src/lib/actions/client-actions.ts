'use server';

import { revalidatePath } from 'next/cache';
import { newClientWithAddressSchema } from '@/lib/schemas/clientSchema';
import { prisma } from '@/lib/prisma-client';
import type { Prisma } from '@/generated/prisma/client';

// Helper function to parse FormData for client creation
function parseClientFormData(input: FormData | Record<string, unknown>) {
  if (!(input instanceof FormData)) {
    return {
      client: input.client as Record<string, unknown> | undefined,
      address: input.address as Record<string, unknown> | undefined,
    };
  }

  const formData = input;
  const client: Record<string, unknown> = {};
  const address: Record<string, unknown> = {};

  const clientFields = ['first_name', 'last_name', 'is_lead', 'email', 'phone'];
  const addressFields = ['city', 'postal_code', 'street', 'building_number', 'nip'];

  for (const [key, value] of formData.entries()) {
    if (clientFields.includes(key)) {
      client[key] = value;
    } else if (addressFields.includes(key)) {
      address[key] = value;
    }
    // Handle prefixed fields (e.g., address_city)
    else if (key.startsWith('address_')) {
      const addressKey = key.replace('address_', '');
      if (addressFields.includes(addressKey)) {
        address[addressKey] = value;
      }
    }
  }

  return {
    client: Object.keys(client).length > 0 ? client : undefined,
    address: Object.keys(address).length > 0 ? address : undefined,
  };
}

// Helper function to convert form values to proper types
function prepareClientData(data: Record<string, unknown>) {
  const prepared = { ...data };

  // Convert is_lead from string to boolean
  if (prepared.is_lead !== undefined) {
    if (typeof prepared.is_lead === 'string') {
      prepared.is_lead =
        prepared.is_lead === 'true' || prepared.is_lead === '1' || prepared.is_lead === 'on';
    } else if (typeof prepared.is_lead === 'boolean') {
      // Keep as is
    } else {
      prepared.is_lead = false; // Default value
    }
  }

  // Handle phone: empty string -> null
  if (prepared.phone === '') {
    prepared.phone = null;
  }

  // Ensure email is lowercase
  if (prepared.email && typeof prepared.email === 'string') {
    prepared.email = prepared.email.toLowerCase();
  }

  return prepared;
}

export async function createClient(input: FormData | Record<string, unknown>) {
  try {
    const { client: clientData, address: addressData } = parseClientFormData(input);

    if (!clientData) {
      return {
        ok: false,
        error: 'Brak danych klienta',
        fieldErrors: {},
        formErrors: ['Dane klienta są wymagane'],
      };
    }

    // Prepare client data
    const preparedClientData = prepareClientData(clientData);

    // Prepare address data if exists
    let preparedAddressData = addressData;
    if (addressData) {
      // For address, we don't need type conversions for now
      preparedAddressData = { ...addressData };
    }

    // Validate using combined schema
    const validationResult = newClientWithAddressSchema.safeParse({
      client: preparedClientData,
      address: preparedAddressData,
    });

    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      return {
        ok: false,
        error: 'Błędy walidacji formularza',
        fieldErrors: errors.fieldErrors,
        formErrors: errors.formErrors,
      };
    }

    const { client: validClientData, address: validAddressData } = validationResult.data;
    let createdId: number;

    await prisma.$transaction(async (tx) => {
      // Check if client with this email already exists
      const existingClient = await tx.clients.findUnique({
        where: { email: validClientData.email },
        select: { id: true },
      });

      if (existingClient) {
        throw new Error('Klient o podanym adresie email już istnieje');
      }

      // Create client
      const createdClient = await tx.clients.create({
        data: {
          first_name: validClientData.first_name,
          last_name: validClientData.last_name,
          is_lead: validClientData.is_lead,
          email: validClientData.email,
          phone: validClientData.phone,
        },
        select: { id: true },
      });

      createdId = createdClient.id;

      // Create address if provided
      if (validAddressData) {
        // Use the relation field instead of client_id
        await tx.client_addresses.create({
          data: {
            city: validAddressData.city,
            postal_code: validAddressData.postal_code,
            street: validAddressData.street,
            building_number: validAddressData.building_number,
            nip: validAddressData.nip,
            clients: {
              connect: { id: createdClient.id },
            },
          },
        });
      }
    });

    // Revalidate clients list
    revalidatePath('/dashboard/clients');

    return {
      ok: true,
      id: createdId!,
      message: validClientData.is_lead
        ? 'Lead został pomyślnie utworzony'
        : 'Klient został pomyślnie utworzony',
    };
  } catch (err: unknown) {
    console.error('Create client error:', err);

    // Handle unique constraint violation (email)
    if (err instanceof Error && err.message.includes('Unique constraint failed')) {
      return {
        ok: false,
        error: 'Klient o podanym adresie email już istnieje',
      };
    }

    const message = err instanceof Error ? err.message : 'Błąd podczas tworzenia klienta';
    return { ok: false, error: message };
  }
}

export async function updateClient(id: number | string, input: FormData | Record<string, unknown>) {
  try {
    // Validate ID
    if (!id) throw new Error('Brak ID klienta');

    const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (Number.isNaN(parsedId)) throw new Error('Nieprawidłowe ID klienta');

    const { client: clientData, address: addressData } = parseClientFormData(input);

    if (!clientData && !addressData) {
      return {
        ok: false,
        error: 'Brak danych do aktualizacji',
        fieldErrors: {},
        formErrors: ['Nie podano żadnych danych do aktualizacji'],
      };
    }

    // Prepare update data
    const updateData: {
      client?: Record<string, unknown>;
      address?: Record<string, unknown>;
    } = {};

    if (clientData) {
      updateData.client = prepareClientData(clientData);
    }

    if (addressData) {
      updateData.address = { ...addressData };
    }

    await prisma.$transaction(async (tx) => {
      // Check if client exists
      const existingClient = await tx.clients.findUnique({
        where: { id: parsedId },
        include: { client_addresses: true },
      });

      if (!existingClient) {
        throw new Error('Klient nie istnieje');
      }

      // Update client data if provided
      if (updateData.client && Object.keys(updateData.client).length > 0) {
        // Check if email is being changed and if it already exists
        if (updateData.client.email && updateData.client.email !== existingClient.email) {
          const clientWithEmail = await tx.clients.findUnique({
            where: { email: updateData.client.email as string },
            select: { id: true },
          });

          if (clientWithEmail && clientWithEmail.id !== parsedId) {
            throw new Error('Klient o podanym adresie email już istnieje');
          }
        }

        await tx.clients.update({
          where: { id: parsedId },
          data: updateData.client as Prisma.clientsUpdateInput,
        });
      }

      // Update or create address if provided
      if (updateData.address && Object.keys(updateData.address).length > 0) {
        if (existingClient.client_addresses) {
          // Update existing address
          await tx.client_addresses.update({
            where: { client_id: parsedId },
            data: updateData.address as Prisma.client_addressesUpdateInput,
          });
        } else {
          // Create new address using the relation field
          await tx.client_addresses.create({
            data: {
              ...updateData.address,
              clients: {
                connect: { id: parsedId },
              },
            } as Prisma.client_addressesCreateInput,
          });
        }
      }
    });

    revalidatePath('/dashboard/clients');
    return {
      ok: true,
      id: parsedId,
      message: 'Klient został pomyślnie zaktualizowany',
    };
  } catch (err: unknown) {
    console.error('Update client error:', err);

    // Handle unique constraint violation (email)
    if (err instanceof Error && err.message.includes('Unique constraint failed')) {
      return {
        ok: false,
        error: 'Klient o podanym adresie email już istnieje',
      };
    }

    const message = err instanceof Error ? err.message : 'Błąd podczas aktualizacji klienta';
    return { ok: false, error: message };
  }
}
export async function deleteClient(id: number | string) {
  try {
    const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (Number.isNaN(parsedId)) throw new Error('Nieprawidłowe ID klienta');

    // Check if client exists
    const existingClient = await prisma.clients.findUnique({
      where: { id: parsedId },
    });

    if (!existingClient) {
      return {
        ok: false,
        error: 'Klient nie istnieje',
      };
    }

    // Delete client (cascade will delete address)
    await prisma.clients.delete({
      where: { id: parsedId },
    });

    revalidatePath('/dashboard/clients');
    return {
      ok: true,
      message: 'Klient został pomyślnie usunięty',
    };
  } catch (err: unknown) {
    console.error('Delete client error:', err);

    // Check if there are related records preventing deletion
    if (err instanceof Error && err.message.includes('Foreign key constraint')) {
      return {
        ok: false,
        error: 'Nie można usunąć klienta, ponieważ ma powiązane projekty',
      };
    }

    const message = err instanceof Error ? err.message : 'Błąd podczas usuwania klienta';
    return { ok: false, error: message };
  }
}
