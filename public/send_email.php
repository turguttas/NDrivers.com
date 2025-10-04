<?php
// ---- Enable error reporting (development only) ----
error_reporting(E_ALL);
ini_set('display_errors', 1);

// ---- Require PHPMailer ----
require 'phpmailer/src/Exception.php';
require 'phpmailer/src/PHPMailer.php';
require 'phpmailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// ---- Get POST data ----
$name    = isset($_POST['name']) ? strip_tags($_POST['name']) : '';
$email   = isset($_POST['email']) ? strip_tags($_POST['email']) : '';
$message = isset($_POST['message']) ? strip_tags($_POST['message']) : '';

// ---- Validation ----
if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Please fill in all fields."]);
    exit;
}

// ---- Create PHPMailer instance ----
$mail = new PHPMailer(true);

try {
    // ---- SMTP settings ----
    $mail->isSMTP();
    $mail->SMTPDebug = 0;              // 0 = off, 2 = debug
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'tagafyaa@gmail.com'; // your Gmail
    $mail->Password   = 'umiw wjnf ivba zkke'; // Gmail App Password
    $mail->SMTPSecure = 'tls';
    $mail->Port       = 587;

    // ---- Recipients ----
    $mail->setFrom($email, $name);
    $mail->addAddress('tagafyaa@gmail.com'); // your receiving email
    $mail->addReplyTo($email, $name);

    // ---- Email content ----
    $mail->isHTML(false);
    $mail->Subject = 'New Contact Form Message from NDrivers';
    $mail->Body    = "You have received a new message from your contact form:\n\n" .
                     "Name: $name\n" .
                     "Email: $email\n" .
                     "Message:\n$message";

    // ---- Send email ----
    $mail->send();

    // ---- Success response ----
    http_response_code(200);
    echo json_encode(["status" => "success", "message" => "Message sent successfully!"]);

} catch (Exception $e) {
    // ---- Error response ----
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Message could not be sent. Mailer Error: {$mail->ErrorInfo}"
    ]);
}
?>
<?php
var_dump(extension_loaded('openssl'));
