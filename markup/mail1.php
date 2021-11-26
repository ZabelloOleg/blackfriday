<?php
	//****************************************
	//edit here
	$senderName = 'BlackFriday';
	$senderEmail = 'BlackFriday';
	$targetEmail = 'Wowshum@ukr.ua';
	$messageSubject = 'Message from BlackFriday';
	$redirectToReferer = true;
	$redirectURL = 'thankyou.html';
	//****************************************

	// mail content
	$email = $_POST['email'];

	// prepare message text
	$messageText =	'E-mail: '.$email."\n";

	// send email
	$senderName = "=?UTF-8?B?" . base64_encode($senderName) . "?=";
	$messageSubject = "=?UTF-8?B?" . base64_encode($messageSubject) . "?=";
	$messageHeaders = "From: " . $senderName . " <" . $senderEmail . ">\r\n"
				. "MIME-Version: 1.0" . "\r\n"
				. "Content-type: text/plain; charset=UTF-8" . "\r\n";

	if (preg_match('/^[_.0-9a-z-]+@([0-9a-z][0-9a-z-]+.)+[a-z]{2,4}$/',$targetEmail,$matches))
	mail($targetEmail, $messageSubject, $messageText, $messageHeaders);

	// redirect
	if($redirectToReferer) {
		header("Location: ".@$_SERVER['HTTP_REFERER'].'#sent');
	} else {
		header("Location: ".$redirectURL);
	}
?>