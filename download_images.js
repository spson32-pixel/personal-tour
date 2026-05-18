const https = require('https');
const fs = require('fs');
const path = require('path');

// 국가유산청 공식 배경화면 이미지 URL
const imageUrls = {
    "seoul-001": "https://www.khs.go.kr/images/etc/walll/wall01_1920.jpg", // 경복궁 흥례문 야간
    "seoul-002": "https://www.khs.go.kr/images/etc/walll/wall04_1920.jpg", // 창덕궁 부용정
    "seoul-003": "https://www.khs.go.kr/images/etc/walll/wall16_1920.jpg", // 덕수궁 석조전 전경 겨울
    "seoul-005": "https://www.khs.go.kr/images/etc/walll/wall06_1920.jpg", // 창경궁 전체전경 가을
    "seoul-016": "https://www.khs.go.kr/images/etc/walll/wall03_1920.jpg", // 경복궁 광화문 야경 가을
    "gyeonggi-001": "https://www.khs.go.kr/images/etc/walll/wall19_1920.jpg", // 수원 화성
};

const imagesDir = path.join(__dirname, 'public', 'images');

function downloadImage(id, url) {
    return new Promise((resolve, reject) => {
        const filename = `${id}.jpg`;
        const filepath = path.join(imagesDir, filename);
        const file = fs.createWriteStream(filepath);

        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                return reject(new Error(`HTTP ${response.statusCode} for ${url}`));
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`✓ 공식 이미지 다운로드 완료: ${id}.jpg`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => {});
            reject(err);
        });
    });
}

async function downloadAllImages() {
    console.log('🌐 공식 사이트 이미지 다운로드 시작...\n');

    try {
        const ids = Object.keys(imageUrls);
        let completed = 0;

        for (let i = 0; i < ids.length; i += 2) {
            const batch = ids.slice(i, i + 2);
            await Promise.all(batch.map(id => downloadImage(id, imageUrls[id])));
            completed += batch.length;
            console.log(`진행률: ${completed}/${ids.length}`);
        }

        console.log(`\n✅ 공식 사이트 이미지 ${ids.length}개 다운로드 완료!\n`);
        updateHeritagesJson();

    } catch (error) {
        console.error('❌ 다운로드 오류:', error.message);
        process.exit(1);
    }
}

function updateHeritagesJson() {
    const filePath = path.join(__dirname, 'lib', 'data', 'heritages.json');

    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        const heritages = JSON.parse(data);

        let updateCount = 0;
        heritages.forEach(heritage => {
            const id = heritage.id;
            if (imageUrls[id]) {
                heritage.image = `/images/${id}.jpg`;
                updateCount++;
            }
        });

        fs.writeFileSync(filePath, JSON.stringify(heritages, null, 2), 'utf-8');

        console.log(`📝 heritages.json 업데이트 완료!`);
        console.log(`✅ 총 ${updateCount}개의 항목이 공식 이미지로 변경되었습니다.`);

    } catch (error) {
        console.error('❌ JSON 업데이트 오류:', error.message);
        process.exit(1);
    }
}

downloadAllImages();
