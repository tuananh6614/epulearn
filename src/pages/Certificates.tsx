import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, ExternalLink, Share2, CheckCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getUserCertificates, getCertificate } from '@/integrations/supabase';
import Footer from '@/components/Footer';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Certificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const { certificateId } = useParams<{ certificateId: string }>();

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userCertificates = await getUserCertificates(user.id);
        setCertificates(userCertificates);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching certificates:', error);
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [user]);

  useEffect(() => {
    const fetchCertificateDetails = async () => {
      if (certificateId) {
        try {
          const certificateDetails = await getCertificate(certificateId);
          setSelectedCertificate(certificateDetails);
        } catch (error) {
          console.error('Error fetching certificate details:', error);
        }
      }
    };

    fetchCertificateDetails();
  }, [certificateId]);

  const handleDownloadCertificate = () => {
    // Placeholder for download functionality
    alert('Download functionality will be implemented soon.');
  };

  const handleShareCertificate = () => {
    // Placeholder for share functionality
    alert('Share functionality will be implemented soon.');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Chứng chỉ của bạn</h1>
          <p className="text-muted-foreground mb-8">
            Các chứng chỉ bạn đã đạt được sau khi hoàn thành khóa học
          </p>

          {!user ? (
            <Alert>
              <AlertDescription>
                Vui lòng đăng nhập để xem chứng chỉ của bạn
              </AlertDescription>
            </Alert>
          ) : loading ? (
            <div>Đang tải chứng chỉ...</div>
          ) : certificates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Bạn chưa có chứng chỉ nào</h3>
                <p className="text-muted-foreground mb-4">
                  Hoàn thành các khóa học để nhận chứng chỉ
                </p>
                <Button asChild>
                  <Link to="/courses">Khám phá khóa học</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((certificate) => (
                <Card key={certificate.id}>
                  <CardHeader>
                    <CardTitle>{certificate.courseName}</CardTitle>
                    <CardDescription>
                      Hoàn thành vào {new Date(certificate.issueDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Chứng chỉ cho khóa học: {certificate.courseName}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <Button asChild variant="link">
                      <Link to={`/certificate/${certificate.certificateId}`}>
                        Xem chi tiết <ExternalLink className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      <Dialog open={!!selectedCertificate} onOpenChange={(open) => !open && setSelectedCertificate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết chứng chỉ</DialogTitle>
          </DialogHeader>
          {selectedCertificate ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedCertificate.courses?.title}</CardTitle>
                  <CardDescription>
                    Chứng nhận hoàn thành khóa học
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Học viên: {selectedCertificate.profiles?.first_name} {selectedCertificate.profiles?.last_name}</p>
                  <p>Email: {selectedCertificate.profiles?.email}</p>
                  <p>Khóa học: {selectedCertificate.courses?.title}</p>
                  <p>Giảng viên: {selectedCertificate.courses?.instructor}</p>
                  <p>Ngày hoàn thành: {new Date(selectedCertificate.issue_date).toLocaleDateString()}</p>
                </CardContent>
              </Card>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleDownloadCertificate}>
                  <Download className="h-4 w-4 mr-2" />
                  Tải xuống
                </Button>
                <Button onClick={handleShareCertificate}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Chia sẻ
                </Button>
              </div>
            </div>
          ) : (
            <div>Đang tải chi tiết chứng chỉ...</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Certificates;
