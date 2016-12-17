<?php
/**
 * This file is used to fetch information for index template (another buffer between view and controller)
 * Created by PhpStorm.
 * User: guanheng
 * Date: 10/14/2016
 * Time: 00:37
 */

require "../controller/PageController.php";
$pageController = new PageController();

$title = "Portfolio";
$content = $pageController->getProjects();
include "indexTemplate.html";
?>