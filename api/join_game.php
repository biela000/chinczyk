<?php
require_once __DIR__ . "/vendor/autoload.php";
require_once __DIR__ . "/utils/DbUtils.php";

$database = DbUtils::connect();

$games = $database->games;

$game = DbUtils::findEmptyGame($games);

echo "a";
if (is_null($game)) {
    $game = DbUtils::createGame($games, $_GET["nickname"]);
} else {
    $game = DbUtils::addPlayer($games, $game, $_GET["nickname"]);
}
echo "a";

print_r($game);

echo json_encode(["id" => $game["_id"]]);