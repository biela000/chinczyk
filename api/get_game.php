<?php
require_once __DIR__ . "/vendor/autoload.php";
require_once __DIR__ . "/utils/DbUtils.php";

$database = DbUtils::connect();

$collection = $database->selectCollection("games");

$document = $collection->findOne(["_id" => (int)$_GET["id"]]);

echo json_encode(["game" => $document]);