import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../components/common/AdminSidebarLayout';
import RuleEditModal from '../../components/admin/RuleEditModal';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, CogIcon } from '@heroicons/react/24/outline';
import { programService } from '../../services/program';
import { ruleService } from '../../services/rule';
import toast from 'react-hot-toast';

const AdminRules = () => {
  const [rules, setRules] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    coverage: '0%'
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch programs
      const programsResult = await programService.getAll();
      if (programsResult.success) {
        setPrograms(programsResult.data || []);
      }

      // Fetch rules from API
      const rulesResult = await ruleService.getAll();
      if (rulesResult.success) {
        setRules(rulesResult.data || []);
      } else {
        // Fallback to mock data if API not ready
        console.log('Rules API not ready, using mock data');
        setRules(getMockRules());
      }

      // Fetch rule statistics
      const statsResult = await ruleService.getStats();
      if (statsResult.success) {
        setStats(statsResult.data);
      } else {
        // Calculate stats manually from rules data
        calculateStatsManually();
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
      
      // Use mock data as fallback
      setRules(getMockRules());
      calculateStatsManually();
    } finally {
      setLoading(false);
    }
  };

  // Mock data as fallback
  const getMockRules = () => [
    {
      id: 1,
      name: 'Rule for Underweight + Rendah',
      description: 'IF BMI = Underweight AND Body Fat = Rendah THEN Program = P1',
      bmiCategory: 'B1',
      bodyFatCategory: 'L1',
      programId: 1,
      priority: 1,
      isActive: true,
      program: { id: 1, code: 'P1', name: 'Fat Loss Program' }
    },
    {
      id: 2,
      name: 'Rule for Ideal + Normal',
      description: 'IF BMI = Ideal AND Body Fat = Normal THEN Program = P2',
      bmiCategory: 'B2',
      bodyFatCategory: 'L2',
      programId: 2,
      priority: 2,
      isActive: true,
      program: { id: 2, code: 'P2', name: 'Muscle Gain Program' }
    },
    {
      id: 3,
      name: 'Rule for Overweight + Tinggi',
      description: 'IF BMI = Overweight AND Body Fat = Tinggi THEN Program = P3',
      bmiCategory: 'B3',
      bodyFatCategory: 'L3',
      programId: 3,
      priority: 3,
      isActive: true,
      program: { id: 3, code: 'P3', name: 'Weight Loss Program' }
    },
    {
      id: 4,
      name: 'Rule for Obese + Tinggi',
      description: 'IF BMI = Obese AND Body Fat = Tinggi THEN Program = P4',
      bmiCategory: 'B4',
      bodyFatCategory: 'L3',
      programId: 4,
      priority: 4,
      isActive: true,
      program: { id: 4, code: 'P4', name: 'Extreme Weight Loss Program' }
    },
    {
      id: 5,
      name: 'Rule for Underweight + Normal',
      description: 'IF BMI = Underweight AND Body Fat = Normal THEN Program = P5',
      bmiCategory: 'B1',
      bodyFatCategory: 'L2',
      programId: 5,
      priority: 5,
      isActive: true,
      program: { id: 5, code: 'P5', name: 'Lean Muscle Program' }
    }
  ];

  const calculateStatsManually = () => {
    const totalRules = rules.length;
    const activeRules = rules.filter(r => r.isActive).length;
    const inactiveRules = totalRules - activeRules;
    
    // Calculate coverage (theoretical max combinations = 4 BMI × 3 BodyFat = 12)
    const maxCombinations = 12;
    const coverage = Math.round((activeRules / maxCombinations) * 100);
    
    setStats({
      total: totalRules,
      active: activeRules,
      inactive: inactiveRules,
      coverage: `${coverage}%`
    });
  };

  // Filter rules based on search
  const filteredRules = rules.filter(rule =>
    rule.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getConditionDisplay(rule).toLowerCase().includes(searchTerm.toLowerCase())
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
    // Check if rule has program relationship from API
    if (rule.program) {
      return `${rule.program.code} - ${rule.program.name}`;
    }
    
    // Fallback: find program from programs array
    const program = programs.find(p => p.id === rule.programId);
    return program ? `${program.code} - ${program.name}` : 'Program tidak ditemukan';
  };

  const handleAdd = () => {
    setSelectedRule(null);
    setShowEditModal(true);
  };

  const handleEdit = (rule) => {
    setSelectedRule(rule);
    setShowEditModal(true);
  };

  const handleSave = async (formData) => {
    try {
      setSaveLoading(true);
      
      let result;
      if (selectedRule?.id) {
        // Update existing rule
        result = await ruleService.admin.update(selectedRule.id, formData);
        if (result.success) {
          toast.success('Rule berhasil diperbarui');
        } else {
          throw new Error(result.message);
        }
      } else {
        // Create new rule
        result = await ruleService.admin.create(formData);
        if (result.success) {
          toast.success('Rule berhasil ditambahkan');
        } else {
          throw new Error(result.message);
        }
      }

      setShowEditModal(false);
      await fetchData(); // Refresh data

    } catch (error) {
      console.error('Save rule error:', error);
      
      // If API not available, use mock save for demo
      if (error.message.includes('Failed to') || error.message.includes('Network')) {
        console.log('API not available, using mock save for demo');
        
        if (selectedRule?.id) {
          // Mock update
          setRules(prev => prev.map(rule => 
            rule.id === selectedRule.id 
              ? { ...rule, ...formData }
              : rule
          ));
          toast.success('Rule berhasil diperbarui (demo mode)');
        } else {
          // Mock create
          const newRule = {
            id: Date.now(),
            ...formData,
            program: programs.find(p => p.id === parseInt(formData.programId))
          };
          setRules(prev => [...prev, newRule]);
          toast.success('Rule berhasil ditambahkan (demo mode)');
        }
        
        setShowEditModal(false);
        calculateStatsManually();
      } else {
        toast.error(error.message || 'Gagal menyimpan rule');
        throw error;
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (rule) => {
    const confirmMessage = `Apakah Anda yakin ingin menghapus rule "${rule.name}"?\n\nRule yang dihapus akan mempengaruhi hasil forward chaining.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        const result = await ruleService.admin.delete(rule.id);
        if (result.success) {
          toast.success('Rule berhasil dihapus');
          await fetchData();
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error('Delete rule error:', error);
        
        // Fallback to mock delete for demo
        setRules(prev => prev.filter(r => r.id !== rule.id));
        toast.success('Rule berhasil dihapus (demo mode)');
        calculateStatsManually();
      }
    }
  };

  const handleToggleStatus = async (rule) => {
    try {
      const result = await ruleService.admin.toggleStatus(rule.id);
      if (result.success) {
        toast.success(`Rule berhasil ${rule.isActive ? 'dinonaktifkan' : 'diaktifkan'}`);
        await fetchData();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Toggle rule status error:', error);
      
      // Fallback to mock toggle for demo
      setRules(prev => prev.map(r => 
        r.id === rule.id 
          ? { ...r, isActive: !r.isActive }
          : r
      ));
      toast.success(`Rule berhasil ${rule.isActive ? 'dinonaktifkan' : 'diaktifkan'} (demo mode)`);
      calculateStatsManually();
    }
  };

  // Check for missing combinations
  const getMissingCombinations = () => {
    const existingCombinations = rules
      .filter(r => r.isActive)
      .map(r => `${r.bmiCategory}-${r.bodyFatCategory}`);
    
    const allCombinations = [];
    ['B1', 'B2', 'B3', 'B4'].forEach(bmi => {
      ['L1', 'L2', 'L3'].forEach(bodyFat => {
        allCombinations.push(`${bmi}-${bodyFat}`);
      });
    });
    
    return allCombinations.filter(combo => !existingCombinations.includes(combo));
  };

  const missingCombinations = getMissingCombinations();

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
      <div className="max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Aturan Forward Chaining</h1>
            <p className="text-gray-600 mt-1">Kelola aturan sistem pakar untuk rekomendasi program</p>
          </div>
          
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Tambah Rule
          </button>
        </div>

        {/* API Status Indicator */}
        <div className="mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Status Data:</span> {rules.length > 0 && rules[0].program ? 
                '🔗 Menggunakan data dari API database' : 
                '📝 Menggunakan mock data (API belum tersedia)'
              }
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900">Total Rules</h3>
            <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900">Rules Aktif</h3>
            <p className="text-2xl font-bold text-green-800">{stats.active}</p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-900">Rules Nonaktif</h3>
            <p className="text-2xl font-bold text-red-800">{stats.inactive}</p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-900">Coverage</h3>
            <p className="text-2xl font-bold text-purple-800">{stats.coverage}</p>
            <p className="text-xs text-purple-600">dari 12 kombinasi</p>
          </div>
        </div>

        {/* Missing Combinations Warning */}
        {missingCombinations.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-900 mb-2">
              ⚠️ Kombinasi yang Belum Diatur ({missingCombinations.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {missingCombinations.map(combo => {
                const [bmi, bodyFat] = combo.split('-');
                return (
                  <span key={combo} className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                    {getBMICategoryDisplay(bmi)} + {getBodyFatCategoryDisplay(bodyFat)}
                  </span>
                );
              })}
            </div>
            <p className="text-sm text-yellow-800 mt-2">
              Kombinasi ini akan menggunakan program default (P2) jika ada user dengan kondisi tersebut.
            </p>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Cari:</span>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari rule atau kondisi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        {/* Rest of the component remains the same... */}
        {/* Table, Mobile Cards, Legend, Summary, Modal */}
        
        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kondisi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRules
                  .sort((a, b) => a.priority - b.priority)
                  .map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                        #{rule.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {rule.bmiCategory}
                        </span>
                        <span className="text-xs text-gray-500">+</span>
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          {rule.bodyFatCategory}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {getConditionDisplay(rule)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getProgramDisplay(rule)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(rule)}
                        className={`px-2 py-1 text-xs font-medium rounded-full cursor-pointer ${
                          rule.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } transition-colors`}
                      >
                        {rule.isActive ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                        title="Edit Rule"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rule)}
                        className="text-red-600 hover:text-red-800 font-medium inline-flex items-center"
                        title="Hapus Rule"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards - Similar structure */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredRules
              .sort((a, b) => a.priority - b.priority)
              .map((rule) => (
              <div key={rule.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      #{rule.priority}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(rule)}
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rule.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {rule.isActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(rule)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                  <div className="text-sm text-gray-500">{rule.description}</div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex space-x-2">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {rule.bmiCategory}
                    </span>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      {rule.bodyFatCategory}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    → {getProgramDisplay(rule)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredRules.length === 0 && (
            <div className="text-center py-8">
              <CogIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Tidak ada rule yang ditemukan.' : 'Belum ada data rule.'}
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Kode BMI</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <div>B1: Underweight (&lt;18.5)</div>
              <div>B2: Ideal (18.5-24.9)</div>
              <div>B3: Overweight (25-29.9)</div>
              <div>B4: Obese (≥30)</div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900 mb-2">Kode Body Fat</h3>
            <div className="space-y-1 text-sm text-green-800">
              <div>L1: Rendah (&lt;10% Pria, &lt;20% Wanita)</div>
              <div>L2: Normal (10-20% Pria, 20-30% Wanita)</div>
              <div>L3: Tinggi (&gt;20% Pria, &gt;30% Wanita)</div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-purple-900 mb-2">Ringkasan Forward Chaining</h3>
          <p className="text-sm text-purple-800">
            Total rules: <span className="font-medium">{rules.length}</span> |
            Ditampilkan: <span className="font-medium">{filteredRules.length}</span> |
            Aktif: <span className="font-medium text-green-700">{stats.active}</span> |
            Coverage: <span className="font-medium text-blue-700">{stats.coverage}</span> |
            Missing: <span className="font-medium text-red-700">{missingCombinations.length}</span>
          </p>
        </div>

        {/* Edit Modal */}
        <RuleEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          rule={selectedRule}
          onSave={handleSave}
          loading={saveLoading}
          programs={programs}
        />
      </div>
    </AdminSidebarLayout>
  );
};

export default AdminRules;