// Evidence Engine V2
// Mỗi Market Force → 4 phần: observation, evidence, businessGap, recommendation

export interface Finding {
  observation: string;
  evidence: string;
  businessGap: string;
  recommendation: string[];
  businessQuestions: string[];
}

export const evidenceEngine: Record<string, Finding> = {

  "Rào Cản Niềm Tin": {
    observation:
      "Khách hàng liên tục hỏi đơn vị nào uy tín, ai làm tốt, và xin review trước khi quyết định.",
    evidence:
      "Các cụm từ 'xin review', 'bên nào làm tốt', 'thi công tốt', 'có ổn không' xuất hiện lặp lại — cho thấy khách chưa có đủ bằng chứng để tin tưởng bất kỳ nhà cung cấp nào.",
    businessGap:
      "Hầu hết doanh nghiệp nội thất đang tập trung đăng ảnh sản phẩm và báo giá, trong khi khách hàng cần bằng chứng từ người thứ ba đã trải nghiệm thực tế.",
    recommendation: [
      "Tạo chuỗi video 'Khách hàng nói về chúng tôi' — quay tại nhà khách sau bàn giao",
      "Viết case study chi tiết từng công trình: trước/trong/sau thi công",
      "Đăng ảnh bàn giao kèm tên địa chỉ thực (được phép) để tăng tính xác thực",
      "Tạo trang 'Công trình đã hoàn thành' thay vì chỉ dùng ảnh render",
    ],
    businessQuestions: [
      "Điều gì tạo niềm tin?",
      "Điều gì làm mất đơn hàng?",
    ],
  },

  "Rào Cản Chất Lượng": {
    observation:
      "Khách hàng lo ngại tủ bị mốc, ngấm nước, bong tróc sau thời gian ngắn sử dụng.",
    evidence:
      "Tín hiệu 'bị mốc', 'ngấm nước', 'nhanh hỏng', 'chống ẩm' xuất hiện ở cả người đang gặp vấn đề lẫn người sắp mua — nỗi sợ độ bền là rào cản xuyên suốt hành trình mua hàng.",
    businessGap:
      "Doanh nghiệp đang truyền thông về thiết kế đẹp và giá cả, nhưng chưa có nội dung cụ thể về khả năng chống ẩm và độ bền vật liệu theo thời gian.",
    recommendation: [
      "Quay video test thực tế: đổ nước lên bề mặt tủ, đo độ ẩm trước/sau",
      "Làm nội dung so sánh MDF thường vs MDF chống ẩm — giải thích bằng hình ảnh",
      "Đăng case study công trình sau 2-3 năm sử dụng: ảnh thực tế không chỉnh sửa",
      "Cam kết bảo hành chống ẩm thành điểm bán hàng chính — không chỉ ghi nhỏ trong hợp đồng",
    ],
    businessQuestions: [
      "Khách hàng đang sợ điều gì?",
      "Điều gì thúc đẩy quyết định mua?",
    ],
  },

  "Rào Cản Tài Chính": {
    observation:
      "Khách hàng hỏi giá trước khi hỏi bất cứ thứ gì khác — giá không rõ ràng làm họ không dám tiến tới.",
    evidence:
      "Cụm từ 'bao nhiêu tiền', 'giá làm tủ bếp', 'chi phí khoảng bao nhiêu' xuất hiện ở giai đoạn đầu tìm kiếm, cho thấy khách đang định giá thị trường trước khi liên hệ bất kỳ đơn vị nào.",
    businessGap:
      "Doanh nghiệp giữ giá bí mật để khách phải gọi điện, nhưng điều này khiến khách bỏ qua và chọn đơn vị có thông tin giá công khai hơn.",
    recommendation: [
      "Công bố bảng giá tham khảo theo loại vật liệu và diện tích — không cần giá chính xác",
      "Làm video 'Bóc tách chi phí tủ bếp 10m2': vật liệu + nhân công + phụ kiện",
      "Tạo công cụ dự toán nhanh trên website: nhập diện tích → ra khoảng giá",
      "Định vị rõ: 'Giá minh bạch — không phát sinh' thành cam kết thương hiệu",
    ],
    businessQuestions: [
      "Điều gì làm mất đơn hàng?",
      "Khách hàng đang sợ điều gì?",
    ],
  },

  "Rào Cản Kiến Thức": {
    observation:
      "Khách hàng hỏi về MDF, HDF, nhựa picomat — họ đang cố hiểu vật liệu nhưng thiếu thông tin để so sánh.",
    evidence:
      "Câu hỏi 'MDF có nhanh hỏng không' xuất hiện cùng lúc với tìm kiếm nhà cung cấp — khách chưa mua vì chưa hiểu, không phải vì không muốn mua.",
    businessGap:
      "Doanh nghiệp dùng thuật ngữ kỹ thuật trong tư vấn nhưng chưa có nội dung giáo dục đơn giản giúp khách hiểu sự khác biệt giữa các loại vật liệu.",
    recommendation: [
      "Tạo series 'Vật liệu nội thất cho người mới': MDF vs HDF vs Nhựa vs Gỗ tự nhiên",
      "Infographic so sánh: độ bền / chống ẩm / giá / phù hợp không gian nào",
      "Video ngắn 60 giây: 'Chọn vật liệu tủ bếp đúng cách'",
      "Đưa nội dung giáo dục vào quy trình tư vấn — gửi trước khi khách hỏi giá",
    ],
    businessQuestions: [
      "Điều gì thúc đẩy quyết định mua?",
    ],
  },

  "Rào Cản Lựa Chọn": {
    observation:
      "Khách hàng so sánh nhiều phương án và không biết nên chọn cái nào — họ bị tê liệt trước quá nhiều lựa chọn.",
    evidence:
      "Tín hiệu 'hay hơn', 'so với', 'nên chọn' cho thấy khách đang ở giai đoạn đánh giá nhưng chưa có tiêu chí rõ ràng để ra quyết định.",
    businessGap:
      "Doanh nghiệp cung cấp nhiều lựa chọn nhưng thiếu hướng dẫn giúp khách chọn đúng nhu cầu — kết quả là khách trì hoãn hoặc chọn đối thủ.",
    recommendation: [
      "Tạo bộ câu hỏi định hướng: 'Nhà bạn thuộc loại nào?' → gợi ý vật liệu phù hợp",
      "Làm nội dung 'Khi nào nên chọn MDF, khi nào nên chọn nhựa picomat'",
      "Đơn giản hóa danh mục sản phẩm: thay vì 20 lựa chọn → 3 gói rõ ràng",
      "Tư vấn viên được đào tạo để chủ động đề xuất thay vì hỏi khách muốn gì",
    ],
    businessQuestions: [
      "Điều gì thúc đẩy quyết định mua?",
      "Điều gì làm mất đơn hàng?",
    ],
  },

  "Rào Cản Bằng Chứng Xã Hội": {
    observation:
      "Khách hàng hài lòng nhưng doanh nghiệp chưa biến sự hài lòng đó thành công cụ bán hàng.",
    evidence:
      "Tín hiệu 'rất hài lòng', 'đáng tiền', 'giới thiệu cho' xuất hiện — đây là mỏ vàng chưa được khai thác. Khách sẵn sàng giới thiệu nhưng không được tạo điều kiện.",
    businessGap:
      "Doanh nghiệp nhận lời khen miệng nhưng không có hệ thống thu thập và phát tán bằng chứng xã hội một cách có chủ đích.",
    recommendation: [
      "Xây quy trình sau bàn giao: xin phép chụp ảnh + quay video + viết testimonial",
      "Tạo chương trình giới thiệu bạn bè: khách cũ giới thiệu → nhận ưu đãi bảo trì",
      "Đăng đều đặn 'Công trình tuần này' trên mạng xã hội — không cần chỉnh sửa quá nhiều",
      "Tổng hợp các đánh giá 5 sao thành highlight story trên Facebook/Zalo",
    ],
    businessQuestions: [
      "Điều gì tạo niềm tin?",
      "Điều gì thúc đẩy quyết định mua?",
    ],
  },

  "Rào Cản Hậu Mãi": {
    observation:
      "Khách hàng có trải nghiệm xấu sau mua — tiếc nuối, thất vọng, hoặc muốn đổi nhà cung cấp.",
    evidence:
      "Tín hiệu 'thất vọng', 'không nên chọn', 'biết thế' phản ánh kỳ vọng không được đáp ứng sau bàn giao — đây là nguồn mất khách và mất uy tín nghiêm trọng nhất.",
    businessGap:
      "Doanh nghiệp tập trung vào giai đoạn trước và trong thi công nhưng thiếu quy trình chăm sóc sau bàn giao — dẫn đến mất cơ hội tái mua và giới thiệu.",
    recommendation: [
      "Lập quy trình check-in sau 30 ngày, 6 tháng, 1 năm: chủ động gọi hỏi thăm",
      "Xử lý khiếu nại trong 24h — đăng công khai cách xử lý để tạo niềm tin",
      "Biến bảo hành từ 'chi phí' thành 'công cụ marketing': cam kết bảo hành minh bạch",
      "Phân tích nguyên nhân thất vọng → cải tiến quy trình thi công và tư vấn",
    ],
    businessQuestions: [
      "Điều gì khiến khách đổi nhà cung cấp?",
      "Điều gì làm mất đơn hàng?",
    ],
  },

};
