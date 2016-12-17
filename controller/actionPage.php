<?php
/**
 * Created by PhpStorm.
 * User: guanheng
 * Date: 10/21/2016
 * Time: 08:49
 */
require dirname(__FILE__) ."/../model/Comment.php";

$commentController = new Comment();

if(!empty($_POST['userName'])|| !empty($_POST['comment'])){
    $commentController->addProjectComments($_POST['userName'],$_POST['comment'],$_POST['projectName']);
}

if (!empty($_SERVER['HTTPS']) && ('on' == $_SERVER['HTTPS'])) {
    $uri = 'https://';
} else {
    $uri = 'http://';
}
$uri .= $_SERVER['HTTP_HOST'];
header('Location: '.$uri.'/view/');