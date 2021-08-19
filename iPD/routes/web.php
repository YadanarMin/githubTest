<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

/*Route::get('/', function () {
    return view('welcome');
});*/

Route::get("/",function(){
    return view('login');
});

Route::get('/login', 'LoginController@index');
Route::post('/login/checklogin', 'LoginController@checklogin');
Route::get('/login/successlogin', 'LoginController@successlogin');
Route::get('/login/logout', 'LoginController@logout');

Route::get('/forge/callback','ForgeController@ForgeCallBack');
Route::post('/forge/login', 'ForgeController@GetThreeLeggedToken');
Route::get('/forge/index','ForgeController@index');
Route::post('/forge/getData','ForgeController@GetData');
Route::post('/forge/saveData','ForgeController@SaveData');
Route::get('/forge/volumeChart','ForgeController@ShowVolumePage');
Route::get('/forge/tekkin','ForgeController@ShowTekkin');

Route::get('/admin/index','AdminController@index');

Route::get('/user/index','LoginController@loginUser');
Route::post('/user/create','LoginController@SaveLoginUserInfo');

Route::get('/roomProp/index','RoomPropController@index');
Route::post('/roomProp/getRoomProp','RoomPropController@GetRoomProp');

Route::get('/dataPortal/index','DataPortalController@index');
Route::get('/dataPortal/projectOverview','DataPortalController@ShowProjectOverview');
Route::get('/dataPortal/searchConsole','DataPortalController@ShowProjectSearchConsole');

Route::get('/forge/room','ForgeController@ShowRoom');
