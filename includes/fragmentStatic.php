<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function addFragmentToSlot() {
    $pageId = $_POST['pageId'];
    $slot = $_POST['slot'];

    $fragment = $_POST["fragment"];



    $deployInfo = json_decode(getInfo());
    $index = count($deployInfo->pages);
    $found = false;

    for ($i = 0; $i < $index; $i++) {
        if ($deployInfo->pages[$i]->pageId == $pageId) {
            $fragcount = 0;
            if ($deployInfo->pages[$i]->fragments == null) {
                $deployInfo->pages[$i]->fragments = array();
            }
            foreach ($deployInfo->pages[$i]->fragments as $frag) {
                if ($frag->slot == $slot) {
                    $deployInfo->pages[$i]->fragments[$fragcount]->fragment = $fragment;
                    $found = true;
                    break;
                }
                $fragcount ++;
            }
            if (!$found) {
                $deployInfo->pages[$i]->fragments[$fragcount]->slot = $slot;
                $deployInfo->pages[$i]->fragments[$fragcount]->fragment = $fragment;
            }
            break;
        }
    }

    print_r($deployInfo);

    $deployInfo = json_encode($deployInfo);
    $fp = fopen("store/deployments.json", "w");
    fwrite($fp, $deployInfo);
    fclose($fp);
}

function getFragment() {
    $fragment = $_GET['fragmentId'];
    $fragmentIndex = "fragments/" . $fragment . "/index.html";
    if (file_exists($fragmentIndex)) {
        $page = file_get_contents($fragmentIndex);
    } else {
        $page = "FragmentNotFound";
    }
    echo $page;
}

function getFragmentSettings() {
    $fragment = $_GET['fragmentId'];
    $fragmentDescriptor = "fragments/" . $fragment . "fragment.xml";
    if (file_exists($fragmentIndex)) {
        $page = file_get_contents($fragmentIndex);
        //READ as XML
    } else {
        $page = "FragmentNotFound";
    }
    
    //Return settings as JSON.
}

?>
