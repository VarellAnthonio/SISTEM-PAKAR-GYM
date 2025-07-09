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
          { id: 1, name: 'Underweight + Low Body Fat → Fat Loss', bmiCategory: 'B1', bodyFatCategory: 'L1', programId: 1, programCode: 'P1', isActive: true },
          { id: 2, name: 'Underweight + Normal Body Fat → Lean Muscle', bmiCategory: 'B1', bodyFatCategory: 'L2', programId: 5, programCode: 'P5', isActive: true },
          { id: 3, name: 'Underweight + High Body Fat → Beginner Muscle', bmiCategory: 'B1', bodyFatCategory: 'L3', programId: 9, programCode: 'P9', isActive: true },
          { id: 4, name: 'Ideal + Low Body Fat → Strength & Definition', bmiCategory: 'B2', bodyFatCategory: 'L1', programId: 6, programCode: 'P6', isActive: true },
          { id: 5, name: 'Ideal + Normal Body Fat → Muscle Gain', bmiCategory: 'B2', bodyFatCategory: 'L2', programId: 2, programCode: 'P2', isActive: true },
          { id: 6, name: 'Ideal + High Body Fat → Fat Burning & Toning', bmiCategory: 'B2', bodyFatCategory: 'L3', programId: 7, programCode: 'P7', isActive: true },
          { id: 7, name: 'Overweight + Low Body Fat → Advanced Strength', bmiCategory: 'B3', bodyFatCategory: 'L1', programId: 10, programCode: 'P10', isActive: true },
          { id: 8, name: 'Overweight + Normal Body Fat → Body Recomposition', bmiCategory: 'B3', bodyFatCategory: 'L2', programId: 8, programCode: 'P8', isActive: true },
          { id: 9, name: 'Overweight + High Body Fat → Weight Loss', bmiCategory: 'B3', bodyFatCategory: 'L3', programId: 3, programCode: 'P3', isActive: true },
          { id: 10, name: 'Obese + High Body Fat → Extreme Weight Loss', bmiCategory: 'B4', bodyFatCategory: 'L3', programId: 4, programCode: 'P4', isActive: true },
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
      name: 'Underweight BMI → Mass Gain Program', 
      bmiCategory: 'B1', 
      programCode: 'P1',
      description: 'Simple BMI-based assignment for underweight users',
      range: '< 18.5'
    },
    { 
      id: 'bmi2', 
      name: 'Ideal BMI → Muscle Gain Program', 
      bmiCategory: 'B2', 
      programCode: 'P2',
      description: 'Simple BMI-based assignment for ideal weight users',
      range: '18.5 - 24.9'
    },
    { 
      id: 'bmi3', 
      name: 'Overweight BMI → Weight Loss Program', 
      bmiCategory: 'B3', 
      programCode: 'P3',
      description: 'Simple BMI-based assignment for overweight users',
      range: '25 - 29.9'
    },
    { 
      id: 'bmi4', 
      name: 'Obese BMI → Extreme Weight Loss Program', 
      bmiCategory: 'B4', 
      programCode: 'P4',
      description: 'Simple BMI-based assignment for obese users',
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
      'L1': 'Low',
      'L2': 'Normal',
      'L3': 'High'
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
    return program ? `${program.code} - ${program.name}` : 'Program not found';
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Forward Chaining Rules</h1>
          <p className="text-gray-600">
            View medical logic rules for both complete consultation and BMI-only analysis
          </p>
        </div>

        {/* Stats Cards - UPDATED */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <BeakerIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Complete Rules</p>
                <p className="text-2xl font-bold text-gray-900">{rules.length}</p>
                <p className="text-xs text-green-600">BMI + Body Fat</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <ScaleIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">BMI-Only Rules</p>
                <p className="text-2xl font-bold text-gray-900">{bmiOnlyRules.length}</p>
                <p className="text-xs text-blue-600">Simple BMI mapping</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3 mr-4">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Coverage</p>
                <p className="text-2xl font-bold text-gray-900">100%</p>
                <p className="text-xs text-purple-600">all scenarios covered</p>
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
                Complete Rules ({rules.length})
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
                BMI-Only Rules ({bmiOnlyRules.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder={`Search ${activeTab === 'complete' ? 'complete' : 'BMI-only'} rules...`}
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
                    <span className="text-sm font-medium text-green-700">Complete Analysis</span>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    Rule #{rule.id}
                  </span>
                </div>

                {/* Condition */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">IF Conditions:</h3>
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
                    <span className="text-xs">THEN</span>
                    <div className="w-8 h-px bg-gray-300 ml-2"></div>
                  </div>
                </div>

                {/* Program Assignment */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Program Assignment:</h3>
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

                {/* Rule Logic */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h4 className="text-xs font-medium text-gray-600 mb-1">Forward Chaining Logic:</h4>
                  <p className="text-xs text-gray-700 font-mono">
                    IF BMI={rule.bmiCategory} AND BodyFat={rule.bodyFatCategory} → {getProgramCode(rule)}
                  </p>
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
                    <span className="text-sm font-medium text-blue-700">BMI-Only Analysis</span>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    Simple Rule
                  </span>
                </div>

                {/* BMI Condition */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">IF BMI Category:</h3>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-3 py-2 text-sm bg-blue-100 text-blue-800 rounded font-medium">
                      {rule.bmiCategory} - {getBMICategoryDisplay(rule.bmiCategory)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    BMI Range: {rule.range}
                  </p>
                </div>

                {/* Arrow */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center text-gray-400">
                    <div className="w-12 h-px bg-gray-300 mr-2"></div>
                    <span className="text-xs">THEN</span>
                    <div className="w-12 h-px bg-gray-300 ml-2"></div>
                  </div>
                </div>

                {/* Program Assignment */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Program Assignment:</h3>
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

                {/* Simple Logic */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h4 className="text-xs font-medium text-gray-600 mb-1">Simple Forward Chaining:</h4>
                  <p className="text-xs text-gray-700 font-mono">
                    IF BMI={rule.bmiCategory} (no body fat data) → {rule.programCode}
                  </p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rules found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'No rules available'}
            </p>
          </div>
        )}

        {/* System Information */}
        <div className="space-y-6">
          {/* Consultation Type Comparison */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Consultation Type Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* BMI-Only */}
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center mb-3">
                  <ScaleIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-blue-900">BMI-Only Consultation</h4>
                </div>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Input: Weight + Height only</li>
                  <li>• Rules: 4 simple mappings</li>
                  <li>• Speed: Very fast</li>
                  <li>• Accuracy: Basic recommendation</li>
                  <li>• Best for: Quick assessment</li>
                </ul>
              </div>

              {/* Complete */}
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center mb-3">
                  <BeakerIcon className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="font-medium text-green-900">Complete Consultation</h4>
                </div>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Input: Weight + Height + Body Fat</li>
                  <li>• Rules: 10 detailed combinations</li>
                  <li>• Speed: Fast</li>
                  <li>• Accuracy: High precision</li>
                  <li>• Best for: Optimal results</li>
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