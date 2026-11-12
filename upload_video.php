<?php
// ========================================================
// --- PORTFOLIO VIDEO API WITH ADMIN PASSCODE PROTECTION ---
// ========================================================

// Change this secret passcode to your own private password!
define('ADMIN_PASSCODE', 'yoseph2026');

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Admin-Passcode");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$uploadDir = __DIR__ . '/uploads/videos/';
$jsonFile = __DIR__ . '/uploads/videos.json';

// Ensure directories exist
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// ----------------------------------------------------
// 1. PUBLIC GET: Anyone can view the uploaded showcase
// ----------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($jsonFile)) {
        $data = file_get_contents($jsonFile);
        echo $data ?: json_encode([]);
    } else {
        echo json_encode([]);
    }
    exit;
}

// ----------------------------------------------------
// 2. PASSCODE VERIFICATION FOR ALL WRITES & DELETES
// ----------------------------------------------------
$providedPasscode = '';
if (isset($_POST['admin_passcode'])) {
    $providedPasscode = $_POST['admin_passcode'];
} elseif (isset($_SERVER['HTTP_X_ADMIN_PASSCODE'])) {
    $providedPasscode = $_SERVER['HTTP_X_ADMIN_PASSCODE'];
}

if ($providedPasscode !== ADMIN_PASSCODE) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'error' => 'Unauthorized: Invalid admin passcode. Only the portfolio owner can modify videos.'
    ]);
    exit;
}

// ----------------------------------------------------
// 3. ADMIN DELETE ACTION
// ----------------------------------------------------
if (isset($_POST['action']) && $_POST['action'] === 'delete') {
    $deleteId = isset($_POST['id']) ? $_POST['id'] : '';
    if (empty($deleteId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing video ID to delete']);
        exit;
    }

    if (file_exists($jsonFile)) {
        $videos = json_decode(file_get_contents($jsonFile), true) ?: [];
        $newVideos = [];
        $found = false;

        foreach ($videos as $v) {
            if ($v['id'] === $deleteId) {
                $found = true;
                // Delete physical file if local upload
                if (!empty($v['videoUrl']) && file_exists(__DIR__ . '/' . $v['videoUrl'])) {
                    @unlink(__DIR__ . '/' . $v['videoUrl']);
                }
            } else {
                $newVideos[] = $v;
            }
        }

        file_put_contents($jsonFile, json_encode($newVideos, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true, 'message' => 'Video removed successfully']);
    } else {
        echo json_encode(['success' => true]);
    }
    exit;
}

// ----------------------------------------------------
// 4. ADMIN UPLOAD ACTION
// ----------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = isset($_POST['title']) ? trim($_POST['title']) : '';
    $category = isset($_POST['category']) ? trim($_POST['category']) : 'Cinematic';
    $software = isset($_POST['software']) ? trim($_POST['software']) : 'Premiere Pro';
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';

    if (empty($title)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Title is required']);
        exit;
    }

    $filePath = null;

    if (isset($_FILES['video']) && $_FILES['video']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['video']['tmp_name'];
        $fileName = $_FILES['video']['name'];
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        $allowedExtensions = ['mp4', 'webm', 'mov', 'mkv', 'avi'];
        if (!in_array($fileExtension, $allowedExtensions)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid file extension. Allowed: mp4, webm, mov, mkv']);
            exit;
        }

        $newFileName = 'vid_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $fileExtension;
        $destPath = $uploadDir . $newFileName;

        if (move_uploaded_file($fileTmpPath, $destPath)) {
            $filePath = 'uploads/videos/' . $newFileName;
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to save uploaded file']);
            exit;
        }
    }

    // Categories array
    $categories = array_filter(array_map('trim', explode(',', $category)));
    if (empty($categories)) {
        $categories = ['Cinematic'];
    }

    // Save to videos.json
    $videos = [];
    if (file_exists($jsonFile)) {
        $existing = file_get_contents($jsonFile);
        $decoded = json_decode($existing, true);
        if (is_array($decoded)) {
            $videos = $decoded;
        }
    }

    $videoRecord = [
        'id' => 'server-' . time(),
        'title' => htmlspecialchars($title),
        'category' => htmlspecialchars($categories[0]),
        'categories' => array_values($categories),
        'software' => htmlspecialchars($software),
        'description' => htmlspecialchars($description),
        'videoUrl' => $filePath,
        'sourceType' => 'file',
        'isCustom' => true,
        'createdAt' => date('c')
    ];

    array_unshift($videos, $videoRecord);
    file_put_contents($jsonFile, json_encode($videos, JSON_PRETTY_PRINT));

    echo json_encode([
        'success' => true,
        'message' => 'Video uploaded and published successfully',
        'video' => $videoRecord
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
?>
