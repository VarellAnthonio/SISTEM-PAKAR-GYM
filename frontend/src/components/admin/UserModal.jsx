// frontend/src/components/admin/UserModal.jsx - SIMPLIFIED VERSION (View & Delete Only)
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const UserModal = ({ 
  isOpen, 
  onClose, 
  user, 
  onDelete,
  loading = false,
  mode = 'view' // ONLY 'view' mode supported now
}) => {
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Reset when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setDeleteLoading(false);
    }
  }, [isOpen]);

  const handleDelete = async () => {
    if (!window.confirm('Yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      setDeleteLoading(true);
      await onDelete(user.id);
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getGenderIcon = (gender) => {
    return gender === 'male' ? '👨' : '👩';
  };

  const getGenderDisplay = (gender) => {
    return gender === 'male' ? 'Laki-laki' : 'Perempuan';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-4 mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Detail Pengguna
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {user.name} - {user.email}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content - VIEW ONLY */}
          <div className="p-4 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            
            {/* User Avatar & Basic Info */}
            <div className="flex items-center space-x-4">
              <div className="bg-gray-200 rounded-full p-4">
                <span className="text-2xl">{getGenderIcon(user.gender)}</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role === 'admin' ? 'Administrator' : 'User'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Kelamin
                </label>
                <p className="text-sm text-gray-900">
                  {getGenderDisplay(user.gender)} {getGenderIcon(user.gender)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Akun
                </label>
                <p className={`text-sm font-medium ${
                  user.isActive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {user.isActive ? '✓ Aktif' : '✗ Nonaktif'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Bergabung
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate(user.createdAt)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terakhir Diperbarui
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate(user.updatedAt)}
                </p>
              </div>
            </div>

            {/* Consultation Summary */}
            {user.consultations && user.consultations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Riwayat Konsultasi Terbaru
                </h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="space-y-2">
                    {user.consultations.slice(0, 3).map((consultation) => (
                      <div key={consultation.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          BMI: {consultation.bmi}, Body Fat: {consultation.bodyFatPercentage}%
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(consultation.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Total: {user.consultations.length} konsultasi
                  </p>
                </div>
              </div>
            )}

            {/* Safety Warning for Admin Accounts */}
            {user.role === 'admin' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-900 mb-1">⚠️ Akun Administrator</h4>
                <p className="text-sm text-yellow-800">
                  Akun administrator tidak dapat diedit atau dihapus untuk menjaga keamanan sistem.
                </p>
              </div>
            )}

            {/* User Actions Info */}
            {user.role !== 'admin' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Aksi yang Tersedia</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>• Nonaktifkan/aktifkan akun pengguna</p>
                  <p>• Hapus pengguna (hanya jika tidak memiliki konsultasi)</p>
                  <p>• Lihat detail informasi pengguna</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 border-t border-gray-200 bg-gray-50 space-y-2 sm:space-y-0 rounded-b-lg">
            <div className="text-sm text-gray-600 order-2 sm:order-1">
              {user.role === 'admin' ? (
                <span className="text-purple-600">🛡️ Akun terlindungi</span>
              ) : (
                <span>Aksi tersedia di tabel utama</span>
              )}
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3 order-1 sm:order-2">
              {/* Delete Button - Only for non-admin users */}
              {user.role !== 'admin' && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleteLoading ? (
                    <div className="flex items-center space-x-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-700"></div>
                      <span>Menghapus...</span>
                    </div>
                  ) : (
                    'Hapus User'
                  )}
                </button>
              )}
              
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;