import http.server
import socketserver
import json
import os

PORT = 8000

class HealthPlatformHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 允许跨域（以便在开发阶段支持各种形式的调试）
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def do_POST(self):
        if self.path == '/api/chat':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            req = json.loads(post_data.decode('utf-8'))
            
            user_msg = req.get('message', '')
            constitution = req.get('constitution', {})
            current_lvl = req.get('currentLvl', 1)
            
            # 模拟中西医AI大模型决策并生成回复与商品联动ID
            reply, recommended_product_id = self.generate_ai_reply(user_msg, constitution, current_lvl)
            
            response = {
                'reply': reply,
                'recommendedProductId': recommended_product_id
            }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def generate_ai_reply(self, message, constitution, current_lvl):
        message_lower = message.lower()
        
        # 计算当前得分最高的中医体质
        max_const = '平和质'
        max_score = 0
        for k, v in constitution.items():
            if v > max_score:
                max_score = v
                max_const = k
                
        reply = f"您好，我是您的主动健康AI助手。已读取您的多模态生理特征与中医体质分型（当前最高分偏向：**{max_const}**，健康评级：{'良' if current_lvl <= 2 else '待调理'}）。\n\n"
        prod_id = None
        
        # 针对消息关键词进行智能辩证分析
        if any(x in message_lower for x in ["气虚", "疲劳", "累", "没劲", "乏力"]) or (max_const == "气虚质" and "调理" in message_lower):
            reply += "针对您的疲劳气虚状态，中医认为气为血之帅，气不足则脏腑功能减退、神疲体倦。建议进行**益气健脾、固表养血**调理。\n\n"
            reply += "1. **膳食调理**：宜用黄芪、大枣、人参、黄精炖汤，忌过度辛辣耗气。\n"
            reply += "2. **穴位经络**：每日按揉**足三里穴**（外膝眼下三寸）和**气海穴**（脐下一点五寸）各3-5分钟，以产生微热酸胀感为宜。\n"
            reply += "3. **健康运动**：气虚者忌汗出如雨、过度运动，建议结合智能手表监测心率，做温和的**八段锦（首选“双手托天理三焦”式）**进行舒展。"
            prod_id = "prod1"  # 怀泉养生草本茶 (含黄芪大枣)
            
        elif any(x in message_lower for x in ["湿", "痰", "重", "黏", "水肿"]) or (max_const == "痰湿质" and "调理" in message_lower):
            reply += "针对您关注的湿气重问题，中医辨证为脾虚湿盛。脾不运湿则积聚成痰。建议进行**健脾祛湿、温阳化气**调理。\n\n"
            reply += "1. **膳食调理**：多食用赤小豆、薏苡仁、茯苓、芡实等。避免冷饮、甜食、油炸食品，防止因“胃不和”导致湿浊内生。\n"
            reply += "2. **经络调理**：每日下午点按**阴陵泉穴**与**丰隆穴**（化痰要穴），每个穴位按压2-3分钟，促进体内湿气排泄。\n"
            reply += "3. **手表联动**：建议通过穿戴设备关注运动心率，保持每日健走40分钟，微微出汗以宣化体内湿浊。"
            prod_id = "prod2"  # 人参黄精膏 (健脾祛湿)
            
        elif any(x in message_lower for x in ["失眠", "睡", "多梦", "易醒", "焦虑"]) or "睡眠" in message_lower:
            reply += "睡眠是人体阴阳交替的重要过程。您提到的失眠多梦，多由心神失养、胃不和或肾水不足导致心火上炎所致。调理应注重**宁心安神、通调气血**。\n\n"
            reply += "1. **药浴温通**：推荐使用艾草、老姜等温经通络药包进行中药足浴，临睡前21:00左右泡脚15-20分钟，引火归元，改善下肢循环。\n"
            reply += "2. **经络穴位**：睡前平躺后，点按**神门穴**（手腕横纹尺侧端）和双脚**涌泉穴**各50次，静心呼吸。\n"
            reply += "3. **生活作息**：手表监测显示您的深睡比例待优化。建议睡前1小时关闭电子屏幕，做3组深长腹式呼吸助眠。"
            prod_id = "prod3"  # 御草堂艾草老姜足浴包
            
        elif any(x in message_lower for x in ["胸闷", "心脏", "心悸", "不舒服"]):
            reply += "⚠️ **健康风险提示**：心主血脉。若您感到明显胸闷、心悸，应密切留意。若症状持续或加重，请立即前往专科就诊。\n\n"
            reply += "1. **应急自救**：建议立即平静坐下或平卧，舌下含服硝酸甘油或速效救心丸。可尝试按压**内关穴**（腕横纹上二寸，两筋之间）和**极泉穴**（腋窝顶点）以暂时缓解憋闷感。\n"
            reply += "2. **硬件联动**：建议持续订阅智能心电监测。系统已将心电图数据监测频率调整，若血氧持续低于92%或静息心率异常骤增，系统将自动触发五级红色紧急呼叫程序。"
            prod_id = "prod3"
            
        else:
            reply += f"根据您当前的体质画像 **{max_const}**，建议节制饮食、防风御寒。\n\n"
            reply += "💡 **您可以尝试以下操作以获取更精准的建议**：\n"
            reply += "- 点击左侧的 **“中医特色辨识”** 加载舌象并运行AI提取。\n"
            reply += "- 在右侧点击演练 **“糖尿病前期 (四级)”** 或 **“心血管急救 (五级)”** 观察大屏数据流向。\n"
            reply += "- 输入具体的症状，如：*“最近老是失眠怎么办”* 或 *“我总觉得累”*。"
            
        return reply, prod_id

if __name__ == '__main__':
    web_dir = os.path.join(os.path.dirname(__file__))
    os.chdir(web_dir)
    
    # 尽量使用多线程的 ThreadingHTTPServer 以支持高并发的异步 Fetch 请求
    try:
        from http.server import ThreadingHTTPServer
        server_class = ThreadingHTTPServer
    except ImportError:
        server_class = socketserver.TCPServer
        
    handler = HealthPlatformHandler
    socketserver.TCPServer.allow_reuse_address = True
    
    print(f"Active Health AI Server starting on port {PORT}...")
    print(f"Serving files from: {web_dir}")
    
    with server_class(("", PORT), handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
