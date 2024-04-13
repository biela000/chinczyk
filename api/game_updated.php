<?php
//require_once __DIR__ . "/vendor/autoload.php";
//require_once __DIR__ . "/utils/DbUtils.php";
//require_once __DIR__ . "/utils/constants.php";
//
//$database = DbUtils::connect();
//
//$games = $database->selectCollection("games");
//
//$start = time();
//
//$start_game = $games->findOne(["_id" => (int)$_GET["id"]]);
//$start_turn = $start_game["turn"];
//
//while ($start > time() - REQUEST_TIMEOUT) {
//    $game = $games->findOne(["_id" => (int)$_GET["id"]]);
//    $new_turn = $game["turn"];
//
//    if ($new_turn != $start_turn) {
//        echo json_encode(["game" => $game]);
//        return;
//    }
//
//    usleep(300000);
//}
//
//echo json_encode(["game" => $start_game]);