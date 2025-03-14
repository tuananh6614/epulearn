
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Award, Download, Calendar, FileCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CertificateProps {
  userName: string;
  courseName: string;
  certificateId: string;
  issueDate: string;
  onDownload?: () => void;
}

const Certificate = ({ 
  userName, 
  courseName, 
  certificateId, 
  issueDate,
  onDownload
}: CertificateProps) => {
  const certificateRef = React.useRef<HTMLDivElement>(null);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  const downloadAsPDF = async () => {
    if (!certificateRef.current) return;
    
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`certificate-${certificateId}.pdf`);
      
      if (onDownload) {
        onDownload();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };
  
  return (
    <div className="flex flex-col">
      <div className="mb-4 flex justify-end">
        <Button variant="outline" onClick={downloadAsPDF}>
          <Download className="mr-2 h-4 w-4" />
          Tải xuống
        </Button>
      </div>
      
      <div 
        ref={certificateRef} 
        className="bg-white text-black p-8 border-8 border-blue-600 rounded-lg shadow-xl w-full max-w-4xl mx-auto aspect-[1.4/1]"
      >
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="mb-2 flex justify-center">
            <Award className="h-20 w-20 text-blue-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-blue-800 mb-2">CHỨNG CHỈ HOÀN THÀNH</h1>
          <div className="w-32 h-1 bg-blue-600 mb-6"></div>
          
          <p className="text-lg mb-2">Chứng nhận</p>
          <h2 className="text-3xl font-bold mb-6">{userName}</h2>
          
          <p className="text-lg mb-4">đã hoàn thành khóa học</p>
          <h3 className="text-2xl font-bold mb-8">{courseName}</h3>
          
          <div className="flex justify-center gap-8 mb-8">
            <div className="flex flex-col items-center">
              <Calendar className="h-5 w-5 text-blue-600 mb-1" />
              <p className="text-sm text-gray-600">Ngày cấp: {formatDate(issueDate)}</p>
            </div>
            <div className="flex flex-col items-center">
              <FileCheck className="h-5 w-5 text-blue-600 mb-1" />
              <p className="text-sm text-gray-600">Mã chứng chỉ: {certificateId}</p>
            </div>
          </div>
          
          <div className="flex justify-between w-full mt-4">
            <div className="flex flex-col items-center">
              <div className="w-32 h-px bg-black mb-1"></div>
              <p className="text-sm">Học viên</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-32 h-px bg-black mb-1"></div>
              <p className="text-sm">Giám đốc đào tạo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
