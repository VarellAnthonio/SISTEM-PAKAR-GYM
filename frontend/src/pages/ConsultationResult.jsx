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
      description: 'Rekomendasi berdasarkan BMI saja',
      icon: '📊'
    };
  }
  return {
    type: 'Complete Consultation',
    description: 'Rekomendasi berdasarkan BMI dan Body Fat',
    icon: '🔬'
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
      const fileName = `Hasil_Konsultasi_${result.programCode}_${timestamp}.pdf`;
      
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
        
        {/* PDF Content Area */}
        <div 
          ref={pdfRef} 
          data-pdf-content
          className="bg-white p-8 rounded-lg shadow-lg"
          style={{ minHeight: '800px' }}
        >
          {/* Header for PDF */}
          <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              SISTEM PAKAR PROGRAM OLAHRAGA
            </h1>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">
              Hasil Konsultasi Program Olahraga
            </h2>
            <p className="text-sm text-gray-600">
              Tanggal Konsultasi: {formatDateForPDF(result.timestamp)}
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">
              Informasi Pengguna
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Nama:</span> 
                  <span className="ml-2 text-gray-900">{result.user}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Berat Badan:</span> 
                  <span className="ml-2 text-gray-900">{result.weight} kg</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Tinggi Badan:</span> 
                  <span className="ml-2 text-gray-900">{result.height} cm</span>
                </p>
                {/* 🔄 NEW: Consultation type indicator */}
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Jenis Konsultasi:</span> 
                  <span className="ml-2 text-gray-900">
                    {getConsultationType(result).icon} {getConsultationType(result).type}
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium text-gray-700">BMI:</span> 
                  <span className="ml-2 text-gray-900">{result.bmi} ({getBMIDisplay(result.bmiCategory)})</span>
                </p>
                {/* 🔄 UPDATED: Handle optional body fat percentage */}
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Persentase Lemak:</span> 
                  <span className="ml-2 text-gray-900">
                    {result.bodyFatPercentage ? 
                      `${result.bodyFatPercentage}% (${getBodyFatDisplay(result.bodyFatCategory)})` : 
                      '❌ Tidak diukur (BMI saja)'
                    }
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Program:</span> 
                  <span className="ml-2 font-semibold text-blue-600">{programData.code} - {programData.name}</span>
                </p>
                {/* 🔄 NEW: Logic explanation */}
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Logic:</span> 
                  <span className="ml-2 text-gray-600 italic">
                    {result.isBMIOnly || !result.bodyFatPercentage ? 
                      `${result.bmiCategory} → ${programData.code} (BMI-only)` :
                      `${result.bmiCategory} + ${result.bodyFatCategory} → ${programData.code}`
                    }
                  </span>
                </p>
              </div>
            </div>
            
            {/* 🔄 NEW: Consultation type explanation */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <span className="text-2xl mr-3">{getConsultationType(result).icon}</span>
                <div>
                  <h4 className="text-sm font-medium text-blue-900">{getConsultationType(result).type}</h4>
                  <p className="text-sm text-blue-800 mt-1">{getConsultationType(result).description}</p>
                  {result.isBMIOnly || !result.bodyFatPercentage ? (
                    <p className="text-xs text-blue-700 mt-2">
                      Sistem menggunakan mapping sederhana: BMI kategori langsung menuju program yang sesuai.
                      Untuk rekomendasi lebih spesifik, lakukan konsultasi lengkap dengan data body fat.
                    </p>
                  ) : (
                    <p className="text-xs text-blue-700 mt-2">
                      Sistem menggunakan 10 kombinasi medis untuk memberikan rekomendasi yang sangat spesifik
                      berdasarkan kondisi BMI dan persentase lemak tubuh Anda.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Program Schedule */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">
              Jadwal Program Latihan
            </h3>
            <div className="overflow-hidden border border-gray-300 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider w-1/6">
                      Hari
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Program Latihan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(programData.schedule || {}).map(([day, exercise]) => (
                    <tr key={day} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-200">
                        {day}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="whitespace-pre-line leading-relaxed">
                          {exercise || 'Belum ada jadwal'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Cardio Ratio */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
              <h4 className="font-semibold text-blue-900 mb-3 text-base">Rasio Latihan</h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                {programData.cardioRatio || '50% Kardio - 50% Beban'}
              </p>
            </div>

            {/* Diet Recommendation */}
            <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg">
              <h4 className="font-semibold text-green-900 mb-3 text-base">Rekomendasi Diet</h4>
              <p className="text-sm text-green-800 leading-relaxed">
                {programData.dietRecommendation || 'Konsultasikan dengan ahli gizi untuk rekomendasi diet yang sesuai.'}
              </p>
            </div>
          </div>

          {/* Program Description */}
          {programData.description && (
            <div className="mb-8">
              <h4 className="font-semibold text-gray-900 mb-3 text-base border-b border-gray-300 pb-2">
                Deskripsi Program
              </h4>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {programData.description}
                </p>
              </div>
            </div>
          )}

          {(!result.bodyFatPercentage || result.isBMIOnly) && (
            <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg mb-8">
              <h4 className="font-semibold text-green-900 mb-3 text-base">💡 Tingkatkan Akurasi Konsultasi</h4>
              <div className="space-y-2">
                <p className="text-sm text-green-800">
                  Anda menggunakan konsultasi BMI saja. Untuk rekomendasi yang lebih akurat dan personal:
                </p>
                <ul className="text-sm text-green-800 space-y-1 ml-4">
                  <li>• Ukur persentase lemak tubuh dengan body fat analyzer</li>
                  <li>• Lakukan konsultasi ulang dengan data lengkap</li>
                  <li>• Dapatkan akses ke 10 program spesifik yang disesuaikan kondisi tubuh</li>
                  <li>• Program akan lebih efektif untuk mencapai tujuan fitness Anda</li>
                </ul>
                <div className="mt-3">
                  <button
                    onClick={() => navigate('/consultation')}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                  >
                    🔄 Lakukan Konsultasi Lengkap
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Important Notes */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg mb-8">
            <h4 className="font-semibold text-yellow-900 mb-4 text-base">Catatan Penting & Guidelines Medis</h4>
            
            <div className="space-y-4">
              {/* General Safety */}
              <div>
                <h5 className="font-medium text-yellow-900 mb-2 text-sm">Keamanan Umum:</h5>
                <ul className="text-sm text-yellow-800 space-y-1 ml-4">
                  <li>• Konsultasikan dengan dokter sebelum memulai program latihan</li>
                  <li>• Lakukan pemanasan 5-10 menit sebelum latihan</li>
                  <li>• Pendinginan 5-10 menit setelah latihan dengan stretching</li>
                  <li>• Hentikan latihan jika merasakan nyeri dada, pusing, atau sesak napas</li>
                </ul>
              </div>

              {/* Heart Rate Guidelines */}
              <div>
                <h5 className="font-medium text-yellow-900 mb-2 text-sm">Panduan Heart Rate (Detak Jantung):</h5>
                <ul className="text-sm text-yellow-800 space-y-1 ml-4">
                  <li>• <strong>Target Heart Rate:</strong> 50-85% dari Maximum Heart Rate (220 - umur)</li>
                  <li>• <strong>Fat Burning Zone:</strong> 60-70% MHR untuk pembakaran lemak optimal</li>
                  <li>• <strong>Cardio Zone:</strong> 70-85% MHR untuk peningkatan kardiovaskular</li>
                  <li>• <strong>Recovery Zone:</strong> 50-60% MHR untuk active recovery</li>
                  <li>• Gunakan heart rate monitor atau hitung manual: 15 detik × 4</li>
                </ul>
              </div>

              {/* Weight Training Guidelines */}
              <div>
                <h5 className="font-medium text-yellow-900 mb-2 text-sm">Panduan Beban Latihan:</h5>
                <ul className="text-sm text-yellow-800 space-y-1 ml-4">
                  <li>• <strong>Pemula:</strong> Mulai dengan 40-60% dari 1RM (1 Rep Maximum)</li>
                  <li>• <strong>Intermediate:</strong> 60-80% dari 1RM</li>
                  <li>• <strong>Advanced:</strong> 80-95% dari 1RM</li>
                  <li>• <strong>RPE Scale:</strong> Target intensitas 6-8 dari skala 1-10</li>
                  <li>• Tingkatkan beban 2.5-5% setiap 1-2 minggu jika form tetap baik</li>
                </ul>
              </div>

              {/* Progressive Overload */}
              <div>
                <h5 className="font-medium text-yellow-900 mb-2 text-sm">Progressive Overload:</h5>
                <ul className="text-sm text-yellow-800 space-y-1 ml-4">
                  <li>• Tingkatkan volume latihan secara bertahap (10% rule)</li>
                  <li>• Fokus pada teknik yang benar sebelum menambah beban</li>
                  <li>• Berikan waktu recovery 48-72 jam untuk muscle group yang sama</li>
                  <li>• Variasi latihan setiap 4-6 minggu untuk menghindari plateau</li>
                </ul>
              </div>

              {/* Hydration & Nutrition */}
              <div>
                <h5 className="font-medium text-yellow-900 mb-2 text-sm">Hidrasi & Nutrisi:</h5>
                <ul className="text-sm text-yellow-800 space-y-1 ml-4">
                  <li>• Minum 500-750ml air 2-3 jam sebelum latihan</li>
                  <li>• Konsumsi 150-250ml setiap 15-20 menit selama latihan</li>
                  <li>• Post-workout: 150% dari berat badan yang hilang</li>
                  <li>• Pre-workout meal: 1-4 jam sebelum latihan (karbohidrat + protein)</li>
                  <li>• Post-workout: Dalam 30-60 menit (protein + karbohidrat)</li>
                </ul>
              </div>

              {/* Recovery & Sleep */}
              <div>
                <h5 className="font-medium text-yellow-900 mb-2 text-sm">Recovery & Istirahat:</h5>
                <ul className="text-sm text-yellow-800 space-y-1 ml-4">
                  <li>• Tidur 7-9 jam per malam untuk recovery optimal</li>
                  <li>• Ambil rest day 1-2 hari per minggu</li>
                  <li>• Active recovery: jalan santai, yoga, atau stretching ringan</li>
                  <li>• Monitor tanda overtraining: kelelahan, penurunan performa, mood changes</li>
                </ul>
              </div>

              {/* When to Stop */}
              <div>
                <h5 className="font-medium text-red-700 mb-2 text-sm">Hentikan Latihan Segera Jika:</h5>
                <ul className="text-sm text-red-700 space-y-1 ml-4">
                  <li>• Nyeri dada atau sesak napas berlebihan</li>
                  <li>• Pusing, mual, atau kehilangan kesadaran</li>
                  <li>• Nyeri sendi atau otot yang tajam</li>
                  <li>• Heart rate tidak kembali normal setelah 5 menit recovery</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-yellow-200">
              <p className="text-xs text-yellow-700 italic">
                *Guidelines berdasarkan American College of Sports Medicine (ACSM), 
                American Heart Association (AHA), dan WHO Physical Activity Guidelines.
              </p>
            </div>
          </div>

          {/* Footer for PDF */}
          <div className="border-t-2 border-gray-200 pt-6 text-center">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Dokumen ini dihasilkan oleh Sistem Pakar Program Olahraga
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
                Hasil konsultasi Anda sudah otomatis tersimpan ke database saat forward chaining dijalankan. 
                Anda dapat mengdownload PDF untuk referensi offline atau melihat riwayat kapan saja.
              </p>
            </div>
          </div>
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