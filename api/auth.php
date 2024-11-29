<?php
header('Content-Type: application/json');
require_once '../config/db_config.php';

session_start();

function register($email, $password, $name) {
    global $conn;
    
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $conn->prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $email, $hashed_password, $name);
    
    if ($stmt->execute()) {
        return ['success' => true, 'message' => 'Registration successful'];
    } else {
        return ['success' => false, 'message' => 'Registration failed'];
    }
}

function login($email, $password) {
    global $conn;
    
    $stmt = $conn->prepare("SELECT id, email, password, role FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($user = $result->fetch_assoc()) {
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['role'] = $user['role'];
            return ['success' => true, 'user' => ['email' => $user['email'], 'role' => $user['role']]];
        }
    }
    
    return ['success' => false, 'message' => 'Invalid credentials'];
}

// Handle incoming requests
$action = $_POST['action'] ?? '';
$response = ['success' => false, 'message' => 'Invalid action'];

switch ($action) {
    case 'register':
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';
        $name = $_POST['name'] ?? '';
        $response = register($email, $password, $name);
        break;
        
    case 'login':
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';
        $response = login($email, $password);
        break;
        
    case 'logout':
        session_destroy();
        $response = ['success' => true, 'message' => 'Logged out successfully'];
        break;
}

echo json_encode($response);
?>
