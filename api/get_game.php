<?php
require_once __DIR__ . "/vendor/autoload.php";
require_once __DIR__ . "/utils/DbUtils.php";
require_once __DIR__ . "/utils/constants.php";

$database = DbUtils::connect();

$games = $database->selectCollection("games");

$game = $games->findOne(["_id" => (int)$_GET["id"]]);

$currentTimestamp = time() * 1000;

if ($game["hasGameStarted"] && $currentTimestamp - $game["moveStartedAt"] >= MOVE_TIME_MILLISECONDS) {
    DbUtils::passMove($games, $game);
}

echo json_encode(["game" => $game]);