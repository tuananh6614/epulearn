
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Calendar, Download, FileCheck, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getUserCertificates, getCertificate } from '@/integrations/supabase/client';
import Certificate from '@/components/Certificate';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Certificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  
  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const certsData = await getUserCertificates(user.id);
        setCertificates(certsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching certificates:', error);
        setLoading(false);
      }
    };
    
    fetchCertificates();
  }, [user]);
  
  const handleViewCertificate = (certificate: any) => {
    setSelectedCertificate(certificate);
  };
  
  const closeCertificateDialog = () => {
    setSelectedCertificate(null);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-screen-xl mx-auto px-4 pt-24 pb-10">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="h-4 bg-muted rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-52 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-screen-xl mx-auto px-4 pt-24 pb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Chứng chỉ của bạn</h1>
        <p className="text-muted-foreground mb-8">Các chứng chỉ bạn đã đạt được khi hoàn thành khóa học</p>
        
        {!user ? (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vui lòng đăng nhập để xem chứng chỉ của bạn
            </AlertDescription>
          </Alert>
        ) : certificates.length === 0 ? (
          <Card className="mt-8">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Award className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Chưa có chứng chỉ nào</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Hoàn thành các khóa học để nhận chứng chỉ của bạn. Chứng chỉ sẽ được cấp sau khi bạn hoàn thành ít nhất 85% nội dung khóa học.
              </p>
              <Button onClick={() => window.location.href = '/courses'}>
                Khám phá khóa học
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <Card key={certificate.id} className="overflow-hidden">
                <div className="relative h-32 bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
                  <Award className="h-16 w-16 text-white" />
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{certificate.courses?.title || 'Khóa học'}</CardTitle>
                  <CardDescription>
                    Cấp ngày: {format(new Date(certificate.issue_date), 'dd MMMM yyyy', { locale: vi })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <FileCheck className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Mã chứng chỉ: {certificate.certificate_id}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        Cấp ngày: {format(new Date(certificate.issue_date), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => handleViewCertificate(certificate)}
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Xem chứng chỉ
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        {selectedCertificate && (
          <Dialog open={!!selectedCertificate} onOpenChange={closeCertificateDialog}>
            <DialogContent className="max-w-5xl">
              <DialogHeader>
                <DialogTitle>Chứng chỉ khóa học</DialogTitle>
              </DialogHeader>
              
              <Certificate
                userName={`${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`}
                courseName={selectedCertificate.courses?.title || 'Khóa học'}
                certificateId={selectedCertificate.certificate_id}
                issueDate={selectedCertificate.issue_date}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Certificates;
