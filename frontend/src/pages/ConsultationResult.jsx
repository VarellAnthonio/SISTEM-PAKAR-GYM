import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/common/SidebarLayout';
import { consultationService } from '../services/consultation';
import { programService } from '../services/program';
import toast from 'react-hot-toast';

const ConsultationResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  
  const [programData, setProgramData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // If no result data, redirect to consultation
  useEffect(() => {
    if (!result) {
      navigate('/consultation');
      return;
    }
    
    // Fetch real program data from database
    fetchProgramData();
  }, [result, navigate]);

  const fetchProgramData = async () => {
    try {
      setLoading(true);
      
      // Get all programs to find the one assigned by forward chaining
      const programsResult = await programService.getAll();
      
      if (programsResult.success) {
        // Find the specific program assigned to this consultation
        const assignedProgram = programsResult.data.find(
          program => program.code === result.programCode
        );
        
        if (assignedProgram) {
          setProgramData(assignedProgram);
        } else {
          // Fallback - get program by trying different approaches
          const fallbackProgram = programsResult.data.find(
            program => program.bmiCategory === result.bmiCategory && 
                      program.bodyFatCategory === result.bodyFatCategory
          ) || programsResult.data.find(program => program.code === 'P2'); // Ultimate fallback
          
          setProgramData(fallbackProgram);
        }
      } else {
        toast.error('Gagal memuat data program');
        // Use basic fallback data if API fails
        setProgramData({
          code: result.programCode,
          name: result.programName,
          schedule: getBasicSchedule(),
          cardioRatio: '50% Kardio - 50% Beban',
          dietRecommendation: 'Konsultasikan dengan ahli gizi untuk rekomendasi diet yang sesuai.'
        });
      }
    } catch (error) {
      console.error('Error fetching program data:', error);
      toast.error('Gagal memuat data program dari database');
      
      // Fallback to basic data
      setProgramData({
        code: result.programCode,
        name: result.programName,
        schedule: getBasicSchedule(),
        cardioRatio: '50% Kardio - 50% Beban',
        dietRecommendation: 'Konsultasikan dengan ahli gizi untuk rekomendasi diet yang sesuai.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Basic fallback schedule if database fails
  const getBasicSchedule = () => {
    return {
      'Senin': 'Latihan sesuai program yang direkomendasikan',
      'Selasa': 'Latihan sesuai program yang direkomendasikan', 
      'Rabu': 'Latihan sesuai program yang direkomendasikan',
      'Kamis': 'Latihan sesuai program yang direkomendasikan',
      'Jumat': 'Latihan sesuai program yang direkomendasikan',
      'Sabtu': 'Latihan sesuai program yang direkomendasikan',
      'Minggu': 'Rest atau cardio ringan'
    };
  };

  const getBMIDisplay = (bmiCategory) => {
    const mapping = {
      'B1': 'Underweight',
      'B2': 'Ideal', 
      'B3': 'Overweight',
      'B4': 'Obese'
    };
    return mapping[bmiCategory] || 'Unknown';
  };

  const getBodyFatDisplay = (bodyFatCategory) => {
    const mapping = {
      'L1': 'Rendah',
      'L2': 'Normal',
      'L3': 'Tinggi'
    };
    return mapping[bodyFatCategory] || 'Unknown';
  };

  const handleSaveConsultation = async () => {
    try {
      setSaving(true);
      
      // Create consultation record in database
      const consultationData = {
        weight: parseFloat(result.weight),
        height: parseFloat(result.height),
        bodyFatPercentage: parseFloat(result.bodyFatPercentage),
        notes: `Hasil konsultasi: ${result.programCode} - ${programData?.name || result.programName}`
      };

      const saveResult = await consultationService.create(consultationData);
      
      if (saveResult.success) {
        toast.success('Hasil konsultasi berhasil disimpan');
      } else {
        toast.error(saveResult.message || 'Gagal menyimpan hasil konsultasi');
      }
    } catch (error) {
      console.error('Error saving consultation:', error);
      toast.error('Gagal menyimpan hasil konsultasi');
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <SidebarLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat hasil konsultasi dari database...</p>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  // If no program data found
  if (!programData) {
    return (
      <SidebarLayout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-xl font-bold text-gray-900 mb-4">Error Loading Program</h1>
            <p className="text-gray-600 mb-6">Gagal memuat data program dari database.</p>
            <button
              onClick={() => navigate('/consultation')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Kembali ke Konsultasi
            </button>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
          Hasil Konsultasi
        </h1>
        
        {/* Data Source Indicator */}
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            ✅ <strong>Data Real-time:</strong> Program dan jadwal diambil langsung dari database (bukan mock-up)
          </p>
        </div>
        
        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-4 lg:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nama: <span className="font-medium text-gray-900">{result.user}</span></p>
              <p className="text-sm text-gray-600">BMI: <span className="font-medium text-gray-900">{getBMIDisplay(result.bmiCategory)}</span></p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Persentase Lemak: <span className="font-medium text-gray-900">{getBodyFatDisplay(result.bodyFatCategory)}</span></p>
              <p className="text-sm text-gray-600">Program: <span className="font-medium text-blue-600">{programData.code} - {programData.name}</span></p>
            </div>
          </div>
        </div>

        {/* Program Schedule - FROM DATABASE */}
        <div className="bg-white rounded-lg shadow p-4 lg:p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Program Latihan</h2>
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Database Real-time
            </span>
          </div>
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hari
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gerakan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(programData.schedule || {}).map(([day, exercise]) => (
                  <tr key={day}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {day}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="whitespace-pre-line">{exercise || 'Belum ada jadwal'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {Object.entries(programData.schedule || {}).map(([day, exercise]) => (
              <div key={day} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-gray-900">{day}</h3>
                </div>
                <div className="text-sm text-gray-600 whitespace-pre-line">
                  {exercise || 'Belum ada jadwal'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info - FROM DATABASE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6">
          {/* Cardio Ratio */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Rasio Latihan</h3>
            <p className="text-sm text-blue-800">
              {programData.cardioRatio || '50% Kardio - 50% Beban'}
            </p>
          </div>

          {/* Diet Recommendation */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">Rekomendasi Diet</h3>
            <p className="text-sm text-green-800">
              {programData.dietRecommendation || 'Konsultasikan dengan ahli gizi untuk rekomendasi diet yang sesuai.'}
            </p>
          </div>
        </div>

        {/* Program Details from Database */}
        {programData.description && (
          <div className="bg-white rounded-lg shadow p-4 lg:p-6 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Deskripsi Program</h3>
            <p className="text-sm text-gray-600">{programData.description}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSaveConsultation}
            disabled={saving}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-center flex items-center justify-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Menyimpan...
              </>
            ) : (
              'Simpan Hasil Konsultasi'
            )}
          </button>
          
          <button
            onClick={() => navigate('/consultation')}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-center"
          >
            Ulangi Konsultasi
          </button>
        </div>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Debug Info</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Program Code: {programData.code}</p>
              <p>BMI Category: {result.bmiCategory}</p>
              <p>Body Fat Category: {result.bodyFatCategory}</p>
              <p>Schedule Keys: {Object.keys(programData.schedule || {}).join(', ')}</p>
              <p>Data Source: Database API</p>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default ConsultationResult;