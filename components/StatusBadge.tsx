
import React from 'react';
import { ReportStatus } from '../types';

interface StatusBadgeProps {
  status: ReportStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    [ReportStatus.DRAFT]: 'bg-slate-100 text-slate-600 border-slate-200',
    [ReportStatus.SUBMITTED]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    [ReportStatus.VERIFIED]: 'bg-green-50 text-green-700 border-green-200',
    [ReportStatus.REVISION]: 'bg-orange-50 text-orange-700 border-orange-200',
    [ReportStatus.REJECTED]: 'bg-red-50 text-red-700 border-red-200',
  };

  const labels = {
    [ReportStatus.DRAFT]: 'Draft',
    [ReportStatus.SUBMITTED]: 'Menunggu Verifikasi',
    [ReportStatus.VERIFIED]: 'Diterima',
    [ReportStatus.REVISION]: 'Revisi',
    [ReportStatus.REJECTED]: 'Ditolak',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};