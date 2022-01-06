--[[
ģ�����ƣ���ά�����ɲ���ʾ����Ļ��
ģ������޸�ʱ�䣺2020.3.31
]]

module(...,package.seeall)

--LCD�ֱ��ʵĿ�Ⱥ͸߶�(��λ������)
local WIDTH, HEIGHT = 132,162

--- qrencode.encode(string) ������ά����Ϣ
-- @param string ��ά���ַ���
-- @return width ���ɵĶ�ά����Ϣ���
-- @return data ���ɵĶ�ά������
-- @usage local width, data = qrencode.encode("http://www.openluat.com")
local width, data = qrencode.encode('http://www.openluat.com')

--- disp.putqrcode(data, width, display_width, x, y) ��ʾ��ά��
-- @param data ��qrencode.encode���صĶ�ά������
-- @param width ��ά�����ݵ�ʵ�ʿ��
-- @param display_width ��ά��ʵ����ʾ���,��ʾ��ȿ�������Ҫ������
-- @param x ��ά����ʾ��ʼ����x
-- @param y ��ά����ʾ��ʼ����y

--- ��ά����ʾ����
local function appQRCode()
	disp.clear()
    local displayWidth = 100
    disp.putqrcode(data, width, displayWidth, (WIDTH-displayWidth)/2, (HEIGHT-displayWidth)/2)
	disp.update()	
end

appQRCode()
