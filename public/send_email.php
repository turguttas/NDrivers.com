<?php
// Enable error reporting (for development, remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Import PHPMailer classes
require 'phpmailer/src/Exception.php';
require 'phpmailer/src/PHPMailer.php';
require 'phpmailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// ---- GET FORM DATA ----
$name = isset($_POST['name']) ? strip_tags($_POST['name']) : '';
$email = isset($_POST['email']) ? strip_tags($_POST['email']) : '';
$message = isset($_POST['message']) ? strip_tags($_POST['message']) : '';

// ---- VALIDATION ----
if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Please fill in all fields."]);
    exit;
}

// ---- CREATE PHPMailer INSTANCE ----
$mail = new PHPMailer(true);

try {
    //Server settings
    $mail->isSMTP();
    $mail->SMTPDebug = 0;                   // 0 = off (for production), 2 = detailed debug
    $mail->Host       = 'smtp.gmail.com';   // Gmail SMTP server
    $mail->SMTPAuth   = true;
    $mail->Username   = 'tagafyaa@gmail.com'; // <-- your Gmail address
    $mail->Password   = 'umiw wjnf ivba zkke';    // <-- Gmail App Password, not your normal password
    $mail->SMTPSecure = 'tls';              // or 'ssl'
    $mail->Port       = 587;                // 465 for ssl, 587 for tls

    //Recipients
    $mail->setFrom($email, $name);
    $mail->addAddress('tagafyaa@gmail.com'); // <-- your receiving email
    $mail->addReplyTo($email, $name);

    // Content
    $mail->isHTML(false);
    $mail->Subject = 'New Contact Form Message from NDrivers';
    $mail->Body    = "You have received a new message from your contact form:\n\n".
                     "Name: $name\n".
                     "Email: $email\n".
                     "Message:\n$message";

    $mail->send();
    echo json_encode(["status" => "success", "message" => "Message sent successfully!"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Message could not be sent. Mailer Error: {$mail->ErrorInfo}"]);
}
?>
