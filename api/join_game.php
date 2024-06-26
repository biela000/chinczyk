<?php
require_once __DIR__ . "/vendor/autoload.php";
require_once __DIR__ . "/utils/DbUtils.php";

$database = DbUtils::connect();

$games = $database->selectCollection("games");

$game = DbUtils::findEmptyGame($games);

if (is_null($game)) {
    $game = DbUtils::createGame($games, $_GET["nickname"], $_GET["playerId"]);
} else {
    $game = DbUtils::addPlayer($games, $game, $_GET["nickname"], $_GET["playerId"]);
}

echo json_encode(["id" => $game["_id"]]);