import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../components/common/AdminSidebarLayout';
import { 
  MagnifyingGlassIcon, 
  CheckCircleIcon,
  CogIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  InformationCircleIcon,
  BeakerIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';
import { programService } from '../../services/program';
import { ruleService } from '../../services/rule';

const AdminRules = () => {
  const [rules, setRules] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('complete'); // 'complete' or 'bmi-only'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [programsResult, rulesResult] = await Promise.all([
        programService.getAll(),
        ruleService.getAll()
      ]);

      if (programsResult.success) {
        setPrograms(programsResult.data || []);
      }

      if (rulesResult.success) {
        setRules(rulesResult.data || []);
      } else {
        // Enhanced mock data for demo
        const mockCompleteRules = [
          { id: 1, name: 'Kurus + Lemak Tubuh Rendah → Menambah Massa', bmiCategory: 'B1', bodyFatCategory: 'L1', programId: 1, programCode: 'P1', isActive: true },
          { id: 2, name: 'Kurus + Lemak Tubuh Normal → Massa Otot Ramping', bmiCategory: 'B1', bodyFatCategory: 'L2', programId: 5, programCode: 'P5', isActive: true },
          { id: 3, name: 'Kurus + Lemak Tubuh Tinggi → Otot Pemula', bmiCategory: 'B1', bodyFatCategory: 'L3', programId: 9, programCode: 'P9', isActive: true },
          { id: 4, name: 'Ideal + Lemak Tubuh Rendah → Kekuatan & Definisi', bmiCategory: 'B2', bodyFatCategory: 'L1', programId: 6, programCode: 'P6', isActive: true },
          { id: 5, name: 'Ideal + Lemak Tubuh Normal → Menambah Otot', bmiCategory: 'B2', bodyFatCategory: 'L2', programId: 2, programCode: 'P2', isActive: true },
          { id: 6, name: 'Ideal + Lemak Tubuh Tinggi → Membakar Lemak & Membentuk', bmiCategory: 'B2', bodyFatCategory: 'L3', programId: 7, programCode: 'P7', isActive: true },
          { id: 7, name: 'Gemuk + Lemak Tubuh Rendah → Kekuatan Lanjutan', bmiCategory: 'B3', bodyFatCategory: 'L1', programId: 10, programCode: 'P10', isActive: true },
          { id: 8, name: 'Gemuk + Lemak Tubuh Normal → Komposisi Tubuh', bmiCategory: 'B3', bodyFatCategory: 'L2', programId: 8, programCode: 'P8', isActive: true },
          { id: 9, name: 'Gemuk + Lemak Tubuh Tinggi → Menurunkan Berat Badan', bmiCategory: 'B3', bodyFatCategory: 'L3', programId: 3, programCode: 'P3', isActive: true },
          { id: 10, name: 'Obesitas + Lemak Tubuh Tinggi → Penurunan Berat Badan Ekstrem', bmiCategory: 'B4', bodyFatCategory: 'L3', programId: 4, programCode: 'P4', isActive: true },
        ];
        setRules(mockCompleteRules);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock BMI-Only Rules Data
  const bmiOnlyRules = [
    { 
      id: 'bmi1', 
      name: 'BMI Kurus → Program Menambah Massa', 
      bmiCategory: 'B1', 
      programCode: 'P1',
      description: 'Pemetaan sederhana berdasarkan BMI untuk pengguna kurus',
      range: '< 18.5'
    },
    { 
      id: 'bmi2', 
      name: 'BMI Ideal → Program Menambah Otot', 
      bmiCategory: 'B2', 
      programCode: 'P2',
      description: 'Pemetaan sederhana berdasarkan BMI untuk pengguna berat badan ideal',
      range: '18.5 - 24.9'
    },
    { 
      id: 'bmi3', 
      name: 'BMI Gemuk → Program Menurunkan Berat Badan', 
      bmiCategory: 'B3', 
      programCode: 'P3',
      description: 'Pemetaan sederhana berdasarkan BMI untuk pengguna gemuk',
      range: '25 - 29.9'
    },
    { 
      id: 'bmi4', 
      name: 'BMI Obesitas → Program Penurunan Berat Badan Ekstrem', 
      bmiCategory: 'B4', 
      programCode: 'P4',
      description: 'Pemetaan sederhana berdasarkan BMI untuk pengguna obesitas',
      range: '≥ 30'
    }
  ];

  const filteredCompleteRules = rules.filter(rule =>
    rule.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getConditionDisplay(rule).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBMIRules = bmiOnlyRules.filter(rule =>
    rule.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getBMICategoryDisplay(rule.bmiCategory).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBMICategoryDisplay = (category) => {
    const mapping = {
      'B1': 'Underweight',
      'B2': 'Ideal',
      'B3': 'Overweight',
      'B4': 'Obese'
    };
    return mapping[category] || category;
  };

  const getBodyFatCategoryDisplay = (category) => {
    const mapping = {
      'L1': 'Rendah',
      'L2': 'Normal',
      'L3': 'Tinggi'
    };
    return mapping[category] || category;
  };

  const getConditionDisplay = (rule) => {
    const bmi = getBMICategoryDisplay(rule.bmiCategory);
    const bodyFat = getBodyFatCategoryDisplay(rule.bodyFatCategory);
    return `${bmi} + ${bodyFat}`;
  };

  const getProgramDisplay = (rule) => {
    if (rule.program) {
      return `${rule.program.code} - ${rule.program.name}`;
    }
    
    const program = programs.find(p => p.id === rule.programId);
    return program ? `${program.code} - ${program.name}` : 'Program tidak ditemukan';
  };

  const getProgramCode = (rule) => {
    if (rule.programCode) return rule.programCode;
    if (rule.program) return rule.program.code;
    
    const program = programs.find(p => p.id === rule.programId);
    return program?.code || 'N/A';
  };

  if (loading) {
    return (
      <AdminSidebarLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminSidebarLayout>
    );
  }

  return (
    <AdminSidebarLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Aturan Forward Chaining</h1>
          <p className="text-gray-600">
            Lihat aturan logika medis untuk konsultasi lengkap dan analisis BMI saja
          </p>
        </div>

        {/* Reference Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* BMI Categories Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ScaleIcon className="h-5 w-5 text-blue-600 mr-2" />
              Kategori BMI (Body Mass Index)
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Kode</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Kategori</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Rentang BMI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-blue-50">
                    <td className="py-2 px-3">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded font-medium">B1</span>
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-900">Underweight</td>
                    <td className="py-2 px-3 text-sm text-gray-600">&lt; 18.5</td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="py-2 px-3">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded font-medium">B2</span>
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-900">Ideal</td>
                    <td className="py-2 px-3 text-sm text-gray-600">18.5 - 24.9</td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="py-2 px-3">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded font-medium">B3</span>
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-900">Overweight</td>
                    <td className="py-2 px-3 text-sm text-gray-600">25.0 - 29.9</td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="py-2 px-3">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded font-medium">B4</span>
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-900">Obese</td>
                    <td className="py-2 px-3 text-sm text-gray-600">≥ 30.0</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              BMI = Berat Badan (kg) ÷ Tinggi Badan² (m)
            </p>
          </div>

          {/* Body Fat Categories Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BeakerIcon className="h-5 w-5 text-green-600 mr-2" />
              Kategori Persentase Lemak Tubuh
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Kode</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Kategori</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Pria (%)</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Wanita (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-green-50">
                    <td className="py-2 px-3">
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded font-medium">L1</span>
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-900">Rendah</td>
                    <td className="py-2 px-3 text-sm text-gray-600">6 - 13</td>
                    <td className="py-2 px-3 text-sm text-gray-600">16 - 20</td>
                  </tr>
                  <tr className="hover:bg-green-50">
                    <td className="py-2 px-3">
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded font-medium">L2</span>
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-900">Normal</td>
                    <td className="py-2 px-3 text-sm text-gray-600">14 - 17</td>
                    <td className="py-2 px-3 text-sm text-gray-600">21 - 24</td>
                  </tr>
                  <tr className="hover:bg-green-50">
                    <td className="py-2 px-3">
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded font-medium">L3</span>
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-900">Tinggi</td>
                    <td className="py-2 px-3 text-sm text-gray-600">18 - 24</td>
                    <td className="py-2 px-3 text-sm text-gray-600">25 - 31</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Kategori berdasarkan standar medis untuk dewasa sehat
            </p>
          </div>
        </div>

        {/* Stats Cards - UPDATED */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <BeakerIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Aturan Lengkap</p>
                <p className="text-2xl font-bold text-gray-900">{rules.length}</p>
                <p className="text-xs text-green-600">BMI + Lemak Tubuh</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <ScaleIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Aturan BMI Saja</p>
                <p className="text-2xl font-bold text-gray-900">{bmiOnlyRules.length}</p>
                <p className="text-xs text-blue-600">Pemetaan BMI sederhana</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3 mr-4">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cakupan</p>
                <p className="text-2xl font-bold text-gray-900">100%</p>
                <p className="text-xs text-purple-600">semua skenario tercakup</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rule Type Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('complete')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'complete'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <BeakerIcon className="h-4 w-4 inline mr-1" />
                Aturan Lengkap ({rules.length})
              </button>
              <button
                onClick={() => setActiveTab('bmi-only')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bmi-only'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <ScaleIcon className="h-4 w-4 inline mr-1" />
                Aturan BMI Saja ({bmiOnlyRules.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder={`Cari aturan ${activeTab === 'complete' ? 'lengkap' : 'BMI saja'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Complete Rules Grid */}
        {activeTab === 'complete' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredCompleteRules.map((rule) => (
              <div 
                key={rule.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                {/* Rule Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-700">Analisis Lengkap</span>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    Aturan #{rule.id}
                  </span>
                </div>

                {/* Condition */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">JIKA Kondisi:</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {rule.bmiCategory}
                    </span>
                    <span className="text-xs text-gray-500">+</span>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      {rule.bodyFatCategory}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {getConditionDisplay(rule)}
                  </p>
                </div>

                {/* Arrow */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center text-gray-400">
                    <div className="w-8 h-px bg-gray-300 mr-2"></div>
                    <span className="text-xs">MAKA</span>
                    <div className="w-8 h-px bg-gray-300 ml-2"></div>
                  </div>
                </div>

                {/* Program Assignment */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Penugasan Program:</h3>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="bg-purple-600 text-white px-2 py-1 rounded text-sm font-bold">
                        {getProgramCode(rule)}
                      </span>
                    </div>
                    <p className="text-sm text-purple-800 font-medium">
                      {getProgramDisplay(rule)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BMI-Only Rules Grid */}
        {activeTab === 'bmi-only' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {filteredBMIRules.map((rule) => (
              <div 
                key={rule.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                {/* Rule Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <ScaleIcon className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700">Analisis BMI Saja</span>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    Aturan Sederhana
                  </span>
                </div>

                {/* BMI Condition */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">JIKA Kategori BMI:</h3>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-3 py-2 text-sm bg-blue-100 text-blue-800 rounded font-medium">
                      {rule.bmiCategory} - {getBMICategoryDisplay(rule.bmiCategory)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Rentang BMI: {rule.range}
                  </p>
                </div>

                {/* Arrow */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center text-gray-400">
                    <div className="w-12 h-px bg-gray-300 mr-2"></div>
                    <span className="text-xs">MAKA</span>
                    <div className="w-12 h-px bg-gray-300 ml-2"></div>
                  </div>
                </div>

                {/* Program Assignment */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Penugasan Program:</h3>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold">
                        {rule.programCode}
                      </span>
                    </div>
                    <p className="text-sm text-blue-800 font-medium">
                      {rule.name.split('→')[1]?.trim() || rule.programCode}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {rule.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'complete' && filteredCompleteRules.length === 0) || 
          (activeTab === 'bmi-only' && filteredBMIRules.length === 0)) && (
          <div className="text-center py-12">
            <CogIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada aturan ditemukan</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Coba sesuaikan kata kunci pencarian' : 'Tidak ada aturan tersedia'}
            </p>
          </div>
        )}

        {/* System Information */}
        <div className="space-y-6">
          {/* Consultation Type Comparison */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Perbandingan Jenis Konsultasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* BMI-Only */}
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center mb-3">
                  <ScaleIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-blue-900">Konsultasi BMI Saja</h4>
                </div>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Input: Berat + Tinggi saja</li>
                  <li>• Aturan: 4 pemetaan sederhana</li>
                  <li>• Kecepatan: Sangat cepat</li>
                  <li>• Akurasi: Rekomendasi dasar</li>
                  <li>• Terbaik untuk: Penilaian cepat</li>
                </ul>
              </div>

              {/* Complete */}
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center mb-3">
                  <BeakerIcon className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="font-medium text-green-900">Konsultasi Lengkap</h4>
                </div>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Input: Berat + Tinggi + Lemak Tubuh</li>
                  <li>• Aturan: 10 kombinasi detail</li>
                  <li>• Kecepatan: Cepat</li>
                  <li>• Akurasi: Presisi tinggi</li>
                  <li>• Terbaik untuk: Hasil optimal</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
};

export default AdminRules;