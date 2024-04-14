<?php

require_once __DIR__ . "/vendor/autoload.php";
require_once __DIR__ . "/utils/DbUtils.php";

$database = DbUtils::connect();

$games = $database->selectCollection("games");

$gameId = (int)$_GET["gameId"];
$playerId = (int)$_GET["playerId"];

$game = $games->findOne(["_id" => $gameId]);

$playerColor = NULL;

foreach ($game["players"] as $player) {
    if ($player["_id"] == $playerId) {
        $playerColor = $player["color"];
        break;
    }
}

if ($playerColor == $game["currentColor"]) {
    DbUtils::passMove($games, $game);
}

echo json_encode($game);