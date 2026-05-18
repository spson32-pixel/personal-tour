const fs = require('fs');
const path = require('path');

const imageUrls = {
    "seoul-001": "https://images.unsplash.com/photo-1591286351328-c5b92dc63f31?w=1280&h=960&fit=crop",
    "seoul-002": "https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=1280&h=960&fit=crop",
    "seoul-003": "https://images.unsplash.com/photo-1588070300943-0a3a517f3fa7?w=1280&h=960&fit=crop",
    "seoul-004": "https://images.unsplash.com/photo-1586786343720-4f39590a8193?w=1280&h=960&fit=crop",
    "seoul-005": "https://images.unsplash.com/photo-1568668392383-58b1ebc9fd8c?w=1280&h=960&fit=crop",
    "seoul-006": "https://images.unsplash.com/photo-1533929736472-79499a8d9e72?w=1280&h=960&fit=crop",
    "seoul-007": "https://images.unsplash.com/photo-1508669232496-895e1003f077?w=1280&h=960&fit=crop",
    "seoul-008": "https://images.unsplash.com/photo-1570654291229-0d46c00a2c92?w=1280&h=960&fit=crop",
    "seoul-009": "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=1280&h=960&fit=crop",
    "seoul-010": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1280&h=960&fit=crop",
    "seoul-011": "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=1280&h=960&fit=crop",
    "seoul-012": "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1280&h=960&fit=crop",
    "seoul-013": "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1280&h=960&fit=crop",
    "seoul-014": "https://images.unsplash.com/photo-1508669232496-895e1003f077?w=1280&h=960&fit=crop",
    "seoul-015": "https://images.unsplash.com/photo-1538669718145-054ce5d87735?w=1280&h=960&fit=crop",
    "seoul-016": "https://images.unsplash.com/photo-1589979480101-a26d836b64f0?w=1280&h=960&fit=crop",
    "seoul-017": "https://images.unsplash.com/photo-1564450352987-0a5243c67e04?w=1280&h=960&fit=crop",
    "seoul-018": "https://images.unsplash.com/photo-1548625361-9882cf96bcdb?w=1280&h=960&fit=crop",
    "seoul-019": "https://images.unsplash.com/photo-1523897056079-5553b57112d4?w=1280&h=960&fit=crop",
    "seoul-020": "https://images.unsplash.com/photo-1589979480101-a26d836b64f0?w=1280&h=960&fit=crop",
    "seoul-021": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=960&fit=crop",
    "seoul-022": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1280&h=960&fit=crop",
    "seoul-023": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1280&h=960&fit=crop",
    "seoul-024": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1280&h=960&fit=crop",
    "seoul-025": "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=1280&h=960&fit=crop",
    "seoul-026": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1280&h=960&fit=crop",
    "seoul-027": "https://images.unsplash.com/photo-1540479859555-17af45c78602?w=1280&h=960&fit=crop",
    "seoul-028": "https://images.unsplash.com/photo-1564429238285-381f17f8c4ef?w=1280&h=960&fit=crop",
    "seoul-029": "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1280&h=960&fit=crop",
    "seoul-030": "https://images.unsplash.com/photo-1533929736472-79499a8d9e72?w=1280&h=960&fit=crop",
    "gyeonggi-001": "https://images.unsplash.com/photo-1542076786-2d2c0a7324f4?w=1280&h=960&fit=crop",
    "gyeonggi-002": "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=1280&h=960&fit=crop",
    "gyeonggi-003": "https://images.unsplash.com/photo-1528164344705-47542687000d?w=1280&h=960&fit=crop",
    "gyeonggi-004": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1280&h=960&fit=crop",
    "gyeonggi-005": "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=1280&h=960&fit=crop",
    "gyeonggi-006": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1280&h=960&fit=crop",
    "gyeonggi-007": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1280&h=960&fit=crop",
    "gyeonggi-008": "https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=1280&h=960&fit=crop",
    "gyeonggi-009": "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?w=1280&h=960&fit=crop",
    "gyeonggi-010": "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=1280&h=960&fit=crop",
    "gyeonggi-011": "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1280&h=960&fit=crop",
    "gyeonggi-012": "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1280&h=960&fit=crop",
    "gyeonggi-013": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1280&h=960&fit=crop",
    "gyeonggi-014": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1280&h=960&fit=crop",
    "gyeonggi-015": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1280&h=960&fit=crop",
};

function updateHeritageImages() {
    const filePath = path.join(__dirname, 'lib', 'data', 'heritages.json');
    
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        const heritages = JSON.parse(data);
        
        let updatedCount = 0;
        
        heritages.forEach(heritage => {
            const id = heritage.id;
            if (imageUrls[id]) {
                if (heritage.image !== imageUrls[id]) {
                    console.log(`업데이트: ${heritage.name} (${id})`);
                    heritage.image = imageUrls[id];
                    updatedCount++;
                }
            }
        });
        
        fs.writeFileSync(filePath, JSON.stringify(heritages, null, 2), 'utf-8');
        
        console.log(`\n✓ 총 ${updatedCount}개의 문화유산 이미지가 업데이트되었습니다.`);
        console.log(`✓ Unsplash의 고품질 이미지로 변경 완료!`);
        console.log(`✓ 저장 경로: ${filePath}`);
        
    } catch (error) {
        console.error('오류 발생:', error.message);
        process.exit(1);
    }
}

updateHeritageImages();
