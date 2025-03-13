
import React, { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCertificate } from '@/services/apiUtils';
import { GraduationCap, Award, Calendar, ChevronRight, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '@/lib/utils';

interface CertificateItemProps {
  certificate: UserCertificate;
}

const CertificateItem = React.memo(({ certificate }: CertificateItemProps) => {
  // Parse date once
  const formattedDate = useMemo(() => {
    try {
      return formatDate(new Date(certificate.issueDate));
    } catch (e) {
      return 'Ngày không xác định';
    }
  }, [certificate.issueDate]);

  return (
    <Card className="mb-4 overflow-hidden hover:shadow-md transition-all duration-300">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="bg-green-500 p-5 flex items-center justify-center md:w-20">
            <Award className="h-10 w-10 text-white" />
          </div>
          
          <div className="p-4 flex-1">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1 text-gray-800 dark:text-white">
                  {certificate.courseName}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formattedDate}</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    Chứng chỉ hoàn thành
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2 mt-2 md:mt-0">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/certificate/${certificate.certificateId}`}>
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Xem
                  </Link>
                </Button>
                <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  <Download className="h-4 w-4 mr-1" />
                  Tải xuống
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

CertificateItem.displayName = 'CertificateItem';

interface CertificatesTabProps {
  certificates: UserCertificate[];
}

const CertificatesTab = React.memo(({ certificates }: CertificatesTabProps) => {
  if (!certificates || certificates.length === 0) {
    return (
      <div className="text-center py-12">
        <GraduationCap className="h-10 w-10 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Chưa có chứng chỉ</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Hãy hoàn thành các khóa học để nhận chứng chỉ của bạn
        </p>
        <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
          <Link to="/courses">Khám phá khóa học</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Chứng chỉ của tôi</h2>
      <div className="space-y-4">
        {certificates.map(certificate => (
          <CertificateItem key={certificate.id} certificate={certificate} />
        ))}
      </div>
    </div>
  );
});

CertificatesTab.displayName = 'CertificatesTab';

export default CertificatesTab;
