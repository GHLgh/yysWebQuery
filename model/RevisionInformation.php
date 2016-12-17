<?php

/**
 * Created by PhpStorm.
 * User: guanheng
 * Date: 10/13/2016
 * Time: 18:09
 */
class RevisionInformation{
    function  RevisionInformation($action, $kind, $log){
        $this->action =  $action;
        $this->kind = $kind;
        $this->log = $log;
    }
};