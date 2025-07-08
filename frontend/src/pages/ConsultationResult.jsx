import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/common/SidebarLayout';
import { programService } from '../services/program';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ConsultationResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const pdfRef = useRef();
  
  const [programData, setProgramData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

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

  const getBodyFatDisplay = (category) => {
    if (!category) return 'Tidak diukur'; 
    
    const mapping = {
      'L1': 'Rendah',
      'L2': 'Normal',
      'L3': 'Tinggi'
    };
    return mapping[category] || 'Unknown';
  };

  const getConsultationType = (result) => {
    if (result.isBMIOnly || !result.bodyFatPercentage) {
      return {
        type: 'BMI Only',
        description: 'Rekomendasi berdasarkan analisis BMI',
        icon: '📊',
        color: 'blue'
      };
    }
    return {
      type: 'Analisis Lengkap',
      description: 'Rekomendasi berdasarkan BMI dan Body Fat',
      icon: '🔬',
      color: 'green'
    };
  };

  const formatDateForPDF = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPDF(true);
      toast.loading('Mempersiapkan PDF...', { id: 'pdf-generation' });
      
      // Get the PDF content element
      const element = pdfRef.current;
      
      if (!element) {
        toast.error('Gagal mengakses konten untuk PDF', { id: 'pdf-generation' });
        return;
      }

      // Create canvas from the element
      toast.loading('Mengambil screenshot konten...', { id: 'pdf-generation' });
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        onclone: (clonedDoc) => {
          // Ensure all styles are applied to cloned document
          const clonedElement = clonedDoc.querySelector('[data-pdf-content]');
          if (clonedElement) {
            clonedElement.style.padding = '20px';
            clonedElement.style.backgroundColor = '#ffffff';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF
      toast.loading('Membuat dokumen PDF...', { id: 'pdf-generation' });
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate dimensions to fit content properly
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate scale to fit content in PDF with margins
      const margin = 10;
      const availableWidth = pdfWidth - (margin * 2);
      const availableHeight = pdfHeight - (margin * 2);
      
      const widthRatio = availableWidth / (imgWidth * 0.264583); // Convert px to mm
      const heightRatio = availableHeight / (imgHeight * 0.264583);
      const ratio = Math.min(widthRatio, heightRatio);
      
      const finalWidth = (imgWidth * 0.264583) * ratio;
      const finalHeight = (imgHeight * 0.264583) * ratio;
      
      const imgX = (pdfWidth - finalWidth) / 2;
      const imgY = margin;

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', imgX, imgY, finalWidth, finalHeight);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `Program_Olahraga_${result.programCode}_${timestamp}.pdf`;
      
      // Save PDF
      toast.loading('Menyimpan file...', { id: 'pdf-generation' });
      pdf.save(fileName);
      
      toast.success('PDF berhasil didownload!', { id: 'pdf-generation' });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Gagal membuat PDF. Silakan coba lagi.', { id: 'pdf-generation' });
    } finally {
      setDownloadingPDF(false);
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
              <p className="text-gray-600">Memuat hasil konsultasi...</p>
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
            <p className="text-gray-600 mb-6">Gagal memuat data program.</p>
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

  const consultationType = getConsultationType(result);

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
          Hasil Konsultasi Program Olahraga
        </h1>
        
        {/* PDF Content Area */}
        <div 
          ref={pdfRef} 
          data-pdf-content
          className="bg-white rounded-lg shadow-lg overflow-hidden"
          style={{ minHeight: '800px' }}
        >
          {/* Header for PDF */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              SISTEM PAKAR PROGRAM OLAHRAGA
            </h1>
            <h2 className="text-lg lg:text-xl font-semibold mb-2">
              Hasil Konsultasi & Rekomendasi Program
            </h2>
            <p className="text-sm opacity-90">
              {formatDateForPDF(result.timestamp)}
            </p>
          </div>

          <div className="p-6 space-y-8">
            {/* User Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2 flex items-center">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-full mr-3">👤</span>
                Informasi Pengguna
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nama:</span> 
                    <span className="font-medium text-gray-900">{result.user}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Berat Badan:</span> 
                    <span className="font-medium text-gray-900">{result.weight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tinggi Badan:</span> 
                    <span className="font-medium text-gray-900">{result.height} cm</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">BMI:</span> 
                    <span className="font-medium text-gray-900">{result.bmi} ({getBMIDisplay(result.bmiCategory)})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Body Fat:</span> 
                    <span className="font-medium text-gray-900">
                      {result.bodyFatPercentage ? 
                        `${result.bodyFatPercentage}% (${getBodyFatDisplay(result.bodyFatCategory)})` : 
                        '❌ Tidak diukur'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Jenis Analisis:</span> 
                    <span className={`font-medium ${consultationType.color === 'blue' ? 'text-blue-600' : 'text-green-600'}`}>
                      {consultationType.icon} {consultationType.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Program Recommendation */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2 flex items-center">
                <span className="bg-green-100 text-green-600 p-2 rounded-full mr-3">🎯</span>
                Program Rekomendasi
              </h3>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                <div className="text-center mb-4">
                  <span className="bg-green-600 text-white px-4 py-2 rounded-full text-lg font-bold">
                    {programData.code}
                  </span>
                  <h4 className="text-xl font-bold text-gray-900 mt-3">{programData.name}</h4>
                  <p className="text-gray-700 mt-2">{programData.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <h5 className="font-semibold text-green-900 mb-2">💪 Rasio Latihan</h5>
                    <p className="text-green-800 font-medium">
                      {programData.cardioRatio || '50% Kardio - 50% Beban'}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h5 className="font-semibold text-blue-900 mb-2">🥗 Rekomendasi Diet</h5>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      {programData.dietRecommendation ? 
                        programData.dietRecommendation.substring(0, 100) + '...' :
                        'Konsultasikan dengan ahli gizi untuk diet yang sesuai'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Training Schedule - IMPROVED LAYOUT */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2 flex items-center">
                <span className="bg-purple-100 text-purple-600 p-2 rounded-full mr-3">📅</span>
                Jadwal Latihan 7 Hari
              </h3>
              
              {/* Mobile-First Cards Layout */}
              <div className="space-y-4">
                {Object.entries(programData.schedule || {}).map(([day, exercise]) => (
                  <div key={day} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-3">
                      <h4 className="font-semibold text-lg">{day}</h4>
                    </div>
                    <div className="p-4">
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {exercise || (
                          <span className="text-gray-400 italic">Belum ada jadwal untuk hari ini</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diet Recommendation Full */}
            {programData.dietRecommendation && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2 flex items-center">
                  <span className="bg-yellow-100 text-yellow-600 p-2 rounded-full mr-3">🥗</span>
                  Panduan Diet Lengkap
                </h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <p className="text-yellow-900 leading-relaxed whitespace-pre-line">
                    {programData.dietRecommendation}
                  </p>
                </div>
              </div>
            )}

            {/* BMI-Only Upgrade Suggestion */}
            {(!result.bodyFatPercentage || result.isBMIOnly) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  💡 <span className="ml-2">Tingkatkan Akurasi Konsultasi</span>
                </h4>
                <div className="space-y-3">
                  <p className="text-blue-800">
                    Anda menggunakan analisis BMI saja. Untuk rekomendasi yang lebih personal dan akurat:
                  </p>
                  <ul className="text-blue-800 space-y-1 ml-4 list-disc">
                    <li>Ukur persentase lemak tubuh dengan body fat analyzer</li>
                    <li>Lakukan konsultasi ulang dengan data lengkap</li>
                    <li>Dapatkan program yang disesuaikan kondisi tubuh spesifik</li>
                  </ul>
                  <div className="mt-4">
                    <button
                      onClick={() => navigate('/consultation')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      🔄 Lakukan Konsultasi Lengkap
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Safety Guidelines */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h4 className="font-semibold text-red-900 mb-4 flex items-center">
                ⚠️ <span className="ml-2">Panduan Keamanan</span>
              </h4>
              
              <div className="space-y-4 text-red-800">
                <div>
                  <h5 className="font-medium mb-2">Sebelum Memulai:</h5>
                  <ul className="text-sm space-y-1 ml-4 list-disc">
                    <li>Konsultasikan dengan dokter sebelum memulai program latihan</li>
                    <li>Lakukan pemanasan 5-10 menit sebelum latihan</li>
                    <li>Pendinginan dengan stretching setelah latihan</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Hentikan Latihan Jika:</h5>
                  <ul className="text-sm space-y-1 ml-4 list-disc">
                    <li>Merasakan nyeri dada atau sesak napas berlebihan</li>
                    <li>Pusing, mual, atau kehilangan kesadaran</li>
                    <li>Nyeri sendi atau otot yang tajam</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Tips Hidrasi:</h5>
                  <ul className="text-sm space-y-1 ml-4 list-disc">
                    <li>Minum 500-750ml air 2-3 jam sebelum latihan</li>
                    <li>Konsumsi 150-250ml setiap 15-20 menit selama latihan</li>
                    <li>Hidrasi optimal: 150% dari berat badan yang hilang setelah latihan</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center border-t border-gray-200 pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Program ini dibuat oleh Sistem Pakar Program Olahraga
                </p>
                <p className="text-xs text-gray-500">
                  Tanggal Cetak: {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  Konsultasikan dengan pelatih profesional untuk hasil optimal
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Outside PDF area */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPDF}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-center flex items-center justify-center font-medium"
          >
            {downloadingPDF ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Membuat PDF...
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/history')}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-center flex items-center justify-center font-medium"
          >
            <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Lihat Riwayat
          </button>
          
          <button
            onClick={() => navigate('/consultation')}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-center flex items-center justify-center font-medium"
          >
            <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Konsultasi Ulang
          </button>
        </div>

        {/* Auto-Save Info */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-green-600 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-green-900 mb-1">Hasil Tersimpan Otomatis</h3>
              <p className="text-sm text-green-800">
                Hasil konsultasi Anda sudah tersimpan di sistem. 
                Download PDF untuk referensi offline atau lihat riwayat kapan saja.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default ConsultationResult;