import { useState, useEffect } from 'react';
import SidebarLayout from '../components/common/SidebarLayout';

const History = () => {
  const [consultations, setConsultations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for now - later this will come from API
  useEffect(() => {
    const mockData = [
      {
        id: 1,
        date: '2024-01-15',
        program: 'P2',
        bmi: 'Ideal',
        bodyFat: 'Normal'
      },
      {
        id: 2,
        date: '2024-01-10',
        program: 'P1',
        bmi: 'Underweight',
        bodyFat: 'Rendah'
      },
      {
        id: 3,
        date: '2024-01-05',
        program: 'P3',
        bmi: 'Overweight',
        bodyFat: 'Tinggi'
      },
      {
        id: 4,
        date: '2024-01-01',
        program: 'P5',
        bmi: 'Underweight',
        bodyFat: 'Normal'
      },
      {
        id: 5,
        date: '2023-12-25',
        program: 'P8',
        bmi: 'Overweight',
        bodyFat: 'Normal'
      }
    ];
    setConsultations(mockData);
  }, []);

  const filteredConsultations = consultations.filter(consultation =>
    consultation.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultation.bmi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultation.bodyFat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDetail = (consultation) => {
    // For now just log, later will navigate to detail page
    console.log('View detail for:', consultation);
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus riwayat konsultasi ini?')) {
      setConsultations(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            Riwayat Konsultasi
          </h1>
          
          {/* Search */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 hidden sm:inline">Cari:</span>
            <input
              type="text"
              placeholder="Cari program, BMI, atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-80"
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BMI Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Body Fat Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredConsultations.map((consultation, index) => (
                <tr key={consultation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(consultation.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {consultation.program}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {consultation.bmi}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {consultation.bodyFat}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleDetail(consultation)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => handleDelete(consultation.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {filteredConsultations.map((consultation, index) => (
            <div key={consultation.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {consultation.program}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{formatDate(consultation.date)}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDetail(consultation)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => handleDelete(consultation.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Hapus
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">BMI:</span>
                  <span className="ml-1 font-medium text-gray-900">{consultation.bmi}</span>
                </div>
                <div>
                  <span className="text-gray-600">Body Fat:</span>
                  <span className="ml-1 font-medium text-gray-900">{consultation.bodyFat}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredConsultations.length === 0 && (
          <div className="bg-white rounded-lg shadow text-center py-8">
            <p className="text-gray-500">
              {searchTerm ? 'Tidak ada hasil yang ditemukan.' : 'Belum ada riwayat konsultasi.'}
            </p>
          </div>
        )}

        {/* Summary Card */}
        {consultations.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Ringkasan</h3>
            <p className="text-sm text-blue-800">
              Total konsultasi: <span className="font-medium">{consultations.length}</span>
            </p>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default History;