<?php

require_once __DIR__ . "/../vendor/autoload.php";

use MongoDB\Client;

class DbUtils
{
    public static function connect()
    {
        self::loadEnvironmentVariables();
        $db_link = self::createDbLink();
        return (new MongoDB\Client($db_link))->selectDatabase($_ENV['DB_NAME']);
    }

    private static function loadEnvironmentVariables()
    {
        $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . "/..");
        $dotenv->load();
    }

    private static function createDbLink()
    {
        $db_link = $_ENV['DB'];

        $db_link = str_replace("<username>", $_ENV['DB_USERNAME'], $db_link);
        $db_link = str_replace("<password>", $_ENV['DB_PASSWORD'], $db_link);

        return $db_link;
    }

    public static function findEmptyGame($games)
    {
        return $games->findOne(["full" => false]);
    }

    public static function createGame($games, $player_nickname)
    {
        return $games->insertOne([
            "_id" => rand(),
            "players" => [
                ["name" => $player_nickname, "color" => "red", "ready" => false],
                ["name" => NULL, "color" => "blue", "ready" => false],
                ["name" => NULL, "color" => "green", "ready" => false],
                ["name" => NULL, "color" => "yellow", "ready" => false]
            ],
            "turn" => 0,
            "current_move" => NULL,
            "positions" => [
                "red" => [0, 0, 0, 0],
                "blue" => [0, 0, 0, 0],
                "green" => [0, 0, 0, 0],
                "yellow" => [0, 0, 0, 0]
            ],
            "created_at" => date('Y-m-d H:i:s'),
            "full" => false
        ]);
    }

    public static function addPlayer($games, $game, $player_nickname)
    {
        foreach ($game["players"] as $player) {
            if ($player["color"] == "yellow") {
                $game["full"] = true;
            }

            if (is_null($player["name"])) {
                $player["name"] = $player_nickname;
                break;
            }
        }

        return $games->replaceOne(
            ["_id" => $game["_id"]],
            $game
        );
    }
}