<?php

require_once './includes/fragmentStatic.php';

function getLayout() {
	$layout = $_GET['layoutName'];
	$page = file_get_contents("layouts/" . $layout . ".html");
	echo $page;
}

function addPage() {
	$page = $_POST['pageName'];
	$deployInfo = json_decode(getInfo());
	$index = count($deployInfo->pages);
	
	$deployInfo->pages[$index]->pageName = $page;
	$deployInfo->pages[$index]->pageId = crc32($page . $index);
	$deployInfo = json_encode($deployInfo);
	$fp = fopen("store/deployments.json","w");
	fwrite($fp,$deployInfo);
	fclose($fp);
}

function deletePage() {
	$pageId = $_POST['pageId'];
	$deployInfo = json_decode(getInfo());
	$index = count($deployInfo->pages);
	for($i = 0; $i < $index; $i ++) {
		if($deployInfo->pages[$i]->pageId == $pageId) {
			$deployInfo->pages[$i] = NULL;
		}
	}
	$deployInfo = json_encode($deployInfo);
	$fp = fopen("store/deployments.json","w");
	fwrite($fp,$deployInfo);
	fclose($fp);
}

function getInfo() {
	$page = file_get_contents("store/deployments.json");
	return $page;
}

function getMenuItems() {
	$depInfo = json_decode(getInfo());
	
	$menu = "";
	foreach($depInfo->pages as $p) {
		if($p!= null) {
			$menu .= "<div class=\"menuItem\">
			<div class=\"menuItemSpreader\"></div>
			<div class=\"menuItemCaption\" onclick=\"loadPage('".$p->pageId."');\">".$p->pageName."</div>
		</div>";
		}
	}
	return $menu;
}

function storePageLayout() {
	$layout = $_POST['layout'];
	$pageId = $_POST['pageId'];
	
	$deployInfo = json_decode(getInfo());
	$index = count($deployInfo->pages);
	for($i = 0; $i<$index; $i++) {
		if($deployInfo->pages[$i]->pageId == $pageId) {
			$deployInfo->pages[$i]->layout = $layout;
			break;
		}
	}
	
	print_r($deployInfo);
	
	$deployInfo = json_encode($deployInfo);
	$fp = fopen("store/deployments.json","w");
	fwrite($fp,$deployInfo);
	fclose($fp);
}



function requestCSS() {
	$css = $_GET['css'];
	echo file_get_contents("fragments/".$css."/main.css");
}

if(isset($_GET['action'])) {
	$action = $_GET['action'];
	switch ($action) {
		case "getDeployInfo" : echo getInfo();
		break;
		case "getLayout" : getLayout();
		break;
		case "getFragment" : getFragment();
		break;
		case "addPage" : addPage();
		break;
		case "deletePage" : deletePage();
		break;
		case "getMenuItems" : echo getMenuItems();
		break;
		case "storePageLayout" : storePageLayout();
		break;
		case "addFragmentToSlot" : addFragmentToSlot();
		break;
		case "requestCSS" : requestCSS();
		break;
		default: echo "ERROR";
		break;
	}
}
else {
	$page = file_get_contents("main.html");
	
	$depInfo = json_decode(getInfo());
	
	$dir = dir("fragments");
	$frags = "";
	while($x = $dir->read()) {
		if($x != "." && $x != "..") {
			$fragmentName = strtoupper(substr($x,0,1)) . substr($x,1);
			$frags .=  "<div class=\"cpMenuItem\" id=\"cpFragment".$fragmentName."\">".$fragmentName."</div>";
			$js = "<script type=\"text/javascript\">$(function() {makeDraggable(\"#cpFragment".$fragmentName."\");});</script>";
			$frags .= $js;
		}
	}
	$menu = "";
	foreach($depInfo->pages as $p) {
		if($p!= null) {
			$menu .= "<div class=\"menuItem\">
			<div class=\"menuItemSpreader\"></div>
			<div class=\"menuItemCaption\" onclick=\"loadPage('".$p->pageId."');\">".$p->pageName."</div>
		</div>";
		}
	}
	
	$page = str_replace("%{FRAGMENTS}%", $frags, $page);
	$page = str_replace("%{PAGEMENU}%", $menu, $page);
	
	echo $page;
}



?>
