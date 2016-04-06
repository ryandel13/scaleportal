<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function getLayout() {
	$layout = $_GET['layoutName'];
	$page = file_get_contents("layouts/" . $layout . ".html");
	echo $page;
}
?>
