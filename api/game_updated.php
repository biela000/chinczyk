<?php
require_once __DIR__ . "/vendor/autoload.php";

use MongoDB\Client;

$uri = 'mongodb+srv://jabila:6798241510695@cluster0.n80rzlt.mongodb.net/?retryWrites=true&w=majority';

$client = new MongoDB\Client($uri);

$db = $client->selectDatabase("chinczyk");

$collection = $db->games;

$start = time();

$start_game = $collection->findOne(["_id" => (int)$_GET["id"]]);
$start_turn = $start_game["turn"];

while ($start > time() - 80) {
    $game = $collection->findOne(["_id" => (int)$_GET["id"]]);
    $new_turn = $game["turn"];
    
    if ($new_turn != $start_turn) {
        echo json_encode(["game" => $game]);
        return;
    }

    usleep(300000);
}

echo json_encode(["game" => $start_game]);