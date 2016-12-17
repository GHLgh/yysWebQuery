<?php

/**
 * Created by PhpStorm.
 * User: guanheng
 * Date: 10/13/2016
 * Time: 18:06
 */
class Node
{
    function Node($type, $name, $revision, $author, $date, $size){
        $this->type = $type;
        $this->name = $name;
        $this->revision = $revision;
        $this->author = $author;
        $this->date = $date;
        $this->size = $size;
        $this->children = array();
        $this->parent = null;
        $this->revisionList = array();
    }
}