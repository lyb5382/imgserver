import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema({
    customPath: { type: String, required: true, unique: true },
    directUrl: { type: String, required: true }
});
const Link = mongoose.models.Link || mongoose.model('Link', linkSchema);

// DB 연결 캐싱 (서버리스 환경 필수 최적화)
const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGODB_URI); // ⚠️ 환경변수 쓸 거임!
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('POST만 받는다 씨발');

    try {
        await connectDB();
        const { customPath, directUrl } = req.body;

        // 같은 주소로 올리면 기존 짤 덮어씌우게 설정 (upsert)
        await Link.findOneAndUpdate(
            { customPath },
            { directUrl },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'DB 저장하다 뻗음' });
    }
}