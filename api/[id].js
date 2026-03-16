export default async function handler(req, res) {
    const { id } = req.query;

    // 파비콘 요청 같은 쓸데없는 트래픽은 가볍게 컷
    if (id === 'favicon.ico') return res.status(404).end();

    try {
        // 작전명: 스크래핑. Imgbb 페이지를 몰래 긁어온다.
        const response = await fetch(`https://ibb.co/${id}`);
        const html = await response.text();

        // 정규식으로 HTML 더미 속에서 '원본 짤 다이렉트 링크'만 쏙 뽑아내기
        const match = html.match(/<link rel="image_src" href="(.*?)"/);

        if (match && match[1]) {
            // CDN 캐싱 빡세게 걸어서 다음 놈부턴 더 빠르게 접속되게 세팅 (성능 최적화)
            res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
            // 원본 이미지 링크로 다이렉트 301 리다이렉트 빡!
            res.redirect(301, match[1]);
        } else {
            res.status(404).send('이미지가 없거나 지워졌어!!!');
        }
    } catch (error) {
        res.status(500).send('서버 뻗음. 긴급 복구 필요.');
    }
}