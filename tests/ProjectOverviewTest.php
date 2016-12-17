<?php

/**
 * Created by PhpStorm.
 * User: guanheng
 * Date: 10/14/2016
 * Time: 07:25
 */
require "../model/ProjectOverview.php";
class ProjectOverviewTest extends PHPUnit_Framework_TestCase
{
    public function testMultiRevisionSingleFileAndDeleteFile()
    {
        // Arrange
        $a = new ProjectOverview("multi_revision_single_file_log.xml", "multi_revision_single_file_list.xml");

        // Act
        $b = $a->getProjectList();

        // Assert
        $this->assertEquals(1, count($b[0]->children));
        $this->assertEquals(2, count($b[0]->children[0]->revisionList));
        $this->assertEquals("M", $b[0]->children[0]->revisionList[0]->action);
        $this->assertEquals("file", $b[0]->children[0]->revisionList[0]->kind);

    }

    public function testMultiRevisionMultiFileAndDeleteFile()
    {
        // Arrange
        $a = new ProjectOverview("multi_revision_multi_file_log.xml", "multi_revision_multi_file_list.xml");

        // Act
        $b = $a->getProjectList();

        // Assert
        $this->assertEquals(2, count($b[0]->children));
        $this->assertEquals(2, count($b[0]->children[0]->revisionList));
        $this->assertEquals(1, count($b[0]->children[1]->revisionList));
        $this->assertEquals(2983, $b[0]->children[0]->revisionList[0]->log->revision);
        $this->assertEquals(2423, $b[0]->children[0]->revisionList[1]->log->revision);
        $this->assertEquals(2984, $b[0]->children[1]->revisionList[0]->log->revision);
    }

    public function testConflictAndMerge()
    {
        // Arrange
        $a = new ProjectOverview("conflict_log.xml", "conflict_list.xml");

        // Act
        $b = $a->getProjectList();
        $c = $b[0]->children;

        // Assert
        $this->assertEquals(1, count($c));
        $this->assertEquals(8, count($c[0]->children));
        $this->assertEquals(3, count($c[0]->children[3]->revisionList));
        $this->assertEquals(7667, $c[0]->children[3]->revisionList[0]->log->revision);
        $this->assertEquals(7666, $c[0]->children[3]->revisionList[1]->log->revision);
        $this->assertEquals(7665, $c[0]->children[3]->revisionList[2]->log->revision);
    }
}
