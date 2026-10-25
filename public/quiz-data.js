const QUIZ = [
  {
    id: "sot-cum",
    name: "Sốt/ Cúm",
    image: "images/image-1.png",
    questions: [
      { title: "1. Tình trạng sốt của bạn như thế nào?", options: [{ key: "A", text: "Sốt cao đột ngột (trên 38.5°C), khó hạ sốt." }, { key: "B", text: "Sốt nhẹ âm ỉ (37.5°C - 38.4°C)" }, { key: "C", text: "Không sốt" }] },
      { title: "2. Bạn có bị đau nhức sau hốc mắt, xuất hiện chấm xuất huyết dưới da hoặc chảy máu chân răng không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "3. Bạn có bị ho khan rát cổ hay ho có đờm đặc (xanh/vàng) không?", options: [{ key: "A", text: "Ho khan" }, { key: "B", text: "Ho đờm đặc" }, { key: "C", text: "Không ho" }] },
      { title: "4. Bạn có bị nghẹt mũi, chảy nước mũi trong, hắt hơi nhiều không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "5. Bạn có cảm giác đau nhức toàn bộ cơ bắp, đau mỏi ê ẩm rã rời không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "6. Bạn (hoặc trẻ) có bị khó thở, thở khò khè không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "7. Tình trạng ho đã kéo dài bao lâu rồi?", options: [{ key: "A", text: "Dưới 1 tuần" }, { key: "B", text: "Kéo dài trên 2 tuần" }, { key: "C", text: "Không ho kéo dài" }] },
      { title: "8. Bạn có bị vã mồ hôi trộm về đêm, ho ra máu hoặc sụt cân không rõ nguyên nhân không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "9. Bạn có tiếp xúc gần với người bị bệnh cúm, sốt xuất huyết hoặc người bệnh lao không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "10. Bạn có tiền sử bệnh Hen phế quản, Phổi tắc nghẽn mạn tính, Tiểu đường hay Suy giảm miễn dịch không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] }
    ],
    results: [
      {
        conditions: { 0: "A", 1: "A", 4: "A" },
        title: "Sốt xuất huyết Dengue",
        level: "Cao",
        advice: "Đi làm xét nghiệm máu. Tự bù nước Oresol tại nhà. Tuyệt đối không dùng Aspirin hoặc Ibuprofen vì dễ gây chảy máu dạ dày."
      },
      {
        conditions: { 0: "A", 2: "A", 4: "A" },
        title: "Cúm mùa do Virus Influenza",
        level: "Trung bình",
        advice: "Nghỉ ngơi hoàn toàn, uống nhiều nước ấm, dùng Paracetamol khi sốt. Nếu xuất hiện khó thở hoặc có bệnh nền, cần đi khám trong 24h."
      },
      {
        conditions: { 0: ["B", "C"], 3: "A" },
        title: "Viêm mũi họng / Cảm lạnh",
        level: "Thấp",
        advice: "Súc họng nước muối sinh lý, rửa mũi ấm, giữ ấm cơ thể. Bệnh thường tự khỏi sau 5–7 ngày mà không cần dùng kháng sinh."
      },
      {
        conditions: { 2: "B", 5: "A" },
        title: "Viêm phổi / Viêm tiểu phế quản",
        level: "Cấp cứu",
        advice: "Đến cơ sở y tế gần nhất để nghe phổi và kiểm tra chỉ số SpO2."
      },
      {
        conditions: { 6: "B", 7: "A" },
        title: "Lao phổi / Bệnh đường hô hấp mạn",
        level: "Cao",
        advice: "Đến bệnh viện chuyên khoa Phổi / Hô hấp để chụp X-quang ngực thẳng và xét nghiệm đờm tìm vi khuẩn Lao."
      }
    ],
    fallback: {
      title: "Chưa xác định được bệnh lý",
      advice: "Chưa đủ căn cứ lâm sàng để xác định bệnh. Theo dõi cơ thể trong 24-48 giờ. Nếu xuất hiện sốt cao > 38 độ hoặc khó thở, cần đến gặp bác sĩ để thăm khám trực tiếp.",
      level: "Thấp"
    }
  },
  {
    id: "dau-bung",
    name: "Đau bụng",
    image: "images/dau-bung.jpg",
    questions: [
      { title: "1. Vị trí đau nhiều nhất của bạn ở đâu?", options: [{ key: "A", text: "Hố chậu phải (bụng dưới bên phải)" }, { key: "B", text: "Vùng thượng vị (trên rốn/dưới xương ức)" }, { key: "C", text: "Khắp bụng/Bụng dưới" }] },
      { title: "2. Cơn đau có tăng lên rõ rệt khi bạn bước đi, ho, hoặc ấn nhẹ vào vùng bụng dưới bên phải không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "3. Bạn có cảm giác nóng rát trào ngược từ dạ dày lên cổ họng, ợ chua, ợ hơi không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "4. Bạn có bị đi ngoài phân lỏng nhiều lần trong ngày (tiêu chảy) không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "5. Bạn có thấy buồn nôn hoặc bị nôn mửa liên tục không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "6. Bạn có cảm giác đi tiểu buốt, tiểu rắt, đi nhiều lần, nước tiểu đục hoặc có mùi nồng bất thường không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "7. Bạn có bị sốt hoặc rét run kèm theo đau bụng không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "8. Bạn có thấy triệu chứng xuất hiện đột ngột sau khi ăn thực phẩm lạ, ôi thiu hoặc uống rượu bia không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "9. Bạn có bị đi ngoài phân đen/có máu hoặc nôn ra máu không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "10. Bạn có tiền sử Viêm loét dạ dày, Bệnh thận mạn hoặc Đái tháo đường không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] }
    ],
    results: [
      {
        conditions: { 0: "A", 1: "A" },
        title: "Viêm ruột thừa",
        level: "Cấp cứu",
        advice: "CẢNH BÁO CAO: Đến cơ sở y tế có chuyên khoa Ngoại trong 6–12 giờ để siêu âm bụng. Nhịn ăn uống hoàn toàn, không chườm nóng và không tự ý uống thuốc giảm đau vì có thể làm lu mờ triệu chứng."
      },
      {
        conditions: { 3: "A", 4: "A", 7: "A" },
        title: "Viêm dạ dày - ruột do nhiễm độc thực phẩm",
        level: "Trung bình",
        advice: "Bù nước và điện giải liên tục bằng dung dịch Oresol. Đi khám nếu nôn nhiều, đi ngoài ra máu hoặc sốt cao không hạ."
      },
      {
        conditions: { 0: "B", 2: "A" },
        title: "Bệnh trào ngược dạ dày - thực quản",
        level: "Thấp",
        advice: "Chia nhỏ bữa ăn, hạn chế đồ chua cay, dầu mỡ, cà phê. Không nằm ngay trong vòng 2 giờ sau khi ăn. Khám tiêu hóa nếu triệu chứng kéo dài."
      },
      {
        conditions: { 5: "A", 6: "A" },
        title: "Nhiễm khuẩn đường tiết niệu",
        level: "Trung bình",
        advice: "Uống nhiều nước. Đến khám chuyên khoa Tiết niệu để xét nghiệm nước tiểu và dùng kháng sinh phù hợp."
      },
      {
        conditions: { 0: "B", 7: "A", 9: "A" },
        title: "Viêm loét dạ dày - tá tràng",
        level: "Trung bình",
        advice: "Đi khám chuyên khoa Tiêu hóa để thực hiện nội soi dạ dày và test vi khuẩn HP (Helicobacter pylori). Tránh dùng các thuốc giảm đau hạ sốt nhóm NSAID/Aspirin."
      },
      {
        conditions: { 0: "C", 5: "A", 6: "A" },
        title: "Sỏi thận",
        level: "Cao",
        advice: "Đến bệnh viện siêu âm hệ tiết niệu và chụp X-quang/CT để xác định kích thước sỏi. Uống nhiều nước và dùng thuốc giảm đau, giãn cơ theo chỉ định của bác sĩ."
      }
    ],
    fallback: {
      title: "Chưa xác định được bệnh lý",
      advice: "Chưa đủ căn cứ lâm sàng để xác định bệnh. Theo dõi cơ thể trong 24-48 giờ. Nếu xuất hiện sốt cao hoặc đau bụng dữ dội tăng dần, cần đến gặp bác sĩ để thăm khám trực tiếp.",
      level: "Thấp"
    }
  },
  {
    id: "dau-dau",
    name: "Đau đầu",
    image: "images/dau-dau.png",
    questions: [
      { title: "1. Bạn đau đầu ở vị trí và có cảm giác như thế nào?", options: [{ key: "A", text: "Đau giật theo nhịp mạch 1 bên đầu" }, { key: "B", text: "Đau âm ỉ như bị siết chặt 2 bên" }, { key: "C", text: "Đau nặng vùng trán/gò má" }, { key: "D", text: "Không đau đầu" }] },
      { title: "2. Bạn có bị sợ ánh sáng, sợ tiếng động mạnh, buồn nôn khi đau đầu không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "3. Bạn có bị nghẹt mũi, chảy mũi mủ xanh/vàng, đau hơn khi cúi đầu về phía trước không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "4. Cơ thể/vòm miệng/tay chân bạn có xuất hiện nốt mụn nước hay mẩn đỏ không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "5. Đau đầu có xuất hiện cùng lúc với mỏi cổ vai gáy, làm việc máy tính lâu hoặc mất ngủ không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "6. Bạn có bị chóng mặt, hoa mắt, ù tai, hồi hộp đánh trống ngực không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "7. (Nếu đo được) Huyết áp tâm thu của bạn có vượt quá 140 mmHg (hoặc >180 mmHg) không?", options: [{ key: "A", text: "Có (>140 mmHg)" }, { key: "B", text: "Bình thường / Không đo" }] },
      { title: "8. Bạn có tiền sử Tăng huyết áp, Đột quỵ hoặc Bệnh tim mạch mạn tính không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] }
    ],
    results: [
      {
        conditions: { 0: "A", 1: "A" },
        title: "Đau đầu nửa đầu",
        level: "Trung bình",
        advice: "Dùng thuốc giảm đau theo chỉ định, nghỉ ngơi trong phòng tối và yên tĩnh. Tránh các yếu tố kích thích như ánh sáng gắt và tiếng ồn lớn."
      },
      {
        conditions: { 0: "B", 4: "A" },
        title: "Đau đầu căng thẳng",
        level: "Thấp",
        advice: "Thư giãn cơ thể, xoa bóp vùng thái dương và cổ vai gáy, hạn chế nhìn màn hình điện tử liên tục, đảm bảo ngủ đủ giấc."
      },
      {
        conditions: { 5: "A", 6: "A" },
        title: "Tăng huyết áp",
        level: "Cao",
        advice: "Nằm nghỉ tĩnh lặng 15–30 phút rồi đo lại. Nếu HA duy trì từ 140-179 mmHg, cần đến phòng khám Tim mạch. Nếu HA >= 180 mmHg hoặc kèm tê yếu tay chân, mờ mắt, đau ngực, cần gọi cấp cứu ngay."
      },
      {
        conditions: { 0: "C", 2: "A" },
        title: "Viêm xoang cấp tính",
        level: "Trung bình",
        advice: "Rửa mũi bằng nước muối sinh lý, xông mũi ấm. Đến khám Tai-Mũi-Họng nếu đau nhức vùng trán/gò má kéo dài trên 7 ngày hoặc chảy mủ xanh/vàng để bác sĩ kê đơn kháng sinh/kháng viêm."
      }
    ],
    fallback: {
      title: "Chưa xác định được bệnh lý",
      advice: "Chưa đủ căn cứ lâm sàng để xác định bệnh. Theo dõi cơ thể trong 24-48 giờ. Nếu đau đầu dữ dội không giảm, cần đến gặp bác sĩ để thăm khám trực tiếp.",
      level: "Thấp"
    }
  },
  {
    id: "co-xuong-khop",
    name: "Đau cơ/xương/khớp",
    image: "images/dau-co-xuong-khop.jpg",
    questions: [
      { title: "1. Vị trí khó chịu nhất của bạn ở đâu?", options: [{ key: "A", text: "Khớp ngón chân cái/cổ chân" }, { key: "B", text: "Các khớp nhỏ ở cổ tay/ngón tay (cả 2 bên)" }, { key: "C", text: "Khớp gối / Cột sống thắt lưng / Cổ vai gáy" }, { key: "D", text: "Một khớp duy nhất kèm sưng to tấy đỏ" }] },
      { title: "2. Cơn đau từ thắt lưng/mông có lan xuống đùi, bắp chân, bàn chân kèm cảm giác tê bì, châm chích không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "3. Khớp có bị sưng tấy, nóng đỏ, đau dữ dội đột ngột (đến mức chạm nhẹ cũng đau) không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "4. Khớp sưng đau to có kèm theo sốt cao, rét run, mệt mỏi lơ mơ không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "5. Bạn có bị cứng khớp vào buổi sáng sau khi ngủ dậy, kéo dài trên 30 phút mới vận động lại được không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "6. Cơn đau có tăng lên khi cúi người, bê nặng, đi lại và giảm khi nằm nghỉ phẳng lưng không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "7. Cơn đau tấy khớp có khởi phát ngay sau một bữa ăn nhiều đạm (hải sản, nội tạng, thịt đỏ) hoặc uống rượu bia không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "8. Đau mỏi có xuất hiện toàn thân kèm theo cảm giác sốt siêu vi/cảm cúm không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "9. Bạn có phải nam giới trung niên, người cao tuổi (>50 tuổi) hoặc có công việc phải ngồi lâu/mang vác nặng không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] },
      { title: "10. Bạn có tiền sử bệnh Gút, Tăng Acid Uric, Bệnh thận mạn, Tiểu đường hoặc Suy giảm miễn dịch không?", options: [{ key: "A", text: "Có" }, { key: "B", text: "Không" }] }
    ],
    results: [
      {
        conditions: { 0: "A", 2: "A", 6: "A" },
        title: "Bệnh Gút",
        level: "Trung bình",
        advice: "Khám chuyên khoa Cơ-Xương-Khớp. Chườm lạnh nhẹ, kê cao chân. Không tự ý dùng thuốc giảm đau NSAIDs nếu có tiền sử bệnh thận hay đái tháo đường."
      },
      {
        conditions: { 0: ["B", "C"], 4: "A" },
        title: "Viêm khớp dạng thấp / Thoái hóa khớp",
        level: "Trung bình",
        advice: "Đi khám chuyên khoa Cơ-Xương-Khớp để chụp X-quang và làm xét nghiệm miễn dịch. Tránh mang vác nặng hoặc vận động sai tư thế."
      },
      {
        conditions: { 0: "C", 1: "A", 5: "A" },
        title: "Thoát vị đĩa đệm / Đau thần kinh tọa",
        level: "Cao",
        advice: "Tránh cúi gập lưng đột ngột. Nằm nghỉ trên bề mặt phẳng cứng. Khám chuyên khoa Cột sống / Thần kinh để chụp cột sống thắt lưng nếu tê bì chân tăng dần."
      },
      {
        conditions: { 0: "D", 2: "A", 3: "A" },
        title: "Viêm khớp nhiễm khuẩn",
        level: "Cấp cứu",
        advice: "Khám chuyên khoa Cơ-Xương-Khớp gấp. Cần xét nghiệm máu và chọc hút dịch khớp kiểm tra vi khuẩn để tránh nguy cơ hủy khớp hoặc nhiễm trùng huyết."
      }
    ],
    fallback: {
      title: "Chưa xác định được bệnh lý",
      advice: "Chưa đủ căn cứ lâm sàng để xác định bệnh. Theo dõi cơ thể trong 24-48 giờ. Nếu tình trạng đau nhức nặng lên, cần đến gặp bác sĩ để thăm khám trực tiếp.",
      level: "Thấp"
    }
  }
];