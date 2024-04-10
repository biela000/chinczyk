<?php
require_once __DIR__ . "/vendor/autoload.php";

use MongoDB\Client;

$uri = 'mongodb+srv://jabila:6798241510695@cluster0.n80rzlt.mongodb.net/?retryWrites=true&w=majority';

$client = new MongoDB\Client($uri);

$db = $client->selectDatabase("chinczyk");

$collection = $db->games;

$document = $collection->findOne(["_id" => (int)$_GET["id"]]);

echo json_encode(["game" => $document]);