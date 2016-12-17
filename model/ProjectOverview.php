<?php
/**
 * Created by PhpStorm.
 * User: guanheng
 * Date: 10/12/2016
 * Time: 22:17
 */
require "Node.php";
require "RevisionInformation.php";
require "LogObject.php";

class ProjectOverview{
    function ProjectOverview($log, $list)
    {
        $this->path = "";
        $this->projectList = array();
        $this->logList = array();
        $this->parseLog($log);
        $this->parseList($list);
    }

    /** Function to parse the list of files (and dirs)
     *  note: this function should be called after parseLog()
     * @param $filename: the list.xml file to be parsed
     * @return Array: a list of (sub-)projects
     */
    function parseList($filename)
    {
        $xml = simplexml_load_file(dirname(__FILE__) . "/../inputs/" . $filename) or die("Error: Cannot create object");
        $list = $xml->list;
        $this->path = $list["path"];
        $parentNode = null;
        foreach ($list->entry as $entry) {
            $type = (string)$entry["kind"];
            $name = (string)$entry->name;
            $commitInfo = $entry->commit;
            $revision = (int)$commitInfo["revision"];
            $author = (string)$commitInfo->author;
            $date = (string)$commitInfo->date;
            if($type == "file")
                $size = (int)$entry->size;
            else
                $size = 0;
            $node = new Node($type, $name, $revision, $author, $date, $size);
            while ($parentNode != null) {
                // check if the node belongs to parent node
                if (substr_compare($name, $parentNode->name, 0, strlen($parentNode->name), TRUE) == 0) {
                    array_push($parentNode->children, $node);
                    $node->parent = $parentNode;
                    // set as parentNode for next entry since svn list's layout is depth first format
                    if ($type == "dir")
                        $parentNode = $node;

                    // go through the log list to math any related revisions
                    $logList = $this->logList;
                    for ($i = 0; $i < count($logList); $i++) {
                        if (array_key_exists($name, $logList[$i]->paths))
                            array_push($node->revisionList, $logList[$i]->paths[$name]);
                    }
                    break;
                } else
                    $parentNode = $parentNode->parent;
            }
            // must be at the root and type is "dir" to become a project entry
            // which means the single file at the root will be ignore
            if ($parentNode == null && $type == "dir") {
                array_push($this->projectList, $node);
                $parentNode = $node;
            }
        }
        return $this->projectList;
    }

    /** Function to parse the list of logs
     *  note: this function should be called before parseList()
     * @param $filename: the log.xml file to be parsed
     * @return Array: a list of logs
     */
    function parseLog($filename)
    {
        $xml = simplexml_load_file(dirname(__FILE__) . "/../inputs/" . $filename) or die("Error: Cannot create object");
        foreach ($xml->logentry as $entry) {
            $revision = (int)$entry["revision"];
            $author = (string)$entry->author;
            $date = (string)$entry->date;
            $msg = (string)$entry->msg;
            $log = new LogObject($revision, $author, $date, $msg);
            $paths = $entry->paths;
            foreach ($paths->path as $path) {
                $log->addPath((string)$path["action"], (string)$path["kind"],
                    substr((string)$path, 2+strlen($author)), $revision);
            }

            array_push($this->logList, $log);
        }
        return $this->logList;
    }

    /** Function to get the parsed list of projects
     * @return Array: a list of (sub-)projects
     */
    function getProjectList(){
        return $this->projectList;
    }

    /** Function to get the parsed list of logs
     * @return Array: a list of logs
     */
    function getLogList(){
        return $this->logList;
    }

    /** Function to get message(comment) for a specific revision
     * @param $revision: the number of revision to look up message
     * @return String: message for the revision
     */
    function getMsg($revision){
        foreach($this->logList as $log){
            if($revision == $log->revision)
                return $log->msg;
        }
    }

    //==================== Helper Functions for Debugging Parsers (should be used) ====================================
    function printList()
    {
        for ($i = 0; $i < count($this->projectList); $i++) {
            $project = $this->projectList[$i];
            $this->printHelper($project);
        }
        print_r($this->logList);
    }

    function printHelper($project)
    {
        printf("%s %d %s %s %d<br>", $project->name, $project->revision, $project->author, $project->date, $project->size);
        if ($project->type == "file") {
            for ($i = 0; $i < count($project->revisionList); $i++) {
                $revision = $project->revisionList[$i];
                printf("%s %s %d<br>", $revision->action, $revision->kind, $revision->revision);
            }
            return;
        }
        for ($i = 0; $i < count($project->children); $i++)
            $this->printHelper($project->children[$i]);
        print("<br>end of this dir<br>");
    }
    //================================= End of Debugging Function =================================================
}
//$parser = new ProjectOverview("small_log.xml","small_list.xml");
//$parser->printList();