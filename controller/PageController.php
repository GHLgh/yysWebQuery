<?php
/**
 * Created by PhpStorm.
 * User: guanheng
 * Date: 10/14/2016
 * Time: 05:19
 */
require dirname(__FILE__) . "/../model/ProjectOverview.php";
require dirname(__FILE__) ."/../model/Comment.php";

class PageController{
    function PageController(){
        $this->projectOverview = new ProjectOverview("svn_log.xml", "svn_list.xml");
    }

    /** Function to parse default svn_log.xml / svn_list.xml and return a content for displaying those projects in html format
     * @return String: content of a project overview to be displayed
     */
    function getProjects(){
        $commentController = new Comment();
        $projectList = $this->projectOverview->getProjectList();
        $content = '';
        $currentProject = '';
        //go through each project and generate corresponding content
        for($i = 0; $i < count($projectList); $i++) {
            // use to group sub-projects together
            // ex. Assignment1.0, Assignment1.1, and Assignment1.2 are considered as in the same group (Assignment1.x)
            // then they will appear next to each other
            $assignmentNumber = mb_substr($projectList[$i]->name, 10, 1);
            if((int)$assignmentNumber%2 == 0){
                $style = "style1";
                $color = "#000000";
            }
            else{
                $style = "style2";
                $color = "#ffffff";
            }
            // condition to generate content for 1.still in the same group or 2.processing the next group
            if(strcmp($assignmentNumber, $currentProject) == 0){
                $content = $content.'<div class="4u">
							<section class="special box '.$style.'">
								<h2 style="font-size:200%;">'.substr($projectList[$i]->name,11).'</h2>
								<p>Date: '.date('m/d/Y', strtotime((string) $projectList[$i]->date)).'<br>
								Revision: '.$projectList[$i]->revision.'<br>
								Summary: '.$this->projectOverview->getMsg($projectList[$i]->revision).'</p>
								<ul class="actions">
									<form action="projectPage.php" method="get">
									<input type="submit" name="submit" value="'.$projectList[$i]->name.'" class="button special"/>
									</form>
									<button type="button" class="btn btn-info" data-toggle="collapse" data-target="#'.($i+2).'">COMMENTs</button>
                               <div id="'.($i+2).'" class="collapse" style="color:'.$color.';">'.$commentController->getProjectComments($projectList[$i]->name, $style).'
    <br><button type="button" class="btn btn-info" style="margin-left:auto;margin-right:auto;" data-toggle="collapse" data-target="#commentOn'.$currentProject.substr($projectList[$i]->name,12).'">ADD COMMENT</button>
                               <br><div id="commentOn'.$currentProject.substr($projectList[$i]->name,12).'" class="collapse align-center">
                               <form action="../controller/actionPage.php" method="post">
                                Your name:<input type="text" name="userName" value = "(up to 30 character)" style="background-color:#ffffff;color: #000000">
                                Your comment:
									<textarea name="comment" rows="5" cols="20" style="background-color:#ffffff;color: #000000;">(Please limit to 140 character.)</textarea>
									<input type="hidden" name="projectName" value="'.$projectList[$i]->name.' "class="collapse">
									<br><input type="submit" value="Submit" class = "button special"/>
									</form>
                                </div>
                                </div>
								</ul>
							</section>
						</div>';
            }
            else {
                if(strlen($currentProject) != 0)
                    $content = $content. '</div></div>
                    </section>';
                $content = $content . '<section id="'.$assignmentNumber.'" class="wrapper '.$style.'">
				<header class="major">
					<h2>' . substr($projectList[$i]->name,0,11) . '</h2>
				</header>
				<div class="container">
					<div class="row">
						<div class="4u">
							<section class="special box '.$style.'">
								<h2 style="font-size:200%;">'.substr($projectList[$i]->name,11).'</h2>
								<p>Date: '.date('m/d/Y', strtotime((string) $projectList[$i]->date)).'<br>
								Revision: '.$projectList[$i]->revision.'<br>
								Summary: '.$this->projectOverview->getMsg($projectList[$i]->revision).'</p>
								<ul class="actions">
									<form action="projectPage.php" method="get">
									<input type="submit" name="submit" value="'.$projectList[$i]->name.'" class="button special"/>
									</form>
									<button type="button" class="btn btn-info" data-toggle="collapse" data-target="#'.($i+2).'">COMMENTs</button>
                               <div id="'.($i+2).'" class="collapse" style="color:'.$color.';">'.$commentController->getProjectComments($projectList[$i]->name, $style).'
    <br><button type="button" class="btn btn-info" style="margin-left:auto;margin-right:auto;" data-toggle="collapse" data-target="#commentOn'.$currentProject.substr($projectList[$i]->name,12).'">ADD COMMENT</button>
                               <br><div id="commentOn'.$currentProject.substr($projectList[$i]->name,12).'" class="collapse align-center">
                               <form action="../controller/actionPage.php" method="post">
                                Your name:<input type="text" name="userName" value = "(up to 30 character)" style="background-color:#ffffff;color: #000000">
                                Your comment:
									<textarea name="comment" rows="5" cols="20" style="background-color:#ffffff;color: #000000;">(Please limit to 140 character.)</textarea>
									<input type="hidden" name="projectName" value="'.$projectList[$i]->name.' "class="collapse">
									<br><input type="submit" value="Submit" class = "button special"/>
									</form>
                                </div>
                                </div>
								</ul>
							</section>
						</div>';
            }
            $currentProject = $assignmentNumber;
        }
        $content = $content. '</div></div></section>';
        return $content;
    }

