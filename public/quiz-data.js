const QUIZ = [
  {
    id: "dau-dau",
    name: "Đau đầu",
    image: "images/dau-dau.png",
    questions: [
      {
        title: "Tình trạng cơn đau đầu của bạn như thế nào?",
        options: [
          { key: "A", text: "Đau dữ dội giật theo nhịp mạch, khu trú 1 bên đầu." },
          { key: "B", text: "Đau âm ỉ như băng quấn siết chặt 2 bên đầu." },
          { key: "C", text: "Đau nặng, căng tức vùng trán, gò má, hốc mắt." },
        ],
      },
      {
        title: "Bạn có biểu hiện nào sau đây kèm theo?",
        options: [
          { key: "A", text: "Nôn/buồn nôn, sợ ánh sáng, sợ tiếng động." },
          { key: "B", text: "Căng thẳng, mỏi cổ vai gáy, làm việc máy tính lâu." },
          { key: "C", text: "Nghẹt mũi, chảy mũi mủ xanh/vàng, đau tăng khi cúi đầu." },
          { key: "D", text: "Không có triệu chứng kèm theo." },
        ],
      },
    ],
    results: [
      {
        answers: ["A", "A"],
        title: "Đau nửa đầu",
        level: "Trung bình",
        advice: "Dùng thuốc giảm đau theo đơn bác sĩ, nghỉ ngơi trong phòng tối, yên tĩnh và tránh ánh sáng mạnh.",
      },
      {
        answers: ["B", "B"],
        title: "Đau đầu căng thẳng",
        level: "Thấp",
        advice: "Xoa bóp vùng thái dương, thư giãn, hạn chế nhìn màn hình điện tử và uống đủ nước.",
      },
      {
        answers: ["C", "C"],
        title: "Đau đầu do viêm xoang",
        level: "Trung bình",
        advice: "Rửa mũi bằng nước muối sinh lý, chườm ấm vùng mặt và giữ ẩm không khí trong phòng, nếu triệu chứng không thuyên giảm cần đi khám.",
      },
    ],
    fallback: {
      title: "Đau đầu chưa rõ nguyên nhân",
      advice: "Theo dõi qua 48h, nếu vẫn còn đau nặng thì cần đi khám.",
    },
  },

  {
    id: "sot-cum",
    name: "Sốt/ Cúm",
    image: "images/image-1.png",
    questions: [
      {
        title: "Tình trạng sốt của bạn như thế nào?",
        options: [
          { key: "A", text: "Sốt cao đột ngột (trên 38.5°C), khó hạ sốt." },
          { key: "B", text: "Sốt nhẹ âm ỉ (37.5°C - 38.4°C)" },
        ],
      },
      {
        title: "Bạn có biểu hiện nào sau đây kèm theo?",
        options: [
          { key: "A", text: "Đau nhức hốc mắt, đau mỏi cơ, có chấm xuất huyết dưới da hoặc chảy máu chân răng." },
          { key: "B", text: "Ho khô, đau họng, đau mỏi toàn thân rã rời." },
          { key: "C", text: "Nghẹt mũi, chảy nước mũi trong, hắt hơi liên tục." },
          { key: "D", text: "Không có triệu chứng kèm theo." },
        ],
      },
    ],
    results: [
      {
        answers: ["A", "A"],
        title: "Sốt xuất huyết Dengue",
        level: "Cao",
        advice: "Nhanh chóng xét nghiệm công thức máu, bù nước và không dùng thuốc hạ sốt.",
      },
      {
        answers: ["A", "B"],
        title: "Cúm mùa Influenza",
        level: "Trung bình",
        advice: "Tự theo dõi và nghỉ ngơi, uống thuốc hạ sốt khi sốt cao và bù nước, điện giải.",
      },
      {
        answers: ["B", "C"],
        title: "Cảm lạnh thông thường",
        level: "Thấp",
        advice: "Tự điều trị triệu chứng (rửa mũi bằng nước muối sinh lý, uống nước ấm).",
      },
    ],
    fallback: {
      title: "Sốt chưa rõ nguyên nhân",
      advice: "Theo dõi nhiệt độ qua 48h, nếu sốt không giảm cần đi khám.",
    },
  },

  {
    id: "co-xuong-khop",
    name: "Đau cơ/xương/khớp",
    image: "images/dau-co-xuong-khop.jpg",
    questions: [
      {
        title: "Vị trí và đặc điểm chính của cơn đau mỏi là gì?",
        options: [
          { key: "A", text: "Đau nhức, sưng đỏ, nóng tại 1 hoặc nhiều khớp xương cụ thể." },
          { key: "B", text: "Đau mỏi toàn thân, ê ẩm khắp cơ bắp và xương khớp." },
          { key: "C", text: "Đau âm ỉ kèm cứng khớp vào buổi sáng (kéo dài >30 phút)." },
        ],
      },
      {
        title: "Bạn có biểu hiện nào sau đây kèm theo?",
        options: [
          { key: "A", text: "Đau khởi phát đột ngột sau ăn nhiều đạm/rượu bia, khớp ngón chân/cổ chân sưng tấy dữ dội." },
          { key: "B", text: "Kèm sốt, mệt mỏi, ho, đau họng hoặc phát ban trên da." },
          { key: "C", text: "Đau tăng khi vận động/đi lại, giảm khi nghỉ ngơi, gặp ở người lớn tuổi hoặc vận động nặng." },
          { key: "D", text: "Không có triệu chứng kèm theo." },
        ],
      },
    ],
    results: [
      {
        answers: ["A", "A"],
        title: "Bệnh Gút cấp tính",
        level: "Trung bình",
        advice: "Đi khám, xét nghiệm máu, chườm lạnh, kê cao chân và uống nhiều nước.",
      },
      {
        answers: ["B", "B"],
        title: "Đau mỏi cơ toàn thân do sốt virus",
        level: "Trung bình",
        advice: "Nghỉ ngơi, bổ sung vitamin, bù nước và uống thuốc hạ sốt nếu cần.",
      },
      {
        answers: ["C", "D"],
        title: "Viêm khớp dạng thấp",
        level: "Trung bình",
        advice: "Đi khám, xét nghiệm yếu tố dạng thấp, và vận động nhẹ nhàng buổi sáng.",
      },
      {
        answers: ["A", "C"],
        title: "Thoái hóa khớp/cột sống",
        level: "Thấp",
        advice: "Tránh mang vác nặng, chườm ấm vùng khớp đau và đi khám nếu cơn đau nặng hơn hoặc duy trì.",
      },
    ],
    fallback: {
      title: "Đau cơ/xương/khớp chưa rõ nguyên nhân",
      advice: "Theo dõi qua 48h, nếu vẫn còn đau nặng thì cần đi khám.",
    },
  },

  {
    id: "dau-bung",
    name: "Đau bụng",
    image: "images/dau-bung.jpg",
    questions: [
      {
        title: "Vị trí đau bụng chính của bạn ở đâu?",
        options: [
          { key: "A", text: "Đau khu trú vùng hố chậu phải (bụng dưới bên phải)." },
          { key: "B", text: "Đau vùng thượng vị (bụng trên rốn/dưới xương ức)." },
          { key: "C", text: "Đau quặn bụng dưới kèm rối loạn tiểu tiện." },
        ],
      },
      {
        title: "Bạn có biểu hiện nào sau đây kèm theo?",
        options: [
          { key: "A", text: "Đau tăng khi ho/di chuyển, ấn vào vùng bụng dưới bên phải thấy rất đau và co cứng." },
          { key: "B", text: "Ợ chua, ợ nóng, cảm giác nóng rát trào ngược lên cổ họng." },
          { key: "C", text: "Đi tiểu buốt, tiểu rắt nhiều lần, nước tiểu đục hoặc có mùi khai nồng." },
          { key: "D", text: "Không có triệu chứng kèm theo." },
        ],
      },
    ],
    results: [
      {
        answers: ["A", "A"],
        title: "Viêm ruột thừa cấp",
        level: "Cấp cứu",
        advice: "Đến ngay khoa cấp cứu, không ăn uống, không uống thuốc giảm đau và không chườm nóng vào bụng.",
      },
      {
        answers: ["B", "B"],
        title: "Bệnh trào ngược dạ dày - thực quản / Viêm dạ dày",
        level: "Trung bình",
        advice: "Tránh ăn đồ chua cay, dầu mỡ, không nằm ngay sau khi ăn. Dùng thuốc trung hòa acid theo đơn.",
      },
      {
        answers: ["C", "C"],
        title: "Viêm bàng quang cấp",
        level: "Trung bình",
        advice: "Uống nhiều nước. Khám chuyên khoa Tiết niệu để làm xét nghiệm nước tiểu và dùng kháng sinh theo đơn.",
      },
    ],
    fallback: {
      title: "Đau bụng chưa rõ nguyên nhân",
      advice: "Theo dõi qua 48h, nếu vẫn còn đau nặng thì cần đi khám.",
    },
  },
];