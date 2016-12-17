<?php
/**
 * This file is used to fetch information for index template (another buffer between view and controller)
 * Created by PhpStorm.
 * User: guanheng
 * Date: 10/14/2016
 * Time: 04:01
 */
require "../controller/PageController.php";

if(isset($_GET['submit'])){
    $pageController = new PageController();
    $title = ($_GET['submit']);
    $content = $pageController->getProject($title);
}
else{
    print("Error on GET<br>");
}

include "projectPageTemplete.html";