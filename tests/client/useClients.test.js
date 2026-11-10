import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useClients } from '../../src/hooks/useClients';
import { clientService } from '../../src/services/api';

vi.mock('../../src/services/api', () => ({
  clientService: {
    getAll: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('useClients hook', () => {
  const mockClients = [
    { id: 1, name: 'PT Wika', category: 'BUMN', contact_person: 'Pak Budi', phone: '0812' },
    { id: 2, name: 'Dinas PU', category: 'Pemerintah', contact_person: 'Bu Siti', phone: '0813' },
    { id: 3, name: 'PT Ciputra', category: 'Swasta', contact_person: 'Pak Hendra', phone: '0814' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('memuat data klien dan menghitung metrik kategori dengan tepat', async () => {
    clientService.getAll.mockResolvedValueOnce({
      success: true,
      data: mockClients,
    });

    const { result } = renderHook(() => useClients());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.clients).toHaveLength(3);
    expect(result.current.metrics.total).toBe(3);
    expect(result.current.metrics.totalSwasta).toBe(1);
    expect(result.current.metrics.totalPemerintah).toBe(1);
    expect(result.current.metrics.totalBUMN).toBe(1);
  });

  it('membuat klien baru dan memicu reload list', async () => {
    clientService.getAll.mockResolvedValueOnce({ success: true, data: mockClients }).mockResolvedValueOnce({
      success: true,
      data: [...mockClients, { id: 4, name: 'PT Jaya', category: 'Swasta' }],
    });

    clientService.create.mockResolvedValueOnce({
      success: true,
      data: { id: 4, name: 'PT Jaya' },
    });

    const { result } = renderHook(() => useClients());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      const res = await result.current.createClient({
        name: ' PT Jaya ',
        company: '',
        category: 'Swasta',
        contact_person: 'Pak Jaya',
        phone: '0815',
        email: 'jaya@test.com',
        address: 'Jl Solo',
      });
      expect(res.success).toBe(true);
    });

    expect(clientService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'PT Jaya',
        company: 'PT Jaya',
      })
    );
    expect(result.current.feedback?.type).toBe('success');
  });

  it('menghapus klien dan mengupdate feedback', async () => {
    clientService.getAll
      .mockResolvedValueOnce({ success: true, data: mockClients })
      .mockResolvedValueOnce({ success: true, data: [mockClients[0], mockClients[1]] });

    clientService.delete.mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useClients());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      const res = await result.current.deleteClient(3, 'PT Ciputra');
      expect(res.success).toBe(true);
    });

    expect(clientService.delete).toHaveBeenCalledWith(3);
    expect(result.current.feedback?.type).toBe('success');
    expect(result.current.feedback?.message).toContain('PT Ciputra');
  });
});
