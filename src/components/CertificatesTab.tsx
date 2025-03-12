
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, FileText, ExternalLink, Download, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/context/AuthContext';
import { fetchUserCertificates } from '@/services/apiUtils';
import { toast } from 'sonner';

interface Certificate {
  id: string;
  title: string;
  issueDate: string;
  credential: string;
}

const CertificatesTab: React.FC = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCertificates = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const certs = await fetchUserCertificates(currentUser.id);
        setCertificates(certs);
      } catch (error) {
        console.error('Error loading certificates:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải chứng chỉ",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCertificates();
  }, [currentUser]);

  const handleViewCertificate = (cert: Certificate) => {
    // For now, show a toast when viewing certificate
    toast({
      title: "Xem chứng chỉ",
      description: `Đang mở chứng chỉ: ${cert.title}`,
    });
  };

  const handleDownloadCertificate = (cert: Certificate) => {
    // For now, show a toast when downloading certificate
    toast({
      title: "Tải xuống chứng chỉ",
      description: `Đang tải xuống chứng chỉ: ${cert.title}`,
    });
  };

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <Award className="h-5 w-5 mr-2 text-blue-500" />
            Chứng chỉ của tôi
          </h2>
          <Badge variant="outline" className="px-2 py-1">
            {certificates.length} chứng chỉ
          </Badge>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          </div>
        ) : certificates.length > 0 ? (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <div 
                key={cert.id} 
                className="p-5 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 
                hover:shadow-md transition-all duration-300 flex flex-col md:flex-row justify-between items-start 
                md:items-center gap-4 relative overflow-hidden"
              >
                <div className="absolute -right-12 -top-12 w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full opacity-50"></div>
                <div className="z-10">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-500" />
                    <h3 className="font-medium text-lg">{cert.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Cấp ngày: {cert.issueDate}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-medium">Mã chứng chỉ:</span> {cert.credential}
                  </p>
                </div>
                <div className="flex space-x-2 z-10">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => handleViewCertificate(cert)}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Xem
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => handleDownloadCertificate(cert)}
                  >
                    <Download className="h-4 w-4" />
                    Tải xuống
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
            <Award className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Chưa có chứng chỉ nào</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Hoàn thành các khóa học để nhận chứng chỉ của bạn.
              Chứng chỉ sẽ được cấp tự động sau khi hoàn thành khóa học.
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
