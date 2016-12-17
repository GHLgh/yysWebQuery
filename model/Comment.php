<?php
/**
 * Created by PhpStorm.
 * User: guanheng
 * Date: 10/20/2016
 * Time: 17:38
 */
$host = "localhost";
$user = "root";
$password = "";
$database = "commentdb";

class Comment{
    function connectToSQL(){
        $mysqli = new mysqli($GLOBALS["host"], $GLOBALS["user"], $GLOBALS["password"], $GLOBALS["database"]);
        if ($mysqli->connect_errno) {
            echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
            return null;
        }
        return $mysqli;
    }

    function addProjectComments($username, $comment, $projectName){
        $mysqli = $this->connectToSQL();
        if($mysqli == null)
            return;

        $username = $mysqli->real_escape_string($username);
        $comment = $this->commentFilter($comment, $mysqli);
        $comment = $mysqli->real_escape_string($comment);
        $projectName = $mysqli->real_escape_string($projectName);

        if(strlen($username) > 30 || strlen($comment) > 140){
            echo "<script>alert('Invalid input!')</script>";
            $mysqli->close();
            return;
        }

        $sql = 'INSERT INTO comments VALUES("'.$username.'", "'.$comment.'" , "'.$projectName.'", null);';
        if ($mysqli->query($sql) === TRUE) {
            echo "New record created successfully";
        } else {
            echo "Error: " . $sql . "<br>" . $mysqli->error;
        }

        $mysqli->close();
    }

    function getProjectComments($projectName, $style){
        $content = "<br>";
        $mysqli = $this->connectToSQL();
        if($mysqli == null)
            return;

        $projectName = $mysqli->real_escape_string($projectName);

        if ($result = $mysqli->query("SELECT * FROM comments WHERE projectName = '$projectName'")) {
            //printf("Select returned %d rows.\n", $result->num_rows);

            while($row = $result->fetch_array(MYSQLI_NUM)) {
                $content = $content.'<section class = "box comment'.$style.' align-left">'.htmlspecialchars($row[0], ENT_QUOTES, 'UTF-8').' says<br>"'.htmlspecialchars($row[1], ENT_QUOTES, 'UTF-8').'"</section>';
            }
            /* free result set */
            $result->close();
        }
        $mysqli->close();
        return $content;
    }

    function commentFilter($comment, $mysqli){
        $filteredComment = "";

        $token = strtok($comment, " ");
        while ($token !== false)
        {
            $result = $mysqli->query("SELECT replacingWord FROM commentFilter WHERE originalWord = '$token'");
            if($result->num_rows > 0){
                $row = $result->fetch_array(MYSQLI_NUM);
                $filteredComment = $filteredComment . $row[0];
            }
            else
                $filteredComment = $filteredComment.$token;

            $token = strtok(" ");
            if($token != false)
                $filteredComment = $filteredComment." ";
        }
        return $filteredComment;
    }
}