-- テスト用GSファイルデータ
INSERT OR IGNORE INTO gs_files (
    filename, 
    display_name, 
    description, 
    file_size, 
    file_path, 
    thumbnail_path, 
    mime_type
) VALUES 
(
    'sample-scene-1.splat',
    'サンプルシーン1',
    'これは美しい室内シーンのGaussian Splattingファイルです。リアルな照明と質感を表現しています。',
    15728640,
    'gs-files/1732723200000-abc12345-sample-scene-1.splat',
    'thumbnails/1732723200000-abc12345-sample-scene-1.jpg',
    'application/octet-stream'
),
(
    'outdoor-landscape.splat',
    '屋外風景',
    '自然豊かな屋外風景のGaussian Splattingファイル。木々や草花の細かなディテールまで再現されています。',
    23068672,
    'gs-files/1732723260000-def67890-outdoor-landscape.splat',
    'thumbnails/1732723260000-def67890-outdoor-landscape.jpg',
    'application/octet-stream'
),
(
    'architecture-demo.ply',
    '建築デモ',
    '現代建築の3Dスキャンデータ。建物の構造や材質感が詳細に記録されています。',
    45123456,
    'gs-files/1732723320000-ghi11223-architecture-demo.ply',
    NULL,
    'application/ply'
); 