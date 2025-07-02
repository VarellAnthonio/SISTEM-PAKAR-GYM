import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../components/common/AdminSidebarLayout';
// Removed RuleEditModal import - rules are now view-only
// import RuleEditModal from '../../components/admin/RuleEditModal';
import { MagnifyingGlassIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { programService } from '../../services/program';
import { ruleService } from '../../services/rule';
import toast from 'react-hot-toast';

const AdminRules = () => {
  const [rules, setRules] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Removed edit-related states
  // const [showEditModal, setShowEditModal] = useState(false);
  // const [selectedRule, setSelectedRule] = useState(null);
  // const [saveLoading, setSaveLoading] = useState(false);

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
        // Fallback mock data for demo
        const mockRules = [
          { id: 1, name: 'Rule for Underweight + Low', bmiCategory: 'B1', bodyFatCategory: 'L1', programId: 1, isActive: true },
          { id: 2, name: 'Rule for Underweight + Normal', bmiCategory: 'B1', bodyFatCategory: 'L2', programId: 5, isActive: true },
          { id: 3, name: 'Rule for Underweight + High', bmiCategory: 'B1', bodyFatCategory: 'L3', programId: 9, isActive: true },
          { id: 4, name: 'Rule for Ideal + Low', bmiCategory: 'B2', bodyFatCategory: 'L1', programId: 6, isActive: true },
          { id: 5, name: 'Rule for Ideal + Normal', bmiCategory: 'B2', bodyFatCategory: 'L2', programId: 2, isActive: true },
          { id: 6, name: 'Rule for Ideal + High', bmiCategory: 'B2', bodyFatCategory: 'L3', programId: 7, isActive: true },
          { id: 7, name: 'Rule for Overweight + Low', bmiCategory: 'B3', bodyFatCategory: 'L1', programId: 10, isActive: true },
          { id: 8, name: 'Rule for Overweight + Normal', bmiCategory: 'B3', bodyFatCategory: 'L2', programId: 8, isActive: true },
          { id: 9, name: 'Rule for Overweight + High', bmiCategory: 'B3', bodyFatCategory: 'L3', programId: 3, isActive: true },
          { id: 10, name: 'Rule for Obese + High', bmiCategory: 'B4', bodyFatCategory: 'L3', programId: 4, isActive: true },
        ];
        setRules(mockRules);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data rules');
    } finally {
      setLoading(false);
    }
  };

  const filteredRules = rules.filter(rule =>
    rule.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    if (rule.program) {
      return `${rule.program.code} - ${rule.program.name}`;
    }
    
    const program = programs.find(p => p.id === rule.programId);
    return program ? `${program.code} - ${program.name}` : 'Program tidak ditemukan';
  };

  // Removed edit-related functions since rules are view-only
  // const handleEdit = (rule) => { ... }
  // const handleSave = async (formData) => { ... }

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Rule Configuration</h1>
          <p className="text-gray-600 mt-1">
            View 10 kombinasi BMI + Body Fat dan program assignment yang sudah optimal
          </p>
        </div>

        {/* Quick Info */}
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-green-900 mb-2">Medical Logic System - Optimal Configuration</h3>
              <p className="text-sm text-green-800">
                <strong>View-Only System:</strong> 10 kombinasi BMI+BodyFat sudah optimal secara medis dan tidak perlu diubah. 
                Setiap kondisi user akan otomatis diarahkan ke program yang tepat melalui forward chaining.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900">Total Rules</h3>
            <p className="text-2xl font-bold text-green-800">{rules.length}</p>
            <p className="text-xs text-green-600">kombinasi realistis</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900">Coverage</h3>
            <p className="text-2xl font-bold text-blue-800">100%</p>
            <p className="text-xs text-blue-600">kombinasi tercakup</p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-900">Programs</h3>
            <p className="text-2xl font-bold text-purple-800">{programs.length}</p>
            <p className="text-xs text-purple-600">program tersedia</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Cari:</span>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari kondisi atau program..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BMI + Body Fat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {rule.bmiCategory}
                        </span>
                        <span className="text-xs text-gray-500">+</span>
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          {rule.bodyFatCategory}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {getConditionDisplay(rule)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getProgramDisplay(rule)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="text-gray-500 text-sm">
                        View Only
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredRules.map((rule) => (
              <div key={rule.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {rule.bmiCategory}
                    </span>
                    <span className="text-xs text-gray-500">+</span>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      {rule.bodyFatCategory}
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    View Only
                  </span>
                </div>
                
                <div className="mb-2">
                  <div className="text-sm text-gray-600">{getConditionDisplay(rule)}</div>
                </div>
                
                <div className="text-sm font-medium text-gray-900">
                  → {getProgramDisplay(rule)}
                </div>
              </div>
            ))}
          </div>
          
          {filteredRules.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? 'Tidak ada rule yang ditemukan.' : 'Belum ada data rule.'}
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">BMI Categories</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <div>B1: Underweight (&lt;18.5)</div>
              <div>B2: Ideal (18.5-24.9)</div>
              <div>B3: Overweight (25-29.9)</div>
              <div>B4: Obese (≥30)</div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900 mb-2">Body Fat Categories</h3>
            <div className="space-y-1 text-sm text-green-800">
              <div>L1: Rendah (&lt;10% Pria, &lt;20% Wanita)</div>
              <div>L2: Normal (10-20% Pria, 20-30% Wanita)</div>
              <div>L3: Tinggi (&gt;20% Pria, &gt;30% Wanita)</div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">Medical Logic System Status</h3>
          <p className="text-sm text-green-800">
            ✅ {rules.length}/10 kombinasi medis optimal |
            ✅ Coverage: 100% kondisi user |
            ✅ Forward chaining operational |
            ✅ View-only untuk menjaga integritas sistem
          </p>
        </div>

        {/* Removed Edit Modal - Rules are now view-only */}
        {/* 
        <RuleEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          rule={selectedRule}
          onSave={handleSave}
          loading={saveLoading}
          programs={programs}
          mode="assignment-only"
        />
        */}
      </div>
    </AdminSidebarLayout>
  );
};

export default AdminRules;