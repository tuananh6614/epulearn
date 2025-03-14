
import React, { useMemo, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCertificate } from '@/services/apiUtils';
import { GraduationCap, Award, Calendar, ChevronRight, Download, Search, FilterIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '@/lib/utils';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimatePresence, motion } from "framer-motion";

interface CertificateItemProps {
  certificate: UserCertificate;
  onDownload: (certificateId: string) => void;
}

const CertificateItem = React.memo(({ certificate, onDownload }: CertificateItemProps) => {
  // Parse date once
  const formattedDate = useMemo(() => {
    try {
      return formatDate(new Date(certificate.issueDate));
    } catch (e) {
      return 'Ngày không xác định';
    }
  }, [certificate.issueDate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-4 overflow-hidden hover:shadow-md transition-all duration-300 group">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            <div className="bg-green-500 p-5 flex items-center justify-center md:w-20 transition-all duration-300 group-hover:bg-green-600">
              <Award className="h-10 w-10 text-white transition-transform duration-300 group-hover:scale-110" />
            </div>
            
            <div className="p-4 flex-1">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-gray-800 dark:text-white group-hover:text-primary transition-colors duration-300">
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
                    <Link to={`/certificate/${certificate.certificateId}`} className="transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <ChevronRight className="h-4 w-4 mr-1" />
                      Xem
                    </Link>
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white transition-all duration-300"
                    onClick={() => onDownload(certificate.certificateId)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Tải xuống
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

CertificateItem.displayName = 'CertificateItem';

interface CertificatesTabProps {
  certificates: UserCertificate[];
}

const CertificatesTab = React.memo(({ certificates }: CertificatesTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "name">("newest");
  
  // Handle certificate download
  const handleDownload = (certificateId: string) => {
    // This function would be implemented to trigger certificate download
    console.log(`Downloading certificate: ${certificateId}`);
    // Could navigate to certificate view with download param
    window.open(`/certificate/${certificateId}?download=true`, '_blank');
  };
  
  // Filter and sort certificates
  const filteredCertificates = useMemo(() => {
    let result = [...certificates];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(cert => 
        cert.courseName.toLowerCase().includes(term)
      );
    }
    
    // Sort by selected order
    switch (sortOrder) {
      case "newest":
        return result.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
      case "oldest":
        return result.sort((a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime());
      case "name":
        return result.sort((a, b) => a.courseName.localeCompare(b.courseName));
      default:
        return result;
    }
  }, [certificates, searchTerm, sortOrder]);

  if (!certificates || certificates.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12"
      >
        <GraduationCap className="h-16 w-16 mx-auto mb-6 text-gray-400 animate-bounce" />
        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-3">Chưa có chứng chỉ</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Hãy hoàn thành các khóa học để nhận chứng chỉ của bạn. Mỗi khóa học đều có chứng chỉ riêng khi bạn hoàn thành.
        </p>
        <Button asChild className="bg-green-600 hover:bg-green-700 text-white transition-all duration-300 animate-pulse">
          <Link to="/courses">Khám phá khóa học</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold mb-4 sm:mb-0 dark:text-white">Chứng chỉ của tôi</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm chứng chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="w-full sm:w-auto">
            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as any)}>
              <SelectTrigger className="w-full sm:w-[180px] flex items-center">
                <FilterIcon className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="name">Tên khóa học</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {searchTerm && filteredCertificates.length === 0 ? (
        <div className="text-center py-8">
          <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">
            Không tìm thấy chứng chỉ phù hợp với "{searchTerm}"
          </p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-4">
            {filteredCertificates.map(certificate => (
              <CertificateItem 
                key={certificate.id} 
                certificate={certificate} 
                onDownload={handleDownload}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
      
      <div className="text-center text-sm text-gray-500 mt-8">
        Tổng cộng: {filteredCertificates.length} chứng chỉ
      </div>
    </motion.div>
  );
});

CertificatesTab.displayName = 'CertificatesTab';

export default CertificatesTab;
