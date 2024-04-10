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

    public static function findEmptyGame($collection)
    {
        return $collection->findOne(["full" => false]);
    }
}