
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Certificate {
  id: string;
  title: string;
  issueDate: string;
  credential: string;
}

interface CertificatesTabProps {
  certificates: Certificate[];
  isLoading: boolean;
}

const CertificatesTab: React.FC<CertificatesTabProps> = ({ certificates, isLoading }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-500" />
          Chứng chỉ của tôi
        </h2>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : certificates.length > 0 ? (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <div key={cert.id} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-medium">{cert.title}</h3>
                  <p className="text-sm text-muted-foreground">Cấp ngày: {cert.issueDate}</p>
                  <p className="text-sm text-muted-foreground">Mã chứng chỉ: {cert.credential}</p>
                </div>
                <Button variant="outline" size="sm">Xem chứng chỉ</Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Chưa có chứng chỉ nào</h3>
            <p className="text-muted-foreground mb-6">
              Hoàn thành các khóa học để nhận chứng chỉ của bạn.
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
