// frontend/src/components/admin/UserModal.jsx
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const UserModal = ({ 
  isOpen, 
  onClose, 
  user, 
  onSave, 
  onDelete,
  loading = false,
  mode = 'view' // 'view', 'edit', 'resetPassword'
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: 'male',
    role: 'user',
    isActive: true
  });
  
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data when user changes
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        gender: user.gender || 'male',
        role: user.role || 'user',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setErrors({});
      setHasChanges(false);
    }
  }, [user, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        email: '',
        gender: 'male',
        role: 'user',
        isActive: true
      });
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setErrors({});
      setHasChanges(false);
    }
  }, [isOpen]);

  // Track changes
  useEffect(() => {
    if (user && mode === 'edit') {
      const hasChanged = 
        formData.name !== (user.name || '') ||
        formData.email !== (user.email || '') ||
        formData.gender !== (user.gender || 'male') ||
        formData.role !== (user.role || 'user') ||
        formData.isActive !== (user.isActive !== undefined ? user.isActive : true);
      
      setHasChanges(hasChanged);
    } else if (mode === 'resetPassword') {
      setHasChanges(passwordData.newPassword.length > 0);
    }
  }, [formData, passwordData, user, mode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (mode === 'edit') {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      } else if (formData.name.length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please provide a valid email';
      }
    } else if (mode === 'resetPassword') {
      if (!passwordData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (passwordData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (mode === 'edit') {
        await onSave(formData);
      } else if (mode === 'resetPassword') {
        await onSave({ newPassword: passwordData.newPassword });
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.')) {
      onDelete(user.id);
    }
  };

  const handleClose = () => {
    if (hasChanges && (mode === 'edit' || mode === 'resetPassword')) {
      if (window.confirm('Ada perubahan yang belum disimpan. Yakin ingin menutup?')) {
        onClose();
      }
    } else {
      onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-4 mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                {mode === 'view' ? 'Detail Pengguna' :
                 mode === 'edit' ? 'Edit Pengguna' : 'Reset Password'}
              </h2>
              {user && (
                <p className="text-sm text-gray-600 mt-1">
                  {user.name} - {user.email}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit}>
            <div className="p-4 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* View Mode */}
              {mode === 'view' && user && (
                <div className="space-y-6">
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
                </div>
              )}

              {/* Edit Mode */}
              {mode === 'edit' && (
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Masukkan nama lengkap"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Masukkan email"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Gender & Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jenis Kelamin
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="male">👨 Laki-laki</option>
                        <option value="female">👩 Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="user">👤 User</option>
                        <option value="admin">👑 Administrator</option>
                      </select>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Akun Aktif</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Nonaktif = user tidak dapat login ke sistem
                    </p>
                  </div>
                </div>
              )}

              {/* Reset Password Mode */}
              {mode === 'resetPassword' && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Peringatan:</strong> Password akan direset untuk user: <strong>{user?.name}</strong>
                    </p>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Baru *
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.newPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Masukkan password baru"
                    />
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Konfirmasi Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Konfirmasi password baru"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 border-t border-gray-200 bg-gray-50 space-y-2 sm:space-y-0 rounded-b-lg">
              <div className="text-sm text-gray-600 order-2 sm:order-1">
                {mode === 'edit' && hasChanges && (
                  <span className="text-orange-600 font-medium">● Ada perubahan yang belum disimpan</span>
                )}
                {mode === 'resetPassword' && hasChanges && (
                  <span className="text-red-600 font-medium">● Password akan direset</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-3 order-1 sm:order-2">
                {mode === 'view' && user && onDelete && user.role !== 'admin' && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                  >
                    Hapus User
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  {mode === 'view' ? 'Tutup' : 'Batal'}
                </button>
                
                {(mode === 'edit' || mode === 'resetPassword') && (
                  <button
                    type="submit"
                    disabled={loading || !hasChanges}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[100px]"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        <span>Simpan...</span>
                      </div>
                    ) : (
                      mode === 'resetPassword' ? 'Reset Password' : 'Simpan Perubahan'
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserModal;