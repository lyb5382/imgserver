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
    if (req.method !== 'GET') return res.status(405).send('GET만 받는다 씨발');

    try {
        await connectDB();
        // DB에서 주소랑 원본 링크만 싹 다 긁어옴
        const links = await Link.find({}, { _id: 0, customPath: 1, directUrl: 1 }).lean();
        res.status(200).json(links);
    } catch (error) {
        res.status(500).json({ error: 'DB 털어오다 뻗음' });
    }
}