    /** Function to parse default svn_log.xml / svn_list.xml and return a content of files of specific projects in html format
     * @param $projectName: the name of the project
     * @return String: content of a table of project's files to be displayed
     */
    function getProject($projectName){
        $projectList = $this->projectOverview->getProjectList();
        foreach ($projectList as $project){
            if($project->name == $projectName)
                break;
        }
        $content = '<iframe src="" name="iframe_a" height="200" width="1340"></iframe><table class="table">
  <tr>
    <th>File name / Path</th>
    <th>Size</th>
    <th>Type</th>
    <th>Revisions</th> 
  </tr>'.$this->printList($project, $this->projectOverview->path).'</table>>';
        return $content;
    }

    /** Helper function to generate the table of files recursively
     * @param $project: a node in the project (dir/file)
     * @param $path: the path to reach the root of the project in subversion (http://subversion..../[project])
     * @return String: content of a table of project's files to be displayed
     */
    function printList($project, $path){
        $content = '';
        // base case: if file, then it has no children, return to last layer
        if ($project->type == "file") {
            $revisionList = '';
            for ($i = 0; $i < count($project->revisionList); $i++) {
                $revision = $project->revisionList[$i];
                $revisionList = $revisionList."Revision:".$revision->log->revision.", action:"
                .$revision->action.", author:".$revision->log->author.
                    ", date:".date('m/d/Y', strtotime((string)$revision->log->date)).",<br>message:".$revision->log->msg."<br>";
            }
            $content = '<tr>
                        <td>'.$project->name.'<br>
                        <a onclick="alert(\'The content is displayed on the top (if the file can be displayed)\')
                        " style="font-size:80%;" href="'.$path."/".$project->name.'
                        " target="iframe_a">'.$path."/".$project->name.'</a></td>
                        <td>'.$project->size.'</td>
                        <td>'.$this->checkType($project->name).'</td>
                        <td>'.$revisionList.'</td> 
                        </tr>';

            return $content;
        }
        // if it is dir, call this function with its children as parameter
        for ($i = 0; $i < count($project->children); $i++)
            $content = $content.$this->printList($project->children[$i], $path);
        return $content;
    }

    /** Helper function to identify the type of file
     * @param $name: the name of the file
     * @return String: a type of known file or "unknown file"
     */
    function checkType($name){
        $pos = strrpos($name,'.');
        if($pos == false)
            return "Unknown Type";
        $extension = substr($name,$pos+1);
        if (strlen($extension) > 4)
            return "Unknown Type";
        return $extension.' file';
    }
};