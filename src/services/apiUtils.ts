
// Tối ưu hàm fetchUserEnrolledCourses để cải thiện hiệu suất
export const fetchUserEnrolledCourses = async (userId: string): Promise<EnrolledCourse[]> => {
  try {
    if (!userId) {
      return [];
    }

    // Sử dụng một truy vấn JOIN duy nhất thay vì nhiều truy vấn riêng lẻ
    const { data, error } = await supabase
      .from('user_courses')
      .select(`
        *,
        course:courses(*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching enrolled courses:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Chuyển đổi dữ liệu sang định dạng EnrolledCourse với xử lý bất đồng bộ hiệu quả hơn
    return data.map(item => {
      const isCompleted = item.progress_percentage >= 100;
      
      // Xử lý khóa học VIP đặc biệt
      if (item.course_id.startsWith('vip-')) {
        const duration = item.course_id.split('vip-')[1];
        const durationMap: Record<string, string> = {
          '1-month': '1 tháng',
          '3-months': '3 tháng',
          '6-months': '6 tháng',
          '1-year': '1 năm'
        };
        
        return {
          id: item.course_id,
          title: `Gói VIP ${durationMap[duration] || duration}`,
          image: '/public/vip-badge.png',
          progress: 100,
          isCompleted: true,
          lastAccessed: item.last_accessed,
          enrolledAt: item.enrolled_at,
          status: item.has_paid ? 'published' : 'draft'
        };
      }
      
      // Xử lý các khóa học thông thường
      if (item.course) {
        return {
          id: item.course_id,
          title: item.course.title,
          image: item.course.thumbnail_url || '/placeholder.svg',
          progress: item.progress_percentage,
          isCompleted,
          lastAccessed: item.last_accessed,
          enrolledAt: item.enrolled_at,
          status: 'published'
        };
      }
      
      // Fallback nếu không tìm thấy thông tin khóa học
      return {
        id: item.course_id,
        title: 'Khóa học không xác định',
        image: '/placeholder.svg',
        progress: item.progress_percentage,
        isCompleted,
        lastAccessed: item.last_accessed,
        enrolledAt: item.enrolled_at,
        status: 'archived'
      };
    });
    
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return [];
  }
};
