"""
CCTV → 교통정보 linkId 매핑 모듈

CCTV 좌표를 기준으로 가장 가까운 도로 링크를 찾아 매핑합니다.
"""

import json
from pathlib import Path

try:
    import geopandas as gpd
    from shapely.geometry import Point
    HAS_GEOPANDAS = True
except ImportError:
    HAS_GEOPANDAS = False

from paths import CCTV_DATA_FILE, CCTV_DATA_WITH_LINKS_FILE, NODELINK_SHAPEFILE


def load_cctv_data(cctv_path):
    """CCTV 데이터 로드"""
    print(f"  CCTV 데이터 로드: {cctv_path}")
    with open(cctv_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    cctv_list = data['response']['data']
    print(f"  총 {len(cctv_list)}개 CCTV")
    return data, cctv_list


def load_nodelink_shapefile(shapefile_path=None):
    """노드링크 Shapefile 로드 (도로 좌표 포함)"""
    if not HAS_GEOPANDAS:
        print("  ⚠️  geopandas 미설치 - linkId 매핑 불가")
        return None

    if shapefile_path is None:
        shapefile_path = NODELINK_SHAPEFILE

    if not shapefile_path.exists():
        print(f"  ⚠️  노드링크 파일 없음: {shapefile_path}")
        return None

    print(f"  노드링크 데이터 로드 중...")
    gdf = gpd.read_file(shapefile_path, encoding='cp949')

    if gdf.crs.to_epsg() != 4326:
        gdf = gdf.to_crs(epsg=4326)

    print(f"  총 {len(gdf):,}개 링크")
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


def map_links_to_cctv_data(cctv_data, links_gdf, max_distance_km=0.5):
    """CCTV 데이터에 linkId 매핑 (외부 호출용)"""
    if links_gdf is None:
        print("  건너뜀 (노드링크 데이터 없음)")
        return 0

    cctv_list = cctv_data['response']['data']

    print(f"  공간 인덱스 생성 중...")
    sindex = links_gdf.sindex

    matched_count = 0
    total = len(cctv_list)

    for idx, cctv in enumerate(cctv_list):
        if (idx + 1) % 500 == 0:
            print(f"  진행: {idx + 1:,}/{total:,}")

        cctv_point = Point(cctv['coordx'], cctv['coordy'])
        nearest = find_nearest_link(cctv_point, links_gdf, sindex, max_distance_km)

        if nearest:
            cctv['linkId'] = nearest['linkId']
            cctv['linkRoadName'] = nearest['roadName']
            cctv['linkDistance'] = nearest['distance']
            matched_count += 1

    print(f"  매핑 완료: {matched_count:,}/{total:,} ({matched_count / total * 100:.1f}%)")
    return matched_count


def save_result(data, output_path):
    """결과 저장"""
    if isinstance(output_path, str):
        output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  저장: {output_path}")


def main():
    if not CCTV_DATA_FILE.exists():
        print(f"❌ CCTV 데이터 파일을 찾을 수 없습니다: {CCTV_DATA_FILE}")
        return

    if not NODELINK_SHAPEFILE.exists():
        print(f"❌ 노드링크 Shapefile을 찾을 수 없습니다: {NODELINK_SHAPEFILE}")
        return

    print("=" * 60)
    print("CCTV → 교통정보 linkId 매핑")
    print("=" * 60)
    print()

    cctv_data, cctv_list = load_cctv_data(CCTV_DATA_FILE)
    links_gdf = load_nodelink_shapefile(NODELINK_SHAPEFILE)

    print("\n공간 인덱스 생성 중... (1회만)")
    sindex = links_gdf.sindex
    print("완료!\n")

    print("CCTV → 링크 매핑 시작...")
    print("최대 검색 거리: 0.5km\n")

    matched_count = 0
    for idx, cctv in enumerate(cctv_list):
        if (idx + 1) % 100 == 0:
            print(f"진행: {idx + 1:,}/{len(cctv_list):,}")

        cctv_point = Point(cctv['coordx'], cctv['coordy'])
        nearest = find_nearest_link(cctv_point, links_gdf, sindex)

        if nearest:
            cctv['linkId'] = nearest['linkId']
            cctv['linkRoadName'] = nearest['roadName']
            cctv['linkDistance'] = nearest['distance']
            matched_count += 1

    print(f"\n매핑 완료: {matched_count:,}/{len(cctv_list):,} ({matched_count / len(cctv_list) * 100:.1f}%)")
    print(f"미매핑: {len(cctv_list) - matched_count:,}개\n")

    save_result(cctv_data, CCTV_DATA_WITH_LINKS_FILE)

    print("\n샘플 데이터 (linkId 매핑된 것):")
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
        print(f"❌ 필요한 패키지가 없습니다: {e}")
    except Exception as e:
        print(f"❌ 에러 발생: {e}")
        raise
