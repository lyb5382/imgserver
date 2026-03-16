import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema({
    customPath: { type: String, required: true, unique: true },
    directUrl: { type: String, required: true }
});
const Link = mongoose.models.Link || mongoose.model('Link', linkSchema);

const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGODB_URI);
};

export default async function handler(req, res) {
    // 들어온 주소 낚아채기 (예: /ed/캐릭터/1)
    const customPath = decodeURIComponent(req.url.split('?')[0].substring(1));

    try {
        await connectDB();
        const link = await Link.findOne({ customPath });

        if (link) {
            // CDN 캐싱 걸어서 속도 미치게 만들기
            res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
            res.redirect(301, link.directUrl);
        } else {
            res.status(404).send('씨발, 짤이 없거나 주소가 틀렸어 파트너.');
        }
    } catch (error) {
        res.status(500).send('서버 뻗음. 긴급 복구 필요.');
    }
}