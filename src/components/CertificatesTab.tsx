import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2, Award } from 'lucide-react';
import { UserCertificate } from '@/services/apiUtils';
import { toast } from 'sonner';

interface CertificatesTabProps {
  certificates: UserCertificate[];
  isLoading: boolean;
}

const CertificatesTab: React.FC<CertificatesTabProps> = ({ certificates, isLoading }) => {
  const handleDownloadCertificate = (certificateId: string) => {
    // In a real application, this would redirect to a certificate download/view endpoint
    console.log(`Downloading certificate with ID: ${certificateId}`);
    // Placeholder for certificate download functionality
    toast.info(`Chứng chỉ ${certificateId} sẽ được tải xuống (chức năng đang phát triển)`);
  };
  
  const handleViewCertificate = (certificateId: string) => {
    // Placeholder for certificate view functionality
    toast.info(`Đang mở chứng chỉ ${certificateId} (chức năng đang phát triển)`);
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Award className="h-5 w-5 mr-2 text-yellow-500" />
          Chứng chỉ của tôi
        </h2>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          </div>
        ) : certificates.length > 0 ? (
          <div className="space-y-4">
            {certificates.map((certificate) => (
              <div key={certificate.id} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{certificate.courseName}</h3>
                    <p className="text-sm text-muted-foreground">Ngày cấp: {new Date(certificate.issueDate).toLocaleDateString('vi-VN')}</p>
                    <p className="text-xs text-muted-foreground mt-1">ID: {certificate.certificateId}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1" 
                      onClick={() => handleViewCertificate(certificate.certificateId)}
                    >
                      <FileText className="h-4 w-4" />
                      Xem
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex items-center gap-1" 
                      onClick={() => handleDownloadCertificate(certificate.certificateId)}
                    >
                      <Download className="h-4 w-4" />
                      Tải xuống
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border rounded-lg">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Bạn chưa có chứng chỉ nào</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Hoàn thành khóa học để nhận chứng chỉ. Chứng chỉ là minh chứng cho kỹ năng và kiến thức bạn đã đạt được.
            </p>
            <Button asChild>
              <Link to="/courses">Khám phá khóa học</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CertificatesTab;
