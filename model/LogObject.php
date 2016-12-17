<?php

/**
 * Created by PhpStorm.
 * User: guanheng
 * Date: 10/13/2016
 * Time: 18:10
 */
class LogObject{
    function LogObject($revision, $author, $date, $msg){
        $this->revision = $revision;
        $this->author = $author;
        $this->date = $date;
        $this->msg = $msg;
        $this->paths = array();
    }

    function addPath($action, $kind, $path){
        $this->paths[$path] = new RevisionInformation($action, $kind, $this);
    }
};