
import React, { useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Award, Download, Calendar, FileCheck, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { Progress } from "@/components/ui/progress";

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
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  
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
      setIsDownloading(true);
      setDownloadProgress(10);
      
      // Notify user that download is starting
      toast.info("Đang chuẩn bị tải chứng chỉ...");
      
      // Add small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      setDownloadProgress(30);
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      
      setDownloadProgress(60);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      setDownloadProgress(80);
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`certificate-${certificateId}.pdf`);
      
      setDownloadProgress(100);
      
      // Notify user that download is complete
      toast.success("Đã tải xuống chứng chỉ thành công!");
      
      if (onDownload) {
        onDownload();
      }
      
      // Reset progress after a delay
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 1500);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Lỗi khi tạo file PDF. Vui lòng thử lại sau.");
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };
  
  return (
    <div className="flex flex-col">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center text-muted-foreground">
          <FileCheck className="mr-2 h-4 w-4" />
          <span className="text-sm">ID: {certificateId}</span>
        </div>
        
        <Button 
          variant="outline" 
          onClick={downloadAsPDF}
          disabled={isDownloading}
          className="relative overflow-hidden transition-all duration-300 w-full sm:w-auto"
        >
          {isDownloading ? (
            <>
              <span className="opacity-0">
                <Download className="mr-2 h-4 w-4" />
                Tải xuống
              </span>
              <span className="absolute inset-0 flex items-center justify-center">
                <CheckCircle className={`h-4 w-4 mr-2 transition-opacity duration-300 ${downloadProgress === 100 ? 'opacity-100' : 'opacity-0'}`} />
                {downloadProgress === 100 ? 'Hoàn thành' : 'Đang tải...'}
              </span>
              <span className="absolute bottom-0 left-0 h-1 bg-primary" style={{ width: `${downloadProgress}%` }}></span>
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Tải xuống
            </>
          )}
        </Button>
      </div>
      
      {isDownloading && (
        <div className="mb-4">
          <Progress value={downloadProgress} className="h-2" />
          <p className="text-xs text-center mt-1 text-muted-foreground">
            {downloadProgress < 100 ? `Đang tạo chứng chỉ (${downloadProgress}%)` : 'Đã hoàn thành'}
          </p>
        </div>
      )}
      
      <div 
        ref={certificateRef} 
        className="bg-white text-black p-8 border-8 border-primary/20 rounded-lg shadow-xl w-full max-w-4xl mx-auto aspect-[1.4/1] transition-all duration-300 hover:shadow-2xl hover:border-primary/30"
      >
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="mb-2 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"></div>
              <Award className="h-20 w-20 text-primary relative z-10" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-primary mb-2">CHỨNG CHỈ HOÀN THÀNH</h1>
          <div className="w-32 h-1 bg-primary mb-6"></div>
          
          <p className="text-lg mb-2">Chứng nhận</p>
          <h2 className="text-3xl font-bold mb-6 text-gray-800">{userName}</h2>
          
          <p className="text-lg mb-4">đã hoàn thành khóa học</p>
          <h3 className="text-2xl font-bold mb-8 text-gray-800">{courseName}</h3>
          
          <div className="flex justify-center gap-8 mb-8">
            <div className="flex flex-col items-center">
              <Calendar className="h-5 w-5 text-primary mb-1" />
              <p className="text-sm text-gray-600">Ngày cấp: {formatDate(issueDate)}</p>
            </div>
            <div className="flex flex-col items-center">
              <FileCheck className="h-5 w-5 text-primary mb-1" />
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
