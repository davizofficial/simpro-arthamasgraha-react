import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SurveyActionModal } from '../../src/components/surveys/SurveyActionModal';

describe('SurveyActionModal', () => {
  const mockSurvey = {
    id: 1,
    project_name: 'Proyek Bendungan',
    user_name: 'Budi Lapangan',
    area_size: 2500,
    elevation: '+15.0 m',
    status: 'pending',
    reviewer_notes: null,
  };

  it('tidak me-render apapun ketika isOpen bernilai false', () => {
    const { container } = render(
      <SurveyActionModal isOpen={false} onClose={() => {}} survey={mockSurvey} actionType="review" onSubmit={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('menampilkan judul dan formulir revisi dengan tepat saat actionType review', () => {
    render(
      <SurveyActionModal isOpen={true} onClose={() => {}} survey={mockSurvey} actionType="review" onSubmit={vi.fn()} />
    );

    expect(screen.getByText('Instruksi Revisi Data Survei')).toBeInTheDocument();
    expect(screen.getByLabelText(/Catatan Resmi Instruksi Revisi/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kirim Catatan Revisi/i })).toBeInTheDocument();
    expect(screen.getByText(/Pilih Template Catatan Cepat/i)).toBeInTheDocument();
  });

  it('memungkinkan pengetikan catatan revisi dengan lancar tanpa kehilangan teks', () => {
    render(
      <SurveyActionModal isOpen={true} onClose={() => {}} survey={mockSurvey} actionType="review" onSubmit={vi.fn()} />
    );

    const textarea = screen.getByLabelText(/Catatan Resmi Instruksi Revisi/i);
    fireEvent.change(textarea, { target: { value: 'Perbaiki elevasi' } });
    expect(textarea.value).toBe('Perbaiki elevasi');

    fireEvent.change(textarea, { target: { value: 'Perbaiki elevasi dan kontur tanah' } });
    expect(textarea.value).toBe('Perbaiki elevasi dan kontur tanah');
    expect(screen.getByText('33 karakter')).toBeInTheDocument();
  });

  it('menyisipkan template cepat tanpa tanda titik ganda', () => {
    render(
      <SurveyActionModal isOpen={true} onClose={() => {}} survey={mockSurvey} actionType="review" onSubmit={vi.fn()} />
    );

    const textarea = screen.getByLabelText(/Catatan Resmi Instruksi Revisi/i);
    fireEvent.change(textarea, { target: { value: 'Data elevasi salah.' } });

    const chipBtn = screen.getByText('+ Perlu uji sondir tambahan pada zona timur');
    fireEvent.click(chipBtn);

    expect(textarea.value).toBe('Data elevasi salah. Perlu uji sondir tambahan pada zona timur');
  });

  it('memanggil onSubmit dengan catatan saat form disubmit', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(true);
    render(
      <SurveyActionModal
        isOpen={true}
        onClose={() => {}}
        survey={mockSurvey}
        actionType="review"
        onSubmit={handleSubmit}
      />
    );

    const textarea = screen.getByLabelText(/Catatan Resmi Instruksi Revisi/i);
    fireEvent.change(textarea, { target: { value: 'Lengkapi dokumen sondir' } });

    const submitBtn = screen.getByRole('button', { name: /Kirim Catatan Revisi/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith('Lengkapi dokumen sondir');
    });
  });

  it('memasang catatan ACC default saat actionType approved', () => {
    render(
      <SurveyActionModal
        isOpen={true}
        onClose={() => {}}
        survey={mockSurvey}
        actionType="approved"
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText('Persetujuan ACC Survei Lokasi')).toBeInTheDocument();
    const textarea = screen.getByLabelText(/Catatan Resmi Evaluasi Direksi/i);
    expect(textarea.value).toContain('Hasil survei lokasi disetujui');
    expect(screen.getByRole('button', { name: /Konfirmasi ACC Survei/i })).toBeInTheDocument();
  });
});
