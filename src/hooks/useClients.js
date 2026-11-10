import { useState, useEffect, useCallback, useMemo } from 'react';
import { clientService } from '../services/api';

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('semua');
  const [feedback, setFeedback] = useState(null);

  const loadClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await clientService.getAll({ search, category });
      if (res.success) {
        setClients(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadClients();
    }, 200);
    return () => clearTimeout(delayDebounce);
  }, [loadClients]);

  const createClient = useCallback(
    async (formData) => {
      try {
        const payload = {
          ...formData,
          name: formData.name.trim(),
          company: formData.company.trim() || formData.name.trim(),
          contact_person: formData.contact_person.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
        };

        const res = await clientService.create(payload);
        if (res.success) {
          setFeedback({
            type: 'success',
            message: `Klien "${payload.name}" berhasil ditambahkan dan tersimpan ke basis data!`,
          });
          await loadClients();
          return { success: true, data: res.data };
        }
        return { success: false, error: res.error || 'Gagal menyimpan klien' };
      } catch (err) {
        setFeedback({ type: 'error', message: err.message });
        return { success: false, error: err.message };
      }
    },
    [loadClients]
  );

  const deleteClient = useCallback(
    async (id, name) => {
      try {
        const res = await clientService.delete(id);
        if (res.success) {
          setFeedback({
            type: 'success',
            message: `Data klien "${name}" berhasil dihapus dari database.`,
          });
          await loadClients();
          return { success: true };
        }
        return { success: false, error: res.error || 'Gagal menghapus klien' };
      } catch (err) {
        setFeedback({ type: 'error', message: err.message });
        return { success: false, error: err.message };
      }
    },
    [loadClients]
  );

  const metrics = useMemo(() => {
    const totalSwasta = clients.filter((c) => c.category === 'Swasta').length;
    const totalPemerintah = clients.filter((c) => c.category === 'Pemerintah').length;
    const totalBUMN = clients.filter((c) => c.category === 'BUMN').length;
    return {
      total: clients.length,
      totalSwasta,
      totalPemerintah,
      totalBUMN,
    };
  }, [clients]);

  return {
    clients,
    loading,
    error,
    search,
    setSearch,
    category,
    setCategory,
    feedback,
    setFeedback,
    reload: loadClients,
    createClient,
    deleteClient,
    metrics,
  };
};

export default useClients;
