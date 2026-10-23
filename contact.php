<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
$isHttps = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== '' && strtolower((string) $_SERVER['HTTPS']) !== 'off';
session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>$isHttps,'httponly'=>true,'samesite'=>'Strict']);
session_start();
function respond(int $status,array $body): never { http_response_code($status); echo json_encode($body,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE); exit; }
function load_config(): array { $file=__DIR__.'/config.php'; if (!is_file($file)) return []; $data=require $file; return is_array($data)?$data:[]; }
function valid_address(mixed $value): bool {
 if (!is_string($value)||trim($value)===''||filter_var($value,FILTER_VALIDATE_EMAIL)===false) return false;
 $value=strtolower($value);
 return !str_contains($value,'replace')&&!str_contains($value,'your-domain.example')&&!str_ends_with($value,'@example.com');
}
function mail_is_configured(array $cfg): bool {
 return valid_address($cfg['recipient_email']??null)&&valid_address($cfg['from_email']??null)
 &&is_string($cfg['from_name']??null)&&trim($cfg['from_name'])!==''&&!preg_match('/[\r\n]/',$cfg['from_name']);
}
if (($_SERVER['REQUEST_METHOD']??'GET')==='GET'&&isset($_GET['csrf'])) {
 if (!isset($_SESSION['csrf_token'])||!is_string($_SESSION['csrf_token'])) $_SESSION['csrf_token']=bin2hex(random_bytes(32));
 respond(200,['ok'=>true,'csrf_token'=>$_SESSION['csrf_token'],'configured'=>mail_is_configured(load_config())]);
}
if (($_SERVER['REQUEST_METHOD']??'')!=='POST') { header('Allow: GET, POST'); respond(405,['ok'=>false,'code'=>'method_not_allowed','message'=>'Use the inquiry form to submit a project request.']); }
$origin=$_SERVER['HTTP_ORIGIN']??'';
if ($origin!=='') {
 $originHost=parse_url($origin,PHP_URL_HOST); $host=parse_url('http://'.($_SERVER['HTTP_HOST']??''),PHP_URL_HOST);
 if (!is_string($originHost)||!is_string($host)||strtolower($originHost)!==strtolower($host)) respond(403,['ok'=>false,'code'=>'origin_rejected','message'=>'The request could not be verified. Refresh and try again.']);
}
$posted=$_POST['csrf_token']??''; $session=$_SESSION['csrf_token']??'';
if (!is_string($posted)||!is_string($session)||$session===''||!hash_equals($session,$posted)) respond(403,['ok'=>false,'code'=>'csrf_failed','message'=>'Your form session expired. Refresh the page and try again.']);
function post_text(string $key): string { $value=$_POST[$key]??''; return is_string($value)?$value:''; }
$honeypot=$_POST['website']??'';
if (!is_string($honeypot)||trim($honeypot)!=='') respond(400,['ok'=>false,'code'=>'invalid_submission','message'=>'We could not process this submission. Review the form and try again.']);
$name=trim(post_text('name')); $email=trim(post_text('email')); $service=trim(post_text('interest')); $message=trim(post_text('message'));
$name=preg_replace('/[\x00-\x1F\x7F]/u',' ',$name)??''; $message=preg_replace('/\x00/u','',$message)??'';
$allowed=['Full-stack development','AI / LLM / agent development','AI integration','Cybersecurity / secure engineering','Debugging / performance','UI/UX and product design','Digital marketing / growth','Workflow automation consulting','Something else'];
if ($name===''||strlen($name)>100||!filter_var($email,FILTER_VALIDATE_EMAIL)||strlen($email)>254||!in_array($service,$allowed,true)||strlen($message)<20||strlen($message)>3000) respond(422,['ok'=>false,'code'=>'validation_failed','message'=>'Please review the fields. Provide your name, a valid email, a service and at least 20 characters about the project.']);
if (preg_match('/[\r\n]/',$email)) respond(422,['ok'=>false,'code'=>'invalid_email','message'=>'Please enter a valid email address.']);
$config=load_config();
if (!mail_is_configured($config)) respond(503,['ok'=>false,'code'=>'not_configured','message'=>'Contact delivery is not configured. Your inquiry has not been sent. Configure the official inbox on the hosting server before enabling delivery.']);
$now=time(); $tries=$_SESSION['contact_attempts']??[]; if (!is_array($tries)) $tries=[];
$tries=array_values(array_filter($tries,static fn($time):bool=>is_int($time)&&($now-$time)<3600));
if (count($tries)>=3) respond(429,['ok'=>false,'code'=>'rate_limited','message'=>'Too many submissions from this session. Please wait before trying again.']);
$tries[]=$now; $_SESSION['contact_attempts']=$tries;
$recipient=(string)$config['recipient_email']; $from=(string)$config['from_email'];
$fromName=str_replace(["\r","\n",'"'],['','','\''],(string)$config['from_name']);
$subject='New agency website project inquiry';
$body="A new project inquiry was submitted through the agency website.\n\nName: ".$name."\nEmail: ".$email."\nService: ".$service."\n\nProject details:\n".$message."\n\nReceived at (UTC): ".gmdate(DATE_ATOM,$now)."\n";
$headers=['From: '.$fromName.' <'.$from.'>','Reply-To: '.$email,'MIME-Version: 1.0','Content-Type: text/plain; charset=UTF-8'];
$accepted=false;
try { $accepted=mail($recipient,$subject,$body,implode("\r\n",$headers)); } catch (Throwable $error) { error_log('Agency contact form: host mail call failed.'); }
if (!$accepted) respond(502,['ok'=>false,'code'=>'mail_failed','message'=>'The website could not hand your inquiry to the mail service. No success was recorded. Please try again later.']);
$_SESSION['csrf_token']=bin2hex(random_bytes(32));
respond(200,['ok'=>true,'code'=>'accepted','csrf_token'=>$_SESSION['csrf_token'],'message'=>'Your inquiry has been accepted by the website mail service. This confirms processing was accepted, not final inbox delivery.']);
