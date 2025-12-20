"""
CCTV 좌표와 교통정보 linkId를 매핑하는 스크립트

원리:
1. CCTV는 (경도, 위도) 좌표만 가지고 있음
2. 교통정보 API는 linkId로만 제공됨
3. 노드링크 Shapefile에는 각 linkId의 실제 도로 좌표가 LineString으로 저장됨
4. CCTV 좌표에서 가장 가까운 도로 링크를 찾아서 매핑

사용법:
    cd frontend
    python python-scripts/map-cctv-to-traffic.py
"""

import json
import geopandas as gpd
from shapely.geometry import Point

from paths import CCTV_DATA_FILE, CCTV_DATA_WITH_LINKS_FILE, NODELINK_SHAPEFILE


def load_cctv_data(cctv_path):
    """CCTV 데이터 로드"""
    print(f"CCTV 데이터 로드: {cctv_path}")
    with open(cctv_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    cctv_list = data['response']['data']
    print(f"  총 {len(cctv_list)}개 CCTV\n")
    return data, cctv_list


def load_nodelink_shapefile(shapefile_path):
    """노드링크 Shapefile 로드 (도로 좌표 포함)"""
    print(f"노드링크 데이터 로드: {shapefile_path}")

    gdf = gpd.read_file(shapefile_path, encoding='cp949')

    if gdf.crs.to_epsg() != 4326:
        print("  좌표계 변환: WGS84")
        gdf = gdf.to_crs(epsg=4326)

    print(f"  총 {len(gdf):,}개 링크")
    print(f"  좌표계: {gdf.crs}\n")

    return gdf


def find_nearest_link(cctv_point, links_gdf, sindex, max_distance_km=0.5):
    """CCTV 좌표에서 가장 가까운 도로 링크 찾기 (공간 인덱스 사용)"""
    buffer_deg = max_distance_km / 111.0
    buffer = cctv_point.buffer(buffer_deg)

    possible_matches_index = list(sindex.intersection(buffer.bounds))

    if not possible_matches_index:
        return None

    possible_matches = links_gdf.iloc[possible_matches_index]
    distances = possible_matches.geometry.distance(cctv_point)

    min_idx = distances.idxmin()
    nearest = links_gdf.loc[min_idx]

    distance_km = distances[min_idx] * 111

    if distance_km > max_distance_km:
        return None

    return {
        'linkId': nearest['LINK_ID'],
        'roadName': nearest.get('ROAD_NAME', ''),
        'distance': round(distance_km, 3)
    }


def map_cctv_to_links(cctv_list, links_gdf, max_distance_km=0.5):
    """모든 CCTV를 링크에 매핑"""
    print("공간 인덱스 생성 중... (1회만)")
    sindex = links_gdf.sindex
    print("완료!\n")

    print("CCTV → 링크 매핑 시작...")
    print(f"최대 검색 거리: {max_distance_km}km\n")

    matched_count = 0

    for idx, cctv in enumerate(cctv_list):
        if (idx + 1) % 100 == 0:
            print(f"진행: {idx + 1:,}/{len(cctv_list):,} ({idx + 1 / len(cctv_list) * 100:.1f}%)")

        cctv_point = Point(cctv['coordx'], cctv['coordy'])
        nearest = find_nearest_link(cctv_point, links_gdf, sindex, max_distance_km)

        if nearest:
            cctv['linkId'] = nearest['linkId']
            cctv['linkRoadName'] = nearest['roadName']
            cctv['linkDistance'] = nearest['distance']
            matched_count += 1

    print(f"\n매핑 완료: {matched_count:,}/{len(cctv_list):,} ({matched_count / len(cctv_list) * 100:.1f}%)")
    print(f"미매핑: {len(cctv_list) - matched_count:,}개 (거리 {max_distance_km}km 초과)\n")

    return matched_count


def save_result(data, output_path):
    """결과 저장"""
    print(f"결과 저장: {output_path}")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("완료!\n")


def main():
    if not CCTV_DATA_FILE.exists():
        print(f"❌ CCTV 데이터 파일을 찾을 수 없습니다: {CCTV_DATA_FILE}")
        print("💡 먼저 CCTV 데이터를 생성하세요: python python-scripts/update-cctv-data.py")
        return

    if not NODELINK_SHAPEFILE.exists():
        print(f"❌ 노드링크 Shapefile을 찾을 수 없습니다: {NODELINK_SHAPEFILE}")
        print("💡 다음 단계를 따라주세요:")
        print("   1. https://www.its.go.kr/opendata/opendataList?service=nodelink")
        print("   2. 표준노드링크 데이터 다운로드")
        print("   3. 압축 해제 후 파일들을 src/datas/nodelink/ 에 복사")
        return

    print("=" * 60)
    print("CCTV → 교통정보 linkId 매핑")
    print("=" * 60)
    print()

    cctv_data, cctv_list = load_cctv_data(CCTV_DATA_FILE)
    links_gdf = load_nodelink_shapefile(NODELINK_SHAPEFILE)

    matched_count = map_cctv_to_links(cctv_list, links_gdf, max_distance_km=0.5)

    save_result(cctv_data, CCTV_DATA_WITH_LINKS_FILE)

    print("샘플 데이터 (linkId 매핑된 것):")
    matched_samples = [c for c in cctv_list if 'linkId' in c][:3]
    for i, cctv in enumerate(matched_samples, 1):
        print(f"\n[{i}] {cctv['cctvname']}")
        print(f"    좌표: ({cctv['coordx']}, {cctv['coordy']})")
        print(f"    linkId: {cctv['linkId']}")
        print(f"    도로명: {cctv['linkRoadName']}")
        print(f"    거리: {cctv['linkDistance']}km")

    print("\n" + "=" * 60)
    print(f"✅ 결과 파일: {CCTV_DATA_WITH_LINKS_FILE}")
    print("=" * 60)


if __name__ == '__main__':
    try:
        main()
    except ImportError as e:
        print("❌ 필요한 패키지를 설치해주세요:")
        print("   pip install -r python-scripts/requirements.txt")
        print(f"\n에러: {e}")
    except Exception as e:
        print(f"❌ 에러 발생: {e}")
        raise
