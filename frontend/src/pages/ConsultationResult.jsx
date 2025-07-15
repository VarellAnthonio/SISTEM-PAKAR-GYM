import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/common/SidebarLayout';
import { programService } from '../services/program';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

const ConsultationResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  
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

  // ENHANCED PDF GENERATION - CLEAN PROFESSIONAL LAYOUT
  const handleDownloadPDF = async () => {
    try {
      setDownloadingPDF(true);
      toast.loading('Mempersiapkan PDF...', { id: 'pdf-generation' });
      
      // Create PDF with optimal settings
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = margin;

      // Helper function to add new page
      const addNewPage = () => {
        pdf.addPage();
        currentY = margin;
      };

      // Helper function to check if content fits on current page
      const checkPageSpace = (requiredHeight) => {
        if (currentY + requiredHeight > pageHeight - margin - 10) {
          addNewPage();
        }
      };

      // Helper function to add section header with better styling
      const addSectionHeader = (title, bgColor = [59, 130, 246]) => {
        checkPageSpace(18);
        
        // Background for header
        pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        pdf.roundedRect(margin, currentY, contentWidth, 12, 2, 2, 'F');
        
        // Header text
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin + 4, currentY + 8);
        
        // Reset text color
        pdf.setTextColor(0, 0, 0);
        currentY += 18;
      };

      // Helper function to add info table with better formatting
      const addInfoTable = (data) => {
        const rowHeight = 8;
        const totalHeight = data.length * rowHeight + 4;
        checkPageSpace(totalHeight);
        
        // Table background
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, currentY, contentWidth, totalHeight, 'F');
        
        // Table border
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.2);
        pdf.rect(margin, currentY, contentWidth, totalHeight);
        
        let tableY = currentY + 4;
        
        data.forEach((row, index) => {
          // Alternating row colors
          if (index % 2 === 0) {
            pdf.setFillColor(255, 255, 255);
            pdf.rect(margin, tableY - 2, contentWidth, rowHeight, 'F');
          }
          
          // Row border
          pdf.setDrawColor(226, 232, 240);
          pdf.line(margin, tableY + rowHeight - 2, margin + contentWidth, tableY + rowHeight - 2);
          
          // Label
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(75, 85, 99);
          pdf.text(row.label, margin + 4, tableY + 3);
          
          // Value
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(17, 24, 39);
          
          // Handle long text
          const maxValueWidth = contentWidth * 0.6;
          const valueLines = pdf.splitTextToSize(String(row.value), maxValueWidth);
          pdf.text(valueLines, margin + contentWidth * 0.4, tableY + 3);
          
          tableY += rowHeight;
        });
        
        currentY += totalHeight + 6;
        pdf.setTextColor(0, 0, 0);
      };

      // Helper function to add text with proper formatting
      const addFormattedText = (text, fontSize = 9, style = 'normal', color = [0, 0, 0]) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', style);
        pdf.setTextColor(color[0], color[1], color[2]);
        
        const lines = pdf.splitTextToSize(text, contentWidth);
        const lineHeight = fontSize * 0.4;
        const totalHeight = lines.length * lineHeight;
        
        checkPageSpace(totalHeight + 4);
        
        pdf.text(lines, margin, currentY);
        currentY += totalHeight + 4;
      };

      toast.loading('Membuat halaman 1 - Header & Info User...', { id: 'pdf-generation' });

      // === PAGE 1: HEADER & USER INFO ===
      
      // Main Header with gradient effect simulation
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 45, 'F');
      
      // Header shadow effect
      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, 40, pageWidth, 5, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SISTEM PAKAR PROGRAM OLAHRAGA', pageWidth/2, 15, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Hasil Konsultasi & Rekomendasi Program', pageWidth/2, 25, { align: 'center' });
      
      pdf.setFontSize(9);
      pdf.text(formatDateForPDF(result.timestamp), pageWidth/2, 35, { align: 'center' });
      
      pdf.setTextColor(0, 0, 0);
      currentY = 55;

      // User Information Section
      addSectionHeader('INFORMASI PENGGUNA', [59, 130, 246]);
      
      const userInfo = [
        { label: 'Nama', value: result.user },
        { label: 'Berat Badan', value: `${result.weight} kg` },
        { label: 'Tinggi Badan', value: `${result.height} cm` },
        { label: 'BMI', value: `${result.bmi} (${getBMIDisplay(result.bmiCategory)})` },
        { 
          label: 'Body Fat', 
          value: result.bodyFatPercentage ? 
            `${result.bodyFatPercentage}% (${getBodyFatDisplay(result.bodyFatCategory)})` : 
            'Tidak diukur'
        },
        { 
          label: 'Jenis Analisis', 
          value: `${getConsultationType(result).type}`
        }
      ];
      
      addInfoTable(userInfo);

      // Program Recommendation Section
      addSectionHeader('PROGRAM REKOMENDASI', [34, 197, 94]);
      
      // Program highlight box
      checkPageSpace(25);
      pdf.setFillColor(34, 197, 94);
      pdf.roundedRect(margin, currentY, contentWidth, 20, 3, 3, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${programData.code}`, margin + 8, currentY + 8);
      
      pdf.setFontSize(12);
      pdf.text(programData.name, margin + 30, currentY + 8);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const descLines = pdf.splitTextToSize(programData.description || '', contentWidth - 16);
      pdf.text(descLines.slice(0, 2), margin + 8, currentY + 15); // Limit to 2 lines
      
      pdf.setTextColor(0, 0, 0);
      currentY += 26;

      // Program details
      const programInfo = [
        { label: 'Rasio Latihan', value: programData.cardioRatio || '50% Kardio - 50% Beban' },
        { 
          label: 'Deskripsi Lengkap', 
          value: programData.description || 'Program olahraga yang disesuaikan dengan kondisi tubuh Anda'
        }
      ];
      
      addInfoTable(programInfo);

      toast.loading('Membuat halaman 2 - Jadwal Latihan...', { id: 'pdf-generation' });

      // === PAGE 2: TRAINING SCHEDULE ===
      addNewPage();
      
      addSectionHeader('JADWAL LATIHAN 7 HARI', [147, 51, 234]);
      
      Object.entries(programData.schedule || {}).forEach(([day, exercise]) => {
        // Day header with better styling
        checkPageSpace(8);
        pdf.setFillColor(99, 102, 241);
        pdf.roundedRect(margin, currentY, contentWidth, 8, 1, 1, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(day, margin + 4, currentY + 5.5);
        
        pdf.setTextColor(0, 0, 0);
        currentY += 12;
        
        // Exercise content with better formatting
        const exerciseText = exercise || 'Belum ada jadwal untuk hari ini';
        addFormattedText(exerciseText, 9, 'normal', [55, 65, 81]);
        
        currentY += 2; // Spacing between days
      });

      toast.loading('Membuat halaman 3 - Diet & Panduan...', { id: 'pdf-generation' });

      // === PAGE 3: DIET & GUIDELINES ===
      addNewPage();

      // Diet Recommendation
      if (programData.dietRecommendation) {
        addSectionHeader('PANDUAN DIET LENGKAP', [245, 158, 11]);
        addFormattedText(programData.dietRecommendation, 9, 'normal', [55, 65, 81]);
      }

      // BMI-Only Upgrade Suggestion
      if (!result.bodyFatPercentage || result.isBMIOnly) {
        addSectionHeader('TINGKATKAN AKURASI KONSULTASI', [59, 130, 246]);
        
        addFormattedText('Anda menggunakan analisis BMI saja. Untuk rekomendasi yang lebih personal dan akurat:', 9, 'normal', [55, 65, 81]);
        
        const suggestions = [
          '• Ukur persentase lemak tubuh dengan body fat analyzer',
          '• Lakukan konsultasi ulang dengan data lengkap',
          '• Dapatkan program yang disesuaikan kondisi tubuh spesifik'
        ];
        
        suggestions.forEach(suggestion => {
          addFormattedText(suggestion, 8, 'normal', [75, 85, 99]);
        });
      }

      // Safety Guidelines
      addSectionHeader('PANDUAN KEAMANAN', [239, 68, 68]);
      
      addFormattedText('SEBELUM MEMULAI:', 10, 'bold', [153, 27, 27]);
      const beforeTips = [
        '• Konsultasikan dengan dokter sebelum memulai program latihan',
        '• Lakukan pemanasan 5-10 menit sebelum latihan',
        '• Pendinginan dengan stretching setelah latihan'
      ];
      beforeTips.forEach(tip => addFormattedText(tip, 8, 'normal', [55, 65, 81]));
      
      addFormattedText('HENTIKAN LATIHAN JIKA:', 10, 'bold', [153, 27, 27]);
      const stopTips = [
        '• Merasakan nyeri dada atau sesak napas berlebihan',
        '• Pusing, mual, atau kehilangan kesadaran',
        '• Nyeri sendi atau otot yang tajam'
      ];
      stopTips.forEach(tip => addFormattedText(tip, 8, 'normal', [55, 65, 81]));
      
      addFormattedText('TIPS HIDRASI:', 10, 'bold', [153, 27, 27]);
      const hydrationTips = [
        '• Minum 500-750ml air 2-3 jam sebelum latihan',
        '• Konsumsi 150-250ml setiap 15-20 menit selama latihan',
        '• Hidrasi optimal: 150% dari berat badan yang hilang setelah latihan'
      ];
      hydrationTips.forEach(tip => addFormattedText(tip, 8, 'normal', [55, 65, 81]));

      // Professional Footer
      checkPageSpace(25);
      pdf.setFillColor(249, 250, 251);
      pdf.rect(0, pageHeight - 30, pageWidth, 30, 'F');
      
      pdf.setDrawColor(229, 231, 235);
      pdf.setLineWidth(0.5);
      pdf.line(0, pageHeight - 30, pageWidth, pageHeight - 30);
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(75, 85, 99);
      pdf.text('Program ini dibuat oleh Sistem Pakar Program Olahraga', pageWidth/2, pageHeight - 20, { align: 'center' });
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, pageWidth/2, pageHeight - 15, { align: 'center' });
      pdf.text('Konsultasikan dengan pelatih profesional untuk hasil optimal', pageWidth/2, pageHeight - 10, { align: 'center' });

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `Program_Olahraga_${result.programCode}_${timestamp}.pdf`;
      
      toast.loading('Menyimpan file PDF...', { id: 'pdf-generation' });
      
      // Save PDF with compression
      pdf.save(fileName);
      
      // Get file size info
      const pdfOutput = pdf.output('datauristring');
      const pdfSize = (pdfOutput.length * 0.75) / 1024; // Approximate size in KB
      const fileSizeText = pdfSize > 1024 ? 
        `${(pdfSize / 1024).toFixed(1)} MB` : 
        `${Math.round(pdfSize)} KB`;
      
      toast.success(`PDF berhasil didownload! (${fileSizeText})`, { id: 'pdf-generation' });
      
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
        
        {/* Web Display Content - Unchanged */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header for Web */}
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

            {/* Training Schedule */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2 flex items-center">
                <span className="bg-purple-100 text-purple-600 p-2 rounded-full mr-3">📅</span>
                Jadwal Latihan 7 Hari
              </h3>
              
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

            {/* Safety Guidelines for Web */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h4 className="font-semibold text-red-900 mb-4 flex items-center">
                ⚠️ <span className="ml-2">Panduan Keamanan</span>
              </h4>
              
              <div className="space-y-4 text-red-800 text-sm">
                <div>
                  <h5 className="font-medium mb-2">Sebelum Memulai:</h5>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Konsultasikan dengan dokter sebelum memulai program latihan</li>
                    <li>Lakukan pemanasan 5-10 menit sebelum latihan</li>
                    <li>Pendinginan dengan stretching setelah latihan</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Hentikan Latihan Jika:</h5>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Merasakan nyeri dada atau sesak napas berlebihan</li>
                    <li>Pusing, mual, atau kehilangan kesadaran</li>
                    <li>Nyeri sendi atau otot yang tajam</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Tips Hidrasi:</h5>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Minum 500-750ml air 2-3 jam sebelum latihan</li>
                    <li>Konsumsi 150-250ml setiap 15-20 menit selama latihan</li>
                    <li>Hidrasi optimal: 150% dari berat badan yang hilang setelah latihan</li>
                  </ul>
                </div>
              </div>
            </div>

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

        {/* Action Buttons */}
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
      </div>
    </SidebarLayout>
  );
};

export default ConsultationResult;