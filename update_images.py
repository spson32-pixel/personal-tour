import json
import os

# 문화유산별 실제 사진 URL 매핑 (CC 라이선스 또는 공개 도메인 이미지)
image_urls = {
    "seoul-001": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Gyeongbokgung_Palace%2C_Seoul%2C_Korea_%2854425254401%29.jpg/1280px-Gyeongbokgung_Palace%2C_Seoul%2C_Korea_%2854425254401%29.jpg",  # 경복궁
    "seoul-002": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Changdeokgung_Palace%2C_Seoul%2C_Korea_%2854425258016%29.jpg/1280px-Changdeokgung_Palace%2C_Seoul%2C_Korea_%2854425258016%29.jpg",  # 창덕궁
    "seoul-003": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Deoksu_Palace%2C_Seoul.jpg/1280px-Deoksu_Palace%2C_Seoul.jpg",  # 덕수궁
    "seoul-004": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Gyeonghuigung_Palace%2C_Seoul%2C_Korea.jpg/1280px-Gyeonghuigung_Palace%2C_Seoul%2C_Korea.jpg",  # 경희궁
    "seoul-005": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Changgyeonggung_Palace_(Seoul).jpg/1280px-Changgyeonggung_Palace_(Seoul).jpg",  # 창경궁
    "seoul-006": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Bukchon_Hanok_Village_20180425_%28Seoul%2C_Korea%29_02.jpg/1280px-Bukchon_Hanok_Village_20180425_%28Seoul%2C_Korea%29_02.jpg",  # 북촌한옥마을
    "seoul-007": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Namsan_Hanok_Village%2C_Seoul%2C_Korea_05.jpg/1280px-Namsan_Hanok_Village%2C_Seoul%2C_Korea_05.jpg",  # 남산골한옥마을
    "seoul-008": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Insadong_street.jpg/1280px-Insadong_street.jpg",  # 인사동
    "seoul-009": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Seoul_National_Museum_exterior%2C_Seoul%2C_Korea_06.jpg/1280px-Seoul_National_Museum_exterior%2C_Seoul%2C_Korea_06.jpg",  # 국립중앙박물관
    "seoul-010": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/National_Folk_Museum_of_Korea%2C_Seoul.JPG/1280px-National_Folk_Museum_of_Korea%2C_Seoul.JPG",  # 국립민속박물관
    "seoul-011": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Seoul_Forest_%28drone_photo%29.jpg/1280px-Seoul_Forest_%28drone_photo%29.jpg",  # 서울숲
    "seoul-012": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Cherry_blossoms_0509_%282%29.JPG/1280px-Cherry_blossoms_0509_%282%29.JPG",  # 여의도공원
    "seoul-013": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Seoul_Tower_%282007%29.jpg/1280px-Seoul_Tower_%282007%29.jpg",  # 남산타워
    "seoul-014": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Cheonggyecheon_-_panoramio_%281%29.jpg/1280px-Cheonggyecheon_-_panoramio_%281%29.jpg",  # 청계천
    "seoul-015": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/HangangPark%2C_Yeouido.jpg/1280px-HangangPark%2C_Yeouido.jpg",  # 한강시민공원
    "seoul-016": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Gwanghwamun_2.JPG/1280px-Gwanghwamun_2.JPG",  # 광화문
    "seoul-017": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Dongdaemun_Design_Plaza_%282%29.jpg/1280px-Dongdaemun_Design_Plaza_%282%29.jpg",  # 동대문역사문화공원
    "seoul-018": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Myeongdong_Cathedral%2C_Seoul%2C_Korea_01.jpg/1280px-Myeongdong_Cathedral%2C_Seoul%2C_Korea_01.jpg",  # 명동성당
    "seoul-019": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Seodaemun_Prison_History_Hall_06.jpg/1280px-Seodaemun_Prison_History_Hall_06.jpg",  # 서대문형무소역사관
    "seoul-020": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Cheongwadae%2C_Seoul%2C_Korea.jpg/1280px-Cheongwadae%2C_Seoul%2C_Korea.jpg",  # 청와대
    "seoul-021": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Bugaksan_Wall.jpg/1280px-Bugaksan_Wall.jpg",  # 북악산
    "seoul-022": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Bukhansan_National_Park_-_Gate_01.jpg/1280px-Bukhansan_National_Park_-_Gate_01.jpg",  # 북한산
    "seoul-023": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Dobongsan_Mountains.JPG/1280px-Dobongsan_Mountains.JPG",  # 도봉산
    "seoul-024": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Gwanaksan_001.jpg/1280px-Gwanaksan_001.jpg",  # 관악산
    "seoul-025": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Seoul_Grand_Park_entry_gate.jpg/1280px-Seoul_Grand_Park_entry_gate.jpg",  # 서울대공원
    "seoul-026": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Gwacheon_Seoul_Grand_Park_Lake.jpg/1280px-Gwacheon_Seoul_Grand_Park_Lake.jpg",  # 과천대공원
    "seoul-027": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Seoul_Children%27s_Grand_Park_04.jpg/1280px-Seoul_Children%27s_Grand_Park_04.jpg",  # 어린이대공원
    "seoul-028": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Seoul_Olympic_Park_Mongjuchon.JPG/1280px-Seoul_Olympic_Park_Mongjuchon.JPG",  # 올림픽공원
    "seoul-029": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Haneul_Park_%28drone_photo%29.jpg/1280px-Haneul_Park_%28drone_photo%29.jpg",  # 월드컵공원
    "seoul-030": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Seokchon_Lake_-_panoramio.jpg/1280px-Seokchon_Lake_-_panoramio.jpg",  # 석촌호수
    "gyeonggi-001": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Hwaseong_Fortress%2C_Suwon_South_Korea_01.jpg/1280px-Hwaseong_Fortress%2C_Suwon_South_Korea_01.jpg",  # 수원화성
    "gyeonggi-002": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Suwon_Hwaseong_Haenggung.jpg/1280px-Suwon_Hwaseong_Haenggung.jpg",  # 수원화성행궁
    "gyeonggi-003": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Imjin-gak_Peace_Park.jpg/1280px-Imjin-gak_Peace_Park.jpg",  # 파주임진각
    "gyeonggi-004": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Paju_Book_City_01.jpg/1280px-Paju_Book_City_01.jpg",  # 파주출판도시
    "gyeonggi-005": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Heyri_Art_Village_Korea.jpg/1280px-Heyri_Art_Village_Korea.jpg",  # 헤이리
    "gyeonggi-006": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Dumulgyeong_Yangpyeong.jpg/1280px-Dumulgyeong_Yangpyeong.jpg",  # 양평두물경
    "gyeonggi-007": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Namhansanseong_fortress_wall.jpg/1280px-Namhansanseong_fortress_wall.jpg",  # 남한산성
    "gyeonggi-008": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Korean_Folk_Village_traditional_courtyard.jpg/1280px-Korean_Folk_Village_traditional_courtyard.jpg",  # 한국민속촌
    "gyeonggi-009": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Everland_Theme_Park_Korea.jpg/1280px-Everland_Theme_Park_Korea.jpg",  # 에버랜드
    "gyeonggi-010": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Caribbean_Bay_Water_Park.jpg/1280px-Caribbean_Bay_Water_Park.jpg",  # 캐리비안베이
    "gyeonggi-011": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Pocheon_Sanjeong_Lake.jpg/1280px-Pocheon_Sanjeong_Lake.jpg",  # 포천산정호수
    "gyeonggi-012": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Jara_Island.jpg/1280px-Jara_Island.jpg",  # 가평자라섬
    "gyeonggi-013": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Nami_Island_Metasequoia_Garden.jpg/1280px-Nami_Island_Metasequoia_Garden.jpg",  # 남이섬
    "gyeonggi-014": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Chungpyeong_Lake.jpg/1280px-Chungpyeong_Lake.jpg",  # 청평호
    "gyeonggi-015": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Hwadamsum_Botanical_Garden.jpg/1280px-Hwadamsum_Botanical_Garden.jpg",  # 화담숲
}

def update_heritage_images():
    """heritages.json의 이미지 URL을 실제 문화유산 사진으로 업데이트"""
    file_path = "lib/data/heritages.json"
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            heritages = json.load(f)
        
        updated_count = 0
        
        for heritage in heritages:
            heritage_id = heritage.get('id')
            if heritage_id in image_urls:
                if heritage['image'] != image_urls[heritage_id]:
                    print(f"업데이트: {heritage['name']} ({heritage_id})")
                    print(f"  기존: {heritage['image']}")
                    print(f"  변경: {image_urls[heritage_id]}")
                    heritage['image'] = image_urls[heritage_id]
                    updated_count += 1
        
        # 업데이트된 데이터를 파일에 저장
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(heritages, f, ensure_ascii=False, indent=2)
        
        print(f"\n총 {updated_count}개의 문화유산 이미지가 업데이트되었습니다.")
        print(f"저장 경로: {file_path}")
        
    except FileNotFoundError:
        print(f"파일을 찾을 수 없습니다: {file_path}")
    except json.JSONDecodeError:
        print("JSON 파일 형식이 잘못되었습니다.")
    except Exception as e:
        print(f"오류 발생: {e}")

if __name__ == "__main__":
    update_heritage_images()
