<?php

/**
 * Created by PhpStorm.
 * User: guanheng
 * Date: 10/21/2016
 * Time: 11:45
 */
require "../model/Comment.php";
class CommentTest extends PHPUnit_Framework_TestCase
{
    public function testSecurity()
    {
        $commentController = new Comment();
        $commentController->getProjectComments("1;DROP TABLE comments", "style1");
    }
}
