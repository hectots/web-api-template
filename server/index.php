<?php
// File: index.php
// Summary: Register all the routes for the REST server

require_once 'database.php';

require 'Slim/Slim.php';
\Slim\Slim::registerAutoloader();

$app = new \Slim\Slim();

$app->get('/:table(/:id)', function($table, $id = null) use($app) {
	if ($id == null) {
		$records = query('SELECT * FROM %s', array($table));
	} else {
		$records = query('SELECT * FROM %s WHERE id = %d', array($table, $id));
	}

	$app->response()->header('Content-Type', 'application/json');
	echo json_encode($records);
});

$app->post('/:table', function($table) use($app) {
	$payload = json_decode($app->request()->getBody(), true);
	
	// Since this code pre-build the query string then we need
	// to be connected to the database first
	$connection = connect();
	
	// Extract the column names and values from the payload
	$cols = '';
	$vals = '';
	foreach ($payload as $col => $val) {
		$cols .= $col . ', ';
		
		$val = mysqli_real_escape_string($connection, $val);
		if (!is_numeric($val)) {
			$vals .= "'" . $val . "', ";
		} else {
			$vals .= $val . ', ';
		}
	}
	
	// Trim the last comma and space
	$cols = substr($cols, 0, strlen($cols) - 2);
	$vals = substr($vals, 0, strlen($vals) - 2);

	if (!empty($payload)) {
		// Pre-build the query
		$qs = vsprintf("INSERT INTO %s (%s) VALUES (%s)", array($table, $cols, $vals));
		
		// ... and execute it
		query($qs);
	}

	$app->response()->header('Content-Type', 'application/json');
	echo json_encode(array('success' => true));
});

$app->put('/:table/:id', function($table, $id) use($app) {
	$payload = json_decode($app->request()->getBody(), true);
	
	// Since this code pre-build the query string then we need
	// to be connected to the database first
	$connection = connect();
	
	// Extract the column names and values from the payload
	$set = '';
	foreach ($payload as $col => $val) {
		$val = mysqli_real_escape_string($connection, $val);
		if (!is_numeric($val)) {
			$set .= $col . "='" . $val . "', ";
		} else {
			$set .= $col . '=' . $val . ', ';
		}
	}
	
	$set = substr($set, 0, strlen($set) - 2);

	if (!empty($payload)) {
		// Pre-build the query
		$qs = vsprintf("UPDATE %s SET %s WHERE id=%d", array($table, $set, $id));
		
		// ... and execute it
		query($qs);
	}

	$app->response()->header('Content-Type', 'application/json');
	echo json_encode(array('success' => true));
});

$app->delete('/:table/:id', function($table, $id) use($app) {
	query("DELETE FROM %s WHERE id=%d", array($table, $id));

	$app->response()->header('Content-Type', 'application/json');
	echo json_encode(array('success' => true));
});

$app->run();
