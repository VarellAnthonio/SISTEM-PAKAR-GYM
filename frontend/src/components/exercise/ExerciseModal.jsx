// frontend/src/components/exercise/ExerciseModal.jsx - SIMPLIFIED VERSION
import { useState, useEffect } from 'react';
import { XMarkIcon, PlayIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import YouTubePlayer from './YouTubePlayer';

const ExerciseModal = ({ 
  isOpen, 
  onClose, 
  exercise, 
  onSave, 
  onDelete,
  loading = false,
  mode = 'view' // 'view', 'edit', 'create'
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    youtubeUrl: '',
    isActive: true
  });
  
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  // SIMPLIFIED CATEGORIES
  const categories = ['Angkat Beban', 'Kardio', 'Other'];

  // Initialize form data when exercise changes
  useEffect(() => {
    if (exercise && isOpen) {
      setFormData({
        name: exercise.name || '',
        category: exercise.category || '',
        description: exercise.description || '',
        youtubeUrl: exercise.youtubeUrl || '',
        isActive: exercise.isActive !== undefined ? exercise.isActive : true
      });
      setErrors({});
      setHasChanges(false);
      setActiveTab('info');
    }
  }, [exercise, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        category: '',
        description: '',
        youtubeUrl: '',
        isActive: true
      });
      setErrors({});
      setHasChanges(false);
      setActiveTab('info');
    }
  }, [isOpen]);

  // Track changes
  useEffect(() => {
    if (exercise && mode === 'edit') {
      const hasChanged = 
        formData.name !== (exercise.name || '') ||
        formData.category !== (exercise.category || '') ||
        formData.description !== (exercise.description || '') ||
        formData.youtubeUrl !== (exercise.youtubeUrl || '') ||
        formData.isActive !== (exercise.isActive !== undefined ? exercise.isActive : true);
      
      setHasChanges(hasChanged);
    } else if (mode === 'create') {
      const hasContent = formData.name.trim() || formData.category || formData.description.trim();
      setHasChanges(hasContent);
    }
  }, [formData, exercise, mode]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama gerakan harus diisi';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Nama gerakan minimal 2 karakter';
    }

    if (!formData.category) {
      newErrors.category = 'Kategori harus dipilih';
    }

    if (formData.youtubeUrl && !isValidYouTubeUrl(formData.youtubeUrl)) {
      newErrors.youtubeUrl = 'Format URL YouTube tidak valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  const extractVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Yakin ingin menghapus gerakan ini?')) {
      onDelete(exercise.id);
    }
  };

  const handleClose = () => {
    if (hasChanges && (mode === 'edit' || mode === 'create')) {
      if (window.confirm('Ada perubahan yang belum disimpan. Yakin ingin menutup?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Angkat Beban': 'bg-blue-100 text-blue-800',
      'Kardio': 'bg-red-100 text-red-800',
      'Other': 'bg-green-100 text-green-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  const videoId = extractVideoId(formData.youtubeUrl);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl my-4 mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {mode === 'create' ? 'Tambah Gerakan Baru' :
                 mode === 'edit' ? 'Edit Gerakan' : 'Detail Gerakan'}
              </h2>
              {exercise && (
                <p className="text-sm text-gray-600 mt-1">
                  {exercise.name} - {exercise.category}
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

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-4">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'info'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Informasi Gerakan
              </button>
              {formData.youtubeUrl && (
                <button
                  onClick={() => setActiveTab('video')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'video'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <PlayIcon className="h-4 w-4 inline mr-1" />
                  Video
                </button>
              )}
            </nav>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit}>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              
              {/* Info Tab */}
              {activeTab === 'info' && (
                <div className="space-y-6">
                  
                  {/* Nama Gerakan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Gerakan *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={mode === 'view'}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      } ${mode === 'view' ? 'bg-gray-50' : ''}`}
                      placeholder="Contoh: Push Up, Squat, Lari"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Kategori */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      disabled={mode === 'view'}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.category ? 'border-red-300' : 'border-gray-300'
                      } ${mode === 'view' ? 'bg-gray-50' : ''}`}
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                    )}
                  </div>

                  {/* YouTube URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link Video YouTube
                    </label>
                    <input
                      type="url"
                      name="youtubeUrl"
                      value={formData.youtubeUrl}
                      onChange={handleChange}
                      disabled={mode === 'view'}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.youtubeUrl ? 'border-red-300' : 'border-gray-300'
                      } ${mode === 'view' ? 'bg-gray-50' : ''}`}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    {errors.youtubeUrl && (
                      <p className="mt-1 text-sm text-red-600">{errors.youtubeUrl}</p>
                    )}
                    {formData.youtubeUrl && videoId && (
                      <p className="mt-1 text-sm text-green-600">✓ URL YouTube valid</p>
                    )}
                  </div>

                  {/* Deskripsi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      disabled={mode === 'view'}
                      rows={4}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                        mode === 'view' ? 'bg-gray-50' : ''
                      }`}
                      placeholder="Jelaskan cara melakukan gerakan ini..."
                    />
                  </div>

                  {/* Status */}
                  {mode !== 'view' && (
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Gerakan Aktif</span>
                      </label>
                    </div>
                  )}

                  {/* View Mode Summary */}
                  {mode === 'view' && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Ringkasan Gerakan</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Kategori:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${getCategoryColor(formData.category)}`}>
                            {formData.category}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            formData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {formData.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Video:</span>
                          <span className="ml-2 font-medium">
                            {formData.youtubeUrl ? '✓ Ada video' : '○ Tidak ada video'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Video Tab */}
              {activeTab === 'video' && formData.youtubeUrl && videoId && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-blue-900">Video Tutorial</h3>
                        <p className="text-sm text-blue-800 mt-1">
                          Tonton video untuk mempelajari cara melakukan gerakan ini dengan benar.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <YouTubePlayer
                    videoId={videoId}
                    title={formData.name}
                    className="w-full h-96"
                  />
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Informasi Video</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Gerakan:</strong> {formData.name}</p>
                      <p><strong>Video ID:</strong> {videoId}</p>
                      <p><strong>URL:</strong> <a href={formData.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{formData.youtubeUrl}</a></p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                {mode === 'edit' && hasChanges && (
                  <span className="text-orange-600 font-medium">● Ada perubahan yang belum disimpan</span>
                )}
                {mode === 'create' && hasChanges && (
                  <span className="text-blue-600 font-medium">● Siap untuk disimpan</span>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                {mode === 'view' && exercise && onDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                  >
                    Hapus Gerakan
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  {mode === 'view' ? 'Tutup' : 'Batal'}
                </button>
                
                {(mode === 'edit' || mode === 'create') && (
                  <button
                    type="submit"
                    disabled={loading || !hasChanges}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Menyimpan...</span>
                      </div>
                    ) : (
                      mode === 'create' ? 'Tambah Gerakan' : 'Simpan Perubahan'
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

export default ExerciseModal